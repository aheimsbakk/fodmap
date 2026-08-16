# BLUEPRINT.md — FODMAP Overview App

> Language-agnostic architecture for the app: authoritative for the page
> structure, behavior, and design. The content data model (§6) is the
> specification of the content pipeline. The concrete Norwegian content
> lives as data under `data/` (physical mapping in `CODEBASE.md`), and a
> developer-time build step turns that data into the static page. The
> generated page and the automated tests are the implementation of this
> document.

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
  text size through 100 % / 125 % / 150 % (§12.2 deviation 9).
- Content pipeline: release data under `data/` (config + item files),
  the oldest→newest merge rules (§6.3), the derived change markers for
  items present in the newest release (§6.6), and the developer-time build
  step that generates the page.
- Installability: manifest, raster icons derived from the favicon glyph,
  and a cache-free service worker — the page is installable as a PWA
  without any caching behavior (§9.6).
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

Column tints are role-based (deviation 13): each column carries the
color of its role, so the column ↔ role correspondence is visible at a
glance (matching the legend and the mobile labels). Values are the role
backgrounds at low opacity:

| Role     | Tint                        |
| -------- | --------------------------- |
| SPIS     | `rgba(160, 196, 157, 0.2)`  |
| BEGRENSE | `rgba(247, 215, 116, 0.25)` |
| UNNGÅ    | `rgba(209, 93, 93, 0.15)`   |

Empty placeholder columns carry the role of their position and get the
corresponding tint (deviation 13, §5.7).

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
fonts, so the masthead title renders wider (deviation 5).

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

Below 640 px the sub-title steps down to keep the tagline on one line
(deviation 8): ≤ 457 px → 1 rem, ≤ 372 px → 0.875 rem, ≤ 329 px →
0.8125 rem.

Text scaling (deviation 9, §7.4): the font-size tokens for content text
(search input, category headings, legend, list items, sub-group titles,
banners, labels) are defined as `calc(<base> × --text-scale)`, where
`--text-scale` is 1, 1.25, or 1.5 per the `data-text-scale` attribute on
the root element. The item markers and the note glyph scale the same
way (§4.6, §4.7). Spacing, borders, search widget height, sticky
offsets, and the masthead titles are deliberately excluded, so the
layout stays compact while text grows. One spacing exception: the item's
left text gutter and its bullet slot (`--size-bullet-slot`) scale with
the text scale, because at 150 % the marker glyph is wider than a fixed
slot and would overlap the item text (§5.6).

Other metrics: list items 0.85 rem with 1.2 line-height and 0.25 rem
bottom margin; sub-group titles 0.8 rem bold; mobile labels 0.875 rem
bold; columns 0.75 rem padding; heading border 2 px solid black; grid
border 2 px solid black (left, right, bottom); dashed separators 1 px.
List text (0.85 rem) and sub-group titles (0.8 → 0.875 rem from 640 px)
are fixed and do not follow the responsive size steps of the other
content text.

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

The note affordance (§7.5) is a bare emoji glyph: the button box, border,
and corner radius are deprecated and gone (deviation 17). The glyph size
is `0.9rem × --text-scale` — identical to the item markers (§4.7), so
the default bullet, the change markers, and the note glyph all render at
the same size at every scale level (deviation 9):

| Token                       | Default                       | Use                                   |
| --------------------------- | ----------------------------- | ------------------------------------- |
| `--info-emoji`              | `ℹ️`                          | button glyph                          |
| `--info-emoji-matched`      | `☑️`                          | glyph when the note matches the query |
| `--info-button-font-size`   | `calc(0.9rem × --text-scale)` | glyph size — same as the item markers |
| `--info-button-margin-left` | `0.4rem`                      | gap after the item text               |

The glyph swap is a CSS `::before` content rule toggled by a class; the
button's live text node never changes, so search restore is unaffected.
The button carries no box and no hover ring; keyboard focus keeps a
visible outline via `:focus-visible` only (deviation 17).

### 4.7 Change-marker tokens

The item bullets are config-driven: `page.markers` in the config file is
written into the token layer by the build step, exactly like the
note-button glyphs (§4.6). `default` is the plain bullet every item shows
when nothing changed in the newest release; `new` / `moved` / `updated`
are the release-change markers of §6.6.

