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

test("every sub-group heading with content above it keeps the separator line", () => {
  // The base rule declares the line for every sub-group. Only the
  // first-block exception (separate test) may strip it, and only on wide
  // screens where the mobile label is hidden.
  const base = declarationsFor(".sub-group-title");
  assert.match(
    base,
    /border-top:\s*1px\s+solid\s+var\(--color-subgroup-line\)/,
    ".sub-group-title base rule must declare the top separator line",
  );
  assert.doesNotMatch(
    base,
    /border-top:\s*none/,
    "the base rule itself must not remove the line",
  );
});

test("a sub-group opening its column drops the separator only at wide widths", () => {
  // At ≥ 768 px the mobile label is hidden, so a sub-group that opens its
  // column has nothing above it to separate from; a floating line there is
  // the defect. Below 768 px the label sits above it, so the line stays —
  // the exception must live inside a min-width media query. It must target
  // true first blocks only (label directly followed by the sub-group, or
  // the sub-group as first child), never :first-of-type: a sub-group below
  // a main item list has content above it and keeps the line.
  const wide = MEDIA_RULES.find(
    (r) =>
      r.selector.startsWith("@media (min-width: 768px)") &&
      r.declarations.includes(".sub-group-title"),
  );
  assert.ok(wide, "expected a min-width: 768px media block");
  assert.match(
    wide.declarations,
    /\.content-col\s*>\s*\.role-label\s*\+\s*\.sub-group-title/,
    "first-block exception must target the label + sub-group pattern",
  );
  assert.match(wide.declarations, /border-top:\s*none/);
  const firstOfType = [...BASE_RULES, ...MEDIA_RULES].find(
    (r) =>
      r.selector.includes(".sub-group-title") &&
      r.selector.includes(":first-of-type"),
  );
  assert.ok(
    !firstOfType,
    "no :first-of-type rule may strip the separator (a main list above counts as content)",
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
