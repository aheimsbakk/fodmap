// render-html.js — turn config + merged items into the full HTML document.

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Attribute values additionally escape double quotes; esc() alone is only
// safe for text content.
function escAttr(s) {
  return esc(s).replace(/"/g, "&quot;");
}

// Browser-tab title is derived from the masthead (BLUEPRINT §3.1).
function webTitle(page) {
  return `${page.head.subtitle} ${page.head.title}`;
}

function buildColumns(section, groups, subgroups, collator) {
  const itemsByGroup = new Map();
  for (const item of section) {
    if (item.visible === "false") continue;
    if (!itemsByGroup.has(item.group)) itemsByGroup.set(item.group, []);
    itemsByGroup.get(item.group).push(item);
  }

  return groups.map((group) => {
    const items = itemsByGroup.get(group.id) || [];
    const placeholder = items.length === 0;

    const bySub = new Map();
    for (const it of items) {
      const key = it.subgroup || "";
      if (!bySub.has(key)) bySub.set(key, []);
      bySub.get(key).push(it);
    }
    const bare = (bySub.get("") || [])
      .slice()
      .sort((a, b) => collator.compare(a.name, b.name));
    const subKeys = [...bySub.keys()]
      .filter((k) => k !== "")
      .sort((a, b) => collator.compare(subgroups[a], subgroups[b]));

    const blocks = [];
    if (bare.length) blocks.push({ bare });
    for (const key of subKeys) {
      const itemsInSub = bySub
        .get(key)
        .slice()
        .sort((a, b) => collator.compare(a.name, b.name));
      blocks.push({ subgroup: key, title: subgroups[key], items: itemsInSub });
    }
    return { group, placeholder, blocks };
  });
}

function itemText(item) {
  return item.amount ? `${item.name} (${item.amount})` : item.name;
}

// Bullet tooltip text (§6.7): the template comes from page.tooltips, keyed
// by the item's marker kind (or the default bullet), and the placeholders
// are filled from the item's own release date and the config group labels.
// A missing kind template falls back to default; with no default template
// the item renders without a tooltip.
function itemTitle(item, tooltips, labelOf) {
  const kind = item.change || "default";
  const template = tooltips[kind] || tooltips.default;
  if (!template) return "";
  return template
    .replaceAll("{{date}}", item.releaseDate || "")
    .replaceAll("{{from}}", item.changedFrom ? labelOf(item.changedFrom) : "")
    .replaceAll("{{to}}", labelOf(item.group));
}

function renderItem(it) {
  const text = itemText(it);
  // data-change selects the marker bullet (§6.6): the emoji lives in the CSS
  // tokens (--marker-*), so the live text node stays plain and search is
  // unaffected, exactly like the note-button glyph (§4.6).
  const change = it.change ? ` data-change="${it.change}"` : "";
  // The tooltip is a native browser title on an empty hotspot span over the
  // bullet: the ::before bullet cannot carry a title attribute. The span is
  // aria-hidden (the marker emoji already conveys the change) and carries no
  // searchable text, so capture and restore are untouched (§6.7).
  const title = it.title ? ` title="${escAttr(it.title)}"` : "";
  // The button stays empty: the info glyph and its "matched" variant come
  // from the CSS tokens (--info-emoji / --info-emoji-matched), so the live
  // text node never changes and search restore is unaffected (§4.6).
  let html = `              <li class="item"${change}>`;
  html += `<span class="item-bullet" aria-hidden="true"${title}></span>`;
  html += `<span class="item-text">${esc(text)}</span>`;
  if (it.note) {
    html += ` <button type="button" class="note-toggle" aria-label="Mer informasjon"></button>`;
    html += ` <span class="note-popover" role="tooltip" hidden>${esc(it.note)}</span>`;
  }
  html += `</li>`;
  return html;
}

function renderList(items) {
  const lis = items.map((it) => renderItem(it)).join("\n");
  return `            <ul class="item-list">\n${lis}\n            </ul>`;
}

function renderColumns(cols) {
  return cols
    .map((col) => {
      const attrs = col.placeholder ? ` data-placeholder` : "";
      const inner = [];
      if (!col.placeholder) {
        inner.push(
          `            <div class="role-label mobile-only">\n` +
            `              ${esc(col.group.label)} <span aria-hidden="true">${col.group.emoji}</span>\n` +
            `            </div>`,
        );
      }
      for (const block of col.blocks) {
        if (block.bare) inner.push(renderList(block.bare));
        else {
          inner.push(
            `            <h4 class="sub-group-title">${esc(block.title)}</h4>`,
          );
          inner.push(renderList(block.items));
        }
      }
      return (
        `          <div class="content-col" data-role="${col.group.id}"${attrs}>` +
        inner.map((l) => `\n${l}`).join("") +
        `\n          </div>`
      );
    })
    .join("\n");
}

function renderSection(sectionDef, sectionItems, ctx) {
  const columns = buildColumns(
    sectionItems,
    ctx.groups,
    ctx.subgroups,
    ctx.collator,
  );
  const borderClass = sectionDef.footnote ? " border-b-0" : "";
  let out = "";
  out += `      <section class="category-section" data-category="${sectionDef.id}">\n`;
  out += `        <h3 class="category-heading" data-category="${sectionDef.id}">\n`;
  out += `          <span class="category-icon" aria-hidden="true">${sectionDef.emoji}</span> ${sectionDef.title}\n`;
  out += `        </h3>\n`;
  out += `        <div class="content-grid${borderClass}">\n`;
  out += renderColumns(columns);
  out += `\n        </div>`;
  if (sectionDef.footnote) {
    const type = ctx.footnoteTypes[sectionDef.footnote.type];
    const icon = type
      ? `<span class="footnote-icon" aria-hidden="true">${type}</span> `
      : "";
    out += `\n        <div class="footnote-banner">\n          ${icon}${sectionDef.footnote.text}\n        </div>`;
  }
  out += `\n      </section>\n`;
  return out;
}

// Render a footer segment — plain text, or a link when it has a url.
function renderSegments(segments, separator, version) {
  return segments
    .map((seg) => {
      if (typeof seg === "string")
        return esc(seg.replace("{{version}}", version));
      const text = esc(seg.text.replace("{{version}}", version));
      return `<a href="${esc(seg.url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .join(separator);
}

export function renderDocument(cfg, itemsBySection, version) {
  const page = cfg.page;
  const collator = new Intl.Collator(cfg.collation);
  const ctx = {
    groups: cfg.groups,
    subgroups: cfg.subgroups,
    footnoteTypes: cfg["footnote-types"],
    collator,
  };

  // Precompute each item's bullet tooltip (§6.7): the strings come from
  // page.tooltips, the item's own release date, and the group labels, so
  // the config owns all wording.
  const tooltips = page.tooltips || {};
  const labelOf = (id) =>
    (cfg.groups.find((g) => g.id === id) || {}).label || "";
  for (const items of itemsBySection.values()) {
    for (const item of items) {
      item.title = itemTitle(item, tooltips, labelOf);
    }
  }

  const sectionsHtml = cfg.sections
    .filter((s) => itemsBySection.has(s.id))
    .map((s) => renderSection(s, itemsBySection.get(s.id), ctx))
    .join("\n");

  const legend = cfg.groups
    .map(
      (g) =>
        `        <div class="legend-item" data-role="${g.id}">\n` +
        `          ${esc(g.label)} <span aria-hidden="true">${g.emoji}</span>\n` +
        `        </div>`,
    )
    .join("\n");

  const [line0, line1, line2] = page.footer.lines;
  const disclaimer = renderSegments(line0.segments, line0.separator, version);
  const sources = renderSegments(line1.segments, line1.separator, version);
  const credit = renderSegments(line2.segments, line2.separator, version);

  return `<!doctype html>
<html lang="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(webTitle(page))}</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="favicon-32x32.png" sizes="32x32" type="image/png" />
    <link rel="stylesheet" href="css/tokens.css" />
    <link rel="stylesheet" href="css/base.css" />
    <link rel="stylesheet" href="css/layout.css" />
    <link rel="stylesheet" href="css/components.css" />
    <link rel="stylesheet" href="css/roles.css" />
    <link rel="stylesheet" href="css/utilities.css" />
  </head>
  <body>
    <div class="halftone-tl sm-only"></div>
    <div class="halftone-tr sm-only"></div>

    <div class="container">
      <header class="masthead">
        <h2 class="sub-title">
          <span class="emoji-left">${page.head.emoji.left}</span>
          ${esc(page.head.subtitle)}
          <span class="emoji-right">${page.head.emoji.right}</span>
        </h2>
        <h1 class="main-title">${esc(page.head.title)}</h1>
      </header>

      <div class="search-widget">
        <span class="search-icon" aria-hidden="true">${page.search.emoji}</span>
        <input
          type="text"
          id="search-input"
          class="search-input"
          autocomplete="off"
          placeholder="${esc(page.search.placeholder)}"
          title="Søk etter matvare"
        />
        <button
          type="button"
          id="clear-search"
          class="clear-search hidden"
          title="Tøm søk"
        >
          &times;
        </button>
        <button
          type="button"
          id="text-scale-toggle"
          class="text-scale-toggle"
          aria-label="Øk tekststørrelsen"
          title="Tekststørrelse: 100 %"
        >
          ${esc(page.search.scale)}
        </button>
      </div>

      <div id="main-column-headers" class="legend">
${legend}
      </div>

      <div class="info-banner">
        <span aria-hidden="true">${page["info-banner"].emoji}</span> ${esc(page["info-banner"].text)}
      </div>

${sectionsHtml}
      <footer class="page-footer">
        <p class="footer-disclaimer">
          ${disclaimer}
        </p>
        <p class="footer-source">
          ${sources}
        </p>
        <p class="footer-credit">
          ${credit}
        </p>
      </footer>
    </div>

    <script type="module" src="js/search.js"></script>
    <script type="module" src="js/text-scale.js"></script>
    <script type="module" src="js/note-popover.js"></script>
  </body>
</html>
`;
}
