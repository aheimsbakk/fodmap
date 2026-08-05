// merge.test.js — unit tests of the release merge and change markers
// (BLUEPRINT §6.3, §6.6; docs/data-format.md §7). Fixtures are written to a
// temp directory at runtime, so the repository stays free of test data.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { listReleases, loadItems } from "../scripts/build/lib/merge.js";

const roots = [];
after(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

/**
 * Writes a synthetic data tree and returns its path.
 * Shape: { "<release>": { "<section>": [ { slug, frontmatter, body? } ] } }.
 * An empty frontmatter value writes `key:` (explicit empty = clear).
 */
function makeTree(releases, extraFile = null) {
  const root = mkdtempSync(join(tmpdir(), "fodmap-merge-"));
  roots.push(root);
  if (extraFile) writeFileSync(join(root, extraFile.name), extraFile.content);
  for (const [release, sections] of Object.entries(releases)) {
    const releaseDir = join(root, release);
    mkdirSync(releaseDir, { recursive: true });
    for (const [section, files] of Object.entries(sections)) {
      if (!Array.isArray(files)) continue;
      const sectionDir = join(releaseDir, section);
      mkdirSync(sectionDir, { recursive: true });
      for (const file of files) {
        const fm = Object.entries(file.frontmatter)
          .map(([key, value]) =>
            value === "" ? `${key}:` : `${key}: ${value}`,
          )
          .join("\n");
        const body = file.body || "";
        writeFileSync(
          join(sectionDir, `${file.slug}.md`),
          `---\n${fm}\n---\n\n${body}`.trim() + "\n",
        );
      }
    }
  }
  return root;
}

function findItem(map, section, slug) {
  return (map.get(section) || []).find((item) => item.slug === slug);
}

// --- release enumeration ----------------------------------------------------

test("listReleases keeps only date folders, oldest → newest", () => {
  const root = makeTree(
    {
      2021: {},
      2024: {},
      "2025-05": {},
      "2025-05-01": {},
    },
    { name: "config.json", content: "{}" },
  );
  mkdirSync(join(root, "docs"), { recursive: true }); // non-date dir must be skipped
  const names = listReleases(root).map((p) => basename(p));
  assert.deepEqual(names, ["2021", "2024", "2025-05", "2025-05-01"]);
});

test("listReleases rejects non date-shaped folders", () => {
  const root = makeTree({ 2025: { s: [] } });
  mkdirSync(join(root, "2025-1"), { recursive: true });
  mkdirSync(join(root, "junk"), { recursive: true });
  const names = listReleases(root).map((p) => basename(p));
  assert.deepEqual(names, ["2025"]);
});

// --- merge semantics ---------------------------------------------------------

test("baseline-only items merge unchanged and carry no marker", () => {
  const root = makeTree({
    2021: {
      s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }],
    },
  });
  const map = loadItems([join(root, "2021")]);
  const a = findItem(map, "s", "a");
  assert.equal(a.name, "A");
  assert.equal(a.group, "spis");
  assert.equal(a.change, null);
});

test("absent fields inherit from the older state", () => {
  const root = makeTree({
    2021: {
      s: [
        {
          slug: "a",
          frontmatter: { name: "A", group: "spis", amount: "40 g" },
        },
      ],
    },
    2025: {
      s: [{ slug: "a", frontmatter: { group: "begrens" } }],
    },
  });
  const map = loadItems(listReleases(root));
  const a = findItem(map, "s", "a");
  assert.equal(a.name, "A", "name inherits from the baseline");
  assert.equal(a.group, "begrens");
  assert.equal(a.amount, "40 g", "amount inherits when a delta omits it");
  assert.equal(a.change, "moved");
});

test("explicit empty amount clears the inherited value", () => {
  const root = makeTree({
    2021: {
      s: [
        {
          slug: "a",
          frontmatter: { name: "A", group: "spis", amount: "40 g" },
        },
      ],
    },
    2025: {
      s: [{ slug: "a", frontmatter: { amount: "" } }],
    },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.amount, "");
  assert.equal(a.change, "updated");
});

test("visible: false hides an item but keeps its fields and history", () => {
  const root = makeTree({
    2021: {
      s: [
        {
          slug: "a",
          frontmatter: { name: "A", group: "spis", amount: "40 g" },
        },
      ],
    },
    2025: {
      s: [{ slug: "a", frontmatter: { visible: "false" } }],
    },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.visible, "false");
  assert.equal(a.name, "A");
  assert.equal(a.change, "updated", "a visibility toggle counts as updated");
});

test("notes prepend newest → oldest, separated by a blank line", () => {
  const root = makeTree({
    2021: {
      s: [
        {
          slug: "a",
          frontmatter: { name: "A", group: "spis" },
          body: "old note",
        },
      ],
    },
    2025: {
      s: [{ slug: "a", frontmatter: { group: "spis" }, body: "new note" }],
    },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.note, "new note\n\nold note");
});

// --- change markers (§6.6) ---------------------------------------------------

test("an item added in the newest release is marked new", () => {
  const root = makeTree({
    2021: { s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }] },
    2025: { s: [{ slug: "b", frontmatter: { name: "B", group: "spis" } }] },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  const b = findItem(loadItems(listReleases(root)), "s", "b");
  assert.equal(a.change, null);
  assert.equal(b.change, "new");
});

test("an item moved to a new group in the newest release is marked moved", () => {
  const root = makeTree({
    2021: { s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }] },
    2025: { s: [{ slug: "a", frontmatter: { group: "unngå" } }] },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.group, "unngå");
  assert.equal(a.change, "moved");
});

test("an item changed in place is marked updated", () => {
  const root = makeTree({
    2021: { s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }] },
    2025: { s: [{ slug: "a", frontmatter: { name: "A2" } }] },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.name, "A2");
  assert.equal(a.change, "updated");
});

test("an untouched file in the newest release marks nothing", () => {
  const root = makeTree({
    2021: { s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }] },
    2025: { s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }] },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.change, null);
});

test("only the newest release marks items; older deltas alone never do", () => {
  const root = makeTree({
    2021: {
      s: [
        { slug: "a", frontmatter: { name: "A", group: "spis" } },
        { slug: "b", frontmatter: { name: "B", group: "spis" } },
      ],
    },
    2024: {
      s: [{ slug: "b", frontmatter: { group: "begrens" } }], // change, 2nd-to-last
    },
    2025: {
      s: [{ slug: "a", frontmatter: { name: "A new" } }], // change in the newest
    },
  });
  const map = loadItems(listReleases(root));
  const a = findItem(map, "s", "a");
  const b = findItem(map, "s", "b");
  assert.equal(a.change, "updated", "changed in the newest release");
  assert.equal(
    b.change,
    null,
    "changed only in an earlier delta → history, no marker",
  );
  assert.equal(b.group, "begrens", "the earlier move still holds in the merge");
});

test("a two-delta move where the newest release only updates in place stays updated", () => {
  const root = makeTree({
    2021: { s: [{ slug: "a", frontmatter: { name: "A", group: "spis" } }] },
    2024: { s: [{ slug: "a", frontmatter: { group: "begrens" } }] },
    2025: { s: [{ slug: "a", frontmatter: { amount: "5 g" } }] },
  });
  const a = findItem(loadItems(listReleases(root)), "s", "a");
  assert.equal(a.group, "begrens");
  assert.equal(
    a.change,
    "updated",
    "the move happened before the newest folder",
  );
});
