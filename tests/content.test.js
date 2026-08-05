/**
 * content.test.js — verifies the generated page against the frozen content
 * inventory (BLUEPRINT §6.2, §12.1). The inventory is duplicated here as
 * data, so a data change to any frozen string or count fails the suite.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { build } from "../scripts/build/build.mjs";

// The generated page is the canonical artifact; the hand-authored
// src/index.html is retired at the end of the migration (BLUEPRINT §12.2
// deviation 16).
const APP = new JSDOM(build().html).window.document;

/** Canonical section headings in display order (BLUEPRINT §6.2). */
const EXPECTED_SECTIONS = [
  "Brød, ris og pasta",
  "Grønnsaker og belgfrukter",
  "Frukt, tørket frukt og bær",
  "Melk, meieriprodukter & alternativer",
  "Nøtter og frø",
  "Drikke",
  "Kjøtt, egg, fisk",
  "Pålegg",
  "Sukker, søtning og annet",
  "Krydder og urter",
  "Smakstilsetning, saus, dressing",
];

/** Per-column item totals (main lists + sub-groups), BLUEPRINT §6.2. */
const EXPECTED_COUNTS = [
  [20, 7, 19], // 1 Brød, ris og pasta
  [50, 19, 22], // 2 Grønnsaker og belgfrukter
  [27, 11, 23], // 3 Frukt, tørket frukt og bær
  [20, 7, 13], // 4 Melk, meieriprodukter & alternativer
  [12, 2, 2], // 5 Nøtter og frø
  [16, 5, 12], // 6 Drikke
  [9, 0, 0], // 7 Kjøtt, egg, fisk
  [35, 0, 11], // 8 Pålegg
  [26, 3, 24], // 9 Sukker, søtning og annet
  [37, 0, 8], // 10 Krydder og urter
  [29, 6, 9], // 11 Smakstilsetning, saus, dressing
];

const TOTAL_ITEMS = EXPECTED_COUNTS.flat().reduce((sum, n) => sum + n, 0);

/**
 * Canonical spellings (BLUEPRINT §12.1): corrected typos plus the
 * reviewed spellings that must stay unchanged. Each entry must equal the
 * whole normalized text of an item or a category heading.
 */
const CANONICAL_SPELLINGS = [
  "Sopp: hermetisk sjampinjong, østers",
  "Purre – kun det grønne",
  "Rødbeter, syltede",
  "Squash (0,75 dl)",
  "Banan i biter (15 stk)",
  "Avokado (1/8 av en hel)",
  "Blåbær, amerikanske og hvite inni (40 gram)",
  "Tranebær (1 ss)",
  "Melk, meieriprodukter & alternativer",
  "Kokosmelk (0,6 dl)",
  "Rømme",
  "Sardiner i vann, olje eller gele",
  "Spekeskinke (strynskinke, strandaskinke, serranoskinke, westfaler)",
  "Sirup, glukose",
  "Acesulfam K",
  "Erytritol (Sukrin) (E 968)",
  "Polydextrose (E 1200)",
  "Bukkehornkløver/methi",
  "Cayennepepper",
  "Kjøttbuljong (Maggi)",
  "Nøtte",
  "Banos",
  "Lollosalat",
];

/** Heading text with icon markup stripped. */
function headingText(heading) {
  for (const el of heading.querySelectorAll(".category-icon, i")) {
    el.remove();
  }
  return normalized(heading.textContent);
}

/** Collapses whitespace so multi-line markup formatting never masks text. */
function normalized(text) {
  return text.replace(/\s+/g, " ").trim();
}

/** Page's category headings in display order. */
function sectionHeadings() {
  const sections = APP.querySelectorAll("section.category-section");
  return Array.from(sections).map((section) =>
    headingText(section.querySelector(".category-heading")),
  );
}

/** Every item text in the page, normalized. */
function allItemTexts() {
  return Array.from(APP.querySelectorAll("li.item")).map((li) =>
    normalized(li.textContent),
  );
}

test("page has 11 sections in the canonical heading order", () => {
  assert.deepEqual(sectionHeadings(), EXPECTED_SECTIONS);
});

test("per-column item counts match BLUEPRINT §6.2 (total 484)", () => {
  const sections = APP.querySelectorAll("section.category-section");
  assert.equal(sections.length, EXPECTED_COUNTS.length);

  let total = 0;
  sections.forEach((section, i) => {
    const cols = section.querySelectorAll(".content-col");
    assert.equal(cols.length, 3, `section ${i + 1} column count`);
    cols.forEach((col, j) => {
      const count = col.querySelectorAll("li.item").length;
      assert.equal(
        count,
        EXPECTED_COUNTS[i][j],
        `section ${i + 1}, column ${j + 1}`,
      );
      total += count;
    });
  });
  assert.equal(total, TOTAL_ITEMS);
  assert.equal(total, 484);
});

test("canonical spellings from BLUEPRINT §12.1 appear verbatim", () => {
  const itemTexts = new Set(allItemTexts());
  const headingSet = new Set(sectionHeadings());
  const allTexts = new Set([...itemTexts, ...headingSet]);

  for (const spelling of CANONICAL_SPELLINGS) {
    assert.ok(
      allTexts.has(spelling),
      `canonical spelling not found: "${spelling}"`,
    );
  }
});

test("masthead sub-title reads 'Vanlige matvarer' (BLUEPRINT §12.1)", () => {
  const subTitle = APP.querySelector(".sub-title");
  for (const el of subTitle.querySelectorAll(".emoji-left, .emoji-right")) {
    el.remove();
  }
  assert.equal(normalized(subTitle.textContent), "Vanlige matvarer");
});
