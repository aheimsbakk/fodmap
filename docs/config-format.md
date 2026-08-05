# FODMAP Config Format — config.json

> Technical specification of the single global configuration file
> `data/config.json`. It defines every configurable name (sections,
> groups, subgroups, footnote types) and the page-level text (head,
> banners, footer). The item data (`data-format.md`) references the
> ids defined here.
>
> **Source of truth.** `data/config.json` is the authoritative format at
> the moment. The field names and structure documented here mirror that
> file.

## 1. Purpose

A page made of ~500 items should not repeat the name of a category in
every item file. `config.json` is the single source of truth for names
and page text:

- Sections and groups are **ordered arrays of entries with an `id`**.
  The `id` is the reference used by folders and by item frontmatter.
- Subgroups and footnote types are **keyed objects** (lookup only, order
  irrelevant).
- Item files store ids, not display text.
- Renaming a heading changes one value here, not 500 files.
- Keys and values are UTF-8, so the format works for other languages.

## 2. Location

`data/config.json`, directly beside the release folders (§ data-format.md §2).

## 3. Schema

Top-level object with these fields:

| Field            | Type   | Required | Meaning                                |
| ---------------- | ------ | -------- | -------------------------------------- |
| `schema`         | number | yes      | format version (§7); `1`               |
| `collation`      | string | yes      | BCP 47 locale for alphabetical sorting |
| `page`           | object | yes      | page-level text (§3.1)                 |
| `sections`       | array  | yes      | ordered section definitions (§3.2)     |
| `groups`         | array  | yes      | ordered group definitions (§3.3)       |
| `subgroups`      | object | yes      | subgroup key → display title (§3.4)    |
| `footnote-types` | object | yes      | footnote key → emoji or null (§3.5)    |

### 3.1 Page

Static text and presentation of the page shell: head (masthead), search,
info banner, page colors, and footer. The browser-tab title is **not
stored** — it is derived as `head.subtitle` + `" "` + `head.title`. The
column legend is not configured here — it derives from the `groups`
entries (label + emoji + colors).

| Field         | Type   | Required | Meaning                                        |
| ------------- | ------ | -------- | ---------------------------------------------- |
| `head`        | object | yes      | masthead `{ emoji, subtitle, title, *-color }` |
| `search`      | object | yes      | search widget text and colors (below)          |
| `info-banner` | object | yes      | `{ emoji, text, text-color }` BEGRENSE note    |
| `colors`      | object | yes      | page-level color tokens (below)                |
| `footer`      | object | yes      | footer colors + lines (below)                  |
| `info-button` | object | no       | item note-button glyphs and sizing (below)     |
| `markers`     | object | no       | change-marker emojis (below)                   |
| `tooltips`    | object | no       | bullet tooltip templates (below)               |

**3.1.1 Note info-button**

`page.info-button` styles the item reasoning-note button (BLUEPRINT §4.6):
the two glyphs it shows and their size. The button is a bare emoji — no
box, border, or corner radius (deviation 17). All values are optional;
the build falls back to the canonical defaults when a key is missing.

| Field           | Type   | Required | Meaning                                                                                                      |
| --------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `emoji`         | string | no       | resting glyph (default `ℹ️`)                                                                                 |
| `emoji-matched` | string | no       | glyph when the note matches the query (default `☑️`)                                                         |
| `font-size`     | string | no       | glyph base size (default `0.9rem` — same as the item markers; the build wraps it in the `--text-scale` calc) |
| `margin-left`   | string | no       | gap after the item text (default `0.4rem`)                                                                   |

`head`:

| Field            | Type   | Meaning                           |
| ---------------- | ------ | --------------------------------- |
| `emoji`          | object | `{ left, right }` flanking emojis |
| `subtitle`       | string | tagline ("Vanlige matvarer")      |
| `title`          | string | main display title ("FODMAP")     |
| `title-color`    | string | main title color                  |
| `subtitle-color` | string | tagline color                     |
| `outline-color`  | string | main title outline color          |

`search`:

