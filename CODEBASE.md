# CODEBASE.md — FODMAP Overview App

> Maps the language-agnostic architecture (`BLUEPRINT.md`) to concrete
> physical files. The site is static and dependency-free at runtime, but
> its content is data-driven: `data/` holds the canonical content, and a
> developer-time build step (`scripts/build/`) merges the release data and
> generates part of the site. Implementation language: vanilla JavaScript
> (ES modules), semantic CSS, plain HTML. No frameworks, no build
> dependencies, no runtime dependencies.

## 1. Repository Structure

```
work/
├── AGENTS.md                    # workflow rules
├── BLUEPRINT.md                 # language-agnostic architecture (source of truth)
├── CHANGELOG.md                 # wrap-up changelog (versioned milestones)
├── CODEBASE.md                  # this file
├── LICENSE                      # MIT License (OSI text, holder: Arnulf Heimsbakk, 2026)
├── VERSION                      # app version; substituted into the footer at build time
├── .github/
│   └── workflows/
│       └── deploy-pages.yml     # GitHub Pages: build from data/ + deploy src/ (on push to main)
├── opencode.json
├── .opencode/                   # agent configuration and skills
├── .gitignore
├── data/                        # canonical content (specs: docs/data-format.md, docs/config-format.md)
│   ├── config.json              # global names (sections/groups/subgroups/footnotes) + page text
│   ├── 2021/                    # baseline release: every item, one file per slug in section folders
│   └── 2025-05/                 # delta release: only changed/added/hidden items
├── docs/
│   ├── config-format.md         # technical spec of data/config.json
│   ├── config-guide.md          # user guide: editing config.json
│   ├── data-format.md           # technical spec of the item data and merge rules
│   ├── data-lifecycle.md        # user guide: yearly data update and release lifecycle
│   └── memory/                  # session memory (skill-managed)
├── README.md                    # project overview, quick start, script docs — in Norwegian
├── src/                         # the site; the Pages workflow rebuilds it from data/ and deploys it
│   ├── index.html               # entry point; build-generated from config + data
│   ├── manifest.webmanifest     # installability manifest (name, display, theme, icons; BLUEPRINT §9.6)
│   ├── sw.js                    # cache-free service worker: installability only, never caches (§9.6)
│   ├── favicon.svg              # favicon: 🥗 emoji scaled to fill the 64×64 canvas (system emoji font)
│   ├── favicon-32x32.png        # favicon raster fallback, 32×32, browser-rendered from the SVG
│   ├── icon-192.png             # manifest icon, 192×192, same 🥗 glyph on opaque white (§9.6)
│   ├── icon-512.png             # manifest icon, 512×512, same 🥗 glyph on opaque white (§9.6)
│   ├── apple-touch-icon.png     # iOS home-screen icon, 180×180, same 🥗 glyph on opaque white (§9.6)
│   ├── css/
│   │   ├── tokens.css           # GENERATED color tokens; typography/sizes/effects static
│   │   ├── roles.css            # GENERATED per-group/per-section rule set
│   │   ├── base.css             # static: reset, body typography, list normalization
│   │   ├── layout.css           # static: page shell, container, content grid, sticky offsets
│   │   ├── components.css       # static: masthead, search widget, labels, banners, decorations
│   │   └── utilities.css        # static: responsive toggles, hidden state, search marker
│   └── js/
│       ├── search.js            # search engine: matcher (pure) + executor (DOM)
│       ├── text-scale.js        # text-size toggle: cycle + persist the level
│       ├── note-popover.js      # item note affordance: hover/pin popover
│       └── pwa.js               # registers sw.js, guarded by support + secure context (§9.6)
├── tests/
│   ├── build.test.js            # data and build pipeline: generated page, counts, note-button + marker contracts, installability (§9.6)
│   ├── content.test.js          # canonical inventory: section order, counts, spellings
│   ├── merge.test.js            # release merge + change markers (listReleases, inheritance, marker classes)
│   ├── search.test.js           # functional tests of the search engine
│   ├── text-scale.test.js       # functional tests of the text-size toggle
│   └── styles.test.js           # stylesheet contract guards (single-line sub-title)
├── scripts/
│   ├── build/
│   │   ├── build.mjs            # build entry: config + all release folders → index.html, tokens.css, roles.css
│   │   └── lib/
│   │       ├── merge.js         # release listing + merge (oldest → newest) into per-section items with change markers, changedFrom, and releaseDate
│   │       ├── render-html.js   # document renderer (config + merged items → HTML)
│   │       ├── render-tokens.js # tokens.css renderer (config colors + marker glyphs + static tokens)
│   │       └── render-css.js    # roles.css renderer (per-group/per-section rules)
│   ├── build.sh                 # user-facing build wrapper: build.mjs + prettier format + summary (see README)
│   ├── verify_codebase_sync.sh  # sync verification (see README)
│   ├── bump-version.sh          # wrap-up: version bump helper (VERSION only; the footer gets its version at build time)
│   └── validate-changelog.sh    # wrap-up: changelog validation
├── package.json                 # dev-only: test runner config + jsdom + prettier
└── package-lock.json
```

