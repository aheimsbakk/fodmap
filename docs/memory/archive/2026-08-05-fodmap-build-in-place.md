---
topic: "FODMAP build writes into src/, migration complete"
importance: high
category: decision
tags: [fodmap, build, migration, generated, src]
created: 2026-08-05T11:32:13Z
model: deepseek/deepseek-v4-flash-0731
---

The data-driven migration is complete. `node scripts/build/build.mjs src` writes `index.html`, `css/tokens.css`, and `css/roles.css` directly into `src/`; these generated artifacts are committed, so the deployed site needs no build step. The hand-authored `src/index.html` is retired. Regenerate output must be formatted with `npm run format` before committing, because the renderers emit non-prettier style. The `tmp/` scratch directory was removed; BLUEPRINT deviation 16 and CODEBASE were updated to reflect the completed migration.
