// build.test.js — data and build pipeline tests (BLUEPRINT §13.4): the
// generated document and token layer reproduce the frozen content inventory
// and the note-button contract (§4.6, §9.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { build } from "../scripts/build/build.mjs";

const { html, tokens, cfg } = build();

const sectionCount = (html.match(/<section class="category-section"/g) || [])
  .length;
const itemCount = (html.match(/<li class="item"/g) || []).length;
const noteButtons =
  html.match(
    /<button type="button" class="note-toggle"[^>]*>[\s\S]*?<\/button>/g,
  ) || [];

test("renders the §6.5 inventory: 11 sections, 484 items", () => {
  assert.equal(sectionCount, 11);
  assert.equal(itemCount, 484);
});

test("renders the six stylesheet layers and three module scripts", () => {
  for (const href of [
    "css/tokens.css",
    "css/base.css",
    "css/layout.css",
    "css/components.css",
    "css/roles.css",
    "css/utilities.css",
  ]) {
    assert.ok(html.includes(`href="${href}"`), `missing stylesheet ${href}`);
  }
  for (const src of [
    "js/search.js",
    "js/text-scale.js",
    "js/note-popover.js",
  ]) {
    assert.ok(html.includes(`src="${src}"`), `missing script ${src}`);
  }
});

test("note buttons are empty: the glyph lives in CSS tokens, not markup (§4.6)", () => {
  assert.ok(
    noteButtons.length > 0,
    "data/2021 should contain items with reasoning notes",
  );
  for (const b of noteButtons) {
    assert.match(b, /aria-label="Mer informasjon"/);
    assert.ok(!/data-emoji/.test(b), "button must not carry data-emoji attrs");
    const text = b.replace(/<[^>]*>/g, "").trim();
    assert.equal(text, "", "button must have no live text node");
  }
});

test("generated token layer reproduces the config info glyphs (§4.6)", () => {
  const info = cfg.page["info-button"];
  assert.match(tokens, new RegExp(`--info-emoji: "${info["emoji"]}"`));
  assert.match(
    tokens,
    new RegExp(`--info-emoji-matched: "${info["emoji-matched"]}"`),
  );
});
