---
topic: "FODMAP user-requested features (dates)"
importance: medium
category: fact
tags: [fodmap, user-requests, history, features]
created: 2026-08-05T14:30:00Z
model: opencode/deepseek-v4-flash-free
---

User-request history for BLUEPRINT.md §12.2 decisions: footer source line
(deviation 6) and the credit line (deviation 10) were requested
2026-07-31; the text-size toggle (deviation 9) was requested 2026-07-31;
the reasoning-note affordance (deviation 15) was requested 2026-08-01;
change markers (deviation 18) and bullet tooltips (deviation 19) were
requested 2026-08-05. The canonical spellings of BLUEPRINT §12.1 were
set 2026-07-31 to correct typos in the source material. BLUEPRINT now
records only the decisions; the dates live here.

Escape handling was changed 2026-08-05 on user request: Escape anywhere
on the page clears the search and moves focus to the input (previously
it was a no-op outside the focused input; §7.1).

The note info-button box was removed 2026-08-05 on user request: no
width/height/radius — the button is a bare emoji glyph, and its size was
unified with the item markers (all three row glyphs — default bullet,
change markers, note glyph — at 0.9rem; deviation 17, §4.6). The
`width`/`height`/`border-radius` fields are gone from `page.info-button`
in config.json.

The glyph sizes were made text-scale-aware 2026-08-05 on user request:
the default bullet, the change markers, and the note glyph now render at
`calc(0.9rem * var(--text-scale))`, so they grow with the text-size
toggle like the other content text (deviation 9; §4.3, §4.6).

The bullet slot scales with the text scale 2026-08-05 on user request
(marker overlapped the text at 150 %): `--size-bullet-slot` =
`calc(1.25rem * var(--text-scale))` drives `li.item`'s padding-left, the
bullet slot, and the tooltip hotspot — the one scaled spacing, noted as
a deviation-9 exception (§4.3, §5.6).
