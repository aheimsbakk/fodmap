/**
 * note-popover.test.js — functional tests of the note popover affordance
 * (BLUEPRINT §7.5).
 *
 * Sets up a minimal DOM with note toggles and popovers, then exercises
 * the hover/pin/click-outside behavior.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { initNotePopover } from "../src/js/note-popover.js";

// Build a minimal page that mirrors the structure the module expects:
// a .note-toggle button followed by a .note-popover sibling.
function createPage() {
  const html = `
    <!DOCTYPE html>
    <html lang="no">
      <body>
        <ul class="item-list">
          <li class="item">
            <span class="item-text">Test item</span>
            <button class="note-toggle" aria-expanded="false"></button>
            <span class="note-popover" hidden>This is a reasoning note.</span>
          </li>
          <li class="item">
            <span class="item-text">Another item</span>
            <button class="note-toggle" aria-expanded="false"></button>
            <span class="note-popover" hidden>Another note.</span>
          </li>
          <li class="item">
            <span class="item-text">No note item</span>
          </li>
        </ul>
      </body>
    </html>
  `;
  return new JSDOM(html, { url: "http://localhost/" });
}

// --- hover behavior (§7.5) --------------------------------------------------

test("hovering the button opens the popover", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.dispatchEvent(new dom.window.MouseEvent("mouseenter", { bubbles: true }));
  assert.equal(pop.hidden, false);
  assert.equal(btn.getAttribute("aria-expanded"), "true");
});

test("hover leave closes the popover", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.dispatchEvent(new dom.window.MouseEvent("mouseenter", { bubbles: true }));
  assert.equal(pop.hidden, false);

  btn.dispatchEvent(new dom.window.MouseEvent("mouseleave", { bubbles: true }));
  assert.equal(pop.hidden, true);
  assert.equal(btn.getAttribute("aria-expanded"), "false");
});

test("hovering the popover keeps it open", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.dispatchEvent(new dom.window.MouseEvent("mouseenter", { bubbles: true }));
  assert.equal(pop.hidden, false);

  // In a real browser, moving from the button to the popover fires
  // mouseleave on the button and mouseenter on the popover. jsdom
  // does not auto-simulate this, so we dispatch both events manually.
  btn.dispatchEvent(new dom.window.MouseEvent("mouseleave", { bubbles: true }));
  pop.dispatchEvent(new dom.window.MouseEvent("mouseenter", { bubbles: true }));
  // Mouse left the button but entered the popover — stays open.
  assert.equal(pop.hidden, false);
});

test("leaving the popover closes it", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.dispatchEvent(new dom.window.MouseEvent("mouseenter", { bubbles: true }));
  assert.equal(pop.hidden, false);

  pop.dispatchEvent(new dom.window.MouseEvent("mouseleave", { bubbles: true }));
  assert.equal(pop.hidden, true);
});

// --- pin behavior (§7.5) ----------------------------------------------------

test("clicking the button pins the popover open", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.click();
  assert.equal(pop.hidden, false);
  assert.equal(btn.getAttribute("aria-expanded"), "true");
});

test("clicking a pinned button unpins and closes it", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.click();
  assert.equal(pop.hidden, false);

  btn.click();
  assert.equal(pop.hidden, true);
  assert.equal(btn.getAttribute("aria-expanded"), "false");
});

test("hover does not close a pinned popover", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.click(); // pin
  assert.equal(pop.hidden, false);

  btn.dispatchEvent(new dom.window.MouseEvent("mouseleave", { bubbles: true }));
  // Still pinned — hover leave should not close it.
  assert.equal(pop.hidden, false);
});

// --- click-outside behavior (§7.5) ------------------------------------------

test("clicking outside a pinned note unpins and closes it", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.click(); // pin
  assert.equal(pop.hidden, false);

  dom.window.document.body.click();
  assert.equal(pop.hidden, true);
  assert.equal(btn.getAttribute("aria-expanded"), "false");
});

test("clicking inside a pinned note does nothing", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop = dom.window.document.querySelectorAll(".note-popover")[0];

  btn.click(); // pin
  assert.equal(pop.hidden, false);

  pop.click();
  assert.equal(pop.hidden, false, "clicking the popover keeps it pinned");
  assert.equal(btn.getAttribute("aria-expanded"), "true");
});

test("clicking the button of a different note pins it without affecting the first", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn1 = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop1 = dom.window.document.querySelectorAll(".note-popover")[0];
  const btn2 = dom.window.document.querySelectorAll(".note-toggle")[1];
  const pop2 = dom.window.document.querySelectorAll(".note-popover")[1];

  btn1.click(); // pin first
  assert.equal(pop1.hidden, false);

  btn2.click(); // pin second — clicking another pinned button is not
  // "outside", so the first note stays pinned (BLUEPRINT §7.5).
  assert.equal(pop1.hidden, false, "first note stays pinned");
  assert.equal(pop2.hidden, false, "second note stays open");
});

// --- no-note items are unaffected -------------------------------------------

test("items without a note toggle are not affected", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const items = [...dom.window.document.querySelectorAll(".item")];
  assert.equal(items.length, 3);
  // The third item has no toggle — no error thrown, no crash.
});

// --- multiple independent toggles -------------------------------------------

test("each toggle manages its own popover independently", () => {
  const dom = createPage();
  initNotePopover(dom.window.document);
  const btn1 = dom.window.document.querySelectorAll(".note-toggle")[0];
  const pop1 = dom.window.document.querySelectorAll(".note-popover")[0];
  const btn2 = dom.window.document.querySelectorAll(".note-toggle")[1];
  const pop2 = dom.window.document.querySelectorAll(".note-popover")[1];

  btn1.click(); // pin first
  assert.equal(pop1.hidden, false);
  assert.equal(pop2.hidden, true);

  btn2.dispatchEvent(
    new dom.window.MouseEvent("mouseenter", { bubbles: true }),
  );
  // Second is shown via hover, first stays pinned.
  assert.equal(pop1.hidden, false);
  assert.equal(pop2.hidden, false);

  btn2.dispatchEvent(
    new dom.window.MouseEvent("mouseleave", { bubbles: true }),
  );
  // Second closes via hover, first stays pinned.
  assert.equal(pop1.hidden, false);
  assert.equal(pop2.hidden, true);
});
