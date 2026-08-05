// tokens.js — regenerate tokens.css with color values from config.json.
// Non-color tokens (typography, sizes, z-order, effects, media queries) are
// not present in config.json, so they stay as static literals.

// Map config colors to the hand-authored --color-* token names.
function palette(cfg) {
  const p = [];
  const colors = cfg.page.colors;
  const head = cfg.page.head;
  const search = cfg.page.search;
  const banner = cfg.page["info-banner"];
  const footer = cfg.page.footer;

  const pairs = [
    ["--color-text", colors["text-color"]],
    ["--color-bg", colors["background-color"]],
    ["--color-accent", head["title-color"]],
    ["--color-accent-light", head["subtitle-color"]],
    ["--color-heading-ink", colors["heading-color"]],
  ];
  pairs.push(["--color-banner-text", banner["text-color"]]);
  pairs.push(["--color-footer-secondary", footer["secondary-color"]]);
  pairs.push(["--color-placeholder", search["placeholder-color"]]);
  pairs.push(["--color-hover-link", footer["hover-color"]]);
  pairs.push(["--color-separator", colors["column-separator-color"]]);
  pairs.push(["--color-column-top", colors["column-top-line-color"]]);
  pairs.push(["--color-outline", head["outline-color"]]);
  pairs.push(["--color-dot-a", colors["halftone-left-color"]]);
  pairs.push(["--color-dot-b", colors["halftone-right-color"]]);
  pairs.push(["--color-dot-c", colors["halftone-both-color"]]);
  return pairs;
}

const SECTION_TOKEN = {
  brød: "brod",
  grønnsaker: "gronn",
  frukt: "frukt",
  melk: "melk",
  nøtter: "notter",
  drikke: "drikke",
  kjøtt: "kjott",
  pålegg: "palegg",
  sukker: "sukker",
  krydder: "krydder",
  saus: "saus",
};

export function renderTokens(cfg) {
  const colorLines = palette(cfg)
    .map(([name, val]) => `  ${name}: ${val};`)
    .join("\n");
  const categoryLines = cfg.sections
    .map(
      (s) =>
        `  --color-${SECTION_TOKEN[s.id] || s.id}: ${s["background-color"]};`,
    )
    .join("\n");

  const roleLines = cfg.groups
    .map(
      (g) =>
        `  --role-${g.id}-bg: ${g["background-color"]};\n` +
        `  --role-${g.id}-ink: ${g["text-color"]};\n` +
        `  --role-${g.id}-tint: ${g["column-color"]};\n` +
        `  --role-${g.id}-border: ${g["border-color"] || g["text-color"]};`,
    )
    .join("\n");
  const sectionLines = cfg.sections
    .map((s) => `  --section-${s.id}-bg: ${s["background-color"]};`)
    .join("\n");

  const ib = cfg.page["info-button"] || {};
  const infoLines = [
    `  --info-emoji: "${ib["emoji"] || "ℹ️"}";`,
    `  --info-emoji-matched: "${ib["emoji-matched"] || "☑️"}";`,
    `  --info-button-width: ${ib.width || "1.2em"};`,
    `  --info-button-height: ${ib.height || "1.2em"};`,
    `  --info-button-font-size: ${ib["font-size"] || "0.75em"};`,
    `  --info-button-border-radius: ${ib["border-radius"] || "50%"};`,
    `  --info-button-margin-left: ${ib["margin-left"] || "0.4rem"};`,
  ].join("\n");

  // Change-marker glyphs (§4.7, §6.6): the values come from page.markers and
  // fall back to the canonical emojis when a key is missing. --marker-default
  // is the plain item bullet (no release change), sourced from the same block.
  const markers = cfg.page.markers || {};
  const markerLines = [
    `  --marker-default: "${markers.default || "❖"}";`,
    `  --marker-new: "${markers.new || "🆕"}";`,
    `  --marker-moved: "${markers.moved || "🔄"}";`,
    `  --marker-updated: "${markers.updated || "🆙"}";`,
  ].join("\n");

  return `/* tokens.css — design tokens: colors, typography, sizes, z-order, sticky
   offsets, effects (BLUEPRINT §4). Generated: color values from config.json;
   typography, sizes, z-order, and effects are static literals. */

:root {
  /* §7.4 text-scale multiplier */
  --text-scale: 1;

  /* §4.1 palette */
${colorLines}

  /* §4.1 category sets: heading background colors only */
${categoryLines}

  /* §4.1 role tokens (generated from groups) */
${roleLines}

  /* §4.1 section heading tokens (generated from sections) */
${sectionLines}

  /* info-button tokens (generated from config page.info-button) */
${infoLines}

  /* change-marker glyphs (generated from config page.markers) */
${markerLines}

  /* §4.2 typography — static */
  --font-system:
    system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    sans-serif;
  --font-body: var(--font-system);
  --font-heading: var(--font-system);
  --font-display: var(--font-system);

  /* §4.3 sizes — static */
  --size-page-padding: 0.5rem;
  --size-main-title: 2.25rem;
  --size-sub-title: 1.25rem;
  --size-search-height: 56px;
  --size-search-text: calc(1rem * var(--text-scale));
  --size-heading: calc(1.125rem * var(--text-scale));
  --size-legend: calc(1.125rem * var(--text-scale));
  --size-item: calc(0.85rem * var(--text-scale));
  --size-item-line: 1.2;
  --size-subgroup: calc(0.8rem * var(--text-scale));
  --size-banner: calc(9px * var(--text-scale));
  --size-footnote: calc(0.75rem * var(--text-scale));
  --size-label: calc(0.875rem * var(--text-scale));

  /* §4.4 depth + sticky — static */
  --z-decoration: 10;
  --z-container: 20;
  --z-heading: 30;
  --z-search: 40;
  --sticky-heading-offset: 56px;

  /* §4.5 effects — static */
  --shadow-banner: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --marker-shadow: 2px 2px 0 0 #000000;
}

@media (min-width: 640px) {
  :root {
    --size-page-padding: 0.5rem;
    --size-main-title: 4.5rem;
    --size-sub-title: 1.5rem;
    --size-search-height: 64px;
    --size-search-text: calc(1.25rem * var(--text-scale));
    --size-heading: calc(1.25rem * var(--text-scale));
    --size-legend: calc(1.25rem * var(--text-scale));
    --size-subgroup: calc(0.875rem * var(--text-scale));
    --size-banner: calc(10px * var(--text-scale));
    --size-footnote: calc(0.875rem * var(--text-scale));
    --sticky-heading-offset: 64px;
  }
}

@media (min-width: 768px) {
  :root {
    --size-page-padding: 1.5rem;
    --size-main-title: 6rem;
    --size-sub-title: 1.875rem;
    --size-legend: 1.5rem;
  }
}

@media (min-width: 1024px) {
  :root {
    --size-page-padding: 2rem;
  }
}

html[data-text-scale="125"] {
  --text-scale: 1.25;
}

html[data-text-scale="150"] {
  --text-scale: 1.5;
}
`;
}
