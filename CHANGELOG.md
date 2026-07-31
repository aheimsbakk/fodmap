# Changelog

## [0.0.0] - 2026-07-31

- **why:** Pre-implementation milestone: architecture, fidelity decisions, and tooling for the FODMAP reimplementation
- **model:** opencode/deepseek-v4-flash-free
- **tags:** fodmap, blueprint, architecture, setup

### Added

- `BLUEPRINT.md` with the language-agnostic architecture: component hierarchy, design tokens, state machine, and contracts
- `CODEBASE.md` mapping every blueprint component to physical files (`src/`, `tests/`, `scripts/`)
- `origin/fodmap.html` tracked as the absolute source of truth
- `README.md` (in Norwegian) with quick start, usage, source references, and script documentation
- `package.json` with pinned dev dependencies (`prettier@3.9.6`, `jsdom@29.1.1`) and `npm test` / `npm run format` scripts
- `scripts/verify_codebase_sync.sh` validating `CODEBASE.md` paths
- `scripts/bump-version.sh` and `scripts/validate-changelog.sh` for the wrap-up workflow
- `.gitignore` covering `node_modules/`, `.env`, and virtualenv directories
- Session memory under `docs/memory/` recording the fidelity decisions

### Changed

- Content fidelity policy finalized in `BLUEPRINT.md` §12.1: 20 user-approved corrections, emoji icons, small-print notes merged into item text
