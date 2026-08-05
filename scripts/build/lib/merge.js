// merge.js — read release folders, parse item frontmatter, merge oldest→newest.
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Parse the small YAML subset used in item files.
// Returns an object with the frontmatter fields plus the slug.
function parseItem(text, slug) {
  const out = { slug };
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (m) {
    for (const line of m[1].split("\n")) {
      const mm = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
      if (!mm) continue;
      const [, key, raw] = mm;
      out[key] = raw === "" ? "" : raw;
    }
    const body = text.slice(m[0].length).trim();
    if (body) out.note = body;
  }
  return out;
}

// Merge all releases (oldest→newest) and group items by section.
// Returns a Map: section -> [item, ...] (items carry { section, slug, ... }).
export function loadItems(releases, sectionFilter) {
  const merged = new Map(); // `${section}/${slug}` -> item
  for (const release of releases) {
    const dirs = readdirSync(release, { withFileTypes: true }).filter((d) =>
      d.isDirectory(),
    );
    for (const d of dirs) {
      const section = d.name;
      if (sectionFilter && !sectionFilter.has(section)) continue;
      const dir = join(release, section);
      for (const file of readdirSync(dir)) {
        if (!file.endsWith(".md")) continue;
        const slug = file.slice(0, -3);
        const key = `${section}/${slug}`;
        const item = parseItem(readFileSync(join(dir, file), "utf8"), slug);
        if (!merged.has(key)) {
          merged.set(key, { ...item, section });
        } else {
          Object.assign(merged.get(key), item);
        }
      }
    }
  }

  const bySection = new Map();
  for (const [key, item] of merged) {
    if (!item.group) continue; // skip items without a group
    const [section] = key.split("/");
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section).push(item);
  }
  return bySection;
}
