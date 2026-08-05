# Task: Memory audit — stale, deprecated, and misclassified entries (deferred)

Status: executed 2026-08-05 — report below; task moved to tasks/done.

Goal: go through `docs/memory/` and clean it up. Mark stale or deprecated
decisions, verify the importance levels (not everything should be `high`),
mark genuine decisions clearly as `decision`, and mark everything else as
`note`.

## Current state (2026-08-05)

- `docs/memory/INDEX.md` has 19 rows; `docs/memory/archive/` holds 19 files.
- Categories: 17 rows say `decision`, 1 says `preference` (README manual),
  1 says `decision` but is the docs-cleanup backlog entry.
- Importance: 16 rows `high`, 1 `medium` (README), 1 `low` (search cleared
  on reload), 1 `high` (docs-cleanup backlog).
- No row has an `expires` date.

## Suspected issues to verify

1. **Stale / superseded entries** — the memory skill says to skip entries
   already captured in `AGENTS.md` / `RULES.md` / `BLUEPRINT.md`:
   - "FODMAP search cleared on reload" (low) — behavior is now documented in
     BLUEPRINT §7.1 and tested; likely superseded → mark as such or delete.
   - "FODMAP emoji icons (deprecated)" — the topic itself says deprecated;
     confirm what it records and mark it `deprecated` in body + INDEX, or
     delete if the information is fully captured elsewhere.
   - "FODMAP build pipeline fixed and tests aligned" and "FODMAP build writes
     into src/, migration complete" — these read as status reports, not
     decisions; likely reclassify as `note`.
   - "FODMAP reimplementation implemented" — check whether it is history or
     still carries a live decision.
2. **Importance inflation** — decide a criterion (e.g., `high` only for
   decisions that still constrain future work or reverse cost is high) and
   downgrade entries that do not meet it.
3. **Category misuse** — per user preference, entries that are not genuine
   decisions must be marked `note` (facts, status reports, implemented
   outcomes). The memory skill's category set is
   `preference / decision / fact / pattern / warning`; decide whether to
   extend it with `note` or map to the closest existing category, and state
   the choice in the task report.

## Steps

1. Read `docs/memory/INDEX.md` and every `docs/memory/archive/*.md`.
2. Cross-check: every INDEX row ↔ archive file exists both ways; front
   matter (topic, category, importance, tags, created) matches its row.
3. For each entry classify: genuine decision → keep `decision`; otherwise
   `note` (or closest skill category). Correct importance. Add `expires`
   where the entry has a known shelf life; delete entries fully superseded
   by BLUEPRINT/CODEBASE/tests.
4. Update the archive files and INDEX rows accordingly; never keep both
   versions of conflicting entries (per memory skill).
5. Report: kept-as-decision N, reclassified-as-note M, deleted K, plus the
   category-set choice. Do not touch the docs-cleanup backlog entry's
   content beyond what the audit requires.

## Constraints

- Strict template (RULES §25): front matter keys, casing, and INDEX columns
  stay as defined by the memory skill.
- After the audit, re-read INDEX for the session's needs (prune expired).
- This is documentation-only work: no code, no tests required (RULES §19
  exception for doc-only changes).

## Report (2026-08-05)

- **Category-set choice:** do NOT extend the skill's category set with
  `note`; status/history entries map to the existing `fact`, implementation
  gotchas to `pattern`.
- **Kept as decision:** 8 (category-colors, system-fonts, role-tint-tokens,
  subgroup-separator, mobile-empty-columns, standalone, data-format,
  note-ring-popover-bold). Kept as preference: 1 (readme-manual).
- **Reclassified:** 5 — implementation → `pattern`; build-pipeline-fixed,
  build-in-place, docs-cleanup-backlog, user-requests → `fact`.
- **Deleted:** 2 — emoji-icons (deprecated; current parts captured in
  BLUEPRINT §9.2 / deviation 3 / CODEBASE §3), reload-clear-search (fully
  superseded by BLUEPRINT §7.1 and the search tests).
- **Importance downgrades:** build-pipeline-fixed high→low,
  build-in-place high→low, docs-cleanup-backlog high→low (criterion:
  high only for decisions still constraining future work or with high
  reverse cost).
- **Stale content fixed in place (created preserved):** data-format
  "not yet implemented" → implemented by the build; standalone and
  build-pipeline-fixed item counts 484 → 510 (BLUEPRINT §6.5);
  mobile-empty-columns §7.2.5 → §7.2 rule 5; implementation trimmed to
  live gotchas (self-boot, data-category duplication, Node test glob,
  Playwright loop).
- **INDEX consistency:** 16 rows/files at start → 14; topics aligned to
  file front matter (standalone row was missing "dependency"); categories
  and importances now match; both-way file↔row existence verified.
- **Side find:** CODEBASE §3 "Scripts" row said `npm test` → `node --test
tests/`; corrected to the actual glob (bare form fails on Node 26).
- **Expires:** none added — no entry has a known shelf life.
- **Result:** 14 entries — 8 decision, 1 preference, 4 fact, 1 pattern.
