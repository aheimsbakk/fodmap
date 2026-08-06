/**
 * search.test.js — functional tests of the search engine (BLUEPRINT §13.1).
 * Pure matcher behavior is tested through the real src/index.html in jsdom,
 * which also exercises the element identity contract (§9.3) end to end.
 */

import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { normalizeQuery, buildMatcher } from "../src/js/search-engine.js";
import { initSearch } from "../src/js/search.js";
import { build } from "../scripts/build/build.mjs";

// Tests run against the generated page (the canonical artifact); the
// hand-authored src/index.html is retired at the end of the migration
// (BLUEPRINT §12.2 deviation 16).
const APP_HTML = build().html;

function setup() {
  const dom = new JSDOM(APP_HTML, { url: "http://localhost/" });
  initSearch(dom.window.document, 1);
  return dom;
}

function input(dom) {
  return dom.window.document.getElementById("search-input");
}

function clearButton(dom) {
  return dom.window.document.getElementById("clear-search");
}

/** Sets the input value and fires the input event (debounce coalesces). */
function type(dom, value) {
  input(dom).value = value;
  input(dom).dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}

/** Waits out the debounce window. */
function settle(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function items(dom) {
  return [...dom.window.document.querySelectorAll("li.item")];
}

function itemByText(dom, text) {
  return items(dom).find((li) => li.textContent.trim() === text);
}

/** Finds an item by its article text; the li textContent would include any
 *  reasoning-note popover text, so note-bearing items must use this. */
function itemByArticle(dom, text) {
  return items(dom).find(
    (li) => li.querySelector(".item-text")?.textContent.trim() === text,
  );
}

function sectionByCategory(dom, category) {
  return dom.window.document.querySelector(
    `section[data-category="${category}"]`,
  );
}

function visibleItems(dom) {
  return items(dom).filter((li) => !li.classList.contains("hidden"));
}

function hiddenItems(dom) {
  return items(dom).filter((li) => li.classList.contains("hidden"));
}

// --- normalizeQuery (§7.2.1) ------------------------------------------------

test("normalizeQuery lowercases and trims", () => {
  assert.equal(normalizeQuery("  LØK  "), "løk");
  assert.equal(normalizeQuery("  "), "");
  assert.equal(normalizeQuery("Melk"), "melk");
  assert.equal(normalizeQuery(""), "");
});

// --- matching (§7.2) --------------------------------------------------------

test("matching is case-insensitive substring containment", async () => {
  const dom = setup();
  type(dom, "BANAN");
  await settle();

  assert.ok(!itemByText(dom, "Banan, umoden").classList.contains("hidden"));
  assert.ok(
    !itemByText(dom, "Banan i biter (15 stk)").classList.contains("hidden"),
  );
  assert.ok(itemByText(dom, "Appelsin").classList.contains("hidden"));
});

test("portion notes participate in matching", async () => {
  const dom = setup();
  type(dom, "15 stk");
  await settle();

  // The amount only appears in the portion note, not the article name.
  assert.ok(
    !itemByText(dom, "Banan i biter (15 stk)").classList.contains("hidden"),
  );
  assert.ok(itemByText(dom, "Banan, umoden").classList.contains("hidden"));
});

// --- note affordance (§7.2.3, §7.5, deviation 17) ------------------------------

test("a note-only match bolds the matched terms inside the popover", async () => {
  const dom = setup();
  type(dom, "surdeigsbrød");
  await settle();

  const item = itemByArticle(dom, "Brød, surdeig, spelt");
  assert.ok(item, "note-bearing item is present");
  assert.ok(!item.classList.contains("hidden"), "note-only match reveals item");
  assert.ok(
    item.querySelector(".note-toggle").classList.contains("is-match"),
    "matched glyph flips to the checked state",
  );
  const popover = item.querySelector(".note-popover");
  const marks = popover.querySelectorAll("b.item-highlight");
  assert.equal(marks.length, 1);
  // Case-insensitive matching keeps the note's original casing.
  assert.equal(marks[0].textContent, "Surdeigsbrød");

  // The other note's popover stays plain.
  const other = itemByArticle(dom, "Cornflakes, glutenfri").querySelector(
    ".note-popover",
  );
  assert.equal(other.querySelectorAll("b.item-highlight").length, 0);
});

test("clearing the search restores the plain popover text and glyph", async () => {
  const dom = setup();
  type(dom, "surdeigsbrød");
  await settle();

  const item = itemByArticle(dom, "Brød, surdeig, spelt");
  const popover = item.querySelector(".note-popover");
  const button = item.querySelector(".note-toggle");
  const origText = popover.textContent.trim();

  clearButton(dom).click();
  await settle();

  assert.equal(popover.innerHTML, origText);
  assert.equal(popover.querySelectorAll("b.item-highlight").length, 0);
  assert.ok(!button.classList.contains("is-match"));
});

test("a search run never disturbs the popover's open/pinned state", async () => {
  const dom = setup();
  const item = itemByArticle(dom, "Brød, surdeig, spelt");
  const button = item.querySelector(".note-toggle");
  const popover = item.querySelector(".note-popover");
  // Simulate the pinned state that note-popover.js owns (§7.5).
  button.dataset.pinned = "1";
  popover.hidden = false;
  button.setAttribute("aria-expanded", "true");

  type(dom, "surdeigsbrød");
  await settle();

  assert.ok(!popover.hidden, "popover stays open while the query matches");
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(popover.querySelectorAll("b.item-highlight").length, 1);

  clearButton(dom).click();
  await settle();

  assert.ok(!popover.hidden, "popover stays open after the query clears");
  assert.equal(button.getAttribute("aria-expanded"), "true");
});

test("a heading match reveals the whole section", async () => {
  const dom = setup();
  type(dom, "saus");
  await settle();

  const section = sectionByCategory(dom, "saus");
  assert.ok(!section.classList.contains("hidden"));
  // All 44 items of §11 stay visible, even non-matching ones. The only
  // other match is "Vaniljesaus" in §4, so exactly one item is visible
  // outside §11.
  assert.equal(visibleItems(dom).length, 45);
  assert.equal(section.querySelectorAll("li.item").length, 44);
  assert.ok(!itemByText(dom, "Vaniljesaus").classList.contains("hidden"));
  // Sections without any match disappear.
  assert.ok(sectionByCategory(dom, "brød").classList.contains("hidden"));
  assert.ok(sectionByCategory(dom, "drikke").classList.contains("hidden"));
});

test('no diacritic folding: "lok" does not match "Løk", "løk" does', async () => {
  const dom = setup();
  type(dom, "lok");
  await settle();

  const lokItem = itemByText(dom, "Løk");
  assert.ok(lokItem.classList.contains("hidden"));
  assert.ok(sectionByCategory(dom, "grønnsaker").classList.contains("hidden"));

  type(dom, "løk");
  await settle();
  assert.ok(!lokItem.classList.contains("hidden"));
});

// --- highlighting (§7.2.3, §7.2.4) -------------------------------------------

test("item emphasis highlights every occurrence", async () => {
  const dom = setup();
  type(dom, "og");
  await settle();

  const item = itemByText(
    dom,
    "Brus med og uten sukker og uten fruktkonsentrat",
  );
  const marks = item.querySelectorAll("b.item-highlight");
  assert.equal(marks.length, 2);
  assert.equal(marks[0].textContent, "og");
});

test("heading markers never wrap icon markup", async () => {
  const dom = setup();
  type(dom, "krydder");
  await settle();

  const heading = sectionByCategory(dom, "krydder").querySelector(
    ".category-heading",
  );
  assert.equal(heading.querySelectorAll(".marker").length, 1);
  assert.ok(heading.querySelector(".marker .category-icon") === null);
  // The icon span itself is untouched.
  assert.equal(heading.querySelector(".category-icon").textContent, "🌶️");
});

test("restore on clear returns exact original markup", async () => {
  const dom = setup();
  type(dom, "sukker");
  await settle();

  const item = itemByText(dom, "Sukker, palme");
  assert.ok(!item.classList.contains("hidden"));
  const heading = sectionByCategory(dom, "sukker").querySelector(
    ".category-heading",
  );
  assert.equal(heading.querySelectorAll(".marker").length, 1);

  clearButton(dom).click();
  await settle();

  assert.equal(
    item.querySelector(".item-text").innerHTML,
    item.dataset.origText,
  );
  assert.equal(heading.innerHTML, heading.dataset.origHtml);
  assert.equal(items(dom).length, visibleItems(dom).length);
  assert.equal(hiddenItems(dom).length, 0);
  assert.ok(
    sectionByCategory(dom, "sukker").classList.contains("hidden") === false,
  );
});

// --- visibility transitions (§7.2.5–7.2.8) ------------------------------------

test("a sub-group heading match reveals its list and highlights the heading", async () => {
  const dom = setup();
  type(dom, "sjømat");
  await settle();

  const section = sectionByCategory(dom, "pålegg");
  assert.ok(!section.classList.contains("hidden"));

  const group = [...section.querySelectorAll(".sub-group-title")].find(
    (h4) => h4.textContent === "Fisk/sjømat",
  );
  // The heading gets the same marker style as a category heading match.
  const marker = group.querySelector(".marker");
  assert.equal(marker.textContent, "sjømat");
  assert.equal(group.innerHTML, 'Fisk/<span class="marker">sjømat</span>');

  // Every product under the matched heading stays visible, plus the
  // §8 UNNGÅ item "Sjømatpålegg med løk/hvitløk" which contains the term.
  for (const product of [
    "Kaviar/kaviarmix (Mills)",
    "Laks (gravet og røkt)",
    "Tunfisk",
  ]) {
    assert.ok(!itemByText(dom, product).classList.contains("hidden"));
  }
  assert.equal(visibleItems(dom).length, 9);

  // Products and headings outside the matched list collapse.
  assert.ok(itemByText(dom, "Bacon").classList.contains("hidden"));
  for (const h4 of section.querySelectorAll(".sub-group-title")) {
    if (h4.textContent !== "Fisk/sjømat") {
      assert.ok(h4.classList.contains("hidden"), h4.textContent);
    }
  }

  // Both columns with a match keep their labels (SPIS via the heading
  // match, UNNGÅ via its own item match), and neither cell collapses on
  // narrow (deviation 14); the placeholder column is never marked.
  const cols = section.querySelectorAll(".content-col");
  assert.ok(!cols[0].querySelector(".role-label").classList.contains("hidden"));
  assert.ok(!cols[2].querySelector(".role-label").classList.contains("hidden"));
  for (const col of cols) {
    assert.ok(!col.classList.contains("col-empty-mobile"));
  }

  // Restore on clear returns the exact original heading markup.
  clearButton(dom).click();
  await settle();
  assert.equal(group.innerHTML, group.dataset.origHtml);
  assert.ok(!group.classList.contains("hidden"));
  assert.equal(visibleItems(dom).length, items(dom).length);
});

test("sub-group headings and mobile labels collapse without matches", async () => {
  const dom = setup();
  type(dom, "tempeh");
  await settle();

  const section = sectionByCategory(dom, "grønnsaker");
  assert.ok(!section.classList.contains("hidden"));
  const cols = section.querySelectorAll(".content-col");
  // SPIS column: its sub-group has a visible item (Tempeh) -> heading stays.
  const spisGroup = cols[0].querySelector(".sub-group-title");
  assert.ok(!spisGroup.classList.contains("hidden"));
  // UNNGÅ column: no matches -> label and sub-group heading collapse.
  assert.ok(cols[2].querySelector(".role-label").classList.contains("hidden"));
  assert.ok(
    cols[2].querySelector(".sub-group-title").classList.contains("hidden"),
  );
  // Below 768 px the whole empty cell collapses instead of leaving a
  // wasted tinted strip (deviation 14): the matcher marks the column and
  // the executor toggles the narrow-only class.
  assert.ok(
    !cols[0].classList.contains("col-empty-mobile"),
    "SPIS keeps its match and its cell",
  );
  assert.ok(
    cols[2].classList.contains("col-empty-mobile"),
    "UNNGÅ collapses on narrow",
  );
});

test("empty columns collapse on narrow and return as soon as they have content", async () => {
  const dom = setup();
  const section = sectionByCategory(dom, "grønnsaker");
  const cols = section.querySelectorAll(".content-col");
  const colClass = "col-empty-mobile";

  // "tempeh" matches only the SPIS column (§7.2.5, deviation 14).
  type(dom, "tempeh");
  await settle();
  assert.ok(!cols[0].classList.contains(colClass), "SPIS keeps its match");
  assert.ok(cols[1].classList.contains(colClass), "BEGRENSE collapses");
  assert.ok(cols[2].classList.contains(colClass), "UNNGÅ collapses");

  // "løk" matches SPIS (Gressløk, Syltet løk, Vårløk) and UNNGÅ (Løk,
  // Hvitløk, Sjalottløk, Vårløk): the UNNGÅ cell returns with content,
  // the still-empty BEGRENSE cell stays collapsed.
  type(dom, "løk");
  await settle();
  assert.ok(!cols[0].classList.contains(colClass), "SPIS matches løk items");
  assert.ok(cols[1].classList.contains(colClass), "BEGRENSE stays collapsed");
  assert.ok(!cols[2].classList.contains(colClass), "UNNGÅ returns with Løk");

  // A category heading match reveals the whole section: no column in it
  // collapses, even though individual items do not match.
  type(dom, "saus");
  await settle();
  for (const col of sectionByCategory(dom, "saus").querySelectorAll(
    ".content-col",
  )) {
    assert.ok(
      !col.classList.contains(colClass),
      "heading match keeps every column",
    );
  }

  // Clearing restores the original layout: no column stays collapsed.
  clearButton(dom).click();
  await settle();
  for (const col of dom.window.document.querySelectorAll(".content-col")) {
    assert.ok(!col.classList.contains(colClass), "clear restores all columns");
  }
});

test("sections with no matches anywhere are hidden entirely", async () => {
  const dom = setup();
  type(dom, "whisky");
  await settle();

  assert.ok(!sectionByCategory(dom, "drikke").classList.contains("hidden"));
  for (const category of [
    "brød",
    "grønnsaker",
    "frukt",
    "melk",
    "nøtter",
    "kjøtt",
    "pålegg",
    "sukker",
    "krydder",
    "saus",
  ]) {
    assert.ok(
      sectionByCategory(dom, category).classList.contains("hidden"),
      category,
    );
  }
});

test("empty placeholder columns are never touched", async () => {
  const dom = setup();
  type(dom, "egg");
  await settle();

  const emptyCols = dom.window.document.querySelectorAll(
    ".content-col[data-placeholder]",
  );
  // Kjøtt (2), Pålegg (1), Krydder (1), and Nøtter (1, empty after the
  // 2025-05 moves) §5.7.
  assert.equal(emptyCols.length, 5);
  for (const col of emptyCols) {
    // Placeholders carry the positional role (for the tint) but never
    // search state: no hidden toggle, no items, no mobile label, and no
    // narrow collapse marker (deviation 14).
    assert.ok(col.dataset.role, "placeholder carries the positional role");
    assert.ok(!col.classList.contains("hidden"));
    assert.ok(!col.classList.contains("col-empty-mobile"));
    assert.equal(col.querySelectorAll("li.item").length, 0);
    assert.equal(col.querySelector(".role-label"), null);
  }
});

// --- special inputs (§13.1) --------------------------------------------------

test("regex metacharacters in the query are inert", async () => {
  const dom = setup();
  type(dom, "(1 ss)");
  await settle();

  assert.ok(
    !itemByText(dom, "Sirup, Kokos/treacle (1 ss)").classList.contains(
      "hidden",
    ),
  );
  // "(1 ss)" is not a substring of "(mer enn 1 ss)", so the parens stay
  // literal and this item stays hidden.
  assert.ok(
    itemByText(dom, "Pesto (mer enn 1 ss)").classList.contains("hidden"),
  );

  type(dom, "b[r]");
  await settle();
  assert.equal(visibleItems(dom).length, 0);
});

test("queries with spaces and uppercase behave like trimmed input", async () => {
  const dom = setup();
  type(dom, "  MILK  ");
  await settle();
  // No English "milk" anywhere; everything must hide without crashing.
  assert.equal(visibleItems(dom).length, 0);

  type(dom, "  linfrø ");
  await settle();
  assert.ok(!itemByText(dom, "Linfrø").classList.contains("hidden"));
});

// --- clear control (§7.1) ----------------------------------------------------

test("clear control toggles visibility and returns focus", async () => {
  const dom = setup();
  assert.ok(clearButton(dom).classList.contains("hidden"));

  type(dom, "whisky");
  await settle();
  assert.ok(!clearButton(dom).classList.contains("hidden"));

  clearButton(dom).click();
  await settle();
  assert.ok(clearButton(dom).classList.contains("hidden"));
  assert.equal(input(dom).value, "");
  assert.equal(dom.window.document.activeElement, input(dom));
});

// --- Escape key (§7.1) -------------------------------------------------------

test("Escape clears the search and keeps focus on the input", async () => {
  const dom = setup();
  type(dom, "whisky");
  await settle();
  assert.ok(!clearButton(dom).classList.contains("hidden"));

  input(dom).focus();
  input(dom).dispatchEvent(
    new dom.window.KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    }),
  );
  await settle();

  assert.equal(input(dom).value, "");
  assert.ok(clearButton(dom).classList.contains("hidden"));
  assert.equal(visibleItems(dom).length, items(dom).length);
  assert.equal(dom.window.document.activeElement, input(dom));
});

