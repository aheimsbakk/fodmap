# FODMAP Data Format

> Defines the file format that stores the FODMAP content: sections, groups,
> subgroup headings, items, portion amounts, notes, and release history.
> This document is the specification. It is deliberately independent of any
> renderer: the format is a proposal and is not yet implemented in the app.

## 1. System goals

The content of the FODMAP page must be:

- **Editable by humans.** A single update once a year should take minutes,
  not a refactor.
- **Versioned.** Every release keeps its history. Older releases are never
  rewritten.
- **Delta-driven.** Later releases store only what changed.
- **Language-portable.** UTF-8 keys and values everywhere, so the format
  can be reused for other languages.
- **Configurable.** Every name (section, group, subgroup) is a key → value
  pair in one global config. The data files reference keys, not display
  text.

## 2. Directory structure

```
data/
├── config.json                  # global configuration (section/group/subgroup names)
├── 2021/                        # first release: the full baseline
│   ├── sukker/                  # section key from config.json
│   │   ├── erytritol.md         # item: slug (filename) is the stable id
│   │   └── …
│   └── …                        # all sections
└── 2025-01-01/                  # later releases: deltas only
    └── sukker/
        └── erytritol.md         # only items that changed, were added, or were hidden
```

Rules:

- Release folders sort by date (§8). The **oldest folder is the full
  baseline**; every item appears there exactly once.
- **Later folders hold deltas only**: changed/updated items, newly added
  items, and items set to `visible: false`. Unchanged items do not appear
  in delta folders.
- Section folders are named after the **section key** in `config.json`
  (UTF-8 allowed, §5).
- The **filename (slug) is the item's permanent id** (§4.3). It never
  changes, even when the display name changes.
- Item files for the current state are built by merging oldest → newest
  (§7).

## 3. config.json

One global file. Ids/keys are free-form (lowercase recommended), values
UTF-8. Full reference in `config-format.md` (technical) and
`config-guide.md` (user). Config covers both the page text (head,
search, banners, footer) and the named collections:

| Field            | Type   | Meaning                                                       |
| ---------------- | ------ | ------------------------------------------------------------- |
| `schema`         | number | format version (§9); `1` for the first release                |
| `collation`      | string | locale for alphabetical sorting, e.g. `"no-NO"`               |
| `page`           | object | page-level text: head, search, banner, colors, footer         |
| `sections`       | array  | ordered sections; each entry has `id` (the folder name)       |
| `groups`         | array  | ordered groups; each entry has `id`, `label`, `emoji`, colors |
| `subgroups`      | object | subgroup key → display title                                  |
| `footnote-types` | object | footnote key → emoji or null                                  |

Sections and groups are **arrays with explicit `id`s** so their order
(page order, column order) is part of the data and survives any parser.
The number of sections and the number of groups are both arbitrary — the
maintainer defines the ids and the array length. Subgroups and footnote
types are keyed objects (lookup only, order irrelevant).

### 3.1 Sections

A section is a top-level category on the page. **Sections are arbitrary**:
the maintainer defines the `id` and may add, remove, or reorder any
number of them. Its `id` is the folder name for that section. Each entry:

| Field              | Type   | Meaning                                                       |
| ------------------ | ------ | ------------------------------------------------------------- |
| `id`               | string | unique section key; folder name                               |
| `title`            | string | displayed heading text (Norwegian, verbatim)                  |
| `emoji`            | string | emoji glyph                                                   |
| `background-color` | string | heading background color (optional)                           |
| `footnote`         | object | `{ "type": <footnote-types key>, "text": string }` (optional) |

Empty placeholder columns are not declared here; a section folder with
no item for a group renders that group's column as a placeholder.

### 3.2 Groups

A group is the column an item sits in (for example SPIS / BEGRENSE /
UNNGÅ). **Groups are arbitrary**: the maintainer defines the `id` and
may add or remove any number of them. There is no fixed count; array
position is the left-to-right column order. Each entry has `id`,
`label` (badge text), `emoji`, and the optional colors
`background-color` (label background), `text-color` (label text / border
ink), and `column-color` (column tint).

### 3.3 Subgroups

A subgroup is a heading inside a column that groups items. The key is
referenced from item frontmatter; the value is the displayed title,
shown verbatim (a trailing colon, where present, is part of the value).
Order is alphabetical by title, not by object order.

### 3.4 Footnote types

Footnote banners can carry an icon. The icon may be `null` (some notes
have no icon). Keyed by section `footnote.type`.

### 3.5 Example (abbreviated)