The build writes three files into the site directory — `index.html`,
`css/tokens.css`, and `css/roles.css` — and leaves the other stylesheet
layers and the three script modules untouched. The generated files are
committed, so the deployed site runs as-is without a build step
(BLUEPRINT §12.2 deviation 16).

## 2. Blueprint Component → File Mapping

### 2.1 Markup (`src/index.html`)

Single document, `lang="no"`, UTF-8, responsive viewport meta. Loads the
stylesheet set in layer order (tokens → base → layout → components →
roles → utilities) and the scripts as ES modules at the end of the body.
The document is generated by `scripts/build/lib/render-html.js` from
`data/config.json` and the merged release data (BLUEPRINT §6, §9.1).

| Blueprint component    | Markup element(s)                                                                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page shell             | `body`                                                                                                                                                                                                           |
| Favicon                | `link[rel="icon"]` ×2 (SVG, then 32×32 PNG) in the head, pointing at `favicon.svg` / `favicon-32x32.png`                                                                                                         |
| Installability         | `link[rel="manifest"]` → `manifest.webmanifest`, `meta[name="theme-color"]` (config masthead color), `meta[name="apple-mobile-web-app-capable"]`, `link[rel="apple-touch-icon"]` → `apple-touch-icon.png` (§9.6) |
| Corner decorations     | `div.halftone-tl.sm-only`, `div.halftone-tr.sm-only`                                                                                                                                                             |
| Content container      | `div.container`                                                                                                                                                                                                  |
| Masthead               | `header.masthead` → `h2.sub-title`, `h1.main-title`                                                                                                                                                              |
| Search widget          | `div.search-widget` → `span.search-icon`, `input#search-input`, `button#clear-search`, `button#text-scale-toggle`                                                                                                |
| Column legend          | `div#main-column-headers.legend` → `div.legend-item[data-role]` per config group                                                                                                                                 |
| Info banner            | `div.info-banner`                                                                                                                                                                                                |
| Category section (×11) | `section.category-section[data-category]` → `h3.category-heading`, `div.content-grid`                                                                                                                            |
| Category heading       | `h3.category-heading[data-category]` (icon span + title)                                                                                                                                                         |
| Column                 | `div.content-col[data-role]`; empty placeholder columns add `data-placeholder`                                                                                                                                   |
| Mobile label           | `div.role-label.mobile-only`                                                                                                                                                                                     |
| Item list              | `ul.item-list` → `li.item` → `span.item-text`; changed items in the newest release add `data-change="new"                                                                                                        | "moved" | "updated"` (BLUEPRINT §6.6) |
| Item bullet tooltip    | `span.item-bullet` per item (empty, `aria-hidden`, native `title` built from `page.tooltips`, BLUEPRINT §6.7)                                                                                                    |
| Note affordance        | optional `button.note-toggle` + `span.note-popover[hidden]` siblings of the item text                                                                                                                            |
| Sub-group              | `h4.sub-group-title` + following `ul.item-list`                                                                                                                                                                  |
| Footnote banner        | `div.footnote-banner` (optional `span.footnote-icon`)                                                                                                                                                            |
| Footer                 | `footer.page-footer` → `p.footer-disclaimer`, `p.footer-source`, `p.footer-credit` (with link)                                                                                                                   |

