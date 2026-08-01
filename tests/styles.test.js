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
  assert.match(TOKEN_ROOT, /--tint-spis:\s*rgba\(160,\s*196,\s*157,\s*0\.2\)/);
  assert.match(
    TOKEN_ROOT,
    /--tint-begrens:\s*rgba\(247,\s*215,\s*116,\s*0\.25\)/,
  );
  assert.match(TOKEN_ROOT, /--tint-unnga:\s*rgba\(209,\s*93,\s*93,\s*0\.15\)/);
});

test("columns are tinted by role selector, not by position or category", () => {
  const roleSelectors = [
    '.content-col[data-role="spis"]',
    '.content-col[data-role="begrens"]',
    '.content-col[data-role="unnga"]',
  ];
  for (const selector of roleSelectors) {
    const rule = BASE_RULES.find((r) => r.selector === selector);
    assert.ok(rule, `expected a rule for ${selector}`);
    assert.match(
      rule.declarations,
      /background-color:\s*var\(--tint-/,
      `${selector} must reference a --tint-* token`,
    );
  }
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
