# BLUEPRINT.md — FODMAP Overview App (Reimplementation)

> Status: Greenfield. Source of truth: `origin/fodmap.html` (single-page FODMAP
> overview in Norwegian). This document is the language-agnostic architecture
> for the reimplementation. Physical file mapping lives in `CODEBASE.md`.

## 1. System Goals

Reimplement the origin as a static, dependency-free single-page app that:

1. Looks identical to the origin on all screen sizes (mobile, tablet, desktop).
2. Behaves identically to the origin: full content rendering without scripts,
   plus the interactive food search with live filtering and highlighting.
3. Uses only plain markup documents, stylesheets, and vanilla scripts
   (one module per concern). No frameworks, no runtime library downloads,
   no remote assets, no build step. Typography uses the platform's native
   system fonts.
4. Keeps the stylesheets clean, token-driven, and mobile-first responsive.
5. Keeps all Norwegian content verbatim (see section 12, Fidelity).

## 2. Scope

### In scope

- Full page: corner decorations, masthead, sticky search widget, column
  legend, info banner, 11 category sections (with footnotes), footer.
- Responsive layout for narrow (base), medium (≥ 640 px), wide (≥ 768 px),
  and extra-wide (≥ 1024 px) viewports.
- Search interaction: debounced live filtering, term highlighting, clear
  control, section/column/item visibility transitions.
- Text-size toggle: a control in the search widget that cycles the content
  text size through 100 % / 125 % / 150 % (see §12.2 deviation 9).
- Automated tests for the search engine, the text-size toggle, and content
  parity.

### Out of scope

- Print stylesheet (explicitly deferred).
- Backend, storage, user accounts, analytics.
- Build tooling, bundlers, package-based runtime dependencies.
- Multiple languages or localization.

## 3. Component Hierarchy

```
Page shell                    (background, base typography, page padding)
├─ Corner decoration, left    (halftone triangle, medium+ only)
├─ Corner decoration, right   (halftone triangle, medium+ only)
└─ Content container          (max-width 1280 px, centered, white, above decorations)
   ├─ Masthead
   │  ├─ Sub-title            (emojis + "Vanlige matvarer")
   │  └─ Main title           ("FODMAP", display typeface, red, outlined)
   ├─ Search widget           (sticky top; icon, text input, clear control,
   │                            text-size toggle)
   ├─ Column legend           (SPIS | BEGRENSE | UNNGÅ; wide+ only)
   ├─ Info banner             (BEGRENSE explanation)
   ├─ Category sections (11 ×)  each:
   │  ├─ Category heading     (sticky below search widget; icon + title)
   │  ├─ Content grid         (1 column narrow, 3 columns wide+)
   │  │  └─ Column (3 ×)      (tinted background; optional mobile label;
   │  │                        optional sub-group headings; item list)
   │  └─ Footnote banner      (optional, joins the grid bottom edge)
   └─ Footer                  (source link, disclaimer)
```

## 4. Design Tokens

### 4.1 Color palette

| Token                      | Value     | Use                    |
| -------------------------- | --------- | ---------------------- |
| Body text                  | `#333`    | default text           |
| Page background            | `#ffffff` | page + container       |
| Accent red (main title)    | `#c43838` | FODMAP masthead        |
| Accent red light           | `#d85c5c` | sub-title              |
| SPIS background            | `#a0c49d` | SPIS labels/badges     |
| SPIS ink / border          | `#1e3a1e` | SPIS labels/badges     |
| BEGRENSE background        | `#f7d774` | BEGRENSE labels/badges |
| BEGRENSE ink / border      | `#4a3c08` | BEGRENSE labels/badges |
| UNNGÅ background           | `#d15d5d` | UNNGÅ labels/badges    |
| UNNGÅ border               | `#5a1919` | UNNGÅ labels/badges    |
| Category heading (default) | `#d59e5e` | heading background     |
| Category heading ink       | `#000`    | heading text/border    |

Category color sets (heading background + column tint base):

| Category                             | Heading bg | Column tint base                 |
| ------------------------------------ | ---------- | -------------------------------- |
| Brød, ris og pasta                   | `#d59e5e`  | `213, 158, 94`                   |
| Grønnsaker og belgfrukter            | `#8fb88a`  | `143, 184, 138`                  |
| Frukt, tørket frukt og bær           | `#d96f6f`  | `217, 111, 111`                  |
| Melk, meieriprodukter & Alternativer | `#93b5c6`  | `147, 181, 198`                  |
| Nøtter og frø                        | `#d59e5e`  | `213, 158, 94` (reuses Brød set) |
| Drikke                               | `#8ab6d6`  | `138, 182, 214`                  |
| Kjøtt, egg, fisk                     | `#e08c8c`  | `224, 140, 140`                  |
| Pålegg                               | `#d1bfae`  | `213, 158, 94` (reuses Brød set) |
| Sukker, søtning og annet             | `#e6c8c8`  | `230, 200, 200`                  |
| Krydder og urter                     | `#b5c7b3`  | `181, 199, 179`                  |
| Smakstilsetning, saus, dressing      | `#b9a7cf`  | `185, 167, 207`                  |

