# BLUEPRINT.md — FODMAP Overview App

> This document is the language-agnostic architecture for the app. It is
> authoritative for the page structure, behavior, and design; the content
> data model (§6) is the specification of the content pipeline. The
> concrete Norwegian content lives as data under `data/` (physical mapping
> in `CODEBASE.md`), and a developer-time build step turns that data into
> the static page. The generated page and the automated tests are the
> implementation of this document.

## 1. System Goals

Provide a static, dependency-free single-page app that:

1. Renders consistently across all screen sizes (mobile, tablet, desktop).
2. Renders all content without scripts, plus the interactive food search
   with live filtering and highlighting.
3. Uses only plain markup documents, stylesheets, and vanilla scripts
   (one module per concern) at runtime. No frameworks, no runtime library
   downloads, no remote assets. Typography uses the platform's native
   system fonts.
4. Keeps content in data, not markup: the Norwegian text and structure
   live in release data plus one config file, and a developer-time build
   step merges them into the static page. The browser never runs the
   build; it receives plain files only.
5. Keeps the stylesheets clean, token-driven, and mobile-first responsive.
6. Keeps all Norwegian content verbatim (see section 12, Fidelity).

## 2. Scope

### In scope

- Full page: corner decorations, masthead, sticky search widget, column
  legend, info banner, 11 category sections (with footnotes), footer.
- Responsive layout for narrow (base), medium (≥ 640 px), wide (≥ 768 px),
  and extra-wide (≥ 1024 px) viewports.
- Search interaction: debounced live filtering, term highlighting, clear
  control, section/column/item visibility transitions. Reasoning notes
  participate in matching (§7.2).
- Note affordance: an item may carry a reasoning note, revealed by an
  inline info button and popover; the note is searchable (§7.5).
- Text-size toggle: a control in the search widget that cycles the content
  text size through 100 % / 125 % / 150 % (see §12.2 deviation 9).
- Content pipeline: release data under `data/` (config + item files),
  the oldest→newest merge rules (§6.3), and the developer-time build
  step that generates the page.
- Automated tests for the search engine, the text-size toggle, the content
  pipeline, and content parity.

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
   │  │  └─ Column (3 ×)      (role-tinted background; optional mobile label;
   │  │                        optional sub-group headings; item list; items
   │  │                        may carry a note info button + popover)
   │  └─ Footnote banner      (optional, joins the grid bottom edge)
   └─ Footer                  (source link, disclaimer)
```

## 4. Design Tokens

Color values are single-sourced in `data/config.json` and written into
the token layer by the build step (§6.1, §14). The tables below are the
canonical values; the generated layer must reproduce them exactly.

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

Category color sets (heading background only):

| Category                             | Heading bg |
| ------------------------------------ | ---------- |
| Brød, ris og pasta                   | `#d59e5e`  |
| Grønnsaker og belgfrukter            | `#8fb88a`  |
| Frukt, tørket frukt og bær           | `#d96f6f`  |
| Melk, meieriprodukter & Alternativer | `#93b5c6`  |
| Nøtter og frø                        | `#a9744f`  |
| Drikke                               | `#8ab6d6`  |
| Kjøtt, egg, fisk                     | `#e08c8c`  |
| Pålegg                               | `#d1bfae`  |
| Sukker, søtning og annet             | `#e6c8c8`  |
| Krydder og urter                     | `#b5c7b3`  |
| Smakstilsetning, saus, dressing      | `#d97744`  |

Column tints are role-based, per user request (2026-08-01, deviation 13):
each column carries the color of its role, so the column ↔ role
correspondence is visible at a glance (matching the legend and the mobile
labels). Values are the role backgrounds at low opacity:

| Role     | Tint                        |
| -------- | --------------------------- |
| SPIS     | `rgba(160, 196, 157, 0.2)`  |
| BEGRENSE | `rgba(247, 215, 116, 0.25)` |
| UNNGÅ    | `rgba(209, 93, 93, 0.15)`   |

Empty placeholder columns carry the role of their position and get the
corresponding tint (deviation 13).

Support colors:

