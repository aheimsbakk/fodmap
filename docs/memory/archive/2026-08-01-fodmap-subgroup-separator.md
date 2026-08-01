---
topic: "FODMAP sub-group separator line removed"
importance: high
category: decision
tags: [fodmap, sub-groups, separator, css, search]
created: 2026-08-01T13:59:03Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-08-01): sub-group headings have no separator line.
The uniform 1 px `border-top` added 2026-07-31 (deviation 11) is removed
everywhere, including the wide-screen flush exception media query — under
a FILTERED search a visible heading can sit below hidden items, leaving
the line floating. Separation from the preceding block is margin-only
(0.75 rem top margin) in `src/css/components.css`. The
`--color-subgroup-line` token was deleted from `src/css/tokens.css`.
Guarded by tests/styles.test.js (no border-top on `.sub-group-title`,
no media query special-casing, token gone). Supersedes the uniform
separator rule documented in BLUEPRINT.md deviation 11 (rewritten).