| Token              | Default | Use                                        |
| ------------------ | ------- | ------------------------------------------ |
| `--marker-default` | `❖`     | plain item bullet (no release change)      |
| `--marker-new`     | `🆕`    | bullet for items new in the newest release |
| `--marker-moved`   | `🔄`    | bullet for items moved to a new group      |
| `--marker-updated` | `🆙`    | bullet for items updated in place          |

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
narrow viewports so the line never overflows (deviation 8). Main title
uses the display typeface at 2.25–6 rem, tight leading, negative top
margin 5 px, bottom margin 1 rem.

### 5.3 Search widget

Sticky at viewport top. White background, 2 px solid black border,
horizontal padding 0.5 rem, flex row with 0.5 rem gap, heights per
section 4.3. Children: search icon (emoji), text input (flex-grow, full
height, transparent background, no border, no focus outline, uppercase),
clear control (`×`, 1.875 rem, hidden by default, red on hover),
text-size toggle (`Aa`, see §7.4 and deviation 9).

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
- Content grid: single column on narrow; 3 equal columns wide+. Grid
  borders: 2 px solid black on left, right, bottom — except sections
  with a footnote banner, where the grid drops its bottom border and the
  banner supplies it (continuous box, horizontal seam between grid and
  banner).
- Columns:
  - Narrow: stacked. Separators: 1 px dashed bottom line on all but the
    last column, plus a 1 px light top line on columns 2 and 3. Each
    column shows its role as a mobile label (colored badge with icon)
    above the list content.
  - Wide+: side by side. Separators: 1 px dashed right line on all but
    the last column. Mobile labels hidden; the legend above the grid
    carries the role names.
  - Each column's background carries its role tint (§4.1) at every width.
- Item list: no list markers; each item prefixed by a default bullet
  (`page.markers.default`, the ❖ U+2756 text glyph unless overridden)
  centered in a slot at the left edge — the slot (`--size-bullet-slot`)
  equals the item's text gutter, so the text column aligns at one x
  position no matter how wide the glyph is; items 0.85 rem, line-height
  1.2, 0.25 rem bottom margin. The gutter and slot scale with the text
  scale (the one scaled spacing, deviation 9), so the marker glyph never
  overlaps the item text at 150 %. Newest-release items replace the
  bullet with their change marker emoji (§6.6): a `data-change`
  attribute on the `li` swaps the `::before` content via CSS, so the
  item text node stays plain and search behavior is unchanged
  (deviation 3). Every bullet also shows a hover tooltip via an empty
  `aria-hidden` `span.item-bullet` hotspot that covers the whole bullet
  slot (§6.7).
- Item structure: primary text plus optional parenthesized portion note.
  All notes are inline plain text; there is no small-print styling
  (deviation 3).
- Note affordance: an item may carry a reasoning note (why the item is in
  its column, a source link, a caveat). It renders as a bare-emoji inline
  button with a popover: hover or focus shows the note, a click pins it
  open, and clicking anywhere outside closes it (§4.6, §7.5).
- Sub-groups: uppercase bold small heading; separated from the preceding
  block by margin only (0.75 rem top margin). No separator line at any
  width or search state (deviation 11).
- Footnote banner: white background, 2 px solid black border (top edge
  open), centered bold text, warning icon, small shadow. VIKTIG and TIPS
  notes use the warning emoji; the MARINADER note has no icon.

### 5.7 Empty placeholder columns

Four sections reserve empty columns to keep the 3-column rhythm: Nøtter
og frø column 2, Kjøtt, egg, fisk columns 2 and 3, Pålegg column 2, and
Krydder og urter column 2 — all rendered wide+ only.

An empty column carries the role of its position (BEGRENSE or UNNGÅ,
§6.2) and receives that role's tint, so the color rhythm of the section
stays complete. It participates in the grid, carries no mobile label, and
is excluded from filtering. A `data-placeholder` attribute marks it for
the wide-only rendering rule.

### 5.8 Footer

