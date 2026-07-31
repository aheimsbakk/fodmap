# CODEBASE.md — FODMAP Overview App (Reimplementation)

> Maps the language-agnostic architecture (`BLUEPRINT.md`) to concrete
> physical files. Implementation language: vanilla JavaScript (ES modules),
> semantic CSS, plain HTML. No frameworks, no build step, no runtime
> dependencies.

## 1. Repository Structure

```
work/
├── AGENTS.md                    # workflow rules
├── BLUEPRINT.md                 # language-agnostic architecture (source of truth)
├── CHANGELOG.md                 # wrap-up changelog (versioned milestones)
├── CODEBASE.md                  # this file
├── .github/
│   └── workflows/
│       └── deploy-pages.yml     # GitHub Pages deploy of src/ (on push to main)
├── opencode.json
├── .opencode/                   # agent configuration and skills
├── .gitignore
├── docs/
│   └── memory/                  # session memory (skill-managed)
├── origin/
│   └── fodmap.html              # absolute source of truth (reference only, never edited)
├── README.md                    # project overview, quick start, script docs — in Norwegian
├── src/
│   ├── index.html               # entry point: full static markup of the page
│   ├── css/
│   │   ├── tokens.css           # design tokens: colors, fonts, sizes, z-order, breakpoints
│   │   ├── base.css             # reset, body typography, list normalization
│   │   ├── layout.css           # page shell, container, content grid, sticky offsets
│   │   ├── components.css       # masthead, search widget, labels, banners, decorations
│   │   └── utilities.css        # responsive toggles, hidden state, search marker
│   └── js/
│       └── search.js            # search engine: matcher (pure) + executor (DOM)
├── tests/
│   ├── content.test.js          # parity: origin vs src/index.html, with corrections map
│   └── search.test.js           # functional tests of the search engine
├── scripts/
│   ├── verify_codebase_sync.sh  # sync verification (see README)
│   ├── bump-version.sh          # wrap-up: version bump helper
│   └── validate-changelog.sh    # wrap-up: changelog validation
├── package.json                 # dev-only: test runner config + jsdom + prettier
└── package-lock.json
```

## 2. Blueprint Component → File Mapping

### 2.1 Markup (`src/index.html`)

Single document, `lang="no"`, UTF-8, responsive viewport meta. Loads the
stylesheet set in layer order (tokens → base → layout → components →
utilities) and the script as a module at the end of the body. Content is
static markup, copied from `origin/fodmap.html` with the approved
corrections applied (BLUEPRINT §12.1).

| Blueprint component    | Markup element(s)                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Page shell             | `body`                                                                                |
| Corner decorations     | `div.halftone-tl.sm-only`, `div.halftone-tr.sm-only`                                  |
| Content container      | `div.container`                                                                       |
| Masthead               | `header.masthead` → `h2.sub-title`, `h1.main-title`                                   |
| Search widget          | `div.search-widget` → `span.search-icon`, `input#search-input`, `button#clear-search` |
| Column legend          | `div#main-column-headers.legend` → 3 × `div.legend-item.legend-spis/begrens/unnga`    |
| Info banner            | `div.info-banner`                                                                     |
| Category section (×11) | `section.category-section[data-category]` → `h3.category-heading`, `div.content-grid` |
| Category heading       | `h3.category-heading[data-category]` (icon span + title)                              |
| Column                 | `div.content-col[data-role="spis\|begrens\|unnga\|empty"]`                            |
| Mobile label           | `div.role-label.mobile-only`                                                          |
| Item list              | `ul.item-list` → `li.item`                                                            |
| Sub-group              | `h4.sub-group-title` + following `ul.item-list`                                       |
| Footnote banner        | `div.footnote-banner` (optional `span.footnote-icon`)                                 |
| Footer                 | `footer.page-footer`                                                                  |

The `data-category` attribute repeats on the section element itself: the
scripts and the content tests address sections by it, while the CSS tint
rules consume the heading's copy through sibling selectors (CODEBASE §5.2).

Semantic hooks used by the script (data attributes, set at load time):

| Hook             | Where                       | Purpose                                      |
| ---------------- | --------------------------- | -------------------------------------------- |
| `data-orig-text` | every `li.item`             | captured plain text for matching and restore |
| `data-orig-html` | every `h3.category-heading` | captured markup for restore/highlight        |

Element IDs: `search-input`, `clear-search`, `main-column-headers`.

