// note-popover.js — (i) affordance on items with a reasoning note.
// Show the note on hover; on a mouse move away (or clicking outside) close it.
// A click "pins" the note open; clicking outside unpins and closes it.
//
// Accepts an optional document parameter for testability; when called
// without arguments it wires itself on the current document (BLUEPRINT §7.5).

/**
 * Wires the note-popover affordance on all .note-toggle buttons.
 * @param {Document} [doc=document] — document to query; defaults to the
 *   current document so the module self-boot in the browser.
 */
export function initNotePopover(doc = globalThis.document) {
  const toggles = Array.from(doc.querySelectorAll(".note-toggle"));

  // Track which toggles are pinned so the global click handler can check
  // efficiently without re-querying the DOM.
  const pinned = new WeakSet();

  for (const btn of toggles) {
    const pop = btn.nextElementSibling;

    const open = () => {
      pop.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      pop.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pinned.has(btn)) {
        pinned.delete(btn);
        close();
      } else {
        pinned.add(btn);
        open();
      }
    });

    // Hover open/close unless the note is pinned by a click.
    btn.addEventListener("mouseenter", () => {
      if (!pinned.has(btn)) open();
    });
    btn.addEventListener("mouseleave", () => {
      if (!pinned.has(btn)) close();
    });
    pop.addEventListener("mouseenter", () => {
      if (!pinned.has(btn)) open();
    });
    pop.addEventListener("mouseleave", () => {
      if (!pinned.has(btn)) close();
    });
  }

  // Clicking anywhere outside a pinned note unpins and closes it.
  // Uses event delegation: if the click target is not inside any pinned
  // toggle/popover pair, close all pinned notes. O(1) per click because
  // pinned is a WeakSet, not a DOM query.
  doc.addEventListener("click", (e) => {
    for (const btn of toggles) {
      if (!pinned.has(btn)) continue;
      const pop = btn.nextElementSibling;
      if (!btn.contains(e.target) && !pop.contains(e.target)) {
        pinned.delete(btn);
        pop.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    }
  });
}

// Boot on load. Module scripts are deferred, so the document is fully
// parsed when this runs; the guard keeps Node test imports side-effect-free.
// Use window.document (not globalThis.document) to avoid matching a
// jsdom document leaked into the Node global scope.
if (typeof window !== "undefined" && window.document) {
  initNotePopover(window.document);
}