Top border 2 px solid black, centered, small text, three lines with equal
0.5 rem gaps. Line 1: bold gray disclaimer. Line 2: "FODMAP v<version> //
Kilder:" followed by two external source links (underlined, red on hover,
open in a new tab): Norsk Helseinformatikk (NHI.no) and NKFM – Lav
FODMAP-mat ved IBS; the version text follows the `VERSION` file. Line 3:
gray credit line "Utviklet av Arnulf Heimsbakk // Kildekode på
github.com/aheimsbakk/fodmap // Lisens MIT" where the repository name is
a link to `https://github.com/aheimsbakk/fodmap/` (open in a new tab).
Only the disclaimer line is bold; the source and credit lines are regular
weight (deviations 6 and 10).

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

Derived item state (build-time, from the merge, §6.3):
└─ change                  (optional marker: "new" / "moved" / "updated",
                             or absent — how the item changed in the newest
                             release, if its file is present there; §6.6)
└─ changedFrom             (previous group id; set on moved items only,
                             the "from" side of the move, §6.6)
└─ releaseDate             (folder name of the item's newest file — the
                             release that last touched the item; feeds
                             the bullet tooltip date, §6.7)

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
   ones, separated by a blank line; notes are append-only.
6. The `change` marker is derived for items whose file is present in the
   newest release folder (§6.6); it never comes from the data files.

### 6.4 Column layout derivation

A section renders one column per config group, in the config array order.
A column holds its bare items first, then its sub-group blocks sorted by
resolved title, each with its items sorted by name (config collation). A
section with no item for a group renders that group's column as an empty
placeholder (§5.7).

### 6.5 Section inventory (parity reference)

Counts are item totals per column (main list + sub-groups), and sub-group
count per column. These are frozen parity assertions, verified against the
merged data and the generated page (§13).

| #   | Section                              | Icon        | Columns (SPIS / BEGRENSE / UNNGÅ)          | Footnotes |
| --- | ------------------------------------ | ----------- | ------------------------------------------ | --------- |
| 1   | Brød, ris og pasta                   | wheat       | 25 / 5 / 25                                | VIKTIG    |
| 2   | Grønnsaker og belgfrukter            | carrot      | 48+5 sub (1) / 9+4 sub (1) / 17+11 sub (1) | —         |
| 3   | Frukt, tørket frukt og bær           | apple       | 21+2 sub (1) / 12 / 18+12 sub (1)          | —         |
| 4   | Melk, meieriprodukter & alternativer | cow         | 0+24 sub (3) / 4 / 0+14 sub (3)            | —         |
| 5   | Nøtter og frø                        | seedling    | 12 / 1 / 5                                 | —         |
| 6   | Drikke                               | mug         | 16 / 5 / 12                                | —         |
| 7   | Kjøtt, egg, fisk                     | drumstick   | 9 / empty / empty                          | MARINADER |
| 8   | Pålegg                               | bread slice | 0+33 sub (6) / 2 / 11                      | —         |
| 9   | Sukker, søtning og annet             | cubes       | 10+16 sub (2) / 4 / 10+17 sub (2)          | TIPS      |
| 10  | Krydder og urter                     | pepper      | 0+37 sub (2) / empty / 10                  | TIPS      |
| 11  | Smakstilsetning, saus, dressing      | droplet     | 28 / 7 / 9                                 | —         |

The "bare+sub (N)" notation reads "x items without a subgroup, y items
inside the N sub-group headings shown". Counts include the 2025-05
release, merged oldest → newest (§6.3): 29 items added, 31 moved to a
new group, 3 removed (`visible: false`), and 1 updated in place.

Total item count: 510 (excluding sub-group headings, mobile labels, and
empty placeholder columns).

### 6.6 Change markers (derived)

An item whose file is present in the **newest** release folder carries a
change marker: a config-driven emoji that replaces the item's default
bullet (rendering in §5.6, tokens in §4.7, config in the `data/config.json`
`page.markers` block; the block also sets the default bullet itself).
Items absent from the newest folder — including a change made in an
earlier delta that the newest release left alone — are never marked: the
marker answers "what did the latest release change?", not "what changed
over all of history".

Classification compares the item's state after the second-to-last release
with its state after the newest release:

