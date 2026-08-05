# Task: Docs cleanup and repo hygiene (deferred)

Status: executed 2026-08-05 (all three decisions done; tests and sync script green).

Analysis outcome: BLUEPRINT.md (1147 lines) and CODEBASE.md (457 lines) are
accurate against the code (all 78 tests pass, sync script passes), but long;
`docs/*.md` has six sync gaps; the code has two hygiene issues. The user
chose the following three actions.

## Decision 1 — delete findings.md

- Delete `/work/findings.md` (Norwegian PDF-comparison analysis, 2026-08-01).
- Its source PDF (`matvarelister_mai-25.pdf`) is already deleted; the content
  fed the 2025-05 release and is referenced nowhere.
- Remove it from git with `git rm`.

## Decision 2 — clean up dead code

Two code fixes, test-first per RULES §19:

1. **Dead rules in `src/css/components.css`** (~90 lines, migration
   leftovers that duplicate the generated `roles.css`):
   - `.legend-spis` / `.legend-begrens` / `.legend-unnga` (lines ~167–183) —
     no such classes in the markup.
   - `.category-heading[data-category="gronnsaker|notter|kjott|palegg"]`
     (lines ~227–265) — transliterated ids; generated markup uses real ids,
     so they match nothing; the remaining category rules are overridden by
     the generated layer.
   - `.content-col[data-role="spis|begrens|unnga"]` tint rules (lines
     ~272–282) — markup writes `data-role="unngå"` (with å), so the UNNGÅ
     rule never matches; all three duplicate `roles.css`.
   - `.content-col[data-role=...] .role-label` color rules (lines ~298–314) —
     duplicated by the generated layer.
   - Result: `roles.css` (generated from config) becomes the sole owner of
     role/section colors, matching CODEBASE §2.2's authoring contract and
     deviation 1/13. `--color-spis-*` / `--color-unnga-border` tokens may
     become unused; check and simplify `render-tokens.js` palette() if so.
   - `tests/styles.test.js` "columns are tinted by role selector" currently
     asserts the dead components.css text (with `data-role="unnga"`) —
     re-target the guard at the generated `roles.css` / `--role-*` tokens.

2. **`scripts/build/lib/merge.js` drops list-form `attribution`**:
   - `parseItem` matches only `key: value` lines; YAML list lines
     (`  - https://…`) are skipped, so ~70 data files' attribution parses as
     `""` (an explicit clear per docs/data-format.md §7.2).
   - Fix: parse list continuation lines into an array, or downgrade the docs
     — user preference: fix the parser (docs/data-format.md §4.1 documents
     the list form; the data already uses it).
   - Nothing renders attribution today, so no visual impact either way.

## Decision 3 — compress BLUEPRINT.md and CODEBASE.md; move decision history to memory

- **BLUEPRINT.md** (target ~850 lines, ~25 % smaller, zero information loss):
  - §12.2 (19 deviations, ~140 lines): compress each to decision + rationale
    - pointer to the normative section (§4–§7); keep the numbering — it is
      referenced by CODEBASE.md and tests.
  - §13 Verification (~90 lines): compress to contract-level one-liners per
    test file; detail stays in CODEBASE §5.4 and the tests.
  - Clear-language tightening of prose throughout; keep all tables (§4
    tokens, §6.5 inventory, §9.2 icons) — they are frozen contracts.
  - Move the verbose decision history (dates, "user request" context) into
    `docs/memory/archive/` entries per the memory skill.
- **CODEBASE.md** (target ~360 lines, ~20 % smaller):
  - §5 Implementation Rationale (~135 lines): condense to mapping-focused
    sentences; do not re-state BLUEPRINT rationale.
  - Keep §2 mapping tables (core content).
- Note: this doc work also fixes the six `docs/*.md` sync gaps found during
  the analysis (unless the code fixes above change them):
  - `config-format.md` §3.3: groups field `color` → `text-color` +
    `border-color`.
  - `config-format.md` §3.1: `page` table missing `info-button` field.
  - `config-guide.md` §1: "eight parts" → seven; page list misses
    `info-button`; §4.5 group fields miss `border-color`.
  - `data-format.md` intro: "not yet implemented" is stale.
  - `data-lifecycle.md` §2.4: "build step is a later concern" is stale
    (build exists: `node scripts/build/build.mjs src`).
- Afterwards: rerun `npm test` and `./scripts/verify_codebase_sync.sh`;
  remember to add `findings.md`'s removal to the sync picture.

## Execution order

1. Decision 2 (code fixes, test-first) → tests green.
2. Decision 3 (doc compression + sync fixes) → tests + sync script green.
3. Decision 1 (`git rm findings.md`).
4. Wrap up: sync commit (`docs(sync):`) precedes the feature/fix commit per
   AGENTS.md.
