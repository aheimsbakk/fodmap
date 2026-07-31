# Changelog

## [0.2.0] - 2026-07-31

- **why:** Fix info banner color parity and add automated deployment to GitHub Pages
- **model:** opencode/deepseek-v4-flash-free
- **tags:** colors, css, github-pages, cicd

### Added

- `.github/workflows/deploy-pages.yml` deploying `src/` to GitHub Pages on push to main (direct pushes and merges only)

### Fixed

- Info banner text color now matches the origin's `text-gray-700` (`#374151`) in `src/css/tokens.css`
- Footer disclaimer uses its own gray-600 token (`--color-footer-secondary`) instead of sharing the banner token

## [0.1.0] - 2026-07-31

- **why:** First working reimplementation of the FODMAP overview with full content parity and live search
- **model:** opencode/deepseek-v4-flash-free
- **tags:** fodmap, reimplementation, search, css, tests

### Added

- `src/index.html`: full page markup with 11 category sections, 484 items, legends, footnote banners, and footer
- `src/css/` token-driven stylesheets (`tokens.css`, `base.css`, `layout.css`, `components.css`, `utilities.css`) replacing Tailwind classes
- `src/js/search.js`: word-based search with heading reveal, item highlighting, clear button, and scroll-aware input blur
- `tests/content.test.js` checking text parity with the origin and per-column item counts
- `tests/search.test.js` covering search behavior in a jsdom environment

### Fixed

- Search module now boots automatically in the browser (`initSearch` call on load)
- Category headings carry `data-category` so heading colors and column tints render
- `scripts/verify_codebase_sync.sh` now parses nested paths and validates all documented files

### Changed

- `package.json` test glob works on Node 26 (`node --test "tests/*.test.js"`)
- `CODEBASE.md` and `BLUEPRINT.md` updated to match the implemented markup and rendering

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
