// note-popover.js — (i) affordance on items with a reasoning note.
// Show the note on hover; on a mouse move away (or clicking outside) close it.
// A click "pins" the note open; clicking outside unpins and closes it.
//
// Accepts an optional document parameter for testability; when called
// without arguments it wires itself on the current document (BLUEPRINT §7.5).

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;
const MARKER_CLASS = "marker";
const HIGHLIGHT_CLASS = "item-highlight";

/** Lowercases and trims the raw input value (§7.2 rule 1). */
export function normalizeQuery(value) {
  return value.toLowerCase().trim();
}

/** Escapes regex metacharacters so user input is always treated literally. */
function escapeRegExp(term) {
  return term.replace(ESCAPE_REGEX, "\\$&");
}

/**
 * Builds the pure matcher: (query, capture) => visibility/highlight plan.
 *
 * Regex results are cached by query string so repeated identical queries
 * skip recompilation.
 */
export function buildMatcher() {
  const cache = new Map();
  return function match(query, capture) {
    const q = normalizeQuery(query);
    const active = q.length > 0;

    // Reuse compiled regexes when the query has not changed.
    let markupRegex, itemRegex;
    if (active) {
      const cached = cache.get(q);
      if (cached) {
        markupRegex = cached.markup;
        itemRegex = cached.item;
      } else {
        markupRegex = new RegExp(`(${escapeRegExp(q)})(?![^<]*>)`, "gi");
        itemRegex = new RegExp(`(${escapeRegExp(q)})`, "gi");
        cache.set(q, { markup: markupRegex, item: itemRegex });
      }
    } else {
      cache.clear();
    }

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
          // heading match reveals its section (§7.2 rule 6).
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
              // other state restores the original plain text (§7.2 rule 3).
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
          // rhythm. Placeholder columns are never marked (§7.2 rule 5,
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
