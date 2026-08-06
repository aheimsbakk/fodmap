/**
 * styles.test.js — stylesheet contract regression guards.
 * jsdom performs no layout, so single-line behavior cannot be asserted
 * through a rendered DOM. Instead, the guards assert the declarations that
 * prevent the defect exist in the stylesheet source: the base rule for
 * every viewport, plus the narrow-viewport size steps for the fit.
 */

import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const COMPONENTS_CSS = readFileSync(
  new URL("../src/css/components.css", import.meta.url),
  "utf8",
);

const TOKENS_CSS = readFileSync(
  new URL("../src/css/tokens.css", import.meta.url),
  "utf8",
);

const ROLES_CSS = readFileSync(
  new URL("../src/css/roles.css", import.meta.url),
  "utf8",
);

// The marker glyphs are config-owned (§4.7): the generated token layer
// reproduces page.markers verbatim, so the guard compares against the
// config instead of hardcoding a glyph (same contract as build.test.js).
const MARKERS = JSON.parse(
  readFileSync(new URL("../data/config.json", import.meta.url), "utf8"),
).page.markers;

// The note glyph's base size is config-owned too (§4.6): the guard derives
// the expected calc from it instead of hardcoding the size.
const INFO_FONT_SIZE = JSON.parse(
  readFileSync(new URL("../data/config.json", import.meta.url), "utf8"),
).page["info-button"]["font-size"];

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Parses every top-level rule in the stylesheet. Comments are stripped
 * first so they can never leak into selectors or unbalanced brace counts.
 */
function parseRules(css) {
  const src = stripComments(css);
  const rules = [];
  let depth = 0;
  let blockStart = 0;
  let cursor = 0;
  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    if (char === "{") {
      if (depth === 0) blockStart = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        rules.push({
          selector: src.slice(cursor, blockStart).trim(),
          declarations: src.slice(blockStart + 1, i),
        });
        cursor = i + 1;
      }
    }
  }
  return rules;
}

const RULES = parseRules(COMPONENTS_CSS);
const MEDIA_RULES = RULES.filter((r) => r.selector.startsWith("@media"));
const BASE_RULES = RULES.filter((r) => !r.selector.startsWith("@media"));

const TOKEN_RULES = parseRules(TOKENS_CSS);
const TOKEN_ROOT = TOKEN_RULES.find((r) => r.selector === ":root").declarations;

const BASE_CSS = readFileSync(
  new URL("../src/css/base.css", import.meta.url),
  "utf8",
);
const BASE_RULE = parseRules(BASE_CSS).find(
  (r) => r.selector === "li.item",
).declarations;

const UTILITIES_CSS = readFileSync(
  new URL("../src/css/utilities.css", import.meta.url),
  "utf8",
);
const UTILITIES_RULES = parseRules(UTILITIES_CSS);

const SEARCH_JS = readFileSync(
  new URL("../src/js/search.js", import.meta.url),
  "utf8",
);
const SEARCH_APPLY_JS = readFileSync(
  new URL("../src/js/search-apply.js", import.meta.url),
  "utf8",
);

const LAYOUT_CSS = readFileSync(
  new URL("../src/css/layout.css", import.meta.url),
  "utf8",
);
const LAYOUT_RULES = parseRules(LAYOUT_CSS);
const LAYOUT_MEDIA = LAYOUT_RULES.filter((r) =>
  r.selector.startsWith("@media"),
);
const LAYOUT_BASE = LAYOUT_RULES.filter(
  (r) => !r.selector.startsWith("@media"),
);

function declarationsFor(selector) {
  const rule = BASE_RULES.find((r) => r.selector === selector);
  return rule ? rule.declarations : "";
}

test("sub-title stays on one line at every viewport width", () => {
  const declarations = declarationsFor(".sub-title");
  // Allow comments between declarations, e.g. a why-comment above the rule.
  const preamble = String.raw`(?:^|;)(?:\s|/\*[\s\S]*?\*/)*`;
  assert.match(
    declarations,
    new RegExp(`${preamble}white-space:\\s*nowrap\\s*(?:;|$)`),
    ".sub-title base rule must declare white-space: nowrap",
  );
});

