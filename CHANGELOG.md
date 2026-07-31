# Changelog

## [0.7.0] - 2026-07-31

- **why:** User request: credit the developer and license the project in the footer
- **model:** opencode/deepseek-v4-flash-free
- **tags:** footer, credit, license, attribution

### Added

- `LICENSE`: MIT License (official OSI text, holder Arnulf Heimsbakk, 2026)
- `src/index.html`: footer credit line "Utviklet av Arnulf Heimsbakk // Kildekode på github.com/aheimsbakk/fodmap // Lisens MIT" with the repository linked to https://github.com/aheimsbakk/fodmap/ (new tab)

### Changed

- `src/index.html`: footer reordered to disclaimer, source line, credit line with equal 0.5 rem gaps; a trial separator (em dash, dashed, then solid) was removed again; only the disclaimer line is bold; disclaimer text drops the trailing period
- `src/css/components.css`: `.footer-disclaimer` bold with 0.5 rem bottom margin, `.footer-credit` 0.5 rem top margin, link underline/hover shared with the source line
- `BLUEPRINT.md` §5.8 and §12.2 deviation 10: footer order, weight, and credit-line wording documented
- `CODEBASE.md`: footer element mapping, LICENSE entry in the repository tree

## [0.6.1] - 2026-07-31

- **why:** User request: the masthead tagline reads "Vanlige matvarer" instead of "Vanlige matvarer på"
- **model:** opencode/deepseek-v4-flash-free
- **tags:** masthead, sub-title, content, fidelity

### Changed

- `src/index.html`: masthead sub-title shortened from "Vanlige matvarer på" to "Vanlige matvarer"; the shorter line keeps the one-line guarantee with more headroom. The browser tab title stays "Vanlige matvarer på FODMAP" (grammatically required there)
- `BLUEPRINT.md` §3 and §12.1 record the correction in the approved-corrections table

## [0.6.0] - 2026-07-31

- **why:** Give users a way to enlarge the content text without breaking the compact layout
- **model:** opencode/deepseek-v4-flash-free
- **tags:** text-scale, accessibility, storage, tokens

### Added

- `src/js/text-scale.js`: new module cycling the content text size through 100 % / 125 % / 150 % via `data-text-scale` on the root element; the level persists in `localStorage` (`fodmap-text-scale`) and degrades to session-only when storage is blocked
- `src/index.html`: `Aa` toggle button in the sticky search widget, with `aria-label` and a live `title` reporting the current level
- `tests/text-scale.test.js`: cycling, storage write/restore, invalid and blocked storage fallbacks, independence from an active search, and the missing-button inert path

### Changed

- `src/css/tokens.css`: content font-size tokens are wrapped in `calc(base × var(--text-scale))`; the multiplier levels live in `html[data-text-scale="..."]` rules; masthead titles, spacing, borders, widget height, and sticky offsets stay fixed so the view remains compact
- `src/css/base.css`: `li.item` declares `overflow-wrap: anywhere` so unbreakable tokens ("Maltodextrin/maltose/maltekstrakt") wrap instead of widening the column at 150 %
- `src/css/components.css`: `.text-scale-toggle` control styling
- `tests/styles.test.js`: token contract guards for the multiplier levels, the scaled vs fixed token sets, and the item overflow-wrap rule
- `BLUEPRINT.md` §1, §2, §3, §4.3, §5.3, §7, §8, §9, §10, §12.2 (deviation 9), and §13.1 document the toggle
- `CODEBASE.md` module, markup, token, storage, and test mapping reflect the feature

## [0.5.1] - 2026-07-31

- **why:** The masthead tagline wrapped onto two lines on narrow screens; it must always stay on one line
- **model:** opencode/deepseek-v4-flash-free
- **tags:** masthead, sub-title, css, responsive

### Fixed

- `src/css/components.css`: the sub-title declares `white-space: nowrap`; on narrow viewports the size steps down (≤ 457 px → 1 rem, ≤ 372 px → 0.875 rem, ≤ 329 px → 0.8125 rem) so the single line also fits without horizontal overflow down to 320 px