test("Escape with an empty query moves focus to the input and changes nothing else", async () => {
  const dom = setup();
  dom.window.document.body.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    }),
  );
  await settle();
  assert.equal(input(dom).value, "");
  assert.equal(visibleItems(dom).length, items(dom).length);
  assert.equal(dom.window.document.activeElement, input(dom));
});

test("Escape outside the input clears the search and moves focus to it", async () => {
  const dom = setup();
  type(dom, "whisky");
  await settle();

  dom.window.document.body.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    }),
  );
  await settle();
  assert.equal(input(dom).value, "");
  assert.ok(clearButton(dom).classList.contains("hidden"));
  assert.equal(visibleItems(dom).length, items(dom).length);
  assert.equal(dom.window.document.activeElement, input(dom));
});

// --- reload boot state (§7.1, §9.3) ----------------------------------------------

test("on boot the search field is cleared even if the browser restored a value", () => {
  // Browsers restore typed form values on reload, but the filter state is
  // never persisted, so a restored query would show a filled field over an
  // unfiltered, fully visible page. Boot must always start from IDLE.
  const dom = new JSDOM(APP_HTML, { url: "http://localhost/" });
  const inputEl = input(dom);
  inputEl.value = "whisky"; // simulate browser form-state restoration
  initSearch(dom.window.document, 1);

  assert.equal(inputEl.value, "");
  assert.equal(visibleItems(dom).length, items(dom).length);
  assert.ok(clearButton(dom).classList.contains("hidden"));
});

