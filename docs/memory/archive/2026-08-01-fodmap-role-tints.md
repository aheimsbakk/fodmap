---
topic: "FODMAP columns tinted by role"
importance: high
category: decision
tags: [fodmap, tints, colors, roles]
created: 2026-08-01T09:49:05Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-08-01): column tints are role-based instead of
category-based, so the column ↔ role correspondence (SPIS/BEGRENSE/UNNGÅ)
is visible at a glance. Tokens: `--tint-spis: rgba(160, 196, 157, 0.2)`,
`--tint-begrens: rgba(247, 215, 116, 0.25)`,
`--tint-unnga: rgba(209, 93, 93, 0.15)` in `src/css/tokens.css`, applied
via `.content-col[data-role="..."]` in `src/css/components.css`. Category
colors now apply to the heading background only; the old `--tint-<category>`
RGB bases and the heading-sibling tint cascade were removed. Empty
placeholder columns (`data-role="empty"`) stay untinted. Documented as
BLUEPRINT.md §12.2 deviation 13.
