# FODMAP Config Guide — editing config.json

> User documentation for the maintainer of the FODMAP data. Explains how to
> edit `data/config.json`: change page text, add sections and subgroups,
> manage footnotes, and set sorting. The technical reference is
> `config-format.md`.

## 1. What config.json does

A page has about 500 food items. Name the category "Brød, ris og pasta"
once in `config.json`, and every item in that section uses it. The config
holds the **names** of things and the **page text**. The item files hold
the **items**.

The file lives at `data/config.json`, next to the release folders.

Config.json has seven parts:

| Part             | Holds                                         | Used by                     |
| ---------------- | --------------------------------------------- | --------------------------- |
| `schema`         | the format version                            | readers of the file         |
| `collation`      | the sorting language                          | alphabetical order          |
| `page`           | head, search, banner, colors, footer          | the page shell              |
| `sections`       | the 11 categories                             | section headings and icons  |
| `groups`         | the role columns (e.g. SPIS, BEGRENSE, UNNGÅ) | role labels, emojis, colors |
| `subgroups`      | group headings inside columns                 | headings like "Ost"         |
| `footnote-types` | footnote styles (with or without icon)        | section footnotes           |

## 2. The golden rule: change values, never ids or keys

An **id** (in `sections` and `groups`) or **key** (in `subgroups` and
`footnote-types`) is a stable code. The `value` is the text people see,
such as `Sukker, søtning og annet`.

- **To rename something: change the value.** One place updates the whole
  page.
- **Never rename an id or key** after data references it. Item files and
  section folders point at ids; renaming an id breaks every item that uses
  it.

Example. You want the section shown as "Sukker og søtning":

```json
{ "id": "sukker", "title": "Sukker og søtning" }
```

Correct: `title` (the value) changed. Wrong: renaming `sukker` to
`soetning`.

### Sections and groups are arrays

In the file, `sections` and `groups` are arrays, not objects. Each entry
carries its own `id`. The **position in the array is the display order**
— for sections, top to bottom; for groups, left to right.

**The number of sections and groups is up to you.** There is no fixed
set. You decide the ids and how many there are (see §4.3 for sections
and §4.5 for groups). An id is the code the data folder and item files
point at, so choose it once and keep it stable.

## 3. Page text (`page`)

Change the head, search, banner, colors, or footer by editing the
`page` block. The browser-tab title is **not stored** — it is built from
`head.subtitle` + " " + `head.title`.

- `head` — the emojis, the tagline (`subtitle`), the big title, and
  their colors (`title-color`, `subtitle-color`, `outline-color`).
- `search` — the magnifier `emoji`, the `placeholder` text, the `clear`
  glyph, the `scale` label, and the `marker` highlight colors.
- `info-banner` — the info emoji, the BEGRENSE explanation text, and
  the `text-color`.
- `colors` — the page-level color tokens: background, text, heading,
  column separators, and halftone decorations.
- `footer` — the footer colors and the text `lines` (below).

The column legend is not configured here — it is built from the `groups`
entries automatically (their `label`, `emoji`, and colors).

## 4. Common tasks

### 4.1 Change a section heading

Edit the `title` value of that section entry.

### 4.2 Change a section emoji

Edit the `emoji` value of that section entry (an emoji).

### 4.3 Add a section

Add a new entry **to the end of the `sections` array**. You can add as
many sections as you need. The `id` must be unique and will become the
folder name for that section's items.

```json
{
  "id": "supermat",
  "title": "Supermat",
  "emoji": "✨",
  "background-color": "#c4c4c4"
}
```

### 4.4 Reorder the sections

Move the entry in the `sections` array to its new position. Top-to-bottom
page order follows array position.

### 4.5 Change a group label, emoji, or color

Edit the `label`, `emoji`, `background-color`, `text-color`, or
`column-color` value of that group entry. The array position controls
the left-to-right column order.

```json
{
  "id": "spis",
  "label": "SPIS",
  "emoji": "👍",
  "background-color": "#a0c49d",
  "text-color": "#1e3a1e",
  "column-color": "rgba(160, 196, 157, 0.2)"
}
```

### 4.5b Add or remove a group

The page is not limited to three groups — you can add as many columns as
you need. To **add a group**, append a new entry to `groups`. The `id`
must be unique and will be referenced by item frontmatter; the position
in the array sets its column order:

```json
{
  "id": "litt",
  "label": "LITT",
  "emoji": "🤏",
  "column-color": "rgba(0, 0, 0, 0.05)"
}
```

To **remove a group**, delete its entry. Remove it from any item
frontmatter that references its `id` first, or those items become
invalid. Adding or removing a group changes the number of columns on the
page; the column legend and the per-column labels follow automatically.

### 4.6 Add a subgroup

Add a key → title pair to `subgroups`:

```json
{ "subgroups": { "frø": "Frø" } }
```

Items then reference the key (`subgroup: frø`). Subgroups display in
alphabetical order by title, so key order does not matter here. Subgroup
titles are shown verbatim; if a heading should end with a colon, the
colon is part of the value.

### 4.7 Manage footnotes

- **Add a footnote type** to `footnote-types` if you need a new style.
  The value is the emoji glyph, or `null` for a note with no icon:

```json
{ "footnote-types": { "info": "ℹ️", "none": null } }
```

- **Attach a footnote to a section** with the `footnote` object:

```json
"footnote": { "type": "viktig", "text": "VIKTIG: Sjekk alltid etiketten." }
```

The `type` must match a key in `footnote-types`.

### 4.8 Empty columns

Empty columns are **not configured in config.json**. A section folder
with no item for a group renders that group's column as an empty
placeholder automatically (see `data-format.md §3.1`). There is nothing
to set here — how many columns a section shows follows from its data.

### 4.9 Change the sorting language

`collation` is a language code used for alphabetical sorting, for example
`no-NO` (Norwegian: `æ`, `ø`, `å` come after `z`). Change it only when you
know the sorting must follow another language.

### 4.10 Change a footer text

The footer text lives in `page.footer.lines`. Each line has a
`separator` and `segments`. A segment is either a plain string or a
`{ "text", "url" }` link. The first line is the bold disclaimer. Edit
the segments to change the text; keep the URL values correct. `{{version}}`
in a segment is replaced with the app version automatically.

## 5. Before you save

Config and data must agree. Check that:

- every section folder and every item `group`, `subgroup`, and
  `footnote.type` points to an id or key that exists in `config.json`;
- no two `sections` ids are the same, and no two `groups` ids are the same;
- the file is valid JSON (no trailing commas — strict JSON parsers reject
  them).

## 6. Rules of thumb

- **Change values, never ids or keys.**
- **Ids and keys are case-sensitive.** Lowercase is recommended for
  consistency, but once an id or key exists, keep its casing unchanged.
- **UTF-8 is fine.** Norwegian letters, emoji, and other scripts all work.
- **Section and group array order is meaningful**; subgroup and footnote
  type order is not.
- **Footnotes reference `footnote-types`.** A `footnote.type` with no
  matching key is a break.
- **Sections and groups are open sets.** Add, remove, or reorder any
  number; the page follows the arrays. When you remove a group, clear
  every item that references its `id`.

## 7. Related documentation

- `data-format.md` — the item data format.
- `config-format.md` — the full technical reference for `config.json`.
- `data-lifecycle.md` — the yearly release workflow (items).
