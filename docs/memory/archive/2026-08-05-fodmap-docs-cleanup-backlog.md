---
topic: "FODMAP docs cleanup (executed)"
importance: low
category: fact
tags: [documentation, blueprint, codebase, cleanup, backlog]
created: 2026-08-05T14:07:34Z
model: opencode/deepseek-v4-flash-free
---

Executed 2026-08-05 (task file: `tasks/done/2026-08-05-docs-cleanup.md`):
`findings.md` deleted, dead role/color rules removed from
`src/css/components.css`, the `merge.js` list-form `attribution` parsing
gap fixed, BLUEPRINT.md/CODEBASE.md compressed, and the six `docs/*.md`
sync gaps fixed; 82 tests pass, the sync script is green.

Decision record: user decided three deferred actions (task file:
`tasks/2026-08-05-docs-cleanup.md`):
delete `findings.md`; fix dead role/color rules in `src/css/components.css`
(duplicate the generated `roles.css`, transliterated ids match nothing) and the
`merge.js` list-form `attribution` parsing gap; compress BLUEPRINT.md/CODEBASE.md
(~25 %/20 %) moving §12.2 deviation history into memory, keeping deviation
numbering. `docs/*.md` sync gaps found: groups `color` vs `text-color`+
`border-color`, missing `page.info-button` field, stale "not yet implemented"
claims in data-format.md/data-lifecycle.md.