### 2.2 Stylesheets (`src/css/`)

| File             | Layer      | Content                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens.css`     | tokens     | CSS custom properties: every color from BLUEPRINT §4.1 (category sets incl. 10 %/20 %/10 % column tints), font families/weights, size scale §4.3, z-order §4.4, sticky offsets, effects §4.5                                                                                                                                                   |
| `base.css`       | base       | minimal reset, `body` (white bg, Open Sans, `#333`), heading families + uppercase, `ul` normalization, `li` bullet marker (❖ U+2756)                                                                                                                                                                                                           |
| `layout.css`     | layout     | `.container` (max-width 1280 px, margins, z-20, padding), page padding scale, `.content-grid` (1 col → 3 cols at ≥ 768 px; 2 px solid borders; `border-b-0` variant for footnote sections), column border rules (dashed separators, mobile top lines), sticky offsets for `.search-widget` (top 0) and `.category-heading` (top 56 px / 64 px) |
| `components.css` | components | masthead typography and title outline shadow, search widget (heights 56/64 px, flex layout), legend cells, role labels (3 color sets), category heading colors (per `[data-category]`), info/footnote banners, sub-group titles, halftone decorations, footer                                                                                  |
| `utilities.css`  | utilities  | `.hidden`, `.mobile-only` (hidden ≥ 768 px), `.wide-only` (hidden < 768 px), `.sm-only` (hidden < 640 px, for the halftone decorations), `.marker` (search highlight span), `.item-highlight` (bold emphasis)                                                                                                                                  |

Authoring rules: mobile-first; no inline styles in markup; all values from
tokens; each file under 300 lines (RULES §17); if a layer outgrows it,
split by component before continuing.

### 2.3 Script (`src/js/search.js`)

One ES module with three exported parts (single responsibility):

| Export                                   | Responsibility                                                                                                                    | BLUEPRINT § |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `normalizeQuery(value)`                  | lowercase + trim                                                                                                                  | §7.2.1      |
| `buildMatcher()`                         | pure matcher: query + captured content → visibility/highlight plan                                                                | §8          |
| `applyPlan(document, plan)`              | executor: applies the plan to the DOM                                                                                             | §8          |
| `initSearch(document, debounceMs = 300)` | load-time capture (`data-orig-*`), event wiring (input debounce 300 ms, clear control, passive scroll-blur > 50 px), IDLE restore | §7, §9.5    |

The matcher never touches the document and is fully testable in Node.
The executor performs no string logic. `initSearch` only wires them
together; all behavior follows BLUEPRINT §7.2 derived visibility rules.

## 3. Tech Specs

| Concern                | Choice                                                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Languages              | HTML5, CSS3, JavaScript (ES modules)                                                                                                                                                                                         |
| Runtime dependencies   | none (Google Fonts stylesheet link + NHI.no hyperlink only)                                                                                                                                                                  |
| Dev dependencies       | `jsdom` (DOM emulation for tests), pinned exact version                                                                                                                                                                      |
| Test runner            | Node built-in `node --test` (Node ≥ 20; environment has v26)                                                                                                                                                                 |
| Full-browser testing   | Playwright, available in this environment via the `playwright-cli` skill (automated browser interactions and page checks)                                                                                                    |
| Module system          | ES modules (`"type": "module"` in package.json; `type="module"` on the script tag)                                                                                                                                           |
| Scripts                | `npm test` → `node --test tests/`                                                                                                                                                                                            |
| Icons                  | emoji text glyphs per BLUEPRINT §9.2 (VS16 variation selector for ⚖️ ℹ️ ⚠️ ☕ 🌶️)                                                                                                                                            |
| Fonts                  | Google Fonts link: Oswald 400/500/700, Bebas Neue, Open Sans 400/600/700; system font fallbacks                                                                                                                              |
| Documentation language | README in Norwegian (bokmål, klarspråk) — the app is Norwegian-only (user decision; overrides RULES §1.2 for user-facing docs). Internal docs (`BLUEPRINT.md`, `CODEBASE.md`, comments, commits) stay English per RULES §1.2 |
| File naming            | `kebab-case` everywhere (RULES §10)                                                                                                                                                                                          |
| Class naming           | semantic lowercase-hyphen; state modifiers via utility classes                                                                                                                                                               |
| Commits                | Conventional Commits (AGENTS.md)                                                                                                                                                                                             |

## 4. Entry Points