| Marker    | Meaning                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `new`     | the item's file does not exist in any earlier release                                                       |
| `moved`   | the item's merged `group` differs from the one it had before the newest release                             |
| `updated` | no group change, but another field differs (`name`, `amount`, `subgroup`, `visible`, `note`, `attribution`) |
| absent    | the item's file is not in the newest release, or the newest file changes nothing                            |

Only one marker applies per item; the priority is `new` > `moved` >
`updated`. The marker is build-time derived state (rule 6 above) and
lives on the item object, never in the data files. A data tree with a
single release folder (a baseline with no delta) has no earlier state to
compare against, so it renders **no** markers: there is nothing for the
"newest release" to have changed relative to.

The 2025-05 release yields 29 `new`, 31 `moved`, and 1 `updated` marker
on the rendered page; the content tests assert these counts (§13).

For `moved` items the merge also records `changedFrom` — the group id the
item had before the newest release — which feeds the bullet tooltip
(§6.7).

### 6.7 Bullet tooltips (derived)

Every item bullet shows a hover tooltip whose text is config-driven, not
hardcoded: the templates live in `page.tooltips` in the config file
(keys `default`, `new`, `moved`, `updated` — the same set as the
markers, §4.7), and the build fills the placeholders from data:

| Placeholder | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `{{date}}`  | the folder name of the release that last touched the item — the one holding its newest file (`YYYY` / `YYYY-MM` / `YYYY-MM-DD`); for marked items this is always the newest release (§6.6) |
| `{{from}}`  | the label of the item's group before the newest release (moved only)                                                                                                                       |
| `{{to}}`    | the label of the item's current group                                                                                                                                                      |

The date answers "when was this item last changed?", not "when is the
catalog from?": an item untouched since the baseline shows the baseline
folder name (2021), while an item merged from the newest release shows
that release's name (2025-05). Marked items are always in the newest
release folder, so their date is the newest release by construction.

The current Norwegian templates are frozen in the config: `default`,
`new`, and `updated` render "Kildedato <release>" (the item's own
last-change date), and `moved` renders "Flyttet fra <label> til <label>,
kildedato <release>". An item with no marker uses the `default`
template; a missing template for a marker kind falls back to the
`default` template; with no `default` template the item renders without
a tooltip.

The tooltip is a native browser title on an empty `span.item-bullet`
hotspot positioned over the bullet glyph — the `::before` bullet cannot
carry a title attribute. The hotspot is `aria-hidden` (the marker emoji
already conveys the change) and is untouched by search: it carries no
searchable text and filtering never re-renders it (§5.6, §7.3).

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
  the Escape key anywhere on the page. All stored originals restored
  exactly.

Clear control activation (button click): empty the query, transition to
IDLE, keep focus on the input. The Escape key clears the same way from
anywhere on the page — with the input focused or not — and moves focus
to the input, so the next keystroke starts a fresh query. Escape with an
empty query moves focus to the input and changes nothing else.

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
  on the button and bolds the matched terms inside the popover (§7.2 rule
  3, deviation 17). It never opens or closes a popover and never touches
  its open/pinned state. Every interactive affordance is inert without
  scripts.

## 8. Data Flow