| Field               | Type   | Meaning                                              |
| ------------------- | ------ | ---------------------------------------------------- |
| `emoji`             | string | magnifier emoji                                      |
| `placeholder`       | string | input placeholder text                               |
| `placeholder-color` | string | placeholder text color                               |
| `clear`             | string | clear-control glyph (`×`)                            |
| `scale`             | string | text-size toggle label (`Aa`)                        |
| `marker`            | object | search highlight, `{ background-color, text-color }` |

`colors` (page-level design tokens):

| Field                    | Type   | Meaning                 |
| ------------------------ | ------ | ----------------------- |
| `background-color`       | string | page background         |
| `text-color`             | string | body text               |
| `heading-color`          | string | heading text/border ink |
| `column-separator-color` | string | column dashed separator |
| `column-top-line-color`  | string | narrow column top line  |
| `halftone-left-color`    | string | left decoration dot     |
| `halftone-right-color`   | string | right decoration dot    |
| `halftone-both-color`    | string | shared decoration dot   |

`footer`:

| Field             | Type   | Meaning                             |
| ----------------- | ------ | ----------------------------------- |
| `secondary-color` | string | secondary text color                |
| `hover-color`     | string | link hover color                    |
| `lines`           | array  | ordered footer lines (§3.1.2 below) |

**3.1.2 Footer lines**

`footer.lines` is an ordered array of lines. Every line has the same
shape — `{ "separator": string, "segments": [ … ] }` — so the generator
renders them all with one function. The **first line is the bold
disclaimer**; that is a rendering rule, not data.

Each `segments` entry is one of:

- a **string** → plain text; or
- an **object** `{ "text": string, "url": string }` → a link (new tab).

Segments are joined with the line's `separator`. A `{{version}}`
placeholder in any segment is substituted from the `VERSION` file.

**3.1.3 Change markers**

`page.markers` holds the item bullet glyphs. `default` is the plain
bullet every item shows when nothing changed in the newest release.
`new`, `moved`, and `updated` are the emoji that replace it on items
merged from the newest release folder (`data-format.md` §7.4): `new`
marks items added, `moved` marks items moved to a new group, and
`updated` marks items changed in place. All values are optional; the
build falls back to the canonical glyphs (❖, 🆕, 🔄, 🆙) when a key is
missing.

| Field     | Type   | Required | Meaning                                   |
| --------- | ------ | -------- | ----------------------------------------- |
| `default` | string | no       | plain bullet (no release change)          |
| `new`     | string | no       | emoji for items new in the newest release |
| `moved`   | string | no       | emoji for items moved to a new group      |
| `updated` | string | no       | emoji for items updated in place          |

**3.1.4 Bullet tooltips**

`page.tooltips` holds the hover-tooltip templates for the item bullets
(BLUEPRINT §6.7). The keys match the markers (§3.1.3). The build fills
the placeholders from data: `{{date}}` becomes the folder name of the
release that last touched the item — the one holding its newest file
(`YYYY` / `YYYY-MM` / `YYYY-MM-DD`; the newest release for marked
items) — `{{from}}` the label of the group the item had before the
newest release (moved items only), and `{{to}}` the label of the item's
current group.

| Field     | Type   | Required | Meaning                                                                    |
| --------- | ------ | -------- | -------------------------------------------------------------------------- |
| `default` | string | no       | tooltip for unchanged items ("Dato {{date}}")                              |
| `new`     | string | no       | tooltip for items new in the newest release                                |
| `moved`   | string | no       | tooltip for moved items ("Flyttet fra {{from}} til {{to}}, dato {{date}}") |
| `updated` | string | no       | tooltip for items updated in place                                         |

All values are optional; a missing key for a marker kind falls back to
the `default` template, and with no `default` template the item renders
without a tooltip. An item with no change marker always uses the
`default` template.

### 3.2 Sections

Ordered array of section definitions. A section is a top-level category
on the page. **Sections are arbitrary**: the maintainer defines the
`id` and may add, remove, or reorder any number of sections. The
**`id` is also the folder name** of that section.