Column tint levels: column 1 = base at 10 % opacity, column 2 = base at
20 % opacity, column 3 = base at 10 % opacity.

Support colors:

| Token            | Value                | Use                             |
| ---------------- | -------------------- | ------------------------------- |
| Dashed separator | `rgba(0, 0, 0, 0.3)` | column separators (1 px dashed) |
| Column top line  | `rgba(0, 0, 0, 0.1)` | column top borders (narrow)     |
| Sub-group line   | `rgba(0, 0, 0, 0.2)` | sub-group top borders           |
| Outline shadow   | `rgba(0, 0, 0, 0.8)` | main title text-shadow          |
| Halftone dot A   | `#c43838`            | left decoration                 |
| Halftone dot B   | `#a0c49d`            | right decoration                |
| Halftone dot C   | `#e6a147`            | both decorations                |
| Banner text      | `#374151` (gray-700) | info banner text                |
| Placeholder text | gray-400             | search input placeholder        |
| Footer secondary | gray-600             | disclaimer text                 |
| Hover link       | `#dc2626` (red-600)  | source link hover               |

### 4.2 Typography

| Role                      | Family          | Weights       | Transform |
| ------------------------- | --------------- | ------------- | --------- |
| Body                      | system-ui stack | 400, 600, 700 | none      |
| Headings, labels, banners | system-ui stack | 400, 500, 700 | uppercase |
| Main title "FODMAP"       | system-ui stack | 400           | uppercase |

All three roles share the platform's native sans-serif stack (`system-ui`
with a generic `sans-serif` fallback). No webfonts are loaded; the page
renders identically offline. Requested weights map to the installed faces
of the platform; missing faces are synthesized. Oswald's condensed look is
approximated by bold weight plus the existing uppercase and letter-spacing
rules; Bebas Neue's narrow display face cannot be reproduced with system
fonts, so the masthead title renders wider than the origin (deliberate
deviation, §12.2).

Letter spacing: main title +2 px, sub-title `tracking-widest`, labels and
banners `tracking-wider`. Search input text: uppercase, `tracking-wider`.

Main title outline: text-shadow composed of a 2 px offset dark shadow plus
four 1 px directional black shadows (creates a black outline).

### 4.3 Size scale

| Element              | Narrow    | ≥ 640 px  | ≥ 768 px  | ≥ 1024 px |
| -------------------- | --------- | --------- | --------- | --------- |
| Page padding         | 0.5 rem   | 0.5 rem   | 1.5 rem   | 2 rem     |
| Main title           | 2.25 rem  | 4.5 rem   | 6 rem     | 6 rem     |
| Sub-title            | 1.25 rem  | 1.5 rem   | 1.875 rem | 1.875 rem |
| Search widget height | 56 px     | 64 px     | 64 px     | 64 px     |
| Search input text    | 1 rem     | 1.25 rem  | 1.25 rem  | 1.25 rem  |
| Category heading     | 1.125 rem | 1.25 rem  | 1.25 rem  | 1.25 rem  |
| Legend headings      | 1.125 rem | 1.25 rem  | 1.5 rem   | 1.5 rem   |
| List text            | 0.85 rem  | 0.85 rem  | 0.85 rem  | 0.85 rem  |
| Sub-group title      | 0.8 rem   | 0.875 rem | 0.875 rem | 0.875 rem |
| Info banner          | 9 px      | 10 px     | 10 px     | 10 px     |
| Footnote banner      | 0.75 rem  | 0.875 rem | 0.875 rem | 0.875 rem |

The sub-title deviates from the narrow step below 640 px to keep the
tagline on one line (deviation 8): ≤ 457 px → 1 rem, ≤ 372 px →
0.875 rem, ≤ 329 px → 0.8125 rem.

Text scaling (§7.2, deviation 9): the font-size tokens for content text
(search input, category headings, legend, list items, sub-group titles,
banners, labels) are defined as `calc(<base> × --text-scale)`, where
`--text-scale` is 1, 1.25, or 1.5 per the `data-text-scale` attribute on
the root element. Spacing, borders, search widget height, sticky offsets,
and the masthead titles are deliberately excluded, so the layout stays
compact while text grows.

Other metrics: list items 0.85 rem with 1.2 line-height and 0.25 rem bottom
margin; sub-group titles 0.8 rem bold; mobile labels 0.875 rem bold;
columns 0.75 rem padding; heading border 2 px solid black; grid border
2 px solid black (left, right, bottom); dashed separators 1 px.

