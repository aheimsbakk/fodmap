# FODMAP Data Lifecycle

> User documentation for maintaining the FODMAP food data: how a release
> is created, edited, and published. The technical format is specified in
> `data-format.md`.

## 1. What a release is

The page content lives under `data/`. Each release is a folder named by
date. The oldest folder is a **baseline**: it contains every food item.
Every later folder is a **delta**: it contains only the items you changed.

The page rebuilds by merging the folders oldest → newest. You always edit
the newest folder; you never touch older ones.

## 2. The yearly update, end to end

When new research arrives, do the following.

### 2.1 Create the release folder

Choose the date format to match how often you update:

| You update           | Folder name  | Example      |
| -------------------- | ------------ | ------------ |
| Once a year          | `YYYY`       | `2025`       |
| Several times a year | `YYYY-MM`    | `2025-01`    |
| On demand            | `YYYY-MM-DD` | `2025-01-15` |

For a yearly update you copy the whole newest folder and edit the copy:

```bash
cp -r data/2024 data/2025
```

Then edit only the files that changed inside `data/2025/`. Because a delta
folder still contains the merged state when copied, the untouched files
stay correct.

### 2.2 Edit items

Open the item's file and change what the new research says. An item file
only needs to state what changed; everything else is inherited. If you
copied the folder, keep the full frontmatter — it is the current state.

### 2.3 Add a note

Notes explain why a value changed and link the research. Put the note in
the Markdown body:

```markdown
---
name: Erytritol (Sukrin) (E 968)
group: begrens
subgroup: sotstoff-polyoler
visible: true
attribution: https://example.com/updated-fodmap.pdf
---

2025: begrenset mengde kan tolereres – verifiser forskningsgrunnlaget (2020).
```

New notes go on top. Older notes stay below; never edit them.

### 2.4 Publish

Build the page from the merged data and deploy it (the build step is a
later concern; see `data-format.md` §10). The release folder stays in the
repository as history.

## 3. Everyday tasks

### 3.1 Change which group an item is in

Set the `group` field to the group key from `config.json`:

```markdown
---
group: begrens
---
```

This moves the item between the SPIS / BEGRENSE / UNNGÅ columns.

### 3.2 Change the safe amount

Set the `amount` field:

```markdown
---
amount: 0,75 dl
---
```

An empty value clears the amount entirely:

```markdown
---
amount:
---
```

### 3.3 Rename an item

Rename the `name` field only. Never rename the file — the filename is the
item's permanent id.

### 3.4 Hide an item

Set `visible: false`. The item disappears from search and the tables, but
its history stays:

```markdown
---
visible: false
---
```

To bring an item back, set `visible: true` in the newest folder.

### 3.5 Add a new item

Create a new file in the appropriate section folder. The filename is the
slug — make it short and stable. The item is placed automatically:
sections and columns come from config, items sort alphabetically inside
them.

```markdown
---
name: Ny matvare
group: spis
---
```

### 3.6 Update the source of an item

Change the `attribution` URL:

```markdown
---
attribution: https://example.com/new-source.pdf
---
```

### 3.7 Adjust names in config

All section, group, and subgroup names live in `data/config.json`. Change
the value there to rename a heading across the whole page. The keys stay
stable; item files reference keys, never names.

## 4. Rules of thumb

- **Edit newest, never oldest.** Release folders are history.
- **The filename is the id.** Rename via `name`, never by moving files.
- **Absent means inherit.** Omit a field to keep the older value.
- **Empty means clear.** `field:` with nothing clears an inherited value.
- **Notes append on top.** Never rewrite or delete old notes.
- **`visible: false` removes.** It is the only removal signal.
- **Keys are stable.** Item files reference config keys; rename config
  _values_, not keys.

## 5. What changed this year

Future version of the page can list changes by diffing adjacent release
folders: a `group` change, an `amount` change, an added or hidden item, a
new note. Because every change is a provable edit to a file, the report
can be generated — nothing needs to be maintained by hand.
