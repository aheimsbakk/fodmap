/**
 * content.test.js — parity between origin/fodmap.html and src/index.html
 * (BLUEPRINT §13.2). The origin is the source of truth; the reimplementation
 * must match it exactly except for the user-approved corrections (§12.1),
 * which this file duplicates as data so a markup change without a matching
 * map update fails the suite.
 */

import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const ORIGIN = new JSDOM(
  readFileSync(new URL("../origin/fodmap.html", import.meta.url), "utf8"),
).window.document;
const APP = new JSDOM(
  readFileSync(new URL("../src/index.html", import.meta.url), "utf8"),
).window.document;

/** Exact origin -> corrected replacements (BLUEPRINT §12.1). */
const CORRECTIONS = new Map([
  // §2 SPIS
  [
    "Sopp: hermetsisk sjampinjong, Østers",
    "Sopp: hermetisk sjampinjong, østers",
  ],
  ["Purre-kun det grønne", "Purre – kun det grønne"],
  ["Rødbeter, syltet", "Rødbeter, syltede"],
  // §2 BEGRENSE
  ["Squash (0.75 dl)", "Squash (0,75 dl)"],
  // §3 SPIS (Tørket frukt)
  ["Banan (15 stk)", "Banan i biter (15 stk)"],
  // §3 BEGRENSE
  ["Avokodo (1/8 av en hel)", "Avokado (1/8 av en hel)"],
  [
    "Blåbær, amerikanske og hvite inn (40 gram)",
    "Blåbær, amerikanske og hvite inni (40 gram)",
  ],
  ["Tranebær (1ss)", "Tranebær (1 ss)"],
  // §4 heading
  [
    "Melk, meieriprodukter & Alternativer",
    "Melk, meieriprodukter & alternativer",
  ],
  // §4 BEGRENSE
  ["Kokosmelk, (0,6 dl)", "Kokosmelk (0,6 dl)"],
  // §4 UNNGÅ
  ["Rømme, kesam", "Rømme"],
  // §8 SPIS
  ["Sardiner i vann, olje eller gele.", "Sardiner i vann, olje eller gele"],
  [
    "Spekeskinke (strynskinke, Strandaskinke, serranoskinke, westfaler)",
    "Spekeskinke (strynskinke, strandaskinke, serranoskinke, westfaler)",
  ],
  // §9 SPIS
  ["Sirup, Glukose", "Sirup, glukose"],
  ["Aceculfat K", "Acesulfam K"],
  // §9 UNNGÅ
  ["Erytritol (Sukrin) (E938)", "Erytritol (Sukrin) (E 968)"],
  ["Polydextrose (E1200)", "Polydextrose (E 1200)"],
  // §10 SPIS
  ["Bukkehomkløver/methi", "Bukkehornkløver/methi"],
  ["Kajennepepper", "Cayennepepper"],
  // §11 UNNGÅ
  ["Kjøttbuljond, cups (Magi)", "Kjøttbuljong (Maggi)"],
]);

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

/** Applies the corrections map to an origin-side string. */
function applyCorrections(text) {
  return CORRECTIONS.get(text) ?? text;
}

test("reimplementation has 11 sections with the origin heading order", () => {
  const originSections = ORIGIN.querySelectorAll("section");
  const appSections = APP.querySelectorAll("section.category-section");
  assert.equal(appSections.length, 11);
  assert.equal(appSections.length, originSections.length);

  originSections.forEach((originSection, i) => {
    const originTitle = applyCorrections(
      headingText(originSection.querySelector(".category-header")),
    );
    const appTitle = headingText(
      appSections[i].querySelector(".category-heading"),
    );
    assert.equal(appTitle, originTitle, `section ${i + 1} heading`);
  });
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

test("every item text equals the origin except the approved corrections", () => {
  const originSections = ORIGIN.querySelectorAll("section");
  const appSections = APP.querySelectorAll("section.category-section");

  originSections.forEach((originSection, i) => {
    const originCols = originSection.querySelectorAll(".content-col");
    const appCols = appSections[i].querySelectorAll(".content-col");
    assert.equal(
      originCols.length,
      appCols.length,
      `section ${i + 1} column count`,
    );

    originCols.forEach((originCol, j) => {
      const originItems = originCol.querySelectorAll("li");
      const appItems = appCols[j].querySelectorAll("li.item");
      assert.equal(
        appItems.length,
        originItems.length,
        `section ${i + 1}, column ${j + 1} item count`,
      );

      originItems.forEach((originItem, k) => {
        const expected = applyCorrections(normalized(originItem.textContent));
        const actual = normalized(appItems[k].textContent);
        assert.equal(
          actual,
          expected,
          `section ${i + 1}, column ${j + 1}, item ${k + 1}`,
        );
      });
    });
  });
});
