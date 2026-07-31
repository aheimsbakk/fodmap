/**
 * search.test.js — functional tests of the search engine (BLUEPRINT §13.1).
 * Pure matcher behavior is tested through the real src/index.html in jsdom,
 * which also exercises the element identity contract (§9.3) end to end.
 */

import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { normalizeQuery, buildMatcher, initSearch } from "../src/js/search.js";

const APP_HTML = readFileSync(
  new URL("../src/index.html", import.meta.url),
  "utf8",
);

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
  return items(dom).find((li) => li.textContent === text);
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
  type(dom, "40 gram");
  await settle();

  assert.ok(
    !itemByText(
      dom,
      "Blåbær, amerikanske og hvite inni (40 gram)",
    ).classList.contains("hidden"),
  );
  assert.ok(itemByText(dom, "Kinakål (75 gram)").classList.contains("hidden"));
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
  assert.ok(sectionByCategory(dom, "brod").classList.contains("hidden"));
  assert.ok(sectionByCategory(dom, "drikke").classList.contains("hidden"));
});

test('no diacritic folding: "lok" does not match "Løk", "løk" does', async () => {
  const dom = setup();
  type(dom, "lok");
  await settle();

  const lokItem = itemByText(dom, "Løk");
  assert.ok(lokItem.classList.contains("hidden"));
  assert.ok(sectionByCategory(dom, "gronnsaker").classList.contains("hidden"));

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

  assert.equal(item.innerHTML, item.dataset.origText);
  assert.equal(heading.innerHTML, heading.dataset.origHtml);
  assert.equal(items(dom).length, visibleItems(dom).length);
  assert.equal(hiddenItems(dom).length, 0);
  assert.ok(
    sectionByCategory(dom, "sukker").classList.contains("hidden") === false,
  );
});

// --- visibility transitions (§7.2.5–7.2.8) ------------------------------------

test("sub-group headings and mobile labels collapse without matches", async () => {
  const dom = setup();
  type(dom, "tempeh");
  await settle();

  const section = sectionByCategory(dom, "gronnsaker");
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
  // The tinted cells themselves never hide.
  assert.ok(!cols[0].classList.contains("hidden"));
  assert.ok(!cols[2].classList.contains("hidden"));
});

test("sections with no matches anywhere are hidden entirely", async () => {
  const dom = setup();
  type(dom, "whisky");
  await settle();

  assert.ok(!sectionByCategory(dom, "drikke").classList.contains("hidden"));
  for (const category of [
    "brod",
    "gronnsaker",
    "frukt",
    "melk",
    "notter",
    "kjott",
    "palegg",
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
    '.content-col[data-role="empty"]',
  );
  assert.equal(emptyCols.length, 4);
  for (const col of emptyCols) {
    assert.ok(!col.classList.contains("hidden"));
    assert.equal(col.querySelectorAll("li.item").length, 0);
    assert.equal(col.querySelector(".role-label"), null);
  }
});

// --- special inputs (§13.1) --------------------------------------------------

test("regex metacharacters in the query are inert", async () => {
  const dom = setup();
  type(dom, "(1 ss)");
  await settle();

  assert.ok(!itemByText(dom, "Tranebær (1 ss)").classList.contains("hidden"));
  assert.ok(
    !itemByText(dom, "Sirup, Kokos/treacle (1 ss)").classList.contains(
      "hidden",
    ),
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

// --- debounce (§9.5) ----------------------------------------------------------

test("rapid input coalesces into a single debounced run", async () => {
  const dom = setup();
  type(dom, "egg");
  type(dom, "cashew");
  await settle();

  // Only the final query took effect.
  assert.ok(sectionByCategory(dom, "kjott").classList.contains("hidden"));
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

  const none = match("agurk", capture);
  assert.equal(none.sections[0].hidden, true);
  assert.equal(none.sections[0].columns[0].items[0].hidden, true);
  assert.equal(none.sections[0].columns[0].items[1].hidden, true);
});
