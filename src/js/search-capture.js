/**
 * search-capture.js — DOM capture for the FODMAP search engine
 * (BLUEPRINT §7.3).
 *
 * Captures every item's plain text and every heading's markup once, at load
 * time, and stores them on data-orig-* attributes for restoration. Returns
 * a capture object that the pure matcher consumes.
 *
 * This separation keeps the DOM traversal isolated from both the pure
 * matcher and the executor, so each module can be tested independently.
 */

/**
 * Captures the document's search content into a plan-ready structure.
 * @param {Document} document
 * @returns {{ sections: CaptureSection[] }}
 */
export function captureContent(document) {
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
                noteHtml: noteEl ? noteEl.innerHTML : null,
                text,
                note,
                group: activeGroup,
              });
              if (activeGroup) activeGroup.items.push(text);
              if (activeGroup && note) activeGroup.items.push(note);
            });
          } else if (child.classList.contains("sub-group-title")) {
            // Sub-group headings match like category headings (§7.2 rule 6),
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
  return { sections };
}
