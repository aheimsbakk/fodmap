# Changelog

## [0.10.3] - 2026-08-01

- **why:** User request: empty columns left by a search wasted vertical space in the stacked mobile layout; hide them and restore them as soon as they have content again
- **model:** opencode/deepseek-v4-flash-free
- **tags:** search, columns, mobile, collapse

### Changed

- `src/js/search.js`: the matcher marks each column `empty` when it has no visible content and the category heading does not match (placeholder columns are never marked); the executor toggles the narrow-only `.col-empty-mobile` class from that flag. Every re-render recomputes the flag, so a column returns as soon as any item or sub-group heading in it matches, or the category heading matches; the IDLE plan removes the class
- `src/css/utilities.css`: `.col-empty-mobile { display: none }` lives in `@media (max-width: 767.98px)` only, so the class is inert from 768 px up and the tinted cell keeps the 3-column rhythm
- `tests/search.test.js`: new coverage for the collapse and the restore (item match, heading match, clear); the sub-group and placeholder tests assert the marker is never placed on content-bearing or placeholder columns
- `tests/styles.test.js`: new guard — the collapse rule exists, is scoped to a max-width media query, and shares its class name with `src/js/search.js`
- `BLUEPRINT.md` §7.2.5 and §12.2 deviation 14 document the narrow collapse; `CODEBASE.md` §2.2, §2.3, §5.1–§5.3 and the README describe the implementation

## [0.10.2] - 2026-08-01

- **why:** User request: empty placeholder columns showed no background while their neighbors were tinted; give them the tint of the role they reserve
- **model:** opencode/deepseek-v4-flash-free
- **tags:** tints, placeholders, columns, css

### Fixed

- `src/index.html`: the four empty placeholder columns (Kjøtt, egg, fisk columns 2–3; Pålegg column 2; Krydder og urter column 2) carry the role of their position (`data-role="begrens"` / `"unnga"`) instead of `data-role="empty"`, so the role tint rules color them like any other column; the `data-placeholder` attribute marks them for the wide-only rendering rule
- `src/css/layout.css`: the wide-only rules target `.content-col[data-placeholder]` instead of `[data-role="empty"]`
- `src/css/components.css` and `src/css/tokens.css`: comments updated; the role tint rules are unchanged and now also apply to placeholders
- `src/js/search.js`: no logic change — placeholders have no items or labels, so filtering never touches them (comment updated)
- `tests/styles.test.js`: the "empty stays untinted" guard is replaced by guards asserting the placeholder rendering rules never override the role tint, the wide-only contract holds, and the `data-role="empty"` value is gone
- `tests/search.test.js`: the placeholder test targets `[data-placeholder]` and asserts the positional role is present
- `BLUEPRINT.md` §4.1, §5.7, §6.1, §7.2.8, and §12.2 deviation 13 document the tinted placeholders
- `CODEBASE.md` §2.1 and §5.2 document the `data-placeholder` marker

## [0.10.1] - 2026-08-01

- **why:** User request: remove the separator line above sub-group titles — under search the line floated above visible headings whose items were hidden
- **model:** opencode/deepseek-v4-flash-free
- **tags:** sub-group, separator, css, search

### Fixed

- `src/css/components.css`: `.sub-group-title` no longer draws a 1 px separator line or top padding; separation from the preceding block is margin-only (0.75 rem), identical at every width and in both search states. The ≥ 768 px first-block exception media query is removed with it
- `src/css/tokens.css`: the unused `--color-subgroup-line` token is removed
- `tests/styles.test.js`: the two separator-line tests are replaced by one guard — no `border-top` or `padding-top` on `.sub-group-title`, no media query special-casing sub-groups, and the token is gone from both stylesheets
- `BLUEPRINT.md` §5.6, §4.1, and §12.2 deviation 11 document the line-free sub-group contract
- `CODEBASE.md` §5.3 documents the new stylesheet guard

## [0.10.0] - 2026-08-01

