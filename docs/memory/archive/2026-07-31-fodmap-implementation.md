---
topic: "FODMAP reimplementation implemented"
importance: high
category: pattern
tags: [fodmap, implementation, search, css, tests, playwright]
created: 2026-07-31T15:15:00Z
model: opencode/deepseek-v4-flash-free
---

Live implementation patterns from the reimplementation (the status history
lives in git):

- `src/js/search.js` MUST self-boot (`if (typeof document !== "undefined")
initSearch(document)`); the jsdom tests call `initSearch` manually, so a
  missing auto-init would pass tests and leave the browser page inert.
- `data-category` appears on BOTH `section.category-section` and its
  `h3.category-heading`: CSS heading-color rules consume the heading's
  copy, scripts and tests the section's copy; dropping either copy
  silently kills heading colors (CODEBASE §2.1).
- Node quirk: `node --test tests/` fails ("Cannot find module"); use the
  glob `node --test "tests/*.test.js"` (set in `package.json`).
- Real-browser verification (playwright-cli) is part of the verification
  loop; jsdom parity alone is not enough (CODEBASE §5.4).
