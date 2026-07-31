---
topic: "FODMAP page uses system fonts"
importance: high
category: decision
tags: [fodmap, fonts, dependencies, offline]
created: 2026-07-31T15:42:25Z
model: opencode/deepseek-v4-flash-free
---

User decision (2026-07-31): the FODMAP page must not depend on Google
Fonts or any third-party font. All three type roles (body, heading,
display) use the platform's native `system-ui` stack via the
`--font-system` token in `src/css/tokens.css`; the font `<link>`s were
removed from `src/index.html`. The page now has zero remote assets.
Documented as BLUEPRINT.md §12.2 deviation 5 — Oswald's condensed look
is approximated by bold+uppercase, and Bebas Neue's narrow masthead
renders wider with system fonts (accepted platform-variability trade-off,
same as emoji). Do not reintroduce webfonts without asking the user.