- **why:** User request: tint columns by role so SPIS/BEGRENSE/UNNGÅ columns are identifiable at a glance
- **model:** opencode/deepseek-v4-flash-free
- **tags:** tints, colors, roles, columns

### Changed

- `src/css/tokens.css`: the 11 category tint bases are replaced by three role tint tokens (`--tint-spis` `rgba(160, 196, 157, 0.2)`, `--tint-begrens` `rgba(247, 215, 116, 0.25)`, `--tint-unnga` `rgba(209, 93, 93, 0.15)`); category colors now apply to the heading background only
- `src/css/components.css`: columns tint by role via `.content-col[data-role="spis|begrens|unnga"]` instead of the category-color cascade at 10 %/20 %/10 % opacity; empty placeholder columns stay untinted
- `tests/styles.test.js`: four contract guards — role tint tokens exist, role selectors reference them, `[data-role="empty"]` gets no tint rule, and no category tint bases remain
- `BLUEPRINT.md` §4.1, §5.6, §5.7, §6.1, and §12.2 deviation 13 document the role-based tinting
- `CODEBASE.md` §2.2 and §5.2 document the role tint tokens and selectors

## [0.9.0] - 2026-07-31

- **why:** User request: give every category a color set related to its content, remove the reused Brød colors, and replace the lavender sauce section
- **model:** opencode/deepseek-v4-flash-free
- **tags:** colors, palette, tokens, design

### Changed

- `src/css/tokens.css`: Nøtter og frø gets its own walnut-brown set (`#a9744f` / `169, 116, 79`) instead of duplicating the Brød set; Pålegg's column tints now come from its own beige heading (`#d1bfae` / `209, 191, 174`) instead of the Brød tint base; Smakstilsetning, saus, dressing swaps the muted lavender (`#b9a7cf` / `185, 167, 207`) for a sauce-red terracotta (`#d97744` / `217, 119, 68`). The other eight category sets are unchanged
- `BLUEPRINT.md` §4.1 and §12.2 (deviations 7 and 12) record the new sets and the one-set-per-category pattern
- `CODEBASE.md` §5.2 lists the updated per-section heading colors

## [0.8.0] - 2026-07-31

- **why:** Make sub-group separators uniform, keep search focus when filtering collapses the layout, and let the Escape key clear the search
- **model:** opencode/deepseek-v4-flash-free
- **tags:** sub-group, css, scroll-blur, focus, escape, search

### Added

- `src/js/search.js`: the Escape key clears an active search exactly like the clear control while the input is focused; the input keeps focus so a new query can follow immediately. Escape with an empty query or outside the input is a no-op
- `tests/search.test.js`: three tests covering Escape clearing with focus retained, the empty-query no-op, and the unfocused-input no-op

### Changed

- `src/css/components.css`: every sub-group heading with content above it now renders the same 1 px separator line; a sub-group that opens its column drops the line at ≥ 768 px (mobile label hidden, nothing above to separate from) via a `@media (min-width: 768px)` rule, mirroring the origin's `md:border-t-0 md:pt-0` variants
- `tests/styles.test.js`: contract guards for the sub-group separator — the base rule declares the line, the first-block exception lives only inside the wide media query, and no `:first-of-type` rule may strip the line (a main item list above counts as content)
- `BLUEPRINT.md` §5.6, §7.1, §8, §9.5, §13.1, and §12.2 (deviation 11) document the uniform separator rule, the Escape clear, and the scroll-blur grace window
- `CODEBASE.md` `initSearch` row reflects the Escape key and the scroll-blur grace window

### Fixed

- `src/js/search.js`: the scroll-blur listener no longer steals focus when filtering collapses the page height — the browser clamps the scroll position and fires a scroll event, which used to blur the input mid-search whenever the page was scrolled past 50 px. A 200 ms grace window after each filter run suppresses layout-collapse scroll events; genuine user scrolls still blur

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