```
# Build time (developer)
config + release folders ──> merge oldest→newest (inherit, clear, remove,
      prepend, derive change markers) ──> render index.html + tokens.css +
      roles.css ──> static site

# Runtime (browser)
input change ──> debounce 300 ms ──> normalize (lowercase + trim)
      ──> match items (article + note) + headings (category and sub-group)
      ──> derive visibility plan
      ──> apply plan (hide/show + highlight) ──> toggle clear control

clear control or Escape (anywhere) ──> empty input ──> restore originals
      ──> IDLE; Escape also moves focus to the input

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

A single document (`src/index.html`). It must:

- Declare Norwegian language, UTF-8, and the responsive viewport meta.
- Render the full page content with scripts disabled (search and the
  text-size toggle degrade to inert; all content and layout must be
  intact).
- Load the stylesheet set — tokens, base, layout, components, roles,
  utilities — and the module scripts (search, text-scale, note-popover,
  and the installability module that registers the cache-free service
  worker, §9.6) at the end of the body.
- Declare the search input with `autocomplete="off"` (boot always clears
  it, see §7.1).
- Declare the favicon: a vector icon carrying the 🥗 emoji glyph scaled to
  fill the icon canvas (system-rendered, like the icon set of §9.2), plus
  a fixed 32 px raster fallback for browsers without vector-favicon
  support.
- Declare the installability metadata: the manifest link, the theme color,
  and the 180 px apple-touch icon (§9.6).
- Require no network at all: no remote assets (fonts are the platform's
  native system stack).
- Be generated, not hand-edited: the document is a build artifact; the
  content authority is the data (§6.1).

### 9.2 Icon set

Emoji glyphs from the system font replace a runtime icon library
(deviation 2). No icon library is loaded.

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

### 9.6 Installability (PWA)

The page is installable on desktop and mobile without becoming an
application platform: it adds an install manifest and a service worker,
and nothing else. There is no caching, no offline behavior, no push, and
no app shell — the runtime stays exactly the static, dependency-free
document of the rest of this spec.

- **Manifest** (static asset beside the document): name and short name,
  Norwegian description, `start_url` and `scope` relative to the document
  (so the app works both at a site root and under a project subpath),
  `display: standalone`, background color equal to the page background,
  theme color equal to the masthead accent red. The icon list holds the
  192 px and 512 px raster icons.
- **Icons**: raster renderings of the favicon glyph (the same filled-canvas
  🥗 rendering as §9.1) at 192 px and 512 px for the manifest, plus a
  180 px apple-touch icon for iOS home screens. All three have an opaque
  white background (the page background), so no platform applies its own
  background. They are produced once at development time from the vector
  favicon; the build step never generates them.
- **Service worker**: registered with no caching behavior. Install and
  activate pass through, and the fetch listener never intercepts a
  request — every request goes to the network exactly as without the
  worker. The worker exists only to satisfy the installability criteria of
  browsers that require a fetch handler; it must never grow a cache or an
  offline strategy. The page keeps working unchanged if the worker fails
  to register or never installs.
- **Registration**: a module script at the end of the body registers the
  worker relative to the document, guarded by support (`serviceWorker` in
  navigator) and by secure context, so plain-HTTP hosts and browsers
  without support skip it silently. A registration failure never surfaces
  to the user: the page remains fully functional without the worker.

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

The canonical spellings below correct known typos in the source material;
the data must use exactly these strings. The reviewed spellings `Nøtte`
(§8), `Banos` (§8), and `Lollosalat` (§2) look like typos but are
intentional and must stay unchanged.

| Location    | Canonical spelling                                                 |
| ----------- | ------------------------------------------------------------------ |
| Masthead    | Vanlige matvarer                                                   |
| §2 SPIS     | Sopp: hermetisk sjampinjong, østers                                |
| §2 SPIS     | Purre – kun det grønne                                             |
| §2 SPIS     | Rødbeter, syltede                                                  |
| §2 BEGRENSE | Squash (0,75 dl)                                                   |
| §3 SPIS     | Banan i biter (15 stk)                                             |
| §3 BEGRENSE | Avokado (1/8 av en hel)                                            |
| §3 SPIS     | Blåbær, amerikanske og hvite inni                                  |
| §3 SPIS     | Tranebær                                                           |
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

The 2025-05 release moved both `Blåbær, amerikanske og hvite inni`
(formerly BEGRENSE, `40 gram`) and `Tranebær` (formerly BEGRENSE, `1 ss`)
to SPIS and cleared their portion notes, so the two §3 rows above no
longer carry an amount.

### 12.2 Design decisions and behavior notes

The normative rules for each decision live in the sections cited; these
notes record the decision and its rationale.

1. Semantics: stylesheet classes are semantic and hand-written; no utility
   class framework is used (§4–§11).
2. Icons: emoji glyphs from the system font replace an icon library
   (§9.2). Emoji are system-rendered and vary per platform — the same
   variability already accepted for the masthead's emoji.
3. Item small-print notes are plain parenthesized text inside the item
   text; no separate small-print styling, in any state (§5.6).
4. The clear control is a button with an explicit `type="button"` (§5.3).
5. Typography uses the platform's native system font stack — no
   third-party fonts (§4.2). Condensed heading faces are approximated by
   bold weight plus the existing uppercase and letter-spacing rules; the
   narrow display face of the original masthead is not reproducible, so
   the masthead title renders wider — the same platform-variability
   trade-off as deviation 2.
6. The footer source line reads "FODMAP v<version> // Kilder:" with two
   links (NHI.no and NKFM – Lav FODMAP-mat ved IBS); the version text
   must track the `VERSION` file (§5.8).
7. The Smakstilsetning, saus, dressing heading color is a sauce-red
   terracotta (`#d97744` / `217, 119, 68`), chosen for its content
   association (tomato-based sauces) and its distance from the pink/red
   family used by Frukt, Kjøtt, and Sukker. Heading background only
   (§4.1).
