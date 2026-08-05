// note-popover.js — (i) affordance on items with a reasoning note.
// Show the note on hover; on a mouse move away (or clicking outside) close it.
// A click "pins" the note open; clicking outside unpins and closes it.
const toggles = Array.from(document.querySelectorAll(".note-toggle"));

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
    btn.dataset.pinned = btn.dataset.pinned ? "" : "1";
    if (btn.dataset.pinned) open();
    else close();
  });

  // Hover open/close unless the note is pinned by a click.
  btn.addEventListener("mouseenter", () => {
    if (!btn.dataset.pinned) open();
  });
  btn.addEventListener("mouseleave", () => {
    if (!btn.dataset.pinned) close();
  });
  pop.addEventListener("mouseenter", () => {
    if (!btn.dataset.pinned) open();
  });
  pop.addEventListener("mouseleave", () => {
    if (!btn.dataset.pinned) close();
  });
}

// Clicking anywhere outside a pinned note unpins and closes it.
document.addEventListener("click", (e) => {
  for (const btn of toggles) {
    const pop = btn.nextElementSibling;
    if (!btn.dataset.pinned) continue;
    if (!btn.contains(e.target) && !pop.contains(e.target)) {
      btn.dataset.pinned = "";
      pop.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  }
});
