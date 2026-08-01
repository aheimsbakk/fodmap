---
topic: "FODMAP empty columns collapse on mobile search"
importance: high
category: decision
tags: [fodmap, search, columns, mobile, collapse]
created: 2026-08-01T19:07:42Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-08-01): on narrow viewports (below 768 px) a column
whose content is fully filtered out collapses entirely instead of leaving
a tinted empty cell — saves vertical space. The matcher in
`src/js/search.js` computes a per-column `empty` flag (placeholder columns
never marked); the executor toggles the `.col-empty-mobile` class, defined
in `src/css/utilities.css` inside `@media (max-width: 767.98px)` only, so
it is inert from 768 px up where the tinted cell keeps the 3-column
rhythm. Every re-render recomputes the flag, so a column returns as soon
as any item or sub-group heading in it matches, or the category heading
matches; the IDLE plan removes the class. Documented as BLUEPRINT.md
deviation 14 (§7.2.5).
