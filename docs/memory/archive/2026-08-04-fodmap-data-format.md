---
topic: "FODMAP versioned data format decided"
importance: high
category: decision
tags: [fodmap, data-format, history, frontmatter, merge]
created: 2026-08-04T13:48:17Z
model: openrouter/deepseek/deepseek-v4-flash-0731
---

User chose a versioned, delta-driven content format stored under `data/`
(baseline + per-date delta folders), documented in `docs/data-format.md`
(spec) and `docs/data-lifecycle.md` (user guide). Key decisions: slug is
the item id; section folders use config ids from `data/config.json`; UTF-8
ids, keys, and values; `sections` and `groups` are ordered **arrays with
explicit `id`** (folder lookup + frontmatter mapping) and group entries
carry `tint`; `config.json` also holds the whole page text (`page`:
masthead, search, info banner, footer) plus `subgroups`/`footnoteTypes`
as keyed objects; merge is oldest→newest with field-level inheritance,
explicit-empty clears, body notes prepend; `visible: false` is the removal
signal; folders sort `YYYY` before `YYYY-MM` before `YYYY-MM-DD`; lowercase
ids/keys recommended; schema version stays `1` while iterating. The
format is implemented by the build (`scripts/build/lib/merge.js` +
`render-html.js`); the spec is `docs/data-format.md`, the merge rules
BLUEPRINT §6.3.