| Field              | Type   | Required | Meaning                                              |
| ------------------ | ------ | -------- | ---------------------------------------------------- |
| `id`               | string | yes      | unique section key; folder name; referenced by items |
| `title`            | string | yes      | displayed heading text (Norwegian, verbatim)         |
| `emoji`            | string | yes      | emoji glyph                                          |
| `background-color` | string | no       | heading background color                             |
| `footnote`         | object | no       | `{ "type": <footnote-types key>, "text": string }`   |

Empty placeholder columns are not declared here. They are derived from
the data: a section folder that has no items for a group renders that
group's column position as a placeholder.

### 3.3 Groups

Ordered array of group definitions. A group is a column (the role label,
as in SPIS / BEGRENSE / UNNGÅ). **Groups are arbitrary**: the maintainer
defines the `id` and may add or remove any number of groups. There is no
fixed count. **The array position is the left-to-right column order.**

| Field              | Type   | Required | Meaning                                                           |
| ------------------ | ------ | -------- | ----------------------------------------------------------------- |
| `id`               | string | yes      | unique group key; referenced from item frontmatter                |
| `label`            | string | yes      | displayed badge text                                              |
| `emoji`            | string | yes      | emoji glyph                                                       |
| `background-color` | string | no       | label background color                                            |
| `text-color`       | string | no       | label text color                                                  |
| `border-color`     | string | no       | label / legend border ink; falls back to `text-color` when absent |
| `column-color`     | string | no       | column background tint (low opacity)                              |

The page column legend and the per-column mobile labels derive from the
`groups` entries automatically (their `label`, `emoji`, and colors).

### 3.4 Subgroups

Keyed object (not an array): a subgroup is a heading inside a column.
The key is referenced from item frontmatter; the value is the displayed
title, shown verbatim. Whether a heading shows a trailing colon is part
of the value. Order is irrelevant — subgroups display alphabetically by
title.

| Field | Type   | Required | Meaning                          |
| ----- | ------ | -------- | -------------------------------- |
| key   | string | yes      | referenced from item frontmatter |
| value | string | yes      | displayed heading text           |

### 3.5 Footnote types

Keyed object: footnote banners can carry an icon. The value is the emoji
glyph, or `null` for a footnote with no icon. A plain value (not an
object) keeps it minimal — it matches the `subgroups` key → string form.

| Field | Type           | Required | Meaning                                     |
| ----- | -------------- | -------- | ------------------------------------------- |
| key   | string         | yes      | referenced from a section's `footnote.type` |
| value | string or null | yes      | emoji glyph, or `null` for none             |

### 3.6 Full example

Abbreviated from the authoritative `data/config.json` (which lists all
current sections, groups, subgroups, and the complete `page` block).

