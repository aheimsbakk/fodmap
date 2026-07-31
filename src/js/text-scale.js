/**
 * text-scale.js — text-size toggle for the FODMAP overview (BLUEPRINT §7.4).
 *
 * One responsibility: cycle the content text size through 100 % / 125 % /
 * 150 % and remember the choice. The state is a single attribute
 * (data-text-scale on the root element); the stylesheet tokens recompute
 * from it, so this module never touches layout or content text.
 *
 * Storage failures (private mode, blocked cookies) degrade to
 * session-only behavior: the toggle works, the choice is not remembered.
 */

const LEVELS = ["100", "125", "150"];
const STORAGE_KEY = "fodmap-text-scale";

/**
 * Applies the restored level and wires the toggle button. The root element
 * always carries the state; only the click wiring depends on the button,
 * so a missing control degrades to an inert page (§9.3).
 * @param {Document} document
 * @param {{ getItem(string): string|null, setItem(string, string): void } | null} storage
 *   Override for tests; defaults to the window's localStorage when usable.
 * @returns {string} the level active after restore ("100" | "125" | "150").
 */
export function initTextScale(document, storage = null) {
  const win = document.defaultView;
  const store =
    storage ??
    (() => {
      try {
        return win.localStorage;
      } catch {
        return null; // opaque origin or blocked storage: session-only
      }
    })();

  function restoreLevel() {
    try {
      const saved = store.getItem(STORAGE_KEY);
      return LEVELS.includes(saved) ? saved : "100";
    } catch {
      return "100";
    }
  }

  const button = document.getElementById("text-scale-toggle");
  function apply(level) {
    document.documentElement.dataset.textScale = level;
    if (button) button.title = `Tekststørrelse: ${level} %`;
  }

  let level = restoreLevel();
  apply(level);
  if (!button) return level;

  button.addEventListener("click", () => {
    level = LEVELS[(LEVELS.indexOf(level) + 1) % LEVELS.length];
    apply(level);
    try {
      store.setItem(STORAGE_KEY, level);
    } catch {
      // Session-only: the level applies now but is not remembered.
    }
  });

  return level;
}

// Boot on load. Module scripts are deferred, so the document is fully
// parsed when this runs; the guard keeps Node test imports side-effect-free.
if (typeof document !== "undefined") {
  initTextScale(document);
}
