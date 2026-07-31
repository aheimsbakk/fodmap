---
topic: "FODMAP reimplementation implemented"
importance: high
category: decision
tags: [fodmap, implementation, search, css, tests, playwright]
created: 2026-07-31T15:15:00Z
model: opencode/deepseek-v4-flash-free
---

The FODMAP reimplementation is implemented and verified (v0.1.0, branch
`convert`). Physical layout: `src/index.html` entry point, styles in
`src/css/` (tokens-driven, 5 stylesheets), search engine in
`src/js/search.js`, tests in `tests/`. 484 items across 11 sections;
per-column counts live in `EXPECTED_COUNTS` in
`tests/content.test.js` (sum 484).

Search design: pure `buildMatcher()` + DOM `applyPlan(plan)` +
`initSearch(document)`; capture at load stores `data-orig-text` /
`data-orig-html` for restore; `li` text is trimmed at capture;
heading regex excludes tags with `(?![^<]*>)`. The module MUST
self-boot (`if (typeof document !== "undefined") initSearch(document)`)
or the browser page stays inert — jsdom tests call `initSearch`
manually and would not catch a missing auto-init.

Markup: `data-category` appears on BOTH the `section.category-section`
and its `h3.category-heading` — the CSS tint rules use sibling
selectors on the heading's copy; the scripts/tests address the
section's copy. Dropping either copy silently kills heading colors.

Node 26.5.0 quirk: `node --test tests/` fails ("Cannot find module");
use the glob `node --test "tests/*.test.js"` (set in `package.json`).

Real-browser smoke test (playwright-cli) is part of the verification
loop; jsdom parity alone is not enough.