### Added

- `tests/styles.test.js`: stylesheet contract guards — the base `.sub-title` rule keeps `white-space: nowrap`, and the narrow-viewport size steps exist

### Changed

- `BLUEPRINT.md` §5.2, §4.3, and §12.2 (deviation 8) document the one-line sub-title guarantee
- `CODEBASE.md` tree, components mapping, and test-suite notes reflect the new stylesheet guard

## [0.5.0] - 2026-07-31

- **why:** Make sub-group headings searchable so a term like "sjømat" reveals the whole "Fisk/sjømat:" list with the same marker style as a category match
- **model:** opencode/deepseek-v4-flash-free
- **tags:** search, sub-group, highlight, visibility

### Added

- `src/js/search.js`: sub-group headings (`h4.sub-group-title`) now match the query; a heading match keeps every item in its list visible and highlights the heading with the `.marker` style used for category headings

### Changed

- `src/js/search.js`: sub-group titles are captured at load time (`data-orig-html`) for restore; items keep a reference to their sub-group so a group match reveals them
- `tests/search.test.js`: new test covering the "sjømat" → "Fisk/sjømat:" flow, including reveal, marker highlight, collapse of non-matching groups, and restore on clear
- `BLUEPRINT.md` §7.2 (rules 2, 3, 5–7), §8, and §13.1 document sub-group heading matching
- `CODEBASE.md` element hooks and matcher/test descriptions reflect sub-group heading search

## [0.4.1] - 2026-07-31

- **why:** Make the Smakstilsetning, saus, dressing section visually distinct: its color was indistinguishable from Krydder og urter, and its icon read as lotion
- **model:** opencode/deepseek-v4-flash-free
- **tags:** colors, icons, css, fidelity

### Changed

- `src/css/tokens.css`: Smakstilsetning, saus, dressing color set is now muted lavender (`#b9a7cf` / `185, 167, 207`) instead of gray-green (`#a4b8a2`), which was indistinguishable from the Krydder og urter set
- `src/index.html`: section 11 icon changed from 🧴 to 🫗 (pouring liquid)
- `BLUEPRINT.md` §4.1, §9.2, and §12.2 (deviation 7) document the new color and icon

## [0.4.0] - 2026-07-31

- **why:** Add NKFM as a second footer source and keep the footer version in sync with VERSION
- **model:** opencode/deepseek-v4-flash-free
- **tags:** footer, versioning, sources, scripts

### Added

- Footer source line lists NKFM – Lav FODMAP-mat ved IBS (Helse Bergen) as a second attribution link alongside NHI.no
- `scripts/bump-version.sh` updates the `FODMAP vX.Y.Z` marker in `src/index.html` together with `VERSION`; it fails before any write when the marker is missing, so the two can never drift apart

### Changed

- `src/index.html` footer source line is now `FODMAP v0.4.0 // Kilder:` with both links; the disclaimer line is unchanged
- `BLUEPRINT.md` §5.8, §11, and §12.2 (deviation 6) document the new footer and the added external dependency
- `README.md` Skript section documents `bump-version.sh` usage
- `CODEBASE.md` script description reflects the footer sync

## [0.3.0] - 2026-07-31

- **why:** Remove the Google Fonts dependency so the page needs no remote assets and works fully offline
- **model:** opencode/deepseek-v4-flash-free
- **tags:** fonts, dependencies, offline, typography

### Removed

- Google Fonts stylesheet and preconnect links from `src/index.html` (Oswald, Bebas Neue, Open Sans)

### Changed

- `src/css/tokens.css`: font role tokens (`--font-body`, `--font-heading`, `--font-display`) now alias the native `system-ui` stack through the new `--font-system` token
- `BLUEPRINT.md` §12.2 deviation 5 documents the font substitution; the masthead title renders wider with system fonts
- `README.md` configuration section now states that no fonts are downloaded and the page works offline

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
