/**
 * text-scale.test.js — functional tests of the text-size toggle
 * (BLUEPRINT §7.4, §13.1). The toggle sets one attribute on the root
 * element and lets the stylesheet tokens recompute; jsdom does no layout,
 * so computed sizes are asserted in a real browser, not here.
 */

import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { initSearch } from "../src/js/search.js";
import { initTextScale } from "../src/js/text-scale.js";

const APP_HTML = readFileSync(
  new URL("../src/index.html", import.meta.url),
  "utf8",
);

/** In-memory storage stand-in; survives across "reloads" by design. */
function createStorage(seed = null) {
  const data = new Map(seed ? [[STORAGE_KEY, seed]] : []);
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
  };
}

const STORAGE_KEY = "fodmap-text-scale";

function setup(storage = null) {
  const dom = new JSDOM(APP_HTML, { url: "http://localhost/" });
  initSearch(dom.window.document, 1);
  const level = initTextScale(dom.window.document, storage);
  return { dom, level };
}

function toggleButton(dom) {
  return dom.window.document.getElementById("text-scale-toggle");
}

function levelOf(dom) {
  return dom.window.document.documentElement.dataset.textScale;
}

/** Waits out the search debounce window. */
function settle(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- default state (§7.4) ---------------------------------------------------

test("load with no stored level starts at S100", () => {
  const { dom } = setup();
  assert.equal(levelOf(dom), "100");
  assert.match(toggleButton(dom).title, /100 %/);
});

// --- cycling (§7.4) ---------------------------------------------------------

test("clicking the toggle cycles 100 -> 125 -> 150 -> 100", () => {
  const { dom } = setup();
  const button = toggleButton(dom);

  button.click();
  assert.equal(levelOf(dom), "125");
  button.click();
  assert.equal(levelOf(dom), "150");
  button.click();
  assert.equal(levelOf(dom), "100");
});

test("button title reports the current level", () => {
  const { dom } = setup();
  toggleButton(dom).click();
  assert.match(toggleButton(dom).title, /125 %/);
});

// --- persistence (§10) ------------------------------------------------------

test("the chosen level is written to storage on toggle", () => {
  const storage = createStorage();
  const { dom } = setup(storage);
  toggleButton(dom).click();
  assert.equal(storage.getItem(STORAGE_KEY), "125");
});

test("a stored level is restored at load", () => {
  const storage = createStorage("150");
  const { dom } = setup(storage);
  assert.equal(levelOf(dom), "150");
});

test("an invalid stored level falls back to S100", () => {
  const storage = createStorage("200");
  const { dom } = setup(storage);
  assert.equal(levelOf(dom), "100");
});

test("storage failures degrade to session-only behavior", () => {
  const broken = {
    getItem() {
      throw new Error("storage blocked");
    },
    setItem() {
      throw new Error("storage blocked");
    },
  };
  const { dom } = setup(broken);
  toggleButton(dom).click();
  assert.equal(levelOf(dom), "125");
});

// --- independence from search (§13.1) ----------------------------------------

test("scaling never disturbs an active search and vice versa", async () => {
  const storage = createStorage();
  const { dom } = setup(storage);

  const input = dom.window.document.getElementById("search-input");
  input.value = "BANAN";
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  await settle();

  const hiddenBefore = dom.window.document.querySelectorAll(
    "section[data-category] .hidden",
  ).length;
  assert.ok(hiddenBefore > 0, "search must be active before toggling");

  toggleButton(dom).click();
  assert.equal(levelOf(dom), "125");
  const hiddenAfter = dom.window.document.querySelectorAll(
    "section[data-category] .hidden",
  ).length;
  assert.equal(hiddenAfter, hiddenBefore, "scale must not touch search state");

  const clear = dom.window.document.getElementById("clear-search");
  clear.click();
  await settle();
  assert.equal(levelOf(dom), "125", "clearing search must not reset the level");
});

// --- element identity contract (§9.3) ---------------------------------------

test("a missing toggle button leaves the page inert, no error", () => {
  const dom = new JSDOM(APP_HTML, { url: "http://localhost/" });
  dom.window.document.getElementById("text-scale-toggle").remove();
  assert.doesNotThrow(() =>
    initTextScale(dom.window.document, createStorage()),
  );
  assert.equal(dom.window.document.documentElement.dataset.textScale, "100");
});