| Token            | Value                | Use                             |
| ---------------- | -------------------- | ------------------------------- |
| Dashed separator | `rgba(0, 0, 0, 0.3)` | column separators (1 px dashed) |
| Column top line  | `rgba(0, 0, 0, 0.1)` | column top borders (narrow)     |
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
fonts, so the masthead title renders wider (deliberate deviation 5, §12.2).

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

List text is 0.85 rem at every width. Sub-group titles are 0.8 rem on
narrow and 0.875 rem from 640 px. These values are fixed and do not
follow the responsive size steps of the other content text.

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

### 4.6 Note info-button tokens

The note affordance (§7.5) is styled from tokens so the button scales
with the text scale:

| Token                         | Default  | Use                                   |
| ----------------------------- | -------- | ------------------------------------- |
| `--info-emoji`                | `ℹ️`     | button glyph                          |
| `--info-emoji-matched`        | `☑️`     | glyph when the note matches the query |
| `--info-button-width`         | `1.2em`  | button size                           |
| `--info-button-height`        | `1.2em`  | button size                           |
| `--info-button-font-size`     | `0.75em` | glyph size                            |
| `--info-button-border-radius` | `50%`    | round button                          |
| `--info-button-margin-left`   | `0.4rem` | gap after the item text               |

The glyph swap is a CSS `::before` content rule toggled by a class; the
button's live text node never changes, so search restore is unaffected.
The button renders without a border and without a hover ring; keyboard
focus keeps a visible outline via `:focus-visible` only (deviation 17).

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
  - Each column's background carries its role tint (§4.1) at every width.
- Item list: no list markers; each item prefixed by a ❖ bullet (U+2756)
  positioned at the left edge; items 0.85 rem, line-height 1.2, 0.25 rem
  bottom margin.
- Item structure: primary text plus optional parenthesized portion note.
  All notes are inline plain text; there is no small-print styling
  (see §12.2 deviation 3).
- Note affordance: an item may carry a reasoning note (why the item is in
  its column, a source link, a caveat). It renders as an inline info
  button with a popover: hover or focus shows the note, a click pins it
  open, and clicking anywhere outside closes it (§4.6, §7.5).
- Sub-groups: uppercase bold small heading; separated from the preceding
  block by margin only (0.75 rem top margin). No separator line at any
  width or search state (deviation 11).
- Footnote banner: white background, 2 px solid black border (top edge
  open), centered bold text, warning icon, small shadow. Wording and icon
  per section: VIKTIG and TIPS notes use the warning emoji; the MARINADER
  note has no icon.

### 5.7 Empty placeholder columns

Three sections reserve empty columns to keep the 3-column rhythm:

- Kjøtt, egg, fisk: columns 2 and 3 are empty, rendered wide+ only.
- Pålegg: column 2 is empty, rendered wide+ only.
- Krydder og urter: column 2 is empty, rendered wide+ only.

Empty columns carry the role of their position (BEGRENSE or UNNGÅ,
§6.2) and receive that role's tint, so the color rhythm of the section
stays complete. They participate in the grid, carry no mobile label, and
are excluded from filtering. A `data-placeholder` attribute marks them
for the wide-only rendering rule.

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
gaps. The source line is a user-requested addition (see §12.2 deviation 6),
and the credit line is a user-requested addition (2026-07-31; see §12.2
deviation 10).

## 6. Content Data Model

Content is data, not markup. Two inputs feed the page: one global config
file and a set of date-named release folders holding item files. The
build step merges the releases (§6.3) and renders the page from the
merged state plus the config (§8).

### 6.1 Sources and authority

| Source          | Holds                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| config file     | global names (sections, groups, subgroups, footnote types) and page text (masthead, search, banners, footer, colors, note button) |
| release folders | the item files; the oldest folder is the full baseline, later folders are deltas                                                  |

The Norwegian text — headings, items, portion notes, footnotes, banners,
footer lines — lives only in these files, verbatim as fixed in §12.1.
The generated page is a rendering of the data, never an independent copy.

### 6.2 Abstract schema

