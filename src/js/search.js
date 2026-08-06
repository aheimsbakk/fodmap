/**
 * search.js — boot layer for the FODMAP search engine (BLUEPRINT §7–§9).
 *
 * Imports the pure matcher, the DOM capture, and the executor from their
 * own modules, then wires the search interaction at load time: debounced
 * filtering, the clear control, and the passive scroll-blur rule. Missing
 * optional elements are skipped; a missing input degrades to inert
 * rendering (§9.3).
 */

import { normalizeQuery, buildMatcher } from "./search-engine.js";
import { captureContent } from "./search-capture.js";
import { applyPlan } from "./search-apply.js";

/**
 * Wires the search interaction and boots the engine.
 * @param {Document} document
 * @param {number} [debounceMs=300] — debounce window in milliseconds.
 */
export function initSearch(document, debounceMs = 300) {
  const input = document.getElementById("search-input");
  if (!input) return;

  // Browsers restore typed form values on reload, but the filter state is
  // never persisted, so a restored query would leave text in the field over
  // a fully visible page. Boot always starts from IDLE: any restored value
  // is discarded before the engine captures and wires anything (§7.1).
  input.value = "";

  const clearButton = document.getElementById("clear-search");
  const win = document.defaultView;
  const capture = captureContent(document);
  const match = buildMatcher();
  let debounceId = null;
  // Filtering hides sections, which collapses the page height; the browser
  // clamps the scroll position and fires a scroll event. Within this window
  // after a filter run such events are ignored so they cannot steal focus
  // from the input the user is typing in (§9.5).
  const FILTER_SCROLL_GRACE_MS = 200;
  let lastFilterAt = 0;

  function run(value) {
    const plan = match(value, capture);
    applyPlan(document, plan);
    lastFilterAt = Date.now();
    clearButton?.classList.toggle("hidden", normalizeQuery(value).length === 0);
  }

  input.addEventListener("input", (event) => {
    win.clearTimeout(debounceId);
    debounceId = win.setTimeout(() => run(event.target.value), debounceMs);
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      input.value = "";
      win.clearTimeout(debounceId);
      run("");
      input.focus();
    });
  }

  // Escape anywhere on the page clears the search exactly like the clear
  // control and moves focus to the input, so the next keystroke starts a
  // fresh query no matter where the previous focus was (§7.1). With an
  // empty query it only moves focus; the page state is left untouched.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.repeat) {
      if (input.value !== "") {
        input.value = "";
        win.clearTimeout(debounceId);
        run("");
      }
      input.focus();
    }
  });

  // Blur the input once the user scrolls past 50 px so sticky headings
  // never sit under a focused keyboard on mobile. Scroll events fired
  // within the filter grace window are the layout collapse, not the user.
  win.addEventListener(
    "scroll",
    () => {
      if (
        win.document.activeElement === input &&
        win.scrollY > 50 &&
        Date.now() - lastFilterAt > FILTER_SCROLL_GRACE_MS
      ) {
        input.blur();
      }
    },
    { passive: true },
  );
}

// Boot on load. Module scripts are deferred, so the document is fully
// parsed when this runs; the guard keeps Node test imports side-effect-free.
if (typeof document !== "undefined") {
  initSearch(document);
}
