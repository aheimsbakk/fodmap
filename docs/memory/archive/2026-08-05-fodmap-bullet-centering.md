---
topic: "Item bullets centered in fixed-width slot"
importance: medium
category: decision
tags: [fodmap, bullets, markers, alignment, css]
created: 2026-08-05T15:25:39Z
model: opencode/deepseek-v4-flash-free
---

User request (2026-08-05): item bullet glyphs were left-aligned, so wide
change-marker emoji (🆕🔄🆙) pushed item text further right than the
narrow default dot. Fix: `li.item::before` centers its glyph in a fixed
1.25rem slot equal to `li.item`'s padding-left, so all item text starts
at the same x position. The `.item-bullet` tooltip hotspot now covers
the whole slot (1.25rem). `tests/styles.test.js` guards slot width +
`text-align: center` and derives the expected marker glyphs from
`data/config.json` (markers are config-owned; never hardcode the glyph
in tests). User also changed `markers.default` from 🔸 to "•".
