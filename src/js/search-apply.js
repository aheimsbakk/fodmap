/**
 * search-apply.js — executor that applies a matcher plan to the document
 * (BLUEPRINT §8).
 *
 * One responsibility: translate a plan object returned by the pure matcher
 * into DOM mutations. Performs no string logic. Idempotent — applying the
 * same plan twice yields the same document state (§9.4).
 *
 * The note button and popover are untouched siblings, so the popover's
 * open/pinned state survives filtering (§7.5).
 */

/**
 * Applies a matcher plan to the document.
 * @param {Document} document
 * @param {{ sections: PlanSection[] }} plan
 */
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
