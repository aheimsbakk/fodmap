---
topic: "FODMAP note button ringless and popover match bold"
importance: high
category: decision
tags: [fodmap, note-button, popover, search, css]
created: 2026-08-05T10:55:00Z
model: opencode/deepseek-v4-flash-free
---

User request (2026-08-05): the note info button's resting 1 px accent
border and its 2 px hover outline were read as red rings around the icon —
both removed. Only `:focus-visible` keeps an outline (keyboard a11y).
Also: a search that matches a reasoning note now bolds the matched terms
inside the popover (`b.item-highlight`), restoring plain text on IDLE.
This reverses the old "popover is never re-rendered" rule; BLUEPRINT
deviation 17 documents it. Implementation: `captureContent` stores the
popover element + original `innerHTML` (`noteHtml`); the matcher emits a
bolded `noteHtml` on note-only matches; `applyPlan` rewrites the popover's
innerHTML but never replaces the element, so the open/pinned state
survives. Gotcha: the matcher plan must carry `popover` alongside
`article`/`button` or the executor silently skips the popover write.