```
Config
├─ schema, collation       (format version, sort locale)
├─ page                    (head, search, info-banner, colors, footer
│                           lines, note info-button)
├─ sections [ ]            (id, title, icon, heading color, optional
│                           footnote; array order = page order)
├─ groups [ ]              (id, label, icon, colors, column tint; array
│                           order = left-to-right columns)
├─ subgroups { }           (key → heading title)
└─ footnote-types { }      (key → emoji, or null)

Release (folder, date name)
├─ baseline (oldest)       (every item exactly once)
└─ delta (later)           (only changed, added, or removed items)

Item (one file; the filename is the stable slug id)
├─ name                    (primary text, verbatim)
├─ group                   (column; key from config)
├─ amount                  (optional portion note, parenthesized)
├─ subgroup                (optional heading; key from config)
├─ visible                 (default true; false removes the item)
├─ attribution             (optional source URL(s))
└─ note                    (optional reasoning note, append-only body)

Section (derived, one per config section with items)
├─ heading                 (icon + title, per-section color)
├─ columns                 (one per config group, in array order)
│   └─ blocks              (bare item list, then sub-group blocks)
└─ footnote banner         (optional, from the section's footnote)
```

### 6.3 Merge rules

The current state of an item is the merge of its file across all releases,
oldest → newest:

1. An item is identified by its slug within its section folder.
2. Absent fields are inherited from the older state.
3. Explicitly empty values clear the inherited value.
4. `visible: false` removes the item from the page; `visible: true`
   restores it.
5. The note body accumulates: the newest note is prepended above older
   ones; notes are append-only.

### 6.4 Column layout derivation

A section renders one column per config group, in the config array order.
A column holds its bare items first, then its sub-group blocks sorted by
resolved title, each with its items sorted by name (config collation). A
section with no item for a group renders that group's column as an empty
placeholder (§5.7).

### 6.5 Section inventory (parity reference)

Counts are item totals per column (main list + sub-groups), and sub-group
count per column. These are frozen parity assertions, verified against the
merged data and the generated page (§13.2).

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

On load the input value is always cleared and boot renders from IDLE
unconditionally: browsers restore typed form values on reload, but the
filter state is never persisted, so a restored query would leave text in
the field over a fully visible, unfiltered page. The input also opts out
of browser form-value restoration (`autocomplete="off"`) so a value cannot
be restored after the boot script has run.

### 7.2 Derived visibility rules (FILTERED state)

1. Query = input value, lowercased, trimmed. No diacritic folding
   (a search for "lok" does not match "Løk"; "løk" does).
2. Match = case-insensitive substring containment in an item's full text
   (including its portion note and its reasoning note, §7.5), in a
   category heading text, or in a sub-group heading text.
3. Item: visible if it matches, the section heading matches, or the
   sub-group heading directly above it matches. Highlighted (emphasis)
   if its article text matches; otherwise plain. A match on the reasoning
   note alone reveals the item, flips its note-button glyph to the matched
   state, and bolds the matched terms inside the popover (§4.6, §7.5,
   deviation 17); the popover's open/pinned state is never disturbed.
4. Category heading: all items in the section stay visible when the heading
   matches; the heading text is highlighted with the marker style. Matches
   inside embedded icon markup are never highlighted.
5. Column: below 768 px a column whose content is fully filtered out
   collapses entirely — if it has no matches and the category heading does
   not match, the whole cell is hidden (its mobile label and sub-group
   headings hide with it). The cell returns as soon as any item or
   sub-group heading in it matches again, or the category heading matches.
   From 768 px up the column is never hidden: only its mobile label and
   sub-group headings collapse when nothing matches (the tinted cell
   remains, keeping the 3-column rhythm). See deviation 14.
6. Sub-group heading: visible when the list directly below it has at least
   one visible item, or when the heading itself matches the query. On a
   heading match, every item in the list below stays visible and the
   heading text is highlighted with the marker style, matching the category
   heading treatment. Hidden otherwise. Columns without any item lists are
   skipped.
7. Section: hidden entirely if no item and no category or sub-group heading
   match anywhere in it.
8. Empty placeholder columns (`data-placeholder`): always untouched.

### 7.3 Restoration guarantee

The original content of every item (plain text), category heading
(markup), and note popover (plain text) is captured once at load time.
Every transition back to IDLE — and every re-render in FILTERED —
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

### 7.5 Note-popover state machine

The note affordance (§5.6) has a third, independent interaction state per
item — the note popover.

