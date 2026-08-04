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

| Part            | Holds                                          | Used by                    |
| --------------- | ---------------------------------------------- | -------------------------- |
| `schema`        | the format version                             | readers of the file        |
| `collation`     | the sorting language                           | alphabetical order         |
| `page`          | page title, masthead, search, banner, footer   | the page shell             |
| `sections`      | the 11 categories                              | section headings and icons |
| `groups`        | the three role columns (SPIS, BEGRENSE, UNNGÅ) | role labels, icons, tints  |
| `subgroups`     | group headings inside columns                  | headings like "Ost:"       |
| `footnoteTypes` | footnote styles (with or without icon)         | section footnotes          |

## 2. The golden rule: change values, never ids or keys

An **id** (in `sections` and `groups`) or **key** (in `subgroups` and
`footnoteTypes`) is a stable code. The `value` is the text people see,
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

## 3. Page text (`page`)

Change the masthead, search, banner, or footer by editing the `page`
block. All values here are display text.

- `title` — the browser tab title.
- `masthead` — the emojis, the tagline (`subtitle`), and the big title.
- `search` — the magnifier `icon`, the `placeholder` text, the `clear`
  glyph, and the `scale` label.
- `infoBanner` — the info icon and the BEGRENSE explanation text.
- `footer` — the disclaimer sentence, the source links (`sources`), and
  the credit line (`credit`).

The column legend is not configured here — it is built from the `groups`
entries automatically (their `label` and `icon`).

## 4. Common tasks

### 4.1 Change a section heading

Edit the `title` value of that section entry.

### 4.2 Change a section icon

Edit the `icon` value of that section entry (an emoji).

### 4.3 Add a section

Add a new entry **to the end of the `sections` array**. The `id` must be
unique and will become the folder name for that section's items.

```json
{ "id": "supermat", "title": "Supermat", "icon": "✨", "color": "#c4c4c4" }
```

### 4.4 Reorder the sections

Move the entry in the `sections` array to its new position. Top-to-bottom
page order follows array position.

### 4.5 Change a group label, icon, or tint

Edit the `label`, `icon`, or `tint` value of that group entry. The array
position controls the left-to-right column order — do not move the entries
unless you really want to reorder the three columns.

```json
{
  "id": "spis",
  "label": "SPIS",
  "icon": "👍",
  "tint": "rgba(160, 196, 157, 0.2)"
}
```

### 4.6 Add a subgroup

Add a key → title pair to `subgroups`:

```json
{ "subgroups": { "fro": "Frø:" } }
```

Items then reference the key (`subgroup: fro`). Subgroups display in
alphabetical order by title, so key order does not matter here.

### 4.7 Manage footnotes

- **Add a footnote type** to `footnoteTypes` if you need a new style
  (with or without an icon).
- **Attach a footnote to a section** with the `footnote` object:

```json
"footnote": { "type": "viktig", "text": "VIKTIG: Sjekk alltid etiketten." }
```

The `type` must match a key in `footnoteTypes`.

### 4.8 Set empty columns

Some sections reserve empty columns to keep the three-column rhythm. List
the group ids in `empty`:

```json
{ "id": "kjott", "empty": ["begrens", "unnga"] }
```

### 4.9 Change the sorting language

`collation` is a language code used for alphabetical sorting, for example
`no-NO` (Norwegian: `æ`, `ø`, `å` come after `z`). Change it only when you
know the sorting must follow another language.

### 4.10 Change an explanatory footer text

Edit `page.footer.disclaimer` (the bold line) or `page.footer.credit` (the
credit line). Keep the URL values correct.

## 5. Before you save

Config and data must agree. Check that:

- every section folder and every item `group`, `subgroup`, and
  `footnote.type` points to an id or key that exists in `config.json`;
- no two `sections` ids are the same, and no two `groups` ids are the same;
- the `empty` lists use real group ids;
- the file is valid JSON.

## 6. Rules of thumb

- **Change values, never ids or keys.**
- **Ids and keys are case-sensitive.** Lowercase is recommended for
  consistency, but once an id or key exists, keep its casing unchanged.
- **UTF-8 is fine.** Norwegian letters, emoji, and other scripts all work.
- **Section and group array order is meaningful**; subgroup and footnote
  type order is not.
- **Footnotes reference `footnoteTypes`.** A `footnote.type` with no
  matching type is a break.

## 7. Related documentation

- `data-format.md` — the item data format.
- `config-format.md` — the full technical reference for `config.json`.
- `data-lifecycle.md` — the yearly release workflow (items).