List text is 0.85 rem at every width: the origin's `li` rule (0.85 rem)
overrides the responsive `ul` size classes, and the reimplementation
reproduces that rendering. Sub-group titles are 0.8 rem on narrow and
0.875 rem from 640 px (the origin's `ul` classes win there because the
Tailwind stylesheet loads after the origin's own rules).

### 4.4 Depth and sticky offsets

| Layer                      | Z-order |
| -------------------------- | ------- |
| Corner decorations         | 10      |
| Content container          | 20      |
| Category headings (sticky) | 30      |
| Search widget (sticky)     | 40      |

Sticky offsets: search widget sticks to viewport top (0). Category headings
stick 56 px from top (narrow) and 64 px (≥ 640 px) so they sit directly
below the search widget.

### 4.5 Effects

- Banner and heading shadows: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`.
- Search highlight marker: white background, black text, 2 px solid black
  border, 0.25 rem radius, horizontal padding, hard offset shadow
  `2px 2px 0 0 #000`.
- Mobile labels and search marker: 0.25 rem border radius.
- Halftone decorations: 80 × 80 px triangle (clip-path), dot pattern from
  two radial-gradient layers offset 8 px, 16 px grid, 80 % opacity,
  positioned 10 px from their corner.

## 5. Layout and Responsive Behavior

### 5.1 Page shell

- White background, native system sans-serif body text, dark gray ink.
- Content container: max width 1280 px, centered, white, sits above the
  decorations, bottom padding 1 rem.
- Page padding scales per section 4.3.

### 5.2 Masthead

Centered, bottom margin 1.5 rem, top margin 0.5 rem. Sub-title above main
title; emoji clusters flank the sub-title text with 0.5 rem horizontal
margin. The sub-title is guaranteed to render on a single line at every
viewport width: `white-space: nowrap`, with the size stepping down on
narrow viewports so the line never overflows (see §12.2 deviation 8).
Main title uses the display typeface at 2.25–6 rem, tight leading,
negative top margin 5 px, bottom margin 1 rem.

### 5.3 Search widget

Sticky at viewport top. White background, 2 px solid black border,
horizontal padding 0.5 rem, flex row with 0.5 rem gap, heights per
section 4.3. Children: search icon (emoji), text input (flex-grow, full
height, transparent background, no border, no focus outline, uppercase),
clear control (`×`, 1.875 rem, hidden by default, red on hover),
text-size toggle (`Aa`, see §7.2 and §12.2 deviation 9).

### 5.4 Column legend

Hidden on narrow; visible wide+ as a 3-column grid with 0.5 rem gaps.
Each cell: centered flex row (label + icon), 2 px solid border in its
role color, bold uppercase, vertical padding 0.5 rem. Roles:
SPIS (thumbs-up), BEGRENSE (scale), UNNGÅ (hand).

### 5.5 Info banner

Full width, white background, 2 px solid black border, 0.25 rem padding,
9–10 px uppercase bold gray text, centered, info icon, bottom margin 1.5 rem.

### 5.6 Category sections

- Sections separated by 1 rem bottom margin.
- Category heading: sticky, centered, uppercase, bold, 2 px solid black
  border, icon + title, small shadow. Background per category set.
- Content grid: single column on narrow; 3 equal columns wide+.
- Grid borders: 2 px solid black on left, right, bottom — except sections
  with a footnote banner, where the grid drops its bottom border and the
  banner supplies it (continuous box, horizontal seam between grid and
  banner).
- Columns:
  - Narrow: stacked. Column separators: 1 px dashed bottom line on all but
    the last column, plus a 1 px light top line on columns 2 and 3.
    Each column shows its role as a mobile label (colored badge with icon)
    above the list content.
  - Wide+: side by side. Column separators: 1 px dashed right line on all
    but the last column. Mobile labels hidden. Legend above the grid carries
    the role names.
- Item list: no list markers; each item prefixed by a ❖ bullet (U+2756)
  positioned at the left edge; items 0.85 rem, line-height 1.2, 0.25 rem
  bottom margin.
- Item structure: primary text plus optional parenthesized portion note.
  All notes are inline plain text; there is no small-print styling
  (see §12.2 deviation 3).
- Sub-groups: uppercase bold small heading; separated from the preceding
  block by a 1 px light border + padding. Every sub-group heading with
  content above it gets the same separator; a sub-group that opens its
  column (nothing above it at wide widths, where the mobile label is
  hidden) stays flush (deviation 11).
- Footnote banner: white background, 2 px solid black border (top edge
  open), centered bold text, warning icon, small shadow. Wording and icon
  per section: VIKTIG and TIPS notes use the warning emoji; the MARINADER
  note has no icon.

### 5.7 Empty placeholder columns

Three sections reserve empty columns to keep the 3-column rhythm:

- Kjøtt, egg, fisk: columns 2 and 3 are empty, rendered wide+ only.
- Pålegg: column 2 is empty, rendered wide+ only.
- Krydder og urter: column 2 is empty, rendered wide+ only.

Empty columns keep the category tint, participate in the grid, and carry no
mobile label. They are excluded from filtering.

### 5.8 Footer

Top border 2 px solid black, centered, small text. Line 1: bold gray
disclaimer text. Line 2: "FODMAP v<version> // Kilder:" followed by
two external source links (underlined, red on hover, open in a new
tab): Norsk Helseinformatikk (NHI.no) and NKFM – Lav FODMAP-mat ved
IBS. The version text follows the `VERSION` file. Line 3: gray credit
line "Utviklet av Arnulf Heimsbakk // Kildekode på
github.com/aheimsbakk/fodmap // Lisens MIT" where the repository name
is a link to `https://github.com/aheimsbakk/fodmap/` (open in a new
tab). Only the disclaimer line is bold; the source and credit lines
are regular weight. The three lines are separated by equal 0.5 rem
gaps. The source line replaces the origin's
"01 // FODMAP | Kilde:" line (user decision; see §12.2
deviation 6), and the credit line is a new addition (user decision
2026-07-31; see §12.2 deviation 10).

## 6. Content Data Model

### 6.1 Abstract schema

```
Section
├─ title            (Norwegian heading text)
├─ icon             (emoji identifier, see 9.2)
├─ color set        (heading bg + column tint base, see 4.1)
├─ column layout    (standard | with-empty-columns | empty-middles)
├─ columns [3]
│   └─ Column
│      ├─ role          (spis | begrens | unnga | empty)
│      ├─ mobile label  (present unless role = empty)
│      └─ blocks [ ]    (each block is either a plain item list
│                        or a sub-group: heading + item list)
│          └─ Item
│             ├─ text         (primary text)
│             └─ portion note (optional parenthesized suffix, inline)
└─ footnote       (optional banner text + icon)
```

### 6.2 Section inventory (parity reference)

Counts are item totals per column (main list + sub-groups), and sub-group
count per column. These are frozen parity assertions.

| #   | Section                              | Icon        | Columns (SPIS / BEGRENSE / UNNGÅ)           | Footnotes |
| --- | ------------------------------------ | ----------- | ------------------------------------------- | --------- |
| 1   | Brød, ris og pasta                   | wheat       | 20 / 7 / 19                                 | VIKTIG    |
| 2   | Grønnsaker og belgfrukter            | carrot      | 46+4 sub (1) / 13+6 sub (1) / 14+8 sub (1)  | —         |
| 3   | Frukt, tørket frukt og bær           | apple       | 25+2 sub (1) / 10+1 sub (1) / 13+10 sub (1) | —         |
| 4   | Melk, meieriprodukter & alternativer | cow         | 3+17 sub (2) / 2+5 sub (2) / 10+2+1 sub (3) | —         |
| 5   | Nøtter og frø                        | seedling    | 12 / 2 / 2                                  | —         |
| 6   | Drikke                               | mug         | 16 / 5 / 12                                 | —         |
| 7   | Kjøtt, egg, fisk                     | drumstick   | 9 / empty / empty                           | MARINADER |
| 8   | Pålegg                               | bread slice | 35 over 6 sub / empty / 11                  | —         |
| 9   | Sukker, søtning og annet             | cubes       | 11+5+10 sub (2) / 3 / 10+8+6 sub (2)        | TIPS      |
| 10  | Krydder og urter                     | pepper      | 17+20 sub (2) / empty / 8                   | TIPS      |
| 11  | Smakstilsetning, saus, dressing      | droplet     | 29 / 6 / 9                                  | —         |

Total item count: 484 (excluding sub-group headings, mobile labels, and
empty placeholder columns).

## 7. State Management

Two independent interactive states: the search query and the text-size
level. Neither depends on the other; each is managed by its own module and
state machine (§7.1, §7.4).

### 7.1 Search state machine

| State    | Condition       | Effects                                                         |
| -------- | --------------- | --------------------------------------------------------------- |
| IDLE     | query empty     | All content visible in original form. Clear control hidden.     |
| FILTERED | query non-empty | Items/headings filtered and highlighted. Clear control visible. |

Transitions (debounced 300 ms after each input change):

- IDLE → FILTERED: first non-empty query.
- FILTERED → FILTERED: query changed (recompute).
- FILTERED → IDLE: query emptied by editing, by the clear control, or by
  the Escape key while the input is focused. All stored originals restored
  exactly.

Clear control activation (button click, or Escape key while the input is
focused): empty the query, transition to IDLE, keep focus on the input.
Escape with an empty query and Escape outside the input are no-ops.

### 7.2 Derived visibility rules (FILTERED state)

1. Query = input value, lowercased, trimmed. No diacritic folding
   (a search for "lok" does not match "Løk"; "løk" does).
2. Match = case-insensitive substring containment in an item's full text
   (including its portion note), in a category heading text, or in a
   sub-group heading text.
3. Item: visible if it matches, the section heading matches, or the
   sub-group heading directly above it matches. Highlighted (emphasis)
   if it matches; otherwise plain.
4. Category heading: all items in the section stay visible when the heading
   matches; the heading text is highlighted with the marker style. Matches
   inside embedded icon markup are never highlighted.
5. Column: never hidden as a cell. If it has no matches and the category
   heading does not match, its mobile label and all its sub-group headings
   are hidden (the tinted cell remains).
6. Sub-group heading: visible when the list directly below it has at least
   one visible item, or when the heading itself matches the query. On a
   heading match, every item in the list below stays visible and the
   heading text is highlighted with the marker style, matching the category
   heading treatment. Hidden otherwise. Columns without any item lists are
   skipped.
7. Section: hidden entirely if no item and no category or sub-group heading
   match anywhere in it.
8. Empty placeholder columns: always untouched.

### 7.3 Restoration guarantee

The original content of every item (plain text) and category heading
(markup) is captured once at load time. Every transition back to IDLE — and every re-render in FILTERED —
restores from these captures, so repeated searches never accumulate
formatting or highlight artifacts.

### 7.4 Text-scale state machine

| State | Condition               | Effects                                        |
| ----- | ----------------------- | ---------------------------------------------- |
| S100  | `data-text-scale="100"` | `--text-scale` 1; content at the sizes of §4.3 |
| S125  | `data-text-scale="125"` | `--text-scale` 1.25; content text 25 % larger  |
| S150  | `data-text-scale="150"` | `--text-scale` 1.5; content text 50 % larger   |

Transitions (single control, a cycling `Aa` button in the search widget):

- S100 → S125 → S150 → S100 on each activation.
- The attribute lives on the root element; the level is restored at load
  from local storage when present and valid, otherwise S100 (see §10).
- The scale applies to the content font-size tokens only; the masthead
  titles, spacing, borders, widget height, and sticky offsets are fixed
  (deviation 9). The sub-title one-line guarantee (deviation 8) is
  unaffected because the masthead never scales.
- Invalid or missing stored values fall back to S100. Storage failures
  (private mode, blocked cookies) degrade to session-only behavior:
  the toggle still works, the choice is simply not remembered.

## 8. Data Flow

```
input change ──> debounce 300 ms ──> normalize (lowercase + trim)
      ──> match items + headings (category and sub-group) ──> derive visibility plan
      ──> apply plan (hide/show + highlight) ──> toggle clear control

clear control or Escape ──> empty input ──> restore originals ──> IDLE

toggle ──> next level ──> set data-text-scale on root ──> tokens recompute
      ──> persist level (local storage, failure-safe)

page load ──> capture item text/markup + heading markup ──> attach listeners
      ──> restore stored text-scale level

scroll ──> if input focused and scrolled past 50 px, and no filter run
          in the last 200 ms ──> blur input
```

The matcher is a pure function: query + captured content in, visibility
plan out. No side effects inside the matcher; a separate executor applies
the plan to the document. This separation makes the engine testable
without a browser and keeps application of changes idempotent. The
text-scale toggle is a pure state flip: it sets one attribute and lets
the stylesheet tokens recompute; no DOM traversal or content rewrites.

## 9. Contracts

### 9.1 Entry point

A single document (`src/index.html` per user requirement). It must:

- Declare Norwegian language, UTF-8, and the responsive viewport meta.
- Render the full page content with scripts disabled (search and the
  text-size toggle degrade to inert; all content and layout must be
  intact).
- Load one stylesheet set and the module scripts at the end.
- Require no network at all: no remote assets (fonts are the platform's
  native system stack).

### 9.2 Icon set

Emoji glyphs from the system font, mapped to the origin's Font Awesome
icons. No runtime icon library.

| Origin icon (FA 6)   | Replacement emoji | Used in                         |
| -------------------- | ----------------- | ------------------------------- |
| magnifying-glass     | 🔍                | search widget                   |
| thumbs-up            | 👍                | SPIS labels                     |
| scale-balanced       | ⚖️                | BEGRENSE labels                 |
| hand                 | ✋                | UNNGÅ labels                    |
| circle-info          | ℹ️                | info banner                     |
| triangle-exclamation | ⚠️                | VIKTIG / TIPS footnotes         |
| wheat-awn            | 🌾                | Brød, ris og pasta              |
| carrot               | 🥕                | Grønnsaker og belgfrukter       |
| apple-whole          | 🍎                | Frukt, tørket frukt og bær      |
| cow                  | 🐄                | Melk, meieriprodukter           |
| seedling             | 🥜                | Nøtter og frø                   |
| mug-hot              | ☕                | Drikke                          |
| drumstick-bite       | 🍗                | Kjøtt, egg, fisk                |
| bread-slice          | 🍞                | Pålegg                          |
| cubes-stacked        | 🧊                | Sukker, søtning og annet        |
| pepper-hot           | 🌶️                | Krydder og urter                |
| bottle-droplet       | 🫗                | Smakstilsetning, saus, dressing |

Glyphs with a dual text/emoji presentation (⚖️ ℹ️ ⚠️ ☕ 🌶️) render in
emoji presentation. The masthead emoji (🥦 🍓 🧀 🥖) stay as text glyphs.

### 9.3 Element identity contract

The script locates elements by stable, semantic identity:

| Element           | Required                                           |
| ----------------- | -------------------------------------------------- |
| Search input      | required; missing → page renders, no interactivity |
| Clear control     | required                                           |
| Text-scale toggle | optional; missing → no text scaling                |
| Category section  | required (11)                                      |
| Category heading  | required per section                               |
| Column            | required per section (3)                           |
| Item              | optional per column                                |
| Sub-group heading | optional per column                                |
| Mobile label      | optional per column                                |

### 9.4 Error boundaries

- Missing optional elements (mobile labels, sub-groups) → skipped.
- Empty columns → skipped by filtering.
- Malformed captured content → element treated as non-matching.
- No exception may propagate out of the filter pipeline; a failed element
  never breaks the rest of the page.
- Filtering is idempotent: applying the same query twice yields the same
  document state.

### 9.5 Timing and performance

- Debounce: 300 ms after the last input change.
- Scroll blur: passive listener; blurs when the input is focused and the
  page is scrolled past 50 px. A 200 ms grace window after each filter
  run suppresses the blur: filtering collapses the page height, the
  browser clamps the scroll position and fires a scroll event, and that
  event must not steal focus from the input mid-search. Only user scrolls
  may blur.
- No network requests in the search path; no timers other than the debounce.

## 10. Persistence

One exception to the otherwise stateless document: the chosen text-size
level is remembered in local storage (key `fodmap-text-scale`, values
`100` / `125` / `150`) so the preference survives reloads. It is a
single string, written only on toggle, read once at load, and validated
against the allowed values; read/write failures degrade to session-only
behavior (deviation 9). Nothing else is stored — no cookies, no server,
no search history. The in-session capture of original item and heading
content needed for restoration is never persisted.

## 11. External Dependencies

| Dependency                      | Type               | Rationale                            |
| ------------------------------- | ------------------ | ------------------------------------ |
| NHI.no source page              | external hyperlink | footer attribution, opens in new tab |
| NKFM source page (Helse Bergen) | external hyperlink | footer attribution, opens in new tab |

No runtime JavaScript libraries and no remote assets. Typography uses the
platform's native system font stack (§4.2), so the page is fully functional
offline; the only external references are the two attribution links in the
footer.

## 12. Fidelity

### 12.1 Verbatim content

All Norwegian text — headings, items, portion notes, footnotes, banners,
brand names, casing, punctuation — is copied from the origin, except for
the user-approved corrections below. Item counts per column must match
section 6.2 exactly.

Approved corrections (user decision, 2026-07-31):

| Location    | Origin                                                             | Corrected                                                          |
| ----------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Masthead    | Vanlige matvarer på                                                | Vanlige matvarer                                                   |
| §2 SPIS     | Sopp: hermetsisk sjampinjong, Østers                               | Sopp: hermetisk sjampinjong, østers                                |
| §2 SPIS     | Purre-kun det grønne                                               | Purre – kun det grønne                                             |
| §2 SPIS     | Rødbeter, syltet                                                   | Rødbeter, syltede                                                  |
| §2 BEGRENSE | Squash (0.75 dl)                                                   | Squash (0,75 dl)                                                   |
| §3 SPIS     | Banan (15 stk)                                                     | Banan i biter (15 stk)                                             |
| §3 BEGRENSE | Avokodo (1/8 av en hel)                                            | Avokado (1/8 av en hel)                                            |
| §3 BEGRENSE | Blåbær, amerikanske og hvite inn (40 gram)                         | Blåbær, amerikanske og hvite inni (40 gram)                        |
| §3 BEGRENSE | Tranebær (1ss)                                                     | Tranebær (1 ss)                                                    |
| §4 heading  | Melk, meieriprodukter & Alternativer                               | Melk, meieriprodukter & alternativer                               |
| §4 BEGRENSE | Kokosmelk, (0,6 dl)                                                | Kokosmelk (0,6 dl)                                                 |
| §4 UNNGÅ    | Rømme, kesam                                                       | Rømme                                                              |
| §8 SPIS     | Sardiner i vann, olje eller gele.                                  | Sardiner i vann, olje eller gele                                   |
| §8 SPIS     | Spekeskinke (strynskinke, Strandaskinke, serranoskinke, westfaler) | Spekeskinke (strynskinke, strandaskinke, serranoskinke, westfaler) |
| §9 SPIS     | Sirup, Glukose                                                     | Sirup, glukose                                                     |
| §9 SPIS     | Aceculfat K                                                        | Acesulfam K                                                        |
| §9 UNNGÅ    | Erytritol (Sukrin) (E938)                                          | Erytritol (Sukrin) (E 968)                                         |
| §9 UNNGÅ    | Polydextrose (E1200)                                               | Polydextrose (E 1200)                                              |
| §10 SPIS    | Bukkehomkløver/methi                                               | Bukkehornkløver/methi                                              |
| §10 SPIS    | Kajennepepper                                                      | Cayennepepper                                                      |
| §11 UNNGÅ   | Kjøttbuljond, cups (Magi)                                          | Kjøttbuljong (Maggi)                                               |

Reviewed and confirmed unchanged: `Nøtte` (§8), `Banos` (§8),
`Lollosalat` (§2).

### 12.2 Documented deviations from the origin (behavior parity notes)

1. Tailwind utility classes are replaced by semantic stylesheet classes.
   Visual output is unchanged.
2. The Font Awesome JavaScript CDN is replaced by corresponding emoji.
   Emoji are system-rendered and vary by platform, so the icon area is a
   deliberate visual deviation from the origin's monochrome icons,
   consistent with the masthead's existing emoji.
3. Item small-print notes are merged into the item text as plain
   parenthesized notes from the start. The origin renders two items
   ("Brød, surdeig, spelt" and "Cornflakes, glutenfri", §1 SPIS) with a
   styled small-print line and flattens that styling after the first
   search. Deviation is deliberate: the styling covers only two items,
   and the origin's own search removes it anyway.
4. The clear control in the origin is a button without an explicit type;
   the reimplementation declares an explicit type (non-visual).
5. Google Fonts (Oswald, Bebas Neue, Open Sans) are replaced by the
   platform's native system font stack (user decision, 2026-07-31: no
   third-party font dependency). Rendering varies by platform and by
   installed faces. Oswald's condensed headings are approximated by bold
   weight with the existing uppercase and letter-spacing rules; Bebas
   Neue's narrow display face is not reproducible with system fonts, so
   the masthead title renders wider. This is the same platform-variability
   trade-off already accepted for emoji (deviation 2).