| State  | Condition              | Effects                                                                                                             |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| CLOSED | popover hidden         | `hidden` on the popover; button glyph `ℹ️`                                                                          |
| SHOWN  | pointer hover or focus | popover visible                                                                                                     |
| PINNED | button click           | popover stays visible while the pointer leaves; a second click on the button or any click outside unpins and closes |

Transitions:

- Hover enter on the button or the popover → SHOWN; hover leave → CLOSED,
  unless PINNED.
- Button click toggles PINNED: pin opens and holds; a second click unpins
  and closes. A click anywhere outside a pinned button and its popover
  unpins and closes.
- Keyboard activation of the button (Enter/Space) behaves as a click
  (native button semantics).
- Search interacts with the popover through the glyph and the popover
  content: a query that matches the note text toggles the matched glyph
  on the button and bolds the matched terms inside the popover (§7.2.3,
  deviation 17). It never opens or closes a popover and never touches its
  open/pinned state. Every interactive affordance is inert without scripts.

## 8. Data Flow

```
# Build time (developer)
config + release folders ──> merge oldest→newest (inherit, clear, remove,
      prepend) ──> render index.html + tokens.css + roles.css ──> static site

# Runtime (browser)
input change ──> debounce 300 ms ──> normalize (lowercase + trim)
      ──> match items (article + note) + headings (category and sub-group)
      ──> derive visibility plan
      ──> apply plan (hide/show + highlight) ──> toggle clear control

clear control or Escape ──> empty input ──> restore originals ──> IDLE

toggle ──> next level ──> set data-text-scale on root ──> tokens recompute
      ──> persist level (local storage, failure-safe)

note hover/click ──> show / pin / close the item's popover (own state)

page load ──> capture article text + note text + heading markup ──> attach
      listeners ──> restore stored text-scale level

scroll ──> if input focused and scrolled past 50 px, and no filter run
          in the last 200 ms ──> blur input
```

The matcher is a pure function: query + captured content in, visibility
plan out. No side effects inside the matcher; a separate executor applies
the plan to the document. This separation makes the engine testable
without a browser and keeps application of changes idempotent. The
text-scale toggle is a pure state flip: it sets one attribute and lets
the stylesheet tokens recompute; no DOM traversal or content rewrites.
The note popover enters the filter pipeline only as captured text: search
matches the note text and writes the button's matched class plus the
popover's bolded content, never its open/pinned state (§7.5).

The build pipeline is likewise pure in its render half: merged data +
config in, document strings out, written by a thin CLI.

## 9. Contracts

### 9.1 Entry point

A single document (`src/index.html` per user requirement). It must:

- Declare Norwegian language, UTF-8, and the responsive viewport meta.
- Render the full page content with scripts disabled (search and the
  text-size toggle degrade to inert; all content and layout must be
  intact).
- Load the stylesheet set — tokens, base, layout, components, roles,
  utilities — and the module scripts (search, text-scale, note-popover)
  at the end of the body.
- Declare the search input with `autocomplete="off"` (boot always clears
  it, see §7.1).
- Require no network at all: no remote assets (fonts are the platform's
  native system stack).
- Be generated, not hand-edited: the document is a build artifact; the
  content authority is the data (§6.1).

### 9.2 Icon set

Emoji glyphs from the system font replace a runtime icon library
(§12.2 deviation 2). No icon library is loaded.

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
| Item article span | required per item; carries the searchable text     |
| Note toggle       | optional per item; absent → no note affordance     |
| Note popover      | optional per item; sibling of the note toggle      |
| Sub-group heading | optional per column                                |
| Mobile label      | optional per column                                |

### 9.4 Error boundaries

- Missing optional elements (mobile labels, sub-groups, note toggles,
  note popovers) → skipped.
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

The build step is a developer-time dependency: it needs a JavaScript
runtime with the standard library only — no packages, no network. It never
runs in the browser and never ships with the page.

## 12. Content Specification

### 12.1 Canonical content

All Norwegian text — headings, items, portion notes, footnotes, banners,
brand names, casing, punctuation — is fixed by this document. The data
files under `data/` hold it, the generated page renders it, and the
automated tests assert it — all verbatim. Item counts per column must
match section 6.5 exactly.

