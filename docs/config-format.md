# FODMAP Config Format — config.json

> Technical specification of the single global configuration file
> `data/config.json`. It defines every configurable name (sections,
> groups, subgroups, footnote types) and the page-level text (masthead,
> banners, footer). The item data (`data-format.md`) references the
> ids defined here. This is a proposal; not yet implemented.

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

| Field           | Type   | Required | Meaning                                |
| --------------- | ------ | -------- | -------------------------------------- |
| `schema`        | number | yes      | format version (§7); `1`               |
| `collation`     | string | yes      | BCP 47 locale for alphabetical sorting |
| `page`          | object | yes      | page-level text (§3.1)                 |
| `sections`      | array  | yes      | ordered section definitions (§3.2)     |
| `groups`        | array  | yes      | ordered group definitions (§3.3)       |
| `subgroups`     | object | yes      | subgroup key → display title (§3.4)    |
| `footnoteTypes` | object | yes      | footnote key → icon definition (§3.5)  |

### 3.1 Page

Static text of the page shell: title, masthead, search, info banner, and
footer. The column legend is not configured here — it derives from the
`groups` entries (label + icon).

| Field        | Type   | Required | Meaning                                |
| ------------ | ------ | -------- | -------------------------------------- |
| `title`      | string | yes      | document `<title>` (with FODMAP in it) |
| `masthead`   | object | yes      | `{ emojis, subtitle, title }` (below)  |
| `search`     | object | yes      | `{ icon, placeholder, clear, scale }`  |
| `infoBanner` | object | yes      | `{ icon, text }` BEGRENSE explanation  |
| `footer`     | object | yes      | disclaimer, sources, credit (below)    |

`masthead`:

| Field      | Type   | Meaning                           |
| ---------- | ------ | --------------------------------- |
| `emojis`   | object | `{ left, right }` flanking emojis |
| `subtitle` | string | tagline ("Vanlige matvarer")      |
| `title`    | string | main display title ("FODMAP")     |

`search`:

| Field         | Type   | Meaning                       |
| ------------- | ------ | ----------------------------- |
| `icon`        | string | magnifier emoji               |
| `placeholder` | string | input placeholder text        |
| `clear`       | string | clear-control glyph (`×`)     |
| `scale`       | string | text-size toggle label (`Aa`) |

`footer`:

| Field        | Type   | Meaning                                   |
| ------------ | ------ | ----------------------------------------- |
| `disclaimer` | string | bold disclaimer sentence                  |
| `sources`    | array  | `{ label, url }` attribution links        |
| `credit`     | object | `{ text, repo, repoUrl, license }` credit |

### 3.2 Sections

Ordered array of section definitions. A section is a top-level category
(the 11 page sections). The **`id` is also the folder name** of that
section.

| Field      | Type   | Required | Meaning                                              |
| ---------- | ------ | -------- | ---------------------------------------------------- |
| `id`       | string | yes      | unique section key; folder name; referenced by items |
| `title`    | string | yes      | displayed heading text (Norwegian, verbatim)         |
| `icon`     | string | yes      | emoji glyph                                          |
| `color`    | string | no       | heading background color                             |
| `empty`    | array  | no       | group ids rendered as empty placeholder columns      |
| `footnote` | object | no       | `{ "type": <footnoteTypes key>, "text": string }`    |

### 3.3 Groups

Ordered array of group definitions. A group is a role column (SPIS /
BEGRENSE / UNNGÅ). The page has exactly three. **The array position is
the left-to-right column order.**

| Field   | Type   | Required | Meaning                                            |
| ------- | ------ | -------- | -------------------------------------------------- |
| `id`    | string | yes      | unique group key; referenced from item frontmatter |
| `label` | string | yes      | displayed badge text                               |
| `icon`  | string | yes      | emoji glyph                                        |
| `tint`  | string | no       | role background color (low opacity)                |

### 3.4 Subgroups

Keyed object (not an array): a subgroup is a heading inside a column.
The key is referenced from item frontmatter; the value is the displayed
title (including the trailing colon where the rendered heading shows
one). Order is irrelevant — subgroups display alphabetically by title.

| Field | Type   | Required | Meaning                          |
| ----- | ------ | -------- | -------------------------------- |
| key   | string | yes      | referenced from item frontmatter |
| value | string | yes      | displayed heading text           |

### 3.5 Footnote types

Keyed object: footnote banners can carry an icon. Some notes have no
icon; the value is then `null`.

| Field | Type            | Required | Meaning                                     |
| ----- | --------------- | -------- | ------------------------------------------- |
| key   | string          | yes      | referenced from a section's `footnote.type` |
| value | `{ "icon": … }` | yes      | icon glyph or `null`                        |

