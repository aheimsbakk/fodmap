// build.test.js — data and build pipeline tests (BLUEPRINT §13.4): the
// generated document and token layer reproduce the frozen content inventory
// and the note-button contract (§4.6, §9.3), plus the change markers of the
// newest release (§4.7, §6.6).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { build } from "../scripts/build/build.mjs";

const { html, tokens, cfg } = build();

const sectionCount = (html.match(/<section class="category-section"/g) || [])
  .length;
const itemCount = (html.match(/<li class="item"/g) || []).length;
const markerCount = (kind) =>
  (html.match(new RegExp(`data-change="${kind}"`, "g")) || []).length;
const noteButtons =
  html.match(
    /<button type="button" class="note-toggle"[^>]*>[\s\S]*?<\/button>/g,
  ) || [];

// The release folders feed the bullet tooltips (§6.7): the newest release
// name dates marked items, the baseline dates items untouched since then.
// The inventory is frozen, so the names are constants like the other counts.
const NEWEST_RELEASE = "2025-05";
const BASELINE_RELEASE = "2021";
const fillDate = (template, release) =>
  template.replaceAll("{{date}}", release);

test("renders the §6.5 inventory: 11 sections, 510 items", () => {
  assert.equal(sectionCount, 11);
  assert.equal(itemCount, 510);
});

test("the newest release renders change markers: 29 new, 31 moved, 1 updated (§6.6)", () => {
  assert.equal(markerCount("new"), 29);
  assert.equal(markerCount("moved"), 31);
  assert.equal(markerCount("updated"), 1);
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

test("generated token layer reproduces the config marker glyphs (§4.7)", () => {
  const markers = cfg.page.markers;
  assert.match(tokens, new RegExp(`--marker-default: "${markers.default}"`));
  assert.match(tokens, new RegExp(`--marker-new: "${markers.new}"`));
  assert.match(tokens, new RegExp(`--marker-moved: "${markers.moved}"`));
  assert.match(tokens, new RegExp(`--marker-updated: "${markers.updated}"`));
});

// --- bullet tooltips (§6.7) --------------------------------------------------

test("every item renders a bullet tooltip hotspot with a title", () => {
  const bullets =
    html.match(
      /<span class="item-bullet" aria-hidden="true" title="[^"]*"><\/span>/g,
    ) || [];
  assert.equal(
    bullets.length,
    itemCount,
    "every item li must carry exactly one .item-bullet hotspot",
  );
});

test("default items date from the release that last touched them", () => {
  // The user fixed new and updated to the default wording; the config
  // templates must agree (§6.7).
  assert.equal(
    fillDate(cfg.page.tooltips.new, NEWEST_RELEASE),
    fillDate(cfg.page.tooltips.default, NEWEST_RELEASE),
  );
  assert.equal(
    fillDate(cfg.page.tooltips.updated, NEWEST_RELEASE),
    fillDate(cfg.page.tooltips.default, NEWEST_RELEASE),
  );

  const titleOf = (kind) => {
    const attr = kind ? ` data-change="${kind}"` : "";
    const m = html.match(
      new RegExp(
        `<li class="item"${attr}><span class="item-bullet" aria-hidden="true" title="([^"]+)"`,
      ),
    );
    return m && m[1];
  };
  // Unmarked items show the folder of their newest file: nothing was
  // touched since the baseline, so every one of them says 2021 (§6.7).
  const d = fillDate(cfg.page.tooltips.default, BASELINE_RELEASE);
  assert.equal(
    titleOf(""),
    d,
    "unchanged items use their own last-change date",
  );
  assert.equal(
    (html.match(/title="Dato 2021"/g) || []).length,
    510 - 29 - 31 - 1,
    "all 449 unmarked items date from the baseline",
  );
});

test("new and updated items show the newest release date", () => {
  const d = fillDate(cfg.page.tooltips.default, NEWEST_RELEASE);
  const titleOf = (kind) => {
    const m = html.match(
      new RegExp(
        `<li class="item" data-change="${kind}"><span class="item-bullet" aria-hidden="true" title="([^"]+)"`,
      ),
    );
    return m && m[1];
  };
  assert.equal(titleOf("new"), d);
  assert.equal(titleOf("updated"), d);
});

test("moved items explain the move: from → to, with the catalog date", () => {
  const moved = [
    ...html.matchAll(
      /<li class="item" data-change="moved"><span class="item-bullet" aria-hidden="true" title="([^"]+)"/g,
    ),
  ].map((m) => m[1]);
  assert.equal(moved.length, markerCount("moved"));
  const labels = cfg.groups.map((g) => g.label).join("|");
  const re = new RegExp(
    `^Flyttet fra (${labels}) til (${labels}), dato ${NEWEST_RELEASE}$`,
  );
  for (const t of moved) {
    const m = t.match(re);
    assert.ok(m, `unexpected moved tooltip: ${t}`);
    assert.notEqual(m[1], m[2], "a move must change the group");
  }
});