6. The footer source line is replaced per user request (2026-07-31):
   "01 // FODMAP | Kilde:" with one NHI.no link becomes
   "FODMAP v0.3.0 // Kilder:" with two links (NHI.no and NKFM – Lav
   FODMAP-mat ved IBS). The disclaimer line below is unchanged. The
   version text must track the `VERSION` file.
7. The Smakstilsetning, saus, dressing category color set is changed per
   user request (2026-07-31): the origin's gray-green
   (`#a4b8a2` / `164, 184, 162`) was visually indistinguishable from the
   Krydder og urter set (`#b5c7b3` / `181, 199, 179`) and is replaced by
   a muted lavender (`#b9a7cf` / `185, 167, 207`), a hue family not used
   elsewhere in the palette. Applies to the heading background and the
   three column tint levels.
8. The masthead sub-title never wraps (user requirement, 2026-07-31).
   The origin wraps onto two lines at narrow viewports; the
   reimplementation declares `white-space: nowrap` and steps the size
   down at ≤ 457 px (1 rem), ≤ 372 px (0.875 rem), and ≤ 329 px
   (0.8125 rem) so the single line also fits without horizontal
   overflow at every width down to 320 px.
9. A text-size toggle is added per user request (2026-07-31): a cycling
   `Aa` button in the search widget raises content text through
   100 % / 125 % / 150 %. The origin has no such control. Scaling
   applies to the content font-size tokens only (`calc` on
   `--text-scale`); the masthead titles, spacing, borders, search
   widget height, and sticky offsets stay fixed so the view remains
   compact. Items declare `overflow-wrap: anywhere` so unbreakable
   tokens ("Maltodextrin/maltose/maltekstrakt") wrap instead of pushing
   the column track wider at 150 %. The level is persisted in local
   storage (key
   `fodmap-text-scale`) — the one storage exception to §10 — and
   degrades to session-only when storage is unavailable. The toggle is
   not part of the search engine module; it lives in its own module
   and state machine (§7.4).