// --- debounce (§9.5) ----------------------------------------------------------

test("rapid input coalesces into a single debounced run", async () => {
  const dom = setup();
  type(dom, "egg");
  type(dom, "cashew");
  await settle();

  // Only the final query took effect.
  assert.ok(sectionByCategory(dom, "kjøtt").classList.contains("hidden"));
  assert.ok(!itemByText(dom, "Cashewnøtter").classList.contains("hidden"));
});

// --- scroll blur (§9.5) ------------------------------------------------------

test("scrolling past 50 px while focused blurs the input", async () => {
  const dom = setup();
  Object.defineProperty(dom.window, "scrollY", {
    value: 100,
    configurable: true,
  });
  input(dom).focus();
  dom.window.dispatchEvent(new dom.window.Event("scroll"));
  assert.notEqual(dom.window.document.activeElement, input(dom));
});

test("a scroll caused by the filter's layout change does not blur the input", async () => {
  // Filtering hides sections, which collapses the page height. The browser
  // clamps the scroll position and fires a scroll event — if the page was
  // scrolled past 50 px, that event would steal focus from the input right
  // after the user's first keystroke. Only user scrolls may blur.
  const dom = setup();
  Object.defineProperty(dom.window, "scrollY", {
    value: 100,
    configurable: true,
  });
  input(dom).focus();
  type(dom, "egg");
  await settle(); // debounce fires -> plan applied -> layout would collapse

  dom.window.dispatchEvent(new dom.window.Event("scroll"));
  assert.equal(
    dom.window.document.activeElement,
    input(dom),
    "input must keep focus after a filter-triggered scroll event",
  );
});

