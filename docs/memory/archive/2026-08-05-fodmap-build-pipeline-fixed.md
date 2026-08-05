---
topic: "FODMAP build pipeline fixed and test suite aligned"
importance: high
category: decision
tags: [fodmap, build, tests, migration, note-button]
created: 2026-08-05T10:38:30Z
model: opencode/deepseek-v4-flash-free
---

The build pipeline in `scripts/build/lib/render-html.js` crashed at render
time: `renderItem(it, info)` read `info.emoji` but `renderColumns` never
threaded the `info` argument from `cfg.page["info-button"]`. Fixed by
dropping the dead param: note buttons render empty with
`aria-label="Mer informasjon"`; the glyph is purely CSS `::before` using the
generated `--info-emoji` / `--info-emoji-matched` tokens (BLUEPRINT §4.6).
`build.mjs` CLI is now guarded by `process.argv[1]?.endsWith("build.mjs")`
so tests can import `build()`. All three jsdom suites (`content`, `search`,
`text-scale`) now load the generated page via `build().html` instead of the
stale hand-authored `src/index.html`; section `data-category` ids are the
Norwegian config ids (`brød`, `grønnsaker`, `kjøtt`, `pålegg`), not the old
ASCII transliterations. New `tests/build.test.js` covers the pipeline
(§13.4): 11 sections, 484 items, note-button contract. Run
`node scripts/build/build.mjs <out-dir>` then assemble static layers from
`src/` to get a runnable spike site.