test("sub-title size steps down on narrow viewports so the line fits", () => {
  const blocks = MEDIA_RULES.filter((r) =>
    r.declarations.includes(".sub-title"),
  );
  assert.ok(
    blocks.length >= 3,
    "expected at least 3 narrow-viewport steps for .sub-title",
  );
  for (const block of blocks) {
    assert.match(
      block.selector,
      /max-width:\s*\d+px/,
      "narrow steps must be max-width media queries",
    );
    assert.match(
      block.declarations,
      /font-size:\s*[\d.]+rem/,
      "each step must declare a smaller font-size in rem",
    );
  }
});

// --- sub-group separator (§5.6, deviation 11) -------------------------------

test("no sub-group heading declares a separator line", () => {
  // User decision 2026-08-01: the separator line above sub-group titles is
  // removed everywhere — under a FILTERED search a visible heading can sit
  // below hidden items, leaving the line floating above it. Separation from
  // the preceding block is margin-only, and the --color-subgroup-line token
  // is deleted with the rule that used it.
  const base = declarationsFor(".sub-group-title");
  assert.doesNotMatch(
    base,
    /border-top/,
    ".sub-group-title must not declare a top border",
  );
  assert.doesNotMatch(
    base,
    /padding-top/,
    ".sub-group-title must not declare top padding (line clearance)",
  );
  const mediaSubGroup = MEDIA_RULES.filter((r) =>
    r.declarations.includes(".sub-group-title"),
  );
  assert.equal(
    mediaSubGroup.length,
    0,
    "no media query may special-case sub-group headings",
  );
  const subGroupRules = [...BASE_RULES, ...MEDIA_RULES].filter((r) =>
    r.selector.includes(".sub-group-title"),
  );
  assert.ok(subGroupRules.length >= 1, "expected a .sub-group-title rule");
  for (const rule of subGroupRules) {
    assert.doesNotMatch(
      rule.declarations,
      /border-top/,
      `no rule may draw a line above a sub-group heading (${rule.selector})`,
    );
  }
  assert.doesNotMatch(
    COMPONENTS_CSS,
    /--color-subgroup-line/,
    "the sub-group line token must not be referenced",
  );
  assert.doesNotMatch(
    TOKENS_CSS,
    /--color-subgroup-line/,
    "the sub-group line token must be removed from tokens.css",
  );
});

// --- text-scale tokens (§4.3, §7.4) -----------------------------------------

test("text-scale multiplier is defined for all three levels", () => {
  assert.match(TOKEN_ROOT, /--text-scale:\s*1\s*;/);
  const levelRule = (level) =>
    TOKEN_RULES.find((r) => r.selector === `html[data-text-scale="${level}"]`);
  assert.match(levelRule("125").declarations, /--text-scale:\s*1\.25/);
  assert.match(levelRule("150").declarations, /--text-scale:\s*1\.5/);
});

test("content font-size tokens scale; masthead and geometry do not", () => {
  const scaled = [
    "search-text",
    "heading",
    "legend",
    "item",
    "subgroup",
    "banner",
    "footnote",
    "label",
  ];
  for (const token of scaled) {
    assert.match(
      TOKEN_ROOT,
      new RegExp(`--size-${token}:\\s*calc\\([^;]*var\\(--text-scale\\)`),
      `--size-${token} must scale via calc(var(--text-scale))`,
    );
  }
  const fixed = [
    "page-padding",
    "main-title",
    "sub-title",
    "search-height",
    "item-line",
  ];
  for (const token of fixed) {
    assert.doesNotMatch(
      TOKEN_ROOT,
      new RegExp(`--size-${token}:\\s*[^;]*var\\(--text-scale\\)`),
      `--size-${token} must stay fixed`,
    );
  }
});

test("items can break long tokens so scaled text never overflows", () => {
  // Unbreakable tokens ("Maltodextrin/maltose/maltekstrakt") exceed the
  // column track at 150 %; anywhere participates in min-content sizing,
  // break-word does not.
  assert.match(BASE_RULE, /overflow-wrap:\s*anywhere\s*;/);
});