The search input declares `autocomplete="off"` and is cleared on boot, so a
browser-restored value never survives a reload: boot always renders from
IDLE (§7.1). The four module scripts load at the end of the body: search,
text-scale, note-popover, and `pwa.js` — the last registers the cache-free
service worker `sw.js` (§9.6).

The `data-category` attribute repeats on the section element itself: the
scripts and the content tests address sections by it, while the CSS
heading-color rules consume the heading's copy through
`[data-category]` selectors (CODEBASE §5.2). Column tints are
role-based and address `[data-role]` directly on the column; the
generated `roles.css` supplies those per-group rules (§2.2).

Semantic hooks used by the script (data attributes, set at load time):

| Hook             | Where                       | Purpose                                        |
| ---------------- | --------------------------- | ---------------------------------------------- |
| `data-orig-text` | every `li.item`             | captured article text for matching and restore |
| `data-orig-html` | every `h3.category-heading` | captured markup for restore/highlight          |
| `data-orig-html` | every `h4.sub-group-title`  | captured markup for restore/highlight          |

The reasoning note text is read live from the static `.note-popover`
sibling at capture time; its original string is stored on the capture item
(`noteHtml`) so a note-only match can bold the matched terms inside the
popover and IDLE can restore the exact plain text (BLUEPRINT §7.2 rule 3,
deviation 17). No origin attribute is needed: the popover's open/pinned
state lives on the button and the element itself is never replaced.
Element IDs: `search-input`, `clear-search`,
`text-scale-toggle`, `main-column-headers`.

### 2.2 Stylesheets (`src/css/`)

| File             | Layer      | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens.css`     | tokens     | CSS custom properties: color values GENERATED from `data/config.json` by `scripts/build/lib/render-tokens.js` (page palette, category sets, role-based column tints, `--role-<id>-*`, `--section-<id>-bg`, `--info-*` note-button tokens, `--marker-*` change-marker glyphs, §4.1/§4.6/§4.7); static literals for typography, sizes (with the `calc(var(--text-scale))` content tokens, §7.4), z-order, sticky offsets, effects, media steps (§4.2–§4.5)                                                           |
| `roles.css`      | roles      | GENERATED by `scripts/build/lib/render-css.js`: per-group rules (`.content-col[data-role]` tint, `.role-label`, `.legend-item` colors) and per-section heading colors (`.category-heading[data-category]`), driven by the config arrays so the page supports an arbitrary number of groups and sections. Written by the build into the site directory                                                                                                                                                              |
| `base.css`       | base       | minimal reset, `body` (white bg, system sans-serif, `#333`), heading families + uppercase, `ul` normalization, `li` bullet marker (default glyph from `--marker-default`, centered in a slot equal to the item gutter — both driven by the text-scale-aware `--size-bullet-slot` token, deviation 9) with the `data-change` marker swap (BLUEPRINT §6.6, §4.7), `li.item` `overflow-wrap: anywhere` (long tokens at 150 % scale), `li.item .item-bullet` tooltip hotspot covering the bullet slot (BLUEPRINT §6.7) |
| `layout.css`     | layout     | `.container` (max-width 1280 px, margins, z-20, padding), page padding scale, `.content-grid` (1 col → 3 cols at ≥ 768 px; 2 px solid borders; `border-b-0` variant for footnote sections), column border rules (dashed separators, mobile top lines), sticky offsets for `.search-widget` (top 0) and `.category-heading` (top 56 px / 64 px)                                                                                                                                                                     |
| `components.css` | components | masthead typography and title outline shadow, sub-title `white-space: nowrap` plus narrow-viewport size steps (≤ 457 / 372 / 329 px), search widget (heights 56/64 px, flex layout, `Aa` text-scale toggle), legend cells, role labels (colors from the generated tokens), category heading colors, info/footnote banners, sub-group titles, note affordance (`.note-toggle`, `.note-popover`, glyph swap via `::before`), halftone decorations, footer                                                            |
| `utilities.css`  | utilities  | `.hidden`, `.mobile-only` (hidden ≥ 768 px), `.wide-only` (hidden < 768 px), `.sm-only` (hidden < 640 px, for the halftone decorations), `.col-empty-mobile` (narrow-only collapse of columns with no visible content, deviation 14), `.marker` (search highlight span), `.item-highlight` (bold emphasis)                                                                                                                                                                                                         |

