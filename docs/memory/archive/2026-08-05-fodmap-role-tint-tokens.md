---
topic: "FODMAP role tints live in generated role tokens"
importance: high
category: decision
tags: [fodmap, tints, colors, roles]
created: 2026-08-05T14:24:54Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-08-01): column tints are role-based instead of
category-based, so the column ↔ role correspondence (SPIS/BEGRENSE/UNNGÅ)
is visible at a glance. The values (SPIS `rgba(160, 196, 157, 0.2)`,
BEGRENSE `rgba(247, 215, 116, 0.25)`, UNNGÅ `rgba(209, 93, 93, 0.15)`)
live in the generated `--role-<id>-tint` tokens in `src/css/tokens.css`,
applied by the generated `src/css/roles.css` via
`.content-col[data-role="..."]` — the sole owner of role/section colors.
Category colors apply to the heading background only.

Update (2026-08-01): empty placeholder columns (Kjøtt cols 2–3, Pålegg
col 2, Krydder col 2) carry the role of their position and get the
corresponding tint — the earlier white cells broke the color rhythm next
to tinted neighbors. The `data-role="empty"` value is gone; placeholders
are marked `data-placeholder` (wide+ only, excluded from search
filtering). BLUEPRINT.md §12.2 deviation 13.

Update (2026-08-05, docs cleanup): the duplicate `--tint-*` tokens and
the dead `.content-col[data-role]` / `.legend-*` rules in
`src/css/components.css` were removed; hand-authored layers no longer
restate role colors (guarded by `tests/styles.test.js`).