8. The masthead sub-title never wraps; narrow-viewport size steps keep
   the single line fitting at every width down to 320 px (§4.3).
9. A text-size toggle cycles the content text through 100 % / 125 % /
   150 %. Scaling applies to the content font-size tokens only
   (`calc` on `--text-scale`); masthead titles, spacing, borders, widget
   height, and sticky offsets stay fixed. One spacing exception: the
   item's left text gutter and its bullet slot (`--size-bullet-slot`)
   scale too, so the marker glyph cannot overlap the item text at
   150 % (§5.6). Items declare `overflow-wrap: anywhere` so unbreakable
   tokens ("Maltodextrin/maltose/maltekstrakt") wrap instead of pushing
   the column track wider at 150 %. The level persists in local storage
   (key `fodmap-text-scale`, §10) and degrades to session-only on
   failure; the toggle lives in its own module and state machine, outside
   the search engine (§4.3, §5.3, §7.4).
10. The footer includes a credit line with the repository name linked to
    the GitHub repository (new tab); three lines, equal 0.5 rem gaps, no
    separator, only the disclaimer bold (§5.8).
11. Sub-group headings have no separator line: under a FILTERED search a
    visible heading can sit below hidden items, so a line above it would
    float detached. Separation is margin-only (0.75 rem top margin), at
    every width and in both search states; the `--color-subgroup-line`
    token is gone (§5.6).
12. Every category has its own heading color set; Nøtter og frø (walnut
    brown `#a9744f` / `169, 116, 79`) and Pålegg (beige `#d1bfae` /
    `209, 191, 174`) were split from the Brød set they initially shared.
    Heading background only (§4.1).
13. Column tints are role-based so the column ↔ role correspondence
    matches the legend and the mobile labels at a glance; category colors
    apply to the heading background only. Empty placeholder columns carry
    the role of their position and get the corresponding tint, keeping
    the section's color rhythm complete (§4.1, §5.7).
14. Narrow viewports hide columns left without visible content by a
    search; wide+ keeps the tinted cells for the 3-column rhythm. A
    mobile-scoped utility class (`.col-empty-mobile`, below 768 px only),
    toggled from a per-column matcher flag, drives the collapse; every
    re-render recomputes the flag, so a column returns as soon as it
    matches again (§5.6, §7.2 rule 5).
15. Items may carry a reasoning note (why the item is in its column, a
    source link, a caveat), stored in the item's data body (§6.2) and
    rendered as an inline info button + popover (§4.6, §5.6, §7.5).
    Search indexes the note text; a note-only match reveals the item and
    flips the button glyph to the matched state instead of highlighting
    item text (§7.2 rule 3).
16. The page is generated from data at build time: the document, the
    color token layer, and the role/section CSS are build artifacts; the
    base, layout, and component CSS layers and the three script modules
    stay hand-authored. The generated artifacts are written into the site
    directory and committed, so the deployed site needs no build step;
    the hand-authored document is retired (§8, §14).
17. The note info button is a bare emoji glyph: no box, border, or corner
    radius — the resting border, the hover outline, and the round hit-box
    were read as red rings around the icon; keyboard focus keeps a
    visible outline via `:focus-visible` only (§4.6). Its glyph size
    equals the item marker size, and both scale with the text scale like
    the other content text (deviation 9), so the default bullet, the
    change markers, and the note glyph stay identical at every level. A
    search that
    matches the reasoning note bolds the matched terms inside the
    popover, restoring the plain text on IDLE; the matched glyph and the
    popover's open/pinned state are untouched (§7.5).