Authoring rules: mobile-first; no inline styles in markup; all values from
tokens; generated layers never duplicate hand-authored rules and
hand-authored rules never restate generated color values; each file under
300 lines (RULES §17); if a layer outgrows it, split by component before
continuing.

### 2.3 Scripts (`src/js/`)

One ES module per concern (BLUEPRINT goal 3, §9.1), loaded in order at
the end of the body.

`src/js/search.js` — the search engine:

| Export                                   | Responsibility                                                                                                                                                                                                                                                                                                                                            | BLUEPRINT § |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `normalizeQuery(value)`                  | lowercase + trim                                                                                                                                                                                                                                                                                                                                          | §7.2 rule 1 |
| `buildMatcher()`                         | pure matcher: query + captured content → visibility/highlight plan for items, category/sub-group headings, and a per-column empty flag (narrow collapse, deviation 14). Items match on article text or note text; a note-only match flags the note button as matched and bolds the matched terms in the popover (`noteHtml`)                              | §8          |
| `applyPlan(document, plan)`              | executor: applies the plan to the DOM (re-renders each item's `.item-text` span and the `.note-popover` content, toggles `.col-empty-mobile` on columns and `.is-match` on note buttons; the popover element itself and its open/pinned state are never touched)                                                                                          | §8          |
| `initSearch(document, debounceMs = 300)` | boot: clear any browser-restored input value, then load-time capture (`data-orig-*` + note text + placeholder flag); event wiring (input debounce 300 ms, Escape key clears the search and moves focus to the input from anywhere on the page, clear control, passive scroll-blur > 50 px with a 200 ms grace window after each filter run), IDLE restore | §7, §9.5    |

`src/js/text-scale.js` — the text-size toggle:

| Export                             | Responsibility                                                                                                                                                                 | BLUEPRINT § |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `initTextScale(document, storage)` | restore the stored level, apply `data-text-scale` on the root, wire the cycling `Aa` button; `storage` defaults to `localStorage`, read/write failures degrade to session-only | §7.4, §10   |

`src/js/note-popover.js` — the note affordance (no exports; wires itself
on load): hover shows the note popover, hover leave closes it unless
pinned, a click pins/unpins, a click outside a pinned note unpins and
closes it, and the toggle keeps `aria-expanded` in sync (BLUEPRINT §7.5).

`src/js/pwa.js` — installability (BLUEPRINT §9.6): registers `sw.js`
relative to the document, guarded by `serviceWorker` support and a secure
context; a failed registration is logged and never surfaced. No caching
anywhere: the worker passes every request through to the network.

The search matcher never touches the document and is fully testable in
Node. The executor performs no string logic. `initSearch` only wires them
together; all behavior follows BLUEPRINT §7.2 derived visibility rules.
The text-scale module sets one attribute and never touches content text;
the note-popover module reads and writes only its own button/popover
pair. The four modules share no state and boot independently.

## 3. Tech Specs

| Concern                | Choice                                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Languages              | HTML5, CSS3, JavaScript (ES modules)                                                                                                                                                                                                                                                                                                     |
| Site generation        | `node scripts/build/build.mjs <out-dir>` — Node ≥ 20 standard library only, no packages; merges every `data/<release>/` folder (oldest → newest), derives the change markers of the newest release, and writes `index.html`, `css/tokens.css`, `css/roles.css` (BLUEPRINT §8, §14)                                                       |
| Content source         | `data/config.json` (names + page text) + release folders under `data/` (item files); merge oldest → newest per `docs/data-format.md` §7                                                                                                                                                                                                  |
| Runtime dependencies   | none (footer attribution hyperlinks to NHI.no, NKFM, and the GitHub repository only; fonts are the platform's native system stack)                                                                                                                                                                                                       |
| Installability (PWA)   | static `manifest.webmanifest` (standalone, white background, config masthead red as theme) + cache-free `sw.js` (never caches, never intercepts, registered by `js/pwa.js` under secure-context guard); icons `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` rasterized once from `favicon.svg` (BLUEPRINT §9.6, deviation 20) |
| Client storage         | `localStorage` (key `fodmap-text-scale`) for the text-size level only; read once at load, written on toggle, validated; failures degrade to session-only (BLUEPRINT §10, §12.2 deviation 9)                                                                                                                                              |
| Versioning             | `VERSION` (semver); `{{version}}` in footer segments substituted at build time from `VERSION`; `scripts/bump-version.sh` bumps `VERSION` only (the footer is a build artifact, so no direct sync is needed)                                                                                                                              |
| Dev dependencies       | `jsdom` (DOM emulation for tests), `prettier`, pinned exact versions; the build uses none                                                                                                                                                                                                                                                |
| Test runner            | Node built-in `node --test` (Node ≥ 20; environment has v26)                                                                                                                                                                                                                                                                             |
| Full-browser testing   | Playwright, available in this environment via the `playwright-cli` skill (automated browser interactions and page checks)                                                                                                                                                                                                                |
| Module system          | ES modules (`"type": "module"` in package.json; `type="module"` on the script tag)                                                                                                                                                                                                                                                       |
| Scripts                | `npm test` → `node --test "tests/*.test.js"` (bare `node --test tests/` fails on Node 26); `npm run format`; `npm run verify:sync`; `npm run build` → `scripts/build.sh` (wrapper: runs `node scripts/build/build.mjs <out-dir>`, formats the artifacts with prettier, and prints a summary; defaults to `src`, `--help` for usage)      |
| Icons                  | emoji text glyphs per BLUEPRINT §9.2 (VS16 variation selector for ⚖️ ℹ️ ⚠️ ☕ 🌶️)                                                                                                                                                                                                                                                        |
| Fonts                  | none — all three roles use the native `system-ui` stack via the `--font-system` token (BLUEPRINT §4.2, §12.2 deviation 5)                                                                                                                                                                                                                |
| Documentation language | README in Norwegian (bokmål, klarspråk) — the app is Norwegian-only (user decision; overrides RULES §1.2 for user-facing docs). Internal docs (`BLUEPRINT.md`, `CODEBASE.md`, comments, commits) stay English per RULES §1.2                                                                                                             |
| File naming            | `kebab-case` everywhere (RULES §10)                                                                                                                                                                                                                                                                                                      |
| Class naming           | semantic lowercase-hyphen; state modifiers via utility classes                                                                                                                                                                                                                                                                           |
| Commits                | Conventional Commits (AGENTS.md)                                                                                                                                                                                                                                                                                                         |

## 4. Entry Points

| Purpose              | Path                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Application entry    | `src/index.html` (generated by the build; served statically, e.g. `python3 -m http.server`)           |
| Build entry          | `scripts/build.sh` (convenience wrapper; default out-dir `src`) → `scripts/build/build.mjs <out-dir>` |
| Content source       | `data/config.json` + `data/<release>/` folders                                                        |
| Search engine module | `src/js/search.js`                                                                                    |
| Text-scale module    | `src/js/text-scale.js`                                                                                |
| Note popover module  | `src/js/note-popover.js`                                                                              |
| Test suite           | `tests/` via `npm test`                                                                               |
| Sync verification    | `scripts/verify_codebase_sync.sh`                                                                     |

## 5. Implementation Rationale (language/framework mapping)

### 5.1 Build step and data

- **Data-driven content without a runtime dependency.** The Norwegian
  text lives as Markdown items with YAML frontmatter plus one JSON config
  (`data/`), per `docs/data-format.md` and `docs/config-format.md`; the
  browser still receives only static files (deviation 16).
- **Merge is a separate pure module.** `lib/merge.js` lists every
  `data/<release>/` folder (date-shaped names only, oldest → newest via
  `listReleases`) and merges per item (slug within section folder) with
  `Object.assign` field-level inheritance (§6.3); notes accumulate
  newest-on-top. It derives `change` (`new` / `moved` / `updated`, or
  none) for items present in the newest release by comparing state
  before/after it (§6.6); a single release folder derives no markers. An
  empty-valued frontmatter key followed by indented `- ` lines parses as
  a YAML list (the list form of `attribution`).
- **One renderer per output.** `lib/render-html.js` (merged items +
  config → document strings), `lib/render-tokens.js`, and
  `lib/render-css.js` each own exactly one generated artifact; all are
  pure, so the pipeline is testable without a DOM (RULES §9, §17).
- **Change markers are declarative, not hand-authored.** The item `li`
  carries `data-change`; the CSS swaps the default bullet for the
  matching `--marker-*` emoji token, with glyphs from `page.markers` in
  the config — restyled in config only, and item text nodes stay plain
  so search is unaffected (deviation 18).
- **Bullet tooltips are derived from config templates.** `merge.js`
  records `changedFrom` (pre-move group id) and `releaseDate` (folder of
  the item's newest file); `render-html.js` builds each item's native
  `title` from `page.tooltips` (§6.7): `{{date}}`, `{{from}}` / `{{to}}`
  ← config group labels, missing template falls back to `default`. The
  title sits on an empty `aria-hidden` `span.item-bullet` hotspot over
  the `::before` bullet (which cannot carry a title).
- **Generated layers, hand-authored layers.** Only the document, the
  color token layer, and `roles.css` vary with the data; layout and
  component rules stay hand-authored and never restate a config-owned
  color, so extra groups/sections need zero new stylesheet code.
- **Generated files are committed in the site.** `build.mjs` writes
  directly into `src/` and the three artifacts are committed, so a plain
  checkout of the repo is already a runnable site. The Pages workflow
  additionally regenerates the artifacts from `data/` before deploying
  (`.github/workflows/deploy-pages.yml`), so the published site always
  matches the latest content even if a commit was made without running
  the build. Regenerate locally with `./scripts/build.sh` (runs the
  build, formats the three artifacts with prettier, and prints a
  summary) and commit the regenerated files.

### 5.2 JavaScript

- **ES modules without a bundler**, one module per concern (BLUEPRINT
  goal 3): `search.js` under the 300-line limit, plus `text-scale.js` and
  `note-popover.js`; the three share no state and boot independently
  (RULES §17).
- **The storage adapter is a parameter, not a global.** `initTextScale`
  accepts a `{ getItem, setItem }` object; the browser path defaults to
  `localStorage` behind a try/catch, and tests inject an in-memory store
  to simulate blocked storage deterministically.
- **Matcher/executor split is the testing strategy.** The matcher is pure
  (strings in, plan out), so `node --test` covers it without a browser;
  the executor and `initSearch` are integration-tested through jsdom
  against the real generated `src/index.html`, which also exercises the
  element identity contract (§9.3).
- **The article span keeps search surgical.** Search re-renders only
  `span.item-text` and toggles classes on the button and column; it never
  rebuilds a note, so the popover's open state survives filtering
  (§7.2 rule 3, §7.5).
- **Notes are searchable through their static text.** The matcher reads
  the note text from the `.note-popover` sibling at capture time; a
  note-only match flips `.is-match` (swapping the `::before` glyph, §4.6)
  and bolds the matched terms in the popover, with the original string
  captured once (`noteHtml`) and restored on every non-matching render
  (deviation 17).
- **Boot clears any restored input value in JS, not just via markup.**
  `autocomplete="off"` can race the deferred module's execution, so
  `initSearch` also sets `input.value = ""` on boot — the deterministic
  source of truth for the "boot always renders from IDLE" invariant
  (§7.1).
- **The narrow empty-column collapse is plan data, not CSS hacks.**
  The matcher sets a per-column empty flag; the executor toggles
  `.col-empty-mobile` from it. Every re-render recomputes the flag and
  the IDLE plan clears it; placeholder columns are never flagged
  (deviation 14).
- **Installability is a registration, not a cache.** `pwa.js` registers
  `sw.js` under a support + secure-context guard, and the worker's fetch
  handler never calls `respondWith` — every request goes to the network,
  so the page behaves identically with or without the worker and no
  cache system can accumulate stale content (deviation 20, §9.6).

### 5.3 CSS

- **Custom properties as the token layer.** `tokens.css` mixes generated
  and static parts: the build writes the config colors (page palette,
  `--role-<id>-bg|ink|tint|border`, `--section-<id>-bg`, `--info-*`,
  `--marker-*`, plus legacy transliterated section names like
  `--color-brod`); typography, sizes, z-order, effects, and media steps
  stay hand-authored literals (§4.2–§4.5).
- **Column tints are role-based** (deviation 13): the generated
  `--role-spis-tint` / `--role-begrens-tint` / `--role-unngå-tint` hold
  the role backgrounds at low opacity, applied by generated
  `.content-col[data-role="..."]` rules — extra groups need no new
  stylesheet code. Empty placeholder columns carry their position's role
  tint and `data-placeholder` (wide-only, excluded from filtering).
- **Section heading colors are generated.** `roles.css` applies
  `--section-<id>-bg` via `[data-category="..."]` selectors per config
  section; the hand-authored `.category-heading` base rule in
  `components.css` keeps `--color-brod` as its fallback background, which
  the generated rules always override for the 11 real sections.
- **Breakpoints** are authored mobile-first: base (< 640 px), `sm`
  (≥ 640 px), `md` (≥ 768 px) — the grid and legend flip happens at
  `md`; `lg` (≥ 1024 px) only adds the body padding step.
- **The empty-column collapse is a max-width media rule**
  (`@media (max-width: 767.98px)`), unlike the other min-width-based
  utilities: a min-width override could not restore a column that its own
  component rule displays as a grid item (deviation 14).
- **Sticky layering** follows §4.4: z-index 10/20/30/40 and 56/64 px
  offsets as tokens (`--sticky-search-offset`, `--sticky-heading-offset`).
- **System font stacks** keep the page dependency-free (deviation 5):
  `--font-body` / `--font-heading` / `--font-display` alias a single
  `--font-system` custom property, so reintroducing webfonts later is a
  one-token change.
- **Text scaling is a token multiplier, not a root font-size.** The
  `--text-scale` property (1 / 1.25 / 1.5) is set by the
  `data-text-scale` attribute on the root; content font-size tokens are
  `calc(<base> * var(--text-scale))`, and the
  `html[data-text-scale="..."]` selectors outrank `:root` by specificity,
  while spacing, borders, widget height, sticky offsets, and masthead
  tokens stay unscaled (deviation 9). The one spacing exception is the
  item's left gutter + bullet slot (`--size-bullet-slot`): it scales so
  the marker glyph never overlaps the item text at 150 %.
- **The note button is a bare emoji glyph, sized like the markers.** The
  `--info-*` tokens (§4.6) carry only the two glyphs, a glyph size of
  `calc(0.9rem × --text-scale)` (the marker base size wrapped in the
  text-scale multiplier, so the default bullet, the change markers, and
  the note glyph stay identical at every scale level, deviation 9), and
  the margin; no box, border, or corner radius — the `::before` content
  swap (`ℹ️` → `☑️`) is driven by `.is-match`, so the button's DOM text
  never changes; keyboard focus only (deviation 17).
- **`overflow-wrap: anywhere` on `li.item`** (not `break-word`):
  `anywhere` participates in min-content sizing, so the grid track
  shrinks with the wrap at 150 % scale instead of overflowing
  (deviation 9).
- **The canonical content** (§12.1) lives in the data files; the
  generated document renders it, and `tests/content.test.js` fails on any
  change to a frozen string or count.

### 5.4 Testing

- The jsdom suites (`content.test.js`, `search.test.js`,
  `text-scale.test.js`) run against the **generated page** — each imports
  `build()` and uses its `html` — because the generated output is the
  canonical artifact; the hand-authored document was retired (deviation 16).
- `tests/build.test.js` (BLUEPRINT §13): asserts the §6.5 inventory
  (11 sections, 510 items), the marker counts (29 new, 31 moved, 1
  updated), all six stylesheet layers and four module scripts, the
  installability contract per §9.6 (manifest link, config-driven theme
  color, apple-touch icon, manifest fields + icon files with matching
  PNG dimensions, cache-free worker), the note affordance per §4.6
  (empty button, glyph from the `--info-*` tokens,
  `aria-label="Mer informasjon"`), the marker glyphs (§4.7), and the §6.7
  bullet tooltips (hotspot per item; "Dato 2021" for the 449 baseline
  items; newest release date for new/updated; from→to for moved).
- `tests/content.test.js` (BLUEPRINT §13): 11 sections in canonical
  order, per-column `li` counts matching §6.5 (total 510), and the §12.1
  canonical spellings verbatim.
- `tests/search.test.js` (BLUEPRINT §13): normalization; matching
  (case-insensitivity, article + reasoning-note participation, category
  and sub-group heading matches, no diacritic folding); highlighting
  (marker vs item emphasis, none inside icon markup); visibility
  transitions; the narrow empty-column collapse (deviation 14); the
  note-button matched glyph with bolded popover terms and plain-text
  restore on clear; popover open/pinned state surviving search runs;
  special inputs; clear/restore; boot clearing of a browser-restored
  value; debounce coalescing; the scroll-blur rule (via `window.scrollY`).
- `tests/styles.test.js` guards stylesheet declarations directly (jsdom
  cannot measure layout): sub-title single-line rule (deviation 8),
  text-scale tokens (§4.3, §7.4), line-free sub-group headings (deviation
  11), role-tint ownership (generated `roles.css` rules + `--role-*-tint`
  tokens; hand-authored layers restate no role/section colors), the
  mobile-scoped empty-column collapse (deviation 14), and the marker
  tokens. Browser-level fit is verified with Playwright at 320–640 px.
- `tests/text-scale.test.js` (BLUEPRINT §13): S100 default, the
  100 → 125 → 150 → 100 cycle, storage write and restore, invalid and
  blocked storage fallbacks, independence from an active search, and the
  missing-button inert path (§9.3).
- `tests/merge.test.js` (BLUEPRINT §6.3, §6.6; docs/data-format.md §7):
  `listReleases` ordering and date-shaped filtering, field inheritance
  and explicit-empty clears, `visible` removal/restore, note prepend, the
  `new` / `moved` / `updated` classification (newest-release-only and
  single-release rules), `changedFrom` and `releaseDate`, and the
  list-form `attribution` parse. Fixtures are built in a temp directory
  at runtime, so the repository holds no test data.
- **Full-browser verification (Playwright):** the `playwright-cli` skill
  covers BLUEPRINT §13: render `src/index.html` at 375 / 768 / 1024 /
  1280 px, check the responsive contract (grid columns, mobile labels vs
  legend, sticky offsets, halftone decorations), and run live search
  flows (typing, highlighting, clear control, section hiding, scroll
  blur).
- TDD applies to bug fixes going forward (RULES §19); initial
  implementation tests are written alongside the module.