// --- role-based column tints (§4.1, deviation 13) ---------------------------

test("role tint tokens live in the token layer", () => {
  // The role layer carries the §4.1 tint values (one token per config
  // group); the old duplicate --tint-* tokens are gone.
  assert.match(
    TOKEN_ROOT,
    /--role-spis-tint:\s*rgba\(160,\s*196,\s*157,\s*0\.2\)/,
  );
  assert.match(
    TOKEN_ROOT,
    /--role-begrens-tint:\s*rgba\(247,\s*215,\s*116,\s*0\.25\)/,
  );
  assert.match(
    TOKEN_ROOT,
    /--role-unngå-tint:\s*rgba\(209,\s*93,\s*93,\s*0\.15\)/,
  );
});

test("columns are tinted by role selector in the generated role layer", () => {
  // roles.css is the sole owner of the role/section colors (deviation 13):
  // every column, role label, and legend cell takes its colors from the
  // generated --role-<id>-* tokens.
  const ROLES_RULES = parseRules(ROLES_CSS);
  for (const selector of [
    '.content-col[data-role="spis"]',
    '.content-col[data-role="begrens"]',
    '.content-col[data-role="unngå"]',
  ]) {
    const rule = ROLES_RULES.find((r) => r.selector === selector);
    assert.ok(rule, `expected a roles.css rule for ${selector}`);
    assert.match(
      rule.declarations,
      /background-color:\s*var\(--role-.*-tint\)/,
      `${selector} must reference a --role-*-tint token`,
    );
  }
});

