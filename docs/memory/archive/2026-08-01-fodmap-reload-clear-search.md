---
topic: "Search field cleared on reload"
importance: low
category: decision
tags: [fodmap, search, reload, form-restore]
created: 2026-08-01T22:07:05Z
model: openrouter/deepseek/deepseek-v4-flash-0731
---

Browsers restore typed form values on reload, but the FODMAP filter state is
never persisted. `initSearch` now clears `input.value` on boot (plus
`autocomplete="off"` on the input) so reload always renders from IDLE. Keep
the clear; do not persist the search query.