The canonical spellings below were set on 2026-07-31 to correct known
typos in the source material. The data must use exactly these strings,
and the content tests assert them. The reviewed spellings
`Nøtte` (§8), `Banos` (§8), and `Lollosalat` (§2) look like typos but
are intentional and must stay unchanged.

| Location    | Canonical spelling                                                 |
| ----------- | ------------------------------------------------------------------ |
| Masthead    | Vanlige matvarer                                                   |
| §2 SPIS     | Sopp: hermetisk sjampinjong, østers                                |
| §2 SPIS     | Purre – kun det grønne                                             |
| §2 SPIS     | Rødbeter, syltede                                                  |
| §2 BEGRENSE | Squash (0,75 dl)                                                   |
| §3 SPIS     | Banan i biter (15 stk)                                             |
| §3 BEGRENSE | Avokado (1/8 av en hel)                                            |
| §3 BEGRENSE | Blåbær, amerikanske og hvite inni (40 gram)                        |
| §3 BEGRENSE | Tranebær (1 ss)                                                    |
| §4 heading  | Melk, meieriprodukter & alternativer                               |
| §4 BEGRENSE | Kokosmelk (0,6 dl)                                                 |
| §4 UNNGÅ    | Rømme                                                              |
| §8 SPIS     | Sardiner i vann, olje eller gele                                   |
| §8 SPIS     | Spekeskinke (strynskinke, strandaskinke, serranoskinke, westfaler) |
| §9 SPIS     | Sirup, glukose                                                     |
| §9 SPIS     | Acesulfam K                                                        |
| §9 UNNGÅ    | Erytritol (Sukrin) (E 968)                                         |
| §9 UNNGÅ    | Polydextrose (E 1200)                                              |
| §10 SPIS    | Bukkehornkløver/methi                                              |
| §10 SPIS    | Cayennepepper                                                      |
| §11 UNNGÅ   | Kjøttbuljong (Maggi)                                               |

### 12.2 Design decisions and behavior notes

1. Semantics: stylesheet classes are semantic and hand-written; no utility
   class framework is used. Visual output follows §4–§11.
2. Icons: emoji glyphs from the system font replace an icon library.
   Emoji are system-rendered and vary by platform, so the icon area looks
   different per platform — the same variability already accepted for the
   masthead's emoji.
3. Item small-print notes are merged into the item text as plain
   parenthesized notes. There is no separate small-print styling; the
   styling applies consistently at all times and under every search state.
4. The clear control is a button with an explicit `type="button"`
   (non-visual).
5. Typography uses the platform's native system font stack (user decision,
   2026-07-31: no third-party font dependency). Rendering varies by
   platform and by installed faces. Condensed heading faces are
   approximated by bold weight with the existing uppercase and
   letter-spacing rules; the narrow display face used by the original
   masthead is not reproducible with system fonts, so the masthead title
   renders wider. This is the same platform-variability trade-off already
   accepted for emoji (deviation 2).
6. The footer source line reads "FODMAP v<version> // Kilder:" with two
   links (NHI.no and NKFM – Lav FODMAP-mat ved IBS); the version text
   must track the `VERSION` file. The disclaimer line below it is bold;
   the source and credit lines are regular weight (§5.8).
7. The Smakstilsetning, saus, dressing category heading color is a
   sauce-red terracotta (`#d97744` / `217, 119, 68`), chosen for its
   content association (tomato-based sauces) and its distance from the
   pink/red family already used by Frukt, Kjøtt, and Sukker. Applies to
   the heading background only (column tints are role-based, deviation 13).
8. The masthead sub-title never wraps (user requirement, 2026-07-31):
   `white-space: nowrap` keeps the tagline on one line, and the size steps
   down at ≤ 457 px (1 rem), ≤ 372 px (0.875 rem), and ≤ 329 px
   (0.8125 rem) so the single line fits without horizontal overflow at
   every width down to 320 px.
