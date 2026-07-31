---
topic: "FODMAP category color sets"
importance: high
category: decision
tags: [fodmap, colors, palette, design]
created: 2026-07-31T22:34:45Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-07-31): every category gets a color set related to its
content. The origin's reuses are removed: Nøtter og frø no longer
duplicates the Brød set (now walnut brown `#a9744f` / tint `169, 116, 79`),
and Pålegg no longer reuses Brød's tint base (now its own beige
`#d1bfae` / `209, 191, 174`, matching the heading = tint pattern of the
other nine categories). The lavender Smakstilsetning set is replaced by
a sauce-red terracotta (`#d97744` / `217, 119, 68`). Values live in
`src/css/tokens.css` and are documented in BLUEPRINT.md §4.1 and
§12.2 deviations 7 and 12. Brød, Grønnsaker, Frukt, Melk, Drikke,
Kjøtt, Sukker, and Krydder are unchanged.