test("hand-authored layers restate no role or section colors", () => {
  // Migration leftovers that duplicate the generated roles.css are dead
  // code: the transliterated legend-* classes and [data-role] rules in
  // components.css match nothing or are overridden by the generated layer
  // (deviation 1/13). The --color-spis-*/--color-unnga-border tokens and
  // the duplicate --tint-* tokens were removed with them.
  assert.doesNotMatch(
    COMPONENTS_CSS,
    /\.legend-spis|\.legend-begrens|\.legend-unnga/,
    "legend cell colors belong to the generated role layer",
  );
  assert.doesNotMatch(
    COMPONENTS_CSS,
    /\.content-col\[data-role=/,
    "column tint rules belong to the generated role layer",
  );
  assert.doesNotMatch(
    COMPONENTS_CSS,
    /\.category-heading\[data-category=/,
    "section heading colors belong to the generated role layer",
  );
  assert.doesNotMatch(
    COMPONENTS_CSS,
    /--color-spis-|--color-begrens-|--color-unnga-ink|--color-unnga-border/,
    "role colors are sourced from --role-* tokens only",
  );
  assert.doesNotMatch(
    COMPONENTS_CSS,
    /--tint-/,
    "components.css must not reference the removed --tint-* tokens",
  );
  assert.doesNotMatch(
    TOKEN_ROOT,
    /--tint-/,
    "the duplicate --tint-* tokens must be gone from the token layer",
  );
});

test("placeholder columns get the role tint and render wide+ only", () => {
  // Empty placeholder columns carry the role of their position, so the
  // role tint rules apply to them like any other column (deviation 13).
  // The [data-placeholder] layout rules may only control their wide-only
  // rendering, never their background.
  const placeholderRules = [...LAYOUT_BASE, ...LAYOUT_MEDIA].filter((r) =>
    r.selector.includes("[data-placeholder]"),
  );
  assert.ok(
    placeholderRules.length >= 1,
    "expected a [data-placeholder] layout rule",
  );
  for (const rule of placeholderRules) {
    assert.doesNotMatch(
      rule.declarations,
      /background-color/,
      "placeholder rendering rules must not override the role tint",
    );
  }
  const narrow = LAYOUT_BASE.find((r) =>
    r.selector.includes("[data-placeholder]"),
  );
  assert.match(
    narrow.declarations,
    /display:\s*none/,
    "placeholder columns stay hidden on narrow",
  );
  const wide = LAYOUT_MEDIA.find(
    (r) =>
      r.selector.startsWith("@media (min-width: 768px)") &&
      r.declarations.includes("[data-placeholder]"),
  );
  assert.ok(
    wide,
    "expected a min-width: 768px media block rendering placeholder columns",
  );
  assert.match(
    wide.declarations,
    /display:\s*block/,
    "placeholder columns render wide+ only",
  );
  const allRules = [
    ...BASE_RULES,
    ...MEDIA_RULES,
    ...LAYOUT_BASE,
    ...LAYOUT_MEDIA,
  ];
  for (const rule of allRules) {
    assert.doesNotMatch(
      rule.selector,
      /\[data-role="empty"\]/,
      'the data-role="empty" value is gone; placeholders use data-placeholder',
    );
  }
});

// --- narrow empty-column collapse (§7.2.5, deviation 14) ---------------------

test("the empty-column collapse is mobile-scoped and shared with the script", () => {
  // A column with no visible content collapses below 768 px so empty
  // cells do not waste vertical space. From 768 px up the class must be
  // inert: the tinted cell stays for the 3-column rhythm. The rule lives
  // in a max-width media query only — a base rule or a min-width
  // override could fight the grid item's own display.
  const narrow = UTILITIES_RULES.find(
    (r) =>
      r.selector.startsWith("@media (max-width:") &&
      r.declarations.includes(".col-empty-mobile"),
  );
  assert.ok(
    narrow,
    "expected a max-width media block hiding .col-empty-mobile",
  );
  assert.match(
    narrow.declarations,
    /\.col-empty-mobile\s*\{\s*display:\s*none/,
    "the max-width block must declare display: none for .col-empty-mobile",
  );

  const outside = UTILITIES_RULES.filter(
    (r) =>
      !r.selector.startsWith("@media (max-width:") &&
      r.declarations.includes(".col-empty-mobile"),
  );
  assert.equal(
    outside.length,
    0,
    "no rule outside the max-width block may target .col-empty-mobile",
  );

  // The executor toggles the same class name; a rename in one file
  // without the other would silently break the collapse.
  assert.match(
    SEARCH_APPLY_JS,
    /col-empty-mobile/,
    "search-apply.js must toggle the .col-empty-mobile class",
  );
});

test("category tint bases are removed from the token layer", () => {
  // Column tints come from the three role tokens; leftover category RGB
  // bases would be dead code.
  assert.doesNotMatch(TOKEN_ROOT, /--tint-brod:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-gronn:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-frukt:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-melk:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-notter:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-drikke:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-kjott:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-palegg:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-sukker:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-krydder:/);
  assert.doesNotMatch(TOKEN_ROOT, /--tint-saus:/);
});

// --- change-markers (§4.7, §6.6) -------------------------------------------

test("change-marker tokens exist and the base layer swaps the bullet", () => {
  // The glyphs are config-driven tokens in the generated token layer.
  for (const [key, token] of [
    ["default", "marker-default"],
    ["new", "marker-new"],
    ["moved", "marker-moved"],
    ["updated", "marker-updated"],
  ]) {
    assert.match(
      TOKENS_CSS,
      new RegExp(`--${token}:\\s*"${MARKERS[key]}"`),
      `--${token} must reproduce the config glyph ${MARKERS[key]}`,
    );
  }
  const baseRules = parseRules(BASE_CSS);
  // The plain bullet is sourced from --marker-default, not a hardcoded glyph.
  const plain = baseRules.find((r) => r.selector === "li.item::before");
  assert.ok(plain, "expected a rule for li.item::before");
  assert.match(
    plain.declarations,
    /content:\s*var\(--marker-default\)/,
    "the default bullet must source its glyph from --marker-default",
  );
  // Each data-change value resolves to its own emoji token in base.css.
  for (const [value, token] of [
    ["new", "marker-new"],
    ["moved", "marker-moved"],
    ["updated", "marker-updated"],
  ]) {
    const selector = `li.item[data-change="${value}"]::before`;
    const rule = baseRules.find((r) => r.selector === selector);
    assert.ok(rule, `expected a rule for ${selector}`);
    assert.match(
      rule.declarations,
      new RegExp(`content:\\s*var\\(--${token}\\)`),
      `${selector} must source its glyph from --${token}`,
    );
  }
});

test("item bullets center in a slot equal to the text gutter", () => {
  // Emoji glyphs have different intrinsic widths (the squared change
  // markers are wider than the default dot), so the glyph box alone would
  // push item text to different x positions. The bullet slot must equal
  // li.item's padding-left and center the glyph within it; both scale
  // with the text scale so the marker never overlaps the text at 150 %
  // (deviation 9).
  const baseRules = parseRules(BASE_CSS);
  const plain = baseRules.find((r) => r.selector === "li.item::before");
  assert.match(
    plain.declarations,
    /width:\s*var\(--size-bullet-slot\)/,
    "the bullet slot must come from --size-bullet-slot",
  );
  assert.match(
    plain.declarations,
    /text-align:\s*center/,
    "the glyph must center within the slot",
  );
  // The gutter and the slot are the same token: the item's text starts
  // exactly where the slot ends.
  const item = baseRules.find((r) => r.selector === "li.item");
  assert.match(
    item.declarations,
    /padding-left:\s*var\(--size-bullet-slot\)/,
    "the item gutter must equal the bullet slot",
  );
  assert.match(
    TOKENS_CSS,
    /--size-bullet-slot:\s*calc\(1\.25rem \* var\(--text-scale\)\)/,
    "the bullet slot must scale with the text scale",
  );
  // The tooltip hotspot must cover the whole slot, not just the glyph:
  // the centered marker can sit anywhere inside it.
  const hotspot = baseRules.find((r) => r.selector === "li.item .item-bullet");
  assert.match(
    hotspot.declarations,
    /width:\s*var\(--size-bullet-slot\)/,
    "the tooltip hotspot must cover the bullet slot",
  );
});

// --- note info-button (§4.6, deviation 17) -----------------------------------

test("the note button is a bare emoji glyph, sized like the item markers", () => {
  const componentRules = parseRules(COMPONENTS_CSS);
  const toggle = componentRules.find((r) => r.selector === ".note-toggle");
  assert.ok(toggle, "expected a rule for .note-toggle");
  // The box and circle are deprecated (deviation 17): the button must not
  // paint a width/height box or a corner radius.
  assert.doesNotMatch(
    toggle.declarations,
    /(?:^|;)\s*width\s*:/,
    "the note button must not declare a width box",
  );
  assert.doesNotMatch(
    toggle.declarations,
    /(?:^|;)\s*height\s*:/,
    "the note button must not declare a height box",
  );
  assert.doesNotMatch(
    toggle.declarations,
    /border-radius/,
    "the note button must not declare a corner radius",
  );
  assert.match(
    toggle.declarations,
    /font-size:\s*var\(--info-button-font-size\)/,
    "the glyph size must come from the info-button token",
  );
  // The box tokens are gone from the generated token layer; the glyph size
  // token is the marker base size wrapped in the text-scale calc, so the
  // default bullet, the change markers, and the note glyph render at the
  // same size at every scale level (§4.6, deviation 9).
  assert.doesNotMatch(TOKENS_CSS, /--info-button-width/);
  assert.doesNotMatch(TOKENS_CSS, /--info-button-height/);
  assert.doesNotMatch(TOKENS_CSS, /--info-button-border-radius/);
  const baseRules = parseRules(BASE_CSS);
  const bullet = baseRules.find((r) => r.selector === "li.item::before");
  const baseSize = INFO_FONT_SIZE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const calcExpr = new RegExp(
    `calc\\(${baseSize} \\* var\\(--text-scale\\)\\)`,
  );
  assert.match(
    bullet.declarations,
    calcExpr,
    "the marker glyph must scale with the text scale",
  );
  assert.match(
    TOKENS_CSS,
    new RegExp(`--info-button-font-size:\\s*${calcExpr.source}`),
    "the note glyph must use the same scaled size as the item markers",
  );
});