```json
{
  "schema": 1,
  "collation": "no-NO",
  "sections": [
    {
      "id": "sukker",
      "title": "Sukker, søtning og annet",
      "emoji": "🧊",
      "background-color": "#e6c8c8",
      "footnote": {
        "type": "tips",
        "text": "TIPS: Matvarer merket \"naturlig lett\" og \"naturlig søtet\" inneholder ofte fruktose/fruktkonsentrat."
      }
    },
    {
      "id": "kjøtt",
      "title": "Kjøtt, egg, fisk",
      "emoji": "🍗",
      "background-color": "#e08c8c",
      "footnote": {
        "type": "plain",
        "text": "MARINADER, PANERING OG FERDIGMAT: Sjekk ALLTID for løk og hvitløk!"
      }
    }
  ],
  "groups": [
    {
      "id": "spis",
      "label": "SPIS",
      "emoji": "👍",
      "background-color": "#a0c49d",
      "text-color": "#1e3a1e",
      "column-color": "rgba(160, 196, 157, 0.2)"
    },
    {
      "id": "begrens",
      "label": "BEGRENSE",
      "emoji": "⚖️",
      "background-color": "#f7d774",
      "text-color": "#4a3c08",
      "column-color": "rgba(247, 215, 116, 0.25)"
    },
    {
      "id": "unngå",
      "label": "UNNGÅ",
      "emoji": "✋",
      "background-color": "#d15d5d",
      "text-color": "#ffffff",
      "column-color": "rgba(209, 93, 93, 0.15)"
    }
  ]
}
```

See `config-format.md` for the complete schema including the `page` block.

## 4. Item file

An item is one Markdown file with YAML frontmatter in the field keys
below. The Markdown body holds free-form notes.

### 4.1 Frontmatter fields

| Field         | Required         | Meaning                                       |
| ------------- | ---------------- | --------------------------------------------- |
| `name`        | baseline: yes    | primary text, verbatim                        |
| `group`       | baseline: yes    | group key from `config.json`                  |
| `amount`      | no               | portion note; rendered as `name (amount)`     |
| `subgroup`    | no               | subgroup key from `config.json`               |
| `visible`     | no, default true | `false` hides the item from search and tables |
| `attribution` | no               | source URL for the item's data                |

In the baseline, `name` and `group` are required. In a delta file any
field may be omitted — omitted fields are inherited (§7.2).

### 4.2 Body

The Markdown body is a rendered note for the item: reasoning, source
links, caveats. Notes accumulate across releases; newer notes are
**prepended** above older ones (§7.3).

### 4.3 Naming and identity

- **Slug = id.** The filename is the permanent identity of the item. A
  `name` change never renames the file.
- Slugs are unique **per section** (folder). The same slug may exist in
  different section folders (e.g. "Reker" in Kjøtt and Pålegg).

### 4.4 Example

```markdown
---
name: Erytritol (Sukrin) (E 968)
group: unngå
subgroup: søtstoff-polyoler
visible: true
attribution: https://example.com/fodmap-2021.pdf
---

Kan tolereres av noen i små mengder – verifiser forskningsgrunnlaget (2020).
```

## 5. Encoding

- All files are UTF-8. Keys and values may contain any Unicode character.
- Key conventions: lowercase (`unngå`, `søtstoff-polyoler`) is recommended
  but not enforced. Keys are case-sensitive.
- The Norwegian content text (names, titles) must match the canonical
  content in `BLUEPRINT.md` §12.1 verbatim.

## 6. Column layout

A section renders one column per group, in the array order of
`config.groups`. A
column is one **bare block** (items with no `subgroup`), if any, followed
by its **subgroup blocks** sorted alphabetically by **resolved title**
(value in `config.subgroups`), each subgroup's items also sorted
alphabetically. Items sort by `name`, using `config.collation`. Section
display order is the array order of `config.sections`; `empty` columns
render as placeholders.

## 7. Merge semantics

The current page state is derived by merging release folders **oldest →
newest**.

1. Start from the baseline. Apply each newer folder in date order.
2. An item is identified by slug within its section folder. A file in a
   newer folder with the same slug as an older file _is_ that item.
3. A newer file is merged onto the older state.
4. An item that appears in no newer folder keeps its older state.

### 7.1 Merge rules (per item)

| Newer file            | Result                                   |
| --------------------- | ---------------------------------------- |
| `group: begrens` only | group changes, everything else inherited |
| `amount:` empty       | amount cleared (explicit empty = clear)  |
| `visible: false`      | item hidden from search and tables       |
| `visible: true`       | item restored                            |
| absent field          | field inherited unchanged                |

### 7.2 Explicit empty vs absent

- **Absent** field → inherit the older value.
- **Empty** value (`amount:`, `attribution:`) → deliberate clear.

### 7.3 Body accumulation

The body is **prepended**: the newest note goes on top, older notes
remain below. Notes are append-only; editing history is forbidden.

## 8. Release folders and sorting

| Format       | Example      |
| ------------ | ------------ |
| `YYYY`       | `2021`       |
| `YYYY-MM`    | `2025-01`    |
| `YYYY-MM-DD` | `2025-01-01` |

Sort order: **`YYYY` → `YYYY-MM` → `YYYY-MM-DD`**, chronologically, so
`2025-01` sorts _before_ `2025-01-01`. Merge order is the sorted order.

## 9. Versioning

- `schema: 1` is the first release of the format — even while it is still
  being worked on.
- Incompatible changes bump the schema version. Migration of old trees is
  a separate concern, decided at a later date.

## 10. Out of scope

This document defines the **data and config format only**. Deliberately
not specified here:

- The renderer that turns the merged data into the page.
- Validation and tests for the data.
- The "what changed this year" report generation.
- Migration tooling for old release trees.

Page-level text (head, search, banners, footer) and its colors are now
covered by `data/config.json` (§3).
