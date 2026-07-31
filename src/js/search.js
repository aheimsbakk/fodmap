/**
 * search.js — search engine for the FODMAP overview (BLUEPRINT §7–§9).
 *
 * Three parts, one responsibility each:
 *  - normalizeQuery / buildMatcher: pure string logic, testable without a DOM
 *  - applyPlan: executor that writes a matcher plan to the document
 *  - initSearch: load-time capture and event wiring
 *
 * The matcher never reads or writes the document; it only passes element
 * references through from the capture, so re-applying a plan is idempotent
 * and every IDLE render restores the captured originals exactly (§7.3).
 */

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;
const MARKER_CLASS = "marker";
const HIGHLIGHT_CLASS = "item-highlight";

/** Lowercases and trims the raw input value (§7.2.1). */
export function normalizeQuery(value) {
  return value.toLowerCase().trim();
}

function escapeRegExp(term) {
  return term.replace(ESCAPE_REGEX, "\\$&");
}

/**
 * Builds the pure matcher: (query, capture) => visibility/highlight plan.
 * Capture shape (produced by initSearch):
 *   sections: [{ element, heading: { element, html, text },
 *                columns: [{ element, label|null, items: [{ element, text }],
 *                            subgroups: [{ element, items: [text] }] }] }]
 * Plan shape mirrors the capture and carries exact html strings to set.
 */
export function buildMatcher() {
  return function match(query, capture) {
    const q = normalizeQuery(query);
    const active = q.length > 0;

    // Lookahead on heading matches excludes text inside tags, so icon
    // markup is never wrapped in a marker (§7.2.4).
    const headingRegex = active
      ? new RegExp(`(${escapeRegExp(q)})(?![^<]*>)`, "gi")
      : null;
    const itemRegex = active ? new RegExp(`(${escapeRegExp(q)})`, "gi") : null;

    return {
      sections: capture.sections.map((section) => {
        const headingMatch =
          active && section.heading.text.toLowerCase().includes(q);
        const headingHtml = headingMatch
          ? section.heading.html.replace(
              headingRegex,
              `<span class="${MARKER_CLASS}">$1</span>`,
            )
          : section.heading.html;

        const columns = section.columns.map((column) => {
          const items = column.items.map((item) => {
            const itemMatch = active && item.text.toLowerCase().includes(q);
            return {
              element: item.element,
              hidden: active && !itemMatch && !headingMatch,
              html: itemMatch
                ? item.text.replace(
                    itemRegex,
                    `<b class="${HIGHLIGHT_CLASS}">$1</b>`,
                  )
                : item.text,
            };
          });

          // The tinted cell itself is never hidden; only its label
          // and sub-group headings collapse when nothing matches
          // (§7.2.5). Columns without items (empty placeholders)
          // have no label or groups, so they stay untouched.
          const columnHasMatch =
            active && (headingMatch || items.some((item) => !item.hidden));

          return {
            label: column.label,
            labelHidden: active && !columnHasMatch,
            subgroups: column.subgroups.map((group) => ({
              element: group.element,
              hidden:
                active &&
                !headingMatch &&
                !group.items.some((text) => text.toLowerCase().includes(q)),
            })),
            items,
          };
        });

        const sectionHasMatch =
          active &&
          (headingMatch ||
            columns.some((column) =>
              column.items.some((item) => !item.hidden),
            ));

        return {
          element: section.element,
          hidden: active && !sectionHasMatch,
          heading: { element: section.heading.element, html: headingHtml },
          columns,
        };
      }),
    };
  };
}

/** Executor: applies a matcher plan to the document. Performs no string logic. */
export function applyPlan(document, plan) {
  plan.sections.forEach((section) => {
    section.element.classList.toggle("hidden", section.hidden);
    section.heading.element.innerHTML = section.heading.html;
    section.columns.forEach((column) => {
      if (column.label) {
        column.label.classList.toggle("hidden", column.labelHidden);
      }
      column.subgroups.forEach((group) => {
        group.element.classList.toggle("hidden", group.hidden);
      });
      column.items.forEach((item) => {
        item.element.classList.toggle("hidden", item.hidden);
        item.element.innerHTML = item.html;
      });
    });
  });
}

/**
 * Captures every item's plain text and every heading's markup once, at load
 * time, and stores them on data-orig-* attributes for restoration (§7.3).
 */
function captureContent(document) {
  const sections = [];
  document.querySelectorAll("section.category-section").forEach((sectionEl) => {
    const headingEl = sectionEl.querySelector(".category-heading");
    const headingHtml = headingEl.innerHTML;
    headingEl.dataset.origHtml = headingHtml;

    const grid = Array.from(sectionEl.children).find((el) =>
      el.classList.contains("content-grid"),
    );
    const columns = [];
    if (grid) {
      Array.from(grid.children).forEach((colEl) => {
        const labelEl = Array.from(colEl.children).find((el) =>
          el.classList.contains("role-label"),
        );
        const items = [];
        const subgroups = [];
        let activeGroup = null;
        Array.from(colEl.children).forEach((child) => {
          if (child.classList.contains("item-list")) {
            Array.from(child.children).forEach((li) => {
              // Items are authored multi-line for readability; the origin
              // renders them with no surrounding whitespace, so trim.
              const text = li.textContent.trim();
              li.dataset.origText = text;
              items.push({ element: li, text });
              if (activeGroup) activeGroup.items.push(text);
            });
          } else if (child.classList.contains("sub-group-title")) {
            activeGroup = { element: child, items: [] };
            subgroups.push(activeGroup);
          }
        });
        columns.push({ element: colEl, label: labelEl, items, subgroups });
      });
    }
    sections.push({
      element: sectionEl,
      heading: {
        element: headingEl,
        html: headingHtml,
        text: headingEl.textContent,
      },
      columns,
    });
  });
  return sections;
}

/**
 * Wires the search interaction: debounced filtering, the clear control, and
 * the passive scroll-blur rule (§7.1, §9.5). Missing optional elements are
 * skipped; a missing input degrades the page to inert rendering (§9.3).
 */
export function initSearch(document, debounceMs = 300) {
  const input = document.getElementById("search-input");
  if (!input) return;

  const clearButton = document.getElementById("clear-search");
  const win = document.defaultView;
  const capture = { sections: captureContent(document) };
  const match = buildMatcher();
  let debounceId = null;

  function run(value) {
    const plan = match(value, capture);
    applyPlan(document, plan);
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

  // Blur the input once the user scrolls past 50 px so sticky headings
  // never sit under a focused keyboard on mobile.
  win.addEventListener(
    "scroll",
    () => {
      if (win.document.activeElement === input && win.scrollY > 50) {
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