10. A footer credit line is added per user request (2026-07-31):
    "Utviklet av Arnulf Heimsbakk // Kildekode på
    github.com/aheimsbakk/fodmap // Lisens MIT" with the repository
    name linked to `https://github.com/aheimsbakk/fodmap/` (new tab).
    The origin has no such line. It renders in the footer's small gray
    secondary style below the source line. The footer order is:
    disclaimer, source line, credit line, with equal 0.5 rem gaps
    between the three text lines. A separator (em dash, then dashed,
    then a solid 2 px rule matching the footer border) sat between
    the disclaimer and the source line for one day and was removed on
    user request; the current footer has no separator. Bold weight
    moved from the source line to the disclaimer line on user request
    (2026-07-31); the source line now renders regular weight.
11. Sub-group headings get a uniform separator line, per user request
    (2026-07-31). The origin is inconsistent: all sub-list titles carry
    `mt-0` (no top margin), most keep the line, and the ones that open
    their column at wide widths drop it via `md:border-t-0 md:pt-0` —
    except §4 SPIS "Melk og meieriprodukter:", which keeps a floating
    line with nothing above it. The reimplementation applies one rule:
    every sub-group heading with content above it gets the 1 px line;
    a sub-group that opens its column has nothing above it at ≥ 768 px
    (the mobile label is hidden there) and stays flush (no margin, no
    padding, no line) via a `@media (min-width: 768px)` rule targeting
    `.content-col > .role-label + .sub-group-title` and
    `.content-col > .sub-group-title:first-child`. Below 768 px the
    label sits above it, so the line stays. No `:first-of-type`
    exception is used: a sub-group below a main item list has content
    above it and keeps the line.

