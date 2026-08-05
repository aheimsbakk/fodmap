// merge.js — read release folders, parse item frontmatter, merge oldest→newest,
// and derive the change marker for items present in the newest release.
// Spec: docs/data-format.md §7, BLUEPRINT §6.3 and §6.6.

import { readdirSync, readFileSync } from "fs";
import { join, basename } from "path";

// Release folder names are zero-padded dates — YYYY, YYYY-MM, or YYYY-MM-DD.
// That pattern sorts chronological under a plain string comparison, which is
// the documented order (docs/data-format.md §8).
const RELEASE_NAME = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;

// List the release folders under a data root, oldest → newest. Anything else
// beside the folders (config.json, docs, scratch) is ignored.
export function listReleases(dataDir) {
  return readdirSync(dataDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && RELEASE_NAME.test(dir.name))
    .map((dir) => join(dataDir, dir.name))
    .sort();
}

// Parse the small YAML subset used in item files: `key: value` lines plus
// list values (`attribution:` followed by indented `- item` lines,
// docs/data-format.md §4.1). Returns an object with the frontmatter fields
// plus the slug.
function parseItem(text, slug) {
  const out = { slug };
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (m) {
    const lines = m[1].split("\n");
    // A key with an empty value may continue as a list on the next lines;
    // the key is remembered until a non-list line ends the list.
    let listKey = null;
    for (const line of lines) {
      const listItem = line.match(/^  - (.*)$/);
      if (listItem) {
        if (listKey) {
          if (!Array.isArray(out[listKey])) out[listKey] = [];
          out[listKey].push(listItem[1]);
        }
        continue;
      }
      listKey = null;
      const mm = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
      if (!mm) continue;
      const [, key, raw] = mm;
      out[key] = raw === "" ? "" : raw;
      if (raw === "") listKey = key;
    }
    const body = text.slice(m[0].length).trim();
    if (body) out.note = body;
  }
  return out;
}

// Merge a list of parsed item files (oldest → newest) into a single state.
// Plain frontmatter fields override oldest→newest; the note body accumulates
// instead — newer notes are prepended above older ones, separated by a blank
// line (BLUEPRINT §6.3 rule 5, docs/data-format.md §7.3).
function mergeStates(files) {
  const state = {};
  const notes = [];
  for (const file of files) {
    Object.assign(state, file.item);
    if (file.item.note) notes.push(file.item.note);
  }
  // files are oldest → newest, so reversing leaves the newest note on top.
  if (notes.length) state.note = notes.reverse().join("\n\n");
  return state;
}

// Fields compared to tell an in-place update apart from a move. Group is
// handled separately because a move is its own marker type (§6.6).
function comparableShallow({
  name,
  amount,
  subgroup,
  visible,
  note,
  attribution,
}) {
  return {
    name,
    amount,
    subgroup,
    visible,
    note,
    // A list-form attribution is a fresh array per parse; compare content,
    // not the reference, so an identical list is not a change (§7.4).
    attribution: Array.isArray(attribution)
      ? attribution.join("\n")
      : attribution,
  };
}

// Classify how the item changed in the newest release. earlier = the files up
// to (excluding) the newest release; lastFiles = the files in the newest
// release. Returns { marker: "new" | "moved" | "updated" | null, fromGroup? } —
// fromGroup is the group the item had before the newest release, set on moved
// items only, and feeds the bullet tooltip "from" side (BLUEPRINT §6.6, §6.7).
function computeChange(earlier, lastFiles) {
  if (earlier.length === 0) return { marker: "new" };
  const prevState = mergeStates(earlier);
  const finalState = mergeStates([...earlier, ...lastFiles]);
  if (finalState.group !== prevState.group) {
    return { marker: "moved", fromGroup: prevState.group };
  }
  const before = comparableShallow(prevState);
  const after = comparableShallow(finalState);
  for (const key of Object.keys(before)) {
    if (before[key] !== after[key]) return { marker: "updated" };
  }
  return { marker: null };
}

// Merge all releases (oldest→newest) and group merged items by section.
// Returns a Map: section -> [item, ...]. Each item carries { section, slug,
// ...merged fields, change } where change is the §6.6 marker or null.
export function loadItems(releases, sectionFilter) {
  const records = new Map(); // `${section}/${slug}` -> { files: [{releaseIndex, item}] }
  releases.forEach((releasePath, releaseIndex) => {
    const dirents = readdirSync(releasePath, { withFileTypes: true });
    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue;
      const section = dirent.name;
      if (sectionFilter && !sectionFilter.has(section)) continue;
      const dir = join(releasePath, section);
      for (const file of readdirSync(dir)) {
        if (!file.endsWith(".md")) continue;
        const slug = file.slice(0, -3);
        const item = parseItem(readFileSync(join(dir, file), "utf8"), slug);
        const key = `${section}/${slug}`;
        if (!records.has(key)) records.set(key, { files: [] });
        records.get(key).files.push({ releaseIndex, item });
      }
    }
  });

  const lastRelease = releases.length - 1;
  // A single release has no earlier state to compare against, so nothing is
  // a "change" and no markers are derived (§6.6).
  const hasEarlierRelease = lastRelease > 0;
  const bySection = new Map();
  for (const [key, record] of records) {
    const files = record.files;
    const state = mergeStates(files);
    state.slug = files[files.length - 1].item.slug;
    state.section = key.split("/")[0];
    // The tooltip date: the folder of the item's newest file — the release
    // that last touched the item, which is the baseline for untouched items
    // (BLUEPRINT §6.7).
    state.releaseDate = basename(
      releases[files[files.length - 1].releaseIndex],
    );

    const lastFiles = files.filter((f) => f.releaseIndex === lastRelease);
    const earlier = files.filter((f) => f.releaseIndex < lastRelease);
    const result =
      hasEarlierRelease && lastFiles.length
        ? computeChange(earlier, lastFiles)
        : null;
    state.change = result ? result.marker : null;
    // The "from" side of a move, for the bullet tooltip (§6.6, §6.7);
    // present only on moved items.
    if (result && result.marker === "moved") {
      state.changedFrom = result.fromGroup;
    }

    if (!state.group) continue; // skip items without a group
    if (!bySection.has(state.section)) bySection.set(state.section, []);
    bySection.get(state.section).push(state);
  }
  return bySection;
}