9. A text-size toggle is added per user request (2026-07-31): a cycling
   `Aa` button in the search widget raises content text through
   100 % / 125 % / 150 %. Scaling applies to the content font-size tokens
   only (`calc` on `--text-scale`); the masthead titles, spacing, borders,
   search widget height, and sticky offsets stay fixed so the view remains
   compact. Items declare `overflow-wrap: anywhere` so unbreakable tokens
   ("Maltodextrin/maltose/maltekstrakt") wrap instead of pushing the
   column track wider at 150 %. The level is persisted in local storage
   (key `fodmap-text-scale`) — the one storage exception to §10 — and
   degrades to session-only when storage is unavailable. The toggle is not
   part of the search engine module; it lives in its own module and state
   machine (§7.4).
10. The footer includes a credit line (user request, 2026-07-31):
    "Utviklet av Arnulf Heimsbakk // Kildekode på
    github.com/aheimsbakk/fodmap // Lisens MIT" with the repository name
    linked to `https://github.com/aheimsbakk/fodmap/` (new tab). The
    footer renders three text lines — disclaimer, source line, credit
    line — with equal 0.5 rem gaps between them and no separator. Only the
    disclaimer line is bold. The credit line sits in the footer's small
    gray secondary style below the source line (§5.8).
11. Sub-group headings have no separator line (user request, 2026-08-01).
    In the FILTERED state a visible sub-group heading can sit below
    hidden items, so a line above it would float detached. Separation
    from the preceding block is margin-only (0.75 rem top margin); the
    `--color-subgroup-line` token is gone, and no media query
    special-cases first sub-groups — the heading renders identically at
    every width and in both search states.
12. Every category has its own heading color set. Nøtter og frø uses a
    walnut brown (`#a9744f` / `169, 116, 79`), and Pålegg uses a beige
    (`#d1bfae` / `209, 191, 174`); both are distinct from the Brød set
    they initially shared, matching the one-set-per-category pattern of
    the other categories. Applies to the heading background only (column
    tints are role-based, deviation 13).
13. Column tints are role-based per user request (2026-08-01): each
    column carries the color of its role (SPIS / BEGRENSE / UNNGÅ, §4.1)
    so the column ↔ role correspondence is visible at a glance, matching
    the legend and the mobile labels. Category colors apply to the heading
    background only. Empty placeholder columns carry the role of their
    position and get the corresponding tint (2026-08-01): leaving them
    white broke the color rhythm of the section next to their tinted
    neighbors. They are marked `data-placeholder`, render wide+ only, and
    stay excluded from filtering.
14. On narrow viewports, columns left without visible content by a search
    are hidden entirely (user request, 2026-08-01): the collapse shrinks
    the stacked narrow layout and saves vertical space. The collapse is a
    mobile-scoped CSS utility class (`.col-empty-mobile`, display none
    below 768 px only) toggled by the search executor from a per-column
    flag in the matcher plan (§7.2.5). Every re-render recomputes the
    flag, so a column reappears as soon as any item or sub-group heading
    in it matches again, or the category heading matches; every IDLE
    render removes the class. From 768 px up the class is inert: the
    tinted cell stays for the 3-column rhythm and the legend/column
    correspondence. Placeholder columns are unaffected — the matcher
    never marks them, and they are already wide-only (§5.7).
15. Items may carry a reasoning note (why the item is in its column, a
    source link, a caveat), stored in the item's data body (§6.2). The
    page renders it as an inline info button with a popover: hover to
    view, click to pin, click outside to close (§7.5). Search indexes the
    note text; a query that matches only the note reveals the item and
    flips the button glyph to the matched state (`☑️`, §4.6) instead of
    highlighting text, because the popover is never re-rendered by the
    filter.
16. The page is generated from data at build time (2026-08-05): the
    document, the color token layer, and the role/section CSS are build
    artifacts rendered from the config file and the merged release data
    (§6, §14). Hand-authored markup is replaced by generated markup; the
    base, layout, and component CSS layers and the three script modules
    stay hand-authored. The runtime page remains plain static files — the
    build step is developer-time only (§1, §8). During the migration the
    generated output is written outside the site directory so it can be
    diffed against the hand-authored files before they are retired.