### 12.3 Negative contracts

- No layout change between viewport widths beyond the documented rules.
- No scroll-jacking; sticky positioning only for the search widget and
  category headings.
- No content reordering across breakpoints (narrow stacking is the same
  order as the wide columns, left to right).

## 13. Verification

### 13.1 Functional tests (automated)

Cover the search engine:

- Normalization: lowercase, trim, empty query.
- Matching: case-insensitivity, portion note participation,
  heading match reveals whole section, sub-group heading match reveals its
  whole list, no diacritic folding.
- Highlight: single/multiple occurrences, emphasis marker in headings
  (category and sub-group) excluding icon markup, item emphasis, restore on
  clear.
- Visibility transitions: item, sub-group, mobile label, section.
- Special inputs: regex metacharacters, spaces, uppercase.
- Clear control: hides/shows, restores originals, returns focus.
- Escape key: clears an active search exactly like the clear control while
  the input is focused; empty query and unfocused input are no-ops.
- Debounce: coalesces rapid input.
- Scroll blur rule.

Text-size toggle (§7.4):

- Cycling: each activation advances S100 → S125 → S150 → S100.
- Application: the `data-text-scale` attribute moves with the level; the
  computed content font sizes scale, the masthead and spacing do not.
- Persistence: the level survives reload via local storage; invalid,
  missing, or unreadable stored values fall back to S100.