| Purpose              | Path                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Application entry    | `src/index.html` (served statically; any static file server, e.g. `python3 -m http.server`) |
| Search engine module | `src/js/search.js`                                                                          |
| Test suite           | `tests/` via `npm test`                                                                     |
| Sync verification    | `scripts/verify_codebase_sync.sh` (created in synchronization phase)                        |

## 5. Implementation Rationale (language/framework mapping)

### 5.1 JavaScript

- **ES modules without a bundler.** The environment has no build step, and
  modern browsers load modules natively. The single module keeps the file
  well under the 300-line limit.
- **Matcher/executor split is the testing strategy.** The matcher is pure
  (strings in, plan out), so `node --test` covers it without a browser.
  The executor and `initSearch` are integration-tested through jsdom with
  the real `src/index.html`, which also exercises the element identity
  contract (BLUEPRINT §9.3).
- **Restoration uses `data-orig-*` attributes** rather than a side table:
  matches the origin's approach, survives any element relocation, and keeps
  restore logic local to each node. Item text is trimmed at capture time
  (items are authored multi-line for readability; the origin renders them
  with no surrounding whitespace, so trimming preserves exact parity).
- **Plain-text items simplify search.** Items carry no child markup
  (small-print notes are merged into the item text, BLUEPRINT §12.2
  deviation 3), so matching and highlighting run directly on the item's
  plain text. Only heading markup (emoji + title) needs tag-safe
  highlighting via the exclusion regex.

### 5.2 CSS

- **Custom properties as the token layer** give the category color sets
  (heading bg + 3 tint levels) a single source of truth:
  `--color-brod`, `--color-gronn`, `--color-frukt`, `--color-melk`,
  `--color-drikke`, `--color-kjott`, plus per-section headings
  (`#d1bfae`, `#e6c8c8`, `#b5c7b3`, `#a4b8a2`) set via
  `[data-category="..."]` selectors — this replaces the origin's
  Tailwind utility classes with semantic selectors (deviation 1).
  Column tints default to the brod set (10 % / 20 % / 10 % opacity) and
  every other category overrides them with heading-sibling rules
  (`.category-heading[data-category="x"] + .content-grid .content-col`),
  which keeps the tint source of truth in the tokens and the markup free
  of per-column color classes.
- **Breakpoints** are authored mobile-first: base (< 640 px), `sm`
  (≥ 640 px), `md` (≥ 768 px) — the grid and legend flip happens at `md`.
  No `lg`-specific rules are needed beyond the body padding step
  (≥ 1024 px), which reuses the `sm`/`md` rule cascade.
- **Sticky layering** follows BLUEPRINT §4.4: z-index 10/20/30/40 and
  offsets 56 px/64 px implemented as tokens
  (`--sticky-search-offset`, `--sticky-heading-offset`).
- **The 20 content corrections** (BLUEPRINT §12.1) are applied only in
  `src/index.html`; `origin/fodmap.html` stays untouched and is read by
  `tests/content.test.js` to prove parity.

### 5.3 Testing

- `tests/content.test.js` loads both `origin/fodmap.html` and
  `src/index.html` in jsdom and asserts: 11 sections in the same order,
  per-column `li` counts matching BLUEPRINT §6.2 (total 484), and text
  equality everywhere except the explicit corrections map (origin → new),
  which the test duplicates as data — a change to the map without a
  matching markup change fails the suite.
- `tests/search.test.js` covers BLUEPRINT §13.1: normalization, matching
  (case-insensitivity, note participation, header match, no diacritic
  folding), highlighting (marker vs item emphasis, no matches inside icon
  markup), visibility transitions (item, sub-group, mobile label, section,
  empty columns untouched), metacharacter safety, clear/restore, debounce
  coalescing, and the scroll-blur rule (simulated via `window.scrollY`).
- **Full-browser verification (Playwright).** Beyond the Node unit tests,
  the environment provides the `playwright-cli` skill for real-browser
  testing. Use it for BLUEPRINT §13.3 visual and behavioral parity:
  render `origin/fodmap.html` and `src/index.html` side by side at
  375 / 768 / 1024 / 1280 px widths; check responsive rules (grid
  columns, mobile labels vs legend, sticky offsets, halftone
  decorations); run live search flows (typing, highlighting, clear
  control, section hiding, scroll blur) and compare screenshots.
- TDD applies to bug fixes going forward (RULES §19); initial
  implementation tests are written alongside the module.
