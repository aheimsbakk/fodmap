---
topic: "FODMAP build writes into src/, migration complete"
importance: low
category: fact
tags: [fodmap, build, migration, generated, src]
created: 2026-08-05T11:32:13Z
model: deepseek/deepseek-v4-flash-0731
---

The data-driven migration is complete: `node scripts/build/build.mjs src`
writes `index.html`, `css/tokens.css`, and `css/roles.css` directly into
`src/`; the artifacts are committed, so the deployed site needs no build
step (BLUEPRINT deviation 16). The renderers emit non-prettier style, so
regenerated output must be formatted with `npm run format` before
committing.