- Independence: toggling the scale never disturbs an active search
  (matches, highlights, and visibility stay intact), and clearing a
  search never resets the level.

### 13.2 Content parity tests (automated)

- Section count, heading order, and heading text equal to origin, except
  the approved corrections (§12.1).
- Per-column item counts equal to section 6.2 (total 484).
- Sampled item text equality against origin, except the approved
  corrections (§12.1).

### 13.3 Visual and behavioral parity (full-browser)

Run in a real browser (Playwright, available in this environment):
render the reimplementation against the origin at 375 px, 768 px,
1024 px, and 1280 px widths and compare masthead, sticky offsets, grid
columns, mobile labels vs legend, banner seams, and footer. Run live
search flows (typing, highlighting, clear, section hiding, scroll blur)
and compare screenshots. Spot-check the FILTERED state at the same
widths.

## 14. Stylesheet Architecture

The stylesheet layer structure (physical files mapped in `CODEBASE.md`):

1. Tokens: color palette, typography, sizes, z-order, shadows, breakpoints.
2. Base: reset, body typography, list normalization.
3. Layout: page shell, container, grid system, sticky behavior.
4. Components: masthead, search widget, labels, banners, headings, columns,
   lists, sub-groups, decorations, footer.
5. Utilities: responsive toggles (mobile-only, wide-only), hidden state,
   search marker styling.

Rules: mobile-first authoring; no duplicated declarations across layers;
no inline styles in the document; every color and size sourced from tokens;
each stylesheet file stays small enough for one focused responsibility.