18. Newest-release items replace the default bullet with a change-marker
    emoji — 🆕 new, 🔄 moved, 🆙 updated in place (§4.7, §6.6). A change
    in an earlier delta is history, not a marker; the 2025-05 release
    marks 29 new, 31 moved, and 1 updated item (§6.5).
19. Item bullets carry a hover tooltip: a native browser title on an
    empty `aria-hidden` `span.item-bullet` hotspot, built from the
    config-driven `page.tooltips` templates — the release date that last
    touched the item, with the from→to group labels for moved items.
    Native titles keep the page dependency-free and script-free; the
    strings are editable in `config.json`, like the marker glyphs
    (§6.7).
20. The page is installable as a PWA without any caching: a manifest and a
    cache-free service worker satisfy installability, and every request
    still goes to the network. No offline behavior, no app shell, no
    storage beyond the existing text-scale local-storage key (§9.6).
    Requested 2026-08-05 (user: "do not make a cache system").

### 12.3 Negative contracts

- No layout change between viewport widths beyond the documented rules.
- No scroll-jacking; sticky positioning only for the search widget and
  category headings.
- No content reordering across breakpoints (narrow stacking is the same
  order as the wide columns, left to right).
- No runtime template evaluation: the browser receives plain files only;
  the build runs before deploy, never in the page.

## 13. Verification

The automated suites run with `npm test` (Node's built-in `node --test`).
The table lists the contract each test file guards; the concrete cases
live in `CODEBASE.md` §5.4 and in the test files themselves.

| Test file                  | Contract level                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/search.test.js`     | search engine (§7.1–§7.3, §7.5): normalization, matching (article + note), highlighting, visibility transitions, narrow empty-column collapse, note-button matched state, clear/Escape, debounce, scroll blur                                                                                                                       |
| `tests/text-scale.test.js` | text-size toggle (§7.4): cycle, attribute application, persistence and fallbacks, independence from search                                                                                                                                                                                                                          |
| `tests/content.test.js`    | content inventory (§6.5, §12.1): 11 sections in order, per-column counts (total 510), canonical spellings verbatim                                                                                                                                                                                                                  |
| `tests/build.test.js`      | build pipeline (§6, §14): generated inventory, change-marker counts (29 new, 31 moved, 1 updated), stylesheet/script references, installability metadata (§9.6: manifest link, theme color, apple-touch icon, worker registration, manifest icons and their raster dimensions), note-button contract (§4.6), bullet tooltips (§6.7) |
| `tests/merge.test.js`      | release merge and markers (§6.3, §6.6, §6.7): release ordering, inheritance and clears, `visible`, note prepend, marker classification, `changedFrom`, `releaseDate`                                                                                                                                                                |
| `tests/styles.test.js`     | stylesheet contracts (§4.1, §4.3, §5.6, §7.4): sub-title one-line rule and narrow steps, text-scale tokens, no sub-group separators, role-tint ownership, empty-column collapse scoping, marker tokens                                                                                                                              |

Full-browser verification runs with Playwright (available in this
environment): render `src/index.html` at 375 / 768 / 1024 / 1280 px and
verify the responsive contract (masthead, sticky offsets, grid columns,
mobile labels vs legend, banner seams, footer); run live search flows
(typing, highlighting, clear, section hiding, scroll blur) and verify the
resulting document state, including the narrow empty-column collapse at
375 px.

## 14. Stylesheet Architecture

The stylesheet layer structure (physical files mapped in `CODEBASE.md`):

1. Tokens: color palette, typography, sizes, z-order, shadows, breakpoints,
   plus the change-marker glyphs (§4.7). Color values and marker glyphs are
   generated from the config file at build time; the static tokens
   (typography, sizes, z-order, effects) stay hand-authored.
2. Roles: per-group and per-section color rules, generated from the config
   arrays so the page supports an arbitrary number of groups and sections.
3. Base: reset, body typography, list normalization, and the item bullet —
   the configurable default (from `page.markers`, §4.7) plus the
   `data-change` marker swap (§4.7, §6.6).
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