```json
{
  "schema": 1,
  "collation": "no-NO",
  "page": {
    "head": {
      "emoji": { "left": "🥦🍓", "right": "🧀🥖" },
      "subtitle": "Vanlige matvarer",
      "title": "FODMAP",
      "title-color": "#c43838",
      "subtitle-color": "#d85c5c",
      "outline-color": "#000000"
    },
    "search": {
      "emoji": "🔍",
      "placeholder": "SØK ETTER MATVARE (F.EKS. LØK, EPLE)...",
      "placeholder-color": "#9ca3af",
      "clear": "×",
      "scale": "Aa",
      "marker": {
        "background-color": "#ffffff",
        "text-color": "#000000"
      }
    },
    "info-banner": {
      "emoji": "ℹ️",
      "text": "BEGRENSE: Opp til 1 matvare per måltid. Matvaren har lav FODMAP opp til mengden oppgitt i BEGRENSE-kolonnen.",
      "text-color": "#374151"
    },
    "colors": {
      "background-color": "#ffffff",
      "text-color": "#333333",
      "heading-color": "#000000",
      "column-separator-color": "rgba(0, 0, 0, 0.3)",
      "column-top-line-color": "rgba(0, 0, 0, 0.1)",
      "halftone-left-color": "#c43838",
      "halftone-right-color": "#a0c49d",
      "halftone-both-color": "#e6a147"
    },
    "footer": {
      "secondary-color": "#4b5563",
      "hover-color": "#dc2626",
      "lines": [
        {
          "separator": "  ",
          "segments": [
            "Rådfør deg alltid med lege eller klinisk ernæringsfysiolog før du starter på en eliminasjonsdiett"
          ]
        },
        {
          "separator": "  ",
          "segments": [
            "FODMAP v{{version}} // Kilder:",
            {
              "text": "Norsk Helseinformatikk (NHI.no)",
              "url": "https://nhi.no/kosthold/forebyggende-kost-og-sykdom/dette-er-fodmap-reduserte-matvarer"
            }
          ]
        },
        {
          "separator": " // ",
          "segments": [
            "Utviklet av Arnulf Heimsbakk",
            {
              "text": "Kildekode på github.com/aheimsbakk/fodmap",
              "url": "https://github.com/aheimsbakk/fodmap/"
            },
            "Lisens MIT"
          ]
        }
      ]
    },
    "markers": {
      "default": "•",
      "new": "🆕",
      "moved": "🔄",
      "updated": "🆙"
    },
    "tooltips": {
      "default": "Dato {{date}}",
      "new": "Dato {{date}}",
      "moved": "Flyttet fra {{from}} til {{to}}, dato {{date}}",
      "updated": "Dato {{date}}"
    }
  },
  "sections": [
    {
      "id": "brød",
      "title": "Brød, ris og pasta",
      "emoji": "🌾",
      "background-color": "#d59e5e",
      "footnote": {
        "type": "viktig",
        "text": "VIKTIG: Glutenfrie produkter kan likevel inneholde høy FODMAP-ingredienser. Gjelder spesielt grove produkter."
      }
    },
    {
      "id": "grønnsaker",
      "title": "Grønnsaker og belgfrukter",
      "emoji": "🥕",
      "background-color": "#8fb88a"
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
  ],
  "subgroups": {
    "belgfrukter": "Belgfrukter",
    "ost": "Ost",
    "søtstoff": "Søtstoff",
    "søtstoff-polyoler": "Søtstoff (polyoler)",
    "annet": "Annet"
  },
  "footnote-types": {
    "viktig": "⚠️",
    "tips": "ℹ️",
    "plain": null
  }
}
```

## 4. Config ↔ data contract

Every reference from the item data must resolve to an id or key here.
A reference to a missing id makes the data invalid.

| Where the reference appears   | Must resolve to                |
| ----------------------------- | ------------------------------ |
| section folder name (path)    | the `id` of a `sections` entry |
| item field `group`            | the `id` of a `groups` entry   |
| item field `subgroup`         | a key in `subgroups`           |
| section field `footnote.type` | a key in `footnote-types`      |

A section folder with no item for a given group id renders that group's
column as an empty placeholder (§3.2).

## 5. Ids, keys, and values

- **Id** (`sections`, `groups`): stable identifier, referenced by item
  data and by folder names. Never renames an id once data references it —
  rename the value instead. Uniqueness is required within each array.
- **Count is dynamic**: the number of sections and groups is arbitrary.
  The maintainer defines the ids and the array length; there is no fixed
  set of sections or of columns (see §3.2 and §3.3).
- **Key** (`subgroups`, `footnote-types`): stable lookup key, same rule.
- **Value**: display text or attributes.
- **Encoding**: UTF-8 for ids, keys, and values.
- **Case**: lowercase ids/keys recommended, not enforced; case-sensitive.

## 6. Order semantics

| Block            | Order source                                   |
| ---------------- | ---------------------------------------------- |
| `sections`       | array position = page order of the sections    |
| `groups`         | array position = left-to-right column order    |
| `page.*`         | fixed structure; single values and link arrays |
| `subgroups`      | none — display alphabetically by value         |
| `footnote-types` | none — keyed lookup only                       |

Explicit arrays make the order part of the data, immune to parser
ordering differences. Subgroup and footnote type order is irrelevant and
therefore kept as objects.

## 7. Versioning

- The `schema` field carries the format version: `1` for the first
  release, even while iterating.
- An incompatible change bumps the number. Migration of old config is a
  separate concern, decided later (§ data-format.md §9).

## 8. Out of scope

Deliberately not specified here (may grow later):

- Validation tooling and a formal JSON Schema.
- Any editor UI.