17. The note info button renders without a border and without a hover
    ring (user request, 2026-08-05): the resting 1 px accent border and
    the 2 px hover outline were read as red rings around the icon, so
    both are removed; keyboard focus keeps a visible outline via
    `:focus-visible` only (§4.6). A search that matches the reasoning
    note now bolds the matched terms inside the popover, restoring the
    plain text on IDLE; the matched glyph (§4.6) and the popover's
    open/pinned state are untouched (§7.5).

### 12.3 Negative contracts

- No layout change between viewport widths beyond the documented rules.
- No scroll-jacking; sticky positioning only for the search widget and
  category headings.
- No content reordering across breakpoints (narrow stacking is the same
  order as the wide columns, left to right).
- No runtime template evaluation: the browser receives plain files only;
  the build runs before deploy, never in the page.

## 13. Verification

### 13.1 Functional tests (automated)

Cover the search engine:

- Normalization: lowercase, trim, empty query.
- Matching: case-insensitivity, portion note participation, reasoning
  note participation (a note-only match reveals the item), heading match
  reveals whole section, sub-group heading match reveals its whole list,
  no diacritic folding.
- Highlight: single/multiple occurrences, emphasis marker in headings
  (category and sub-group) excluding icon markup, item emphasis, restore on
  clear.
- Visibility transitions: item, sub-group, mobile label, section.
- Empty-column collapse (deviation 14): below 768 px a column with no
  visible content is marked for hiding; it returns when an item or
  sub-group heading in it matches, or the category heading matches;
  placeholder columns are never marked; clearing the query removes the
  marker.
- Note-button state: a note-only match toggles the matched glyph and
  bolds the matched terms inside the popover; every other state (article
  match, no match, IDLE) restores the plain glyph and the plain popover
  text; the popover's open/pinned state survives search runs untouched.
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

### 13.2 Content inventory tests (automated)

- Section count (11), heading order, and heading text equal to the
  canonical inventory in §6.5 and §12.1.
- Per-column item counts equal to §6.5 (total 484).
- The canonical spellings in §12.1 are present verbatim in the data files
  and in the generated markup.

### 13.3 Visual and behavioral verification (full-browser)

Run in a real browser (Playwright, available in this environment): render
the page at 375 px, 768 px, 1024 px, and 1280 px widths and verify the
responsive contract — masthead, sticky offsets, grid columns, mobile
labels vs legend, banner seams, and footer. Run live search flows (typing,
highlighting, clear, section hiding, scroll blur) and verify the resulting
document state. Spot-check the FILTERED state at the same widths,
including the narrow empty-column collapse (deviation 14) at 375 px: an
emptied column must be gone below 768 px and present as a tinted cell
from 768 px up.

### 13.4 Data and build pipeline tests (automated)

Cover the merge and render pipeline:

- Merge: baseline + deltas produce the expected per-item state; absent
  fields inherit, explicit empty clears, `visible: false` removes,
  `visible: true` restores, notes prepend oldest → newest (§6.3).
- Render: the generated document contains exactly the sections, columns,
  items, and footnote banners of §6.5, the config-driven legend, and the
  three module scripts; the generated token and role CSS reproduce the
  config colors (§4, §14).
- Config integrity: every section folder, item `group`, `subgroup`, and
  `footnote.type` reference resolves to a config id or key (§4 of
  `docs/config-format.md`).

## 14. Stylesheet Architecture

The stylesheet layer structure (physical files mapped in `CODEBASE.md`):

1. Tokens: color palette, typography, sizes, z-order, shadows, breakpoints.
   Color values are generated from the config file at build time; the
   static tokens (typography, sizes, z-order, effects) stay hand-authored.
2. Roles: per-group and per-section color rules, generated from the config
   arrays so the page supports an arbitrary number of groups and sections.
3. Base: reset, body typography, list normalization.
4. Layout: page shell, container, grid system, sticky behavior.
5. Components: masthead, search widget, labels, banners, headings, columns,
   lists, sub-groups, note affordance, decorations, footer.
6. Utilities: responsive toggles (mobile-only, wide-only), hidden state,
   search marker styling.

Rules: mobile-first authoring; no duplicated declarations across layers;
generated layers never duplicate hand-authored rules and hand-authored
rules never restate generated color values; no inline styles in the
document; every color and size sourced from tokens; each stylesheet file
stays small enough for one focused responsibility.