// --- idempotence (§9.4) ------------------------------------------------------

test("re-applying the same query yields the same document state", async () => {
  const dom = setup();
  type(dom, "sirup");
  await settle();
  const first = itemByText(dom, "Sirup, glukose").innerHTML;

  type(dom, "siru");
  await settle();
  type(dom, "sirup");
  await settle();
  assert.equal(itemByText(dom, "Sirup, glukose").innerHTML, first);
});

// --- pure matcher without a DOM ----------------------------------------------

test("buildMatcher works on a synthetic capture with no DOM reads", () => {
  const match = buildMatcher();
  const capture = {
    sections: [
      {
        element: null,
        heading: {
          element: null,
          html: "<span>🥕</span> Grønnsaker",
          text: "🥕 Grønnsaker",
        },
        columns: [
          {
            label: null,
            items: [
              { element: null, text: "Løk" },
              { element: null, text: "Gulrot" },
            ],
            subgroups: [],
          },
        ],
      },
    ],
  };

  const plan = match("grønnsaker", capture);
  assert.equal(plan.sections[0].hidden, false);
  assert.ok(plan.sections[0].heading.html.includes("marker"));
  assert.ok(!plan.sections[0].columns[0].items[0].hidden);
  assert.ok(!plan.sections[0].columns[0].items[1].hidden);
  assert.equal(plan.sections[0].columns[0].empty, false);

  const none = match("agurk", capture);
  assert.equal(none.sections[0].hidden, true);
  assert.equal(none.sections[0].columns[0].items[0].hidden, true);
  assert.equal(none.sections[0].columns[0].items[1].hidden, true);
  assert.equal(none.sections[0].columns[0].empty, true);
});
