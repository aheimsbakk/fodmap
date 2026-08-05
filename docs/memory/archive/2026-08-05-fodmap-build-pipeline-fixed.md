---
topic: "FODMAP build pipeline fixed and test suite aligned"
importance: low
category: fact
tags: [fodmap, build, tests, migration, note-button]
created: 2026-08-05T10:38:30Z
model: opencode/deepseek-v4-flash-free
---

Test-suite facts after the build migration (2026-08-05): all three jsdom
suites (content, search, text-scale) load the generated page via
`build().html` instead of the committed `src/index.html`; `build.mjs`
guards its CLI with `process.argv[1]?.endsWith("build.mjs")` so tests can
import `build()`; section `data-category` ids are the Norwegian config
ids (`brød`, `grønnsaker`, `kjøtt`, `pålegg`), not ASCII
transliterations. The note-button glyph is purely CSS `::before` from the
generated `--info-emoji` / `--info-emoji-matched` tokens (BLUEPRINT §4.6);
`tests/build.test.js` covers the pipeline (§13): 11 sections, 510 items,
note-button contract.
