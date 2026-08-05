// render-css.js — generate the role- and section-specific CSS from config.
// Unlike tokens.css (color values) or the hand-authored component rules, this
// emits the per-role/per-section attribute rules so the page supports an
// arbitrary number of groups and sections. Requires the matching custom
// properties in tokens.css (--role-<id>-* and --section-<id>-bg).

function rolesCss(cfg) {
  const rules = [];
  for (const g of cfg.groups) {
    const id = g.id;
    rules.push(
      `/* group: ${g.label} (${id}) */\n` +
        `.content-col[data-role="${id}"] {\n` +
        `  background-color: var(--role-${id}-tint);\n` +
        `}\n` +
        `.content-col[data-role="${id}"] .role-label {\n` +
        `  background-color: var(--role-${id}-bg);\n` +
        `  color: var(--role-${id}-ink);\n` +
        `  border-color: var(--role-${id}-border);\n` +
        `}\n` +
        `.legend-item[data-role="${id}"] {\n` +
        `  background-color: var(--role-${id}-bg);\n` +
        `  color: var(--role-${id}-ink);\n` +
        `  border-color: var(--role-${id}-border);\n` +
        `}\n`,
    );
  }
  return rules.join("\n");
}

function sectionsCss(cfg) {
  const rules = cfg.sections
    .map(
      (s) =>
        `.category-heading[data-category="${s.id}"] {\n` +
        `  background-color: var(--section-${s.id}-bg);\n` +
        `}\n`,
    )
    .join("\n");
  return `/* category heading colors — generated from config sections */\n${rules}`;
}

export function renderRoleSectionCss(cfg) {
  return `/* roles.css — generated from config.json (groups + sections).
   Supports an arbitrary number of groups and sections. */

${rolesCss(cfg)}
${sectionsCss(cfg)}
`;
}
