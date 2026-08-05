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
 *                columns: [{ element, placeholder, label|null,
 *                            items: [{ element, text, group|null }],
 *                            subgroups: [{ element, html, text,
 *                            items: [text] }] }] }]
 * Plan shape mirrors the capture and carries exact html strings to set.
 */
export function buildMatcher() {
  return function match(query, capture) {
    const q = normalizeQuery(query);
    const active = q.length > 0;

    // Lookahead on heading matches excludes text inside tags, so icon
    // markup is never wrapped in a marker (§7.2.4).
    const markupRegex = active
      ? new RegExp(`(${escapeRegExp(q)})(?![^<]*>)`, "gi")
      : null;
    const itemRegex = active ? new RegExp(`(${escapeRegExp(q)})`, "gi") : null;

    return {
      sections: capture.sections.map((section) => {
        const headingMatch =
          active && section.heading.text.toLowerCase().includes(q);
        const headingHtml = headingMatch
          ? section.heading.html.replace(
              markupRegex,
              `<span class="${MARKER_CLASS}">$1</span>`,
            )
          : section.heading.html;

        const columns = section.columns.map((column) => {
          // A sub-group match reveals its whole list, like a category
          // heading match reveals its section (§7.2.6).
          const groupMatches = new Map(
            column.subgroups.map((group) => [
              group,
              active && group.text.toLowerCase().includes(q),
            ]),
          );
          const subgroups = column.subgroups.map((group) => {
            const groupMatch = groupMatches.get(group);
            return {
              element: group.element,
              html: groupMatch
                ? group.html.replace(
                    markupRegex,
                    `<span class="${MARKER_CLASS}">$1</span>`,
                  )
                : group.html,
              hidden:
                active &&
                !headingMatch &&
                !groupMatch &&
                !group.items.some((text) => text.toLowerCase().includes(q)),
            };
          });

          const items = column.items.map((item) => {
            // An item matches on its article text or its reasoning note; a
            // note-only match shows the info button as "matched" (☑️).
            const nameMatch = active && item.text.toLowerCase().includes(q);
            const noteMatch =
              active && !!(item.note && item.note.toLowerCase().includes(q));
            const groupMatch = item.group
              ? groupMatches.get(item.group)
              : false;
            return {
              element: item.element,
              article: item.article,
              button: item.button,
              popover: item.popover,
              hidden:
                active &&
                !nameMatch &&
                !noteMatch &&
                !headingMatch &&
                !groupMatch,
              html: nameMatch
                ? item.text.replace(
                    itemRegex,
                    `<b class="${HIGHLIGHT_CLASS}">$1</b>`,
                  )
                : item.text,
              // A note-only match bolds the terms inside the popover; any
              // other state restores the original plain text (§7.5).
              noteHtml: noteMatch
                ? item.noteHtml.replace(
                    itemRegex,
                    `<b class="${HIGHLIGHT_CLASS}">$1</b>`,
                  )
                : item.noteHtml,
              noteMatch,
            };
          });

          // On narrow the whole cell collapses when nothing in it
          // matches; wide+ keeps the tinted cell for the 3-column
          // rhythm. Placeholder columns are never marked (§7.2.5,
          // deviation 14).
          const columnHasMatch =
            active && (headingMatch || items.some((item) => !item.hidden));
          const empty = active && !column.placeholder && !columnHasMatch;

          return {
            element: column.element,
            empty,
            label: column.label,
            labelHidden: active && !columnHasMatch,
            subgroups,
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
      // Narrow-only collapse: the class is inert from 768 px up, so wide+
      // always keeps the tinted cell (deviation 14). Idempotent per plan.
      column.element.classList.toggle("col-empty-mobile", column.empty);
      if (column.label) {
        column.label.classList.toggle("hidden", column.labelHidden);
      }
      column.subgroups.forEach((group) => {
        group.element.classList.toggle("hidden", group.hidden);
        group.element.innerHTML = group.html;
      });
      column.items.forEach((item) => {
        item.element.classList.toggle("hidden", item.hidden);
        // Only the article text span is re-rendered; the note button and
        // popover are untouched siblings, so the popover's open/pinned
        // state survives filtering (§7.5). The popover's content is
        // re-rendered from the plan so a note-only match can bold terms.
        if (item.article) item.article.innerHTML = item.html;
        if (item.popover && item.noteHtml !== null) {
          item.popover.innerHTML = item.noteHtml;
        }
        if (item.button) {
          item.button.classList.toggle("is-match", !!item.noteMatch);
        }
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
              // The item's searchable text is its article text; a reasoning
              // note lives in a static sibling (button + popover) that search
              // never rebuilds, so it can't collapse. The note is still
              // searchable and drives the info-button glyph.
              const article = li.querySelector(".item-text");
              const noteEl = li.querySelector(".note-popover");
              const button = li.querySelector(".note-toggle");
              const text = article
                ? article.textContent.trim()
                : li.textContent.trim();
              const note = noteEl ? noteEl.textContent.trim() : null;
              li.dataset.origText = text;
              items.push({
                element: li,
                article,
                button,
                popover: noteEl,
                // The popover's content is plain text; the original string is
                // captured for exact restore once a match has bolded it
                // (§7.2.3, deviation 17).
                noteHtml: noteEl ? noteEl.innerHTML : null,
                text,
                note,
                group: activeGroup,
              });
              if (activeGroup) activeGroup.items.push(text);
              if (activeGroup && note) activeGroup.items.push(note);
            });
          } else if (child.classList.contains("sub-group-title")) {
            // Sub-group headings match like category headings (§7.2.6),
            // so their markup and text are captured for highlight/restore.
            const html = child.innerHTML;
            child.dataset.origHtml = html;
            activeGroup = {
              element: child,
              html,
              text: child.textContent,
              items: [],
            };
            subgroups.push(activeGroup);
          }
        });
        columns.push({
          element: colEl,
          // Placeholders are excluded from filtering entirely (§5.7,
          // deviation 14); the matcher uses the flag to never mark them.
          placeholder: colEl.hasAttribute("data-placeholder"),
          label: labelEl,
          items,
          subgroups,
        });
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

  // Browsers restore typed form values on reload, but the filter state is
  // never persisted, so a restored query would leave text in the field over
  // a fully visible page. Boot always starts from IDLE: any restored value
  // is discarded before the engine captures and wires anything (§7.1).
  input.value = "";

  const clearButton = document.getElementById("clear-search");
  const win = document.defaultView;
  const capture = { sections: captureContent(document) };
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
    if (event.key === "Escape") {
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
