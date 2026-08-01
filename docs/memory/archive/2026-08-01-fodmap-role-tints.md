---
topic: "FODMAP columns tinted by role"
importance: high
category: decision
tags: [fodmap, tints, colors, roles]
created: 2026-08-01T14:39:24Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-08-01): column tints are role-based instead of
category-based, so the column ↔ role correspondence (SPIS/BEGRENSE/UNNGÅ)
is visible at a glance. Tokens: `--tint-spis: rgba(160, 196, 157, 0.2)`,
`--tint-begrens: rgba(247, 215, 116, 0.25)`,
`--tint-unnga: rgba(209, 93, 93, 0.15)` in `src/css/tokens.css`, applied
via `.content-col[data-role="..."]` in `src/css/components.css`. Category
colors now apply to the heading background only.

Update (2026-08-01): empty placeholder columns (Kjøtt cols 2–3, Pålegg
col 2, Krydder col 2) now carry the role of their position
(`data-role="begrens"/"unnga"`) and get the corresponding tint — the
earlier white cells broke the color rhythm next to tinted neighbors.
The `data-role="empty"` value is gone; placeholders are marked
`data-placeholder` (wide+ only via `src/css/layout.css`, excluded from
search filtering). Documented as BLUEPRINT.md §12.2 deviation 13.