### 3.6 Full example

```json
{
  "schema": 1,
  "collation": "no-NO",
  "page": {
    "title": "Vanlige matvarer FODMAP",
    "masthead": {
      "emojis": { "left": "🥦🍓", "right": "🧀🥖" },
      "subtitle": "Vanlige matvarer",
      "title": "FODMAP"
    },
    "search": {
      "icon": "🔍",
      "placeholder": "SØK ETTER MATVARE (F.EKS. LØK, EPLE)...",
      "clear": "×",
      "scale": "Aa"
    },
    "infoBanner": {
      "icon": "ℹ️",
      "text": "BEGRENSE: Opp til 1 matvare per måltid. Matvaren har lav FODMAP opp til mengden oppgitt i BEGRENSE-kolonnen."
    },
    "footer": {
      "disclaimer": "Rådfør deg alltid med lege eller klinisk ernæringsfysiolog før du starter på en eliminasjonsdiett",
      "sources": [
        {
          "label": "Norsk Helseinformatikk (NHI.no)",
          "url": "https://nhi.no/kosthold/forebyggende-kost-og-sykdom/dette-er-fodmap-reduserte-matvarer"
        },
        {
          "label": "NKFM – Lav FODMAP-mat ved IBS",
          "url": "https://www.helse-bergen.no/nasjonal-kompetansetjeneste-for-funksjonelle-mage-tarmsykdommer-nkfm/lav-fodmap-mat-ved-ibs"
        }
      ],
      "credit": {
        "text": "Utviklet av Arnulf Heimsbakk // Kildekode på",
        "repo": "github.com/aheimsbakk/fodmap",
        "repoUrl": "https://github.com/aheimsbakk/fodmap/",
        "license": "Lisens MIT"
      }
    }
  },
  "sections": [
    {
      "id": "brod",
      "title": "Brød, ris og pasta",
      "icon": "🌾",
      "color": "#d59e5e"
    },
    {
      "id": "sukker",
      "title": "Sukker, søtning og annet",
      "icon": "🧊",
      "color": "#e6c8c8",
      "footnote": {
        "type": "tips",
        "text": "TIPS: Matvarer merket \"naturlig lett\" og \"naturlig søtet\" inneholder ofte fruktose/fruktkonsentrat."
      }
    },
    {
      "id": "kjott",
      "title": "Kjøtt, egg, fisk",
      "icon": "🍗",
      "color": "#e08c8c",
      "empty": ["begrens", "unnga"],
      "footnote": {
        "type": "marinader",
        "text": "MARINADER, PANERING OG FERDIGMAT: Sjekk ALLTID for løk og hvitløk!"
      }
    }
  ],
  "groups": [
    {
      "id": "spis",
      "label": "SPIS",
      "icon": "👍",
      "tint": "rgba(160, 196, 157, 0.2)"
    },
    {
      "id": "begrens",
      "label": "BEGRENSE",
      "icon": "⚖️",
      "tint": "rgba(247, 215, 116, 0.25)"
    },
    {
      "id": "unnga",
      "label": "UNNGÅ",
      "icon": "✋",
      "tint": "rgba(209, 93, 93, 0.15)"
    }
  ],
  "subgroups": {
    "sotstoff": "Søtstoff:",
    "sotstoff-polyoler": "Søtstoff (polyoler):",
    "annet": "Annet:"
  },
  "footnoteTypes": {
    "viktig": { "icon": "⚠️" },
    "tips": { "icon": "⚠️" },
    "marinader": { "icon": null }
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
| section field `footnote.type` | a key in `footnoteTypes`       |
| section field `empty` (array) | the `id`s of `groups` entries  |

## 5. Ids, keys, and values

- **Id** (`sections`, `groups`): stable identifier, referenced by item
  data and by folder names. Never renames an id once data references it —
  rename the value instead. Uniqueness is required within each array.
- **Key** (`subgroups`, `footnoteTypes`): stable lookup key, same rule.
- **Value**: display text or attributes.
- **Encoding**: UTF-8 for ids, keys, and values.
- **Case**: lowercase ids/keys recommended, not enforced; case-sensitive.

## 6. Order semantics

| Block           | Order source                                   |
| --------------- | ---------------------------------------------- |
| `sections`      | array position = page order of the sections    |
| `groups`        | array position = left-to-right column order    |
| `page.*`        | fixed structure; single values and link arrays |
| `subgroups`     | none — display alphabetically by value         |
| `footnoteTypes` | none — keyed lookup only                       |

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
