---
topic: "FODMAP standalone without origin dependency"
importance: high
category: decision
tags: [fodmap, origin, blueprint, content-tests, standalone]
created: 2026-08-01T19:49:00Z
model: openrouter/deepseek/deepseek-v4-flash-0731
---

User decision (2026-08-01): the app stands on its own; `origin/fodmap.html`
is removed from the repo and no artifact depends on it. `BLUEPRINT.md` is
now the authoritative content spec: §6.2 frozen section inventory and
§12.1 canonical spellings (formerly "approved corrections"), §12.2
rewritten as standalone design decisions. `tests/content.test.js` no longer
loads the origin; it asserts section order, per-column counts (total 484),
and the canonical spellings duplicated as test data. README no longer
frames the page as a reimplementation; the NKFM page remains the upstream
content source for updates.
