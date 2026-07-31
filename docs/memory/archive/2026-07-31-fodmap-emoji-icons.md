---
topic: "FODMAP reimplementation decisions"
importance: high
category: decision
tags: [fodmap, blueprint, fidelity, icons]
created: 2026-07-31T14:45:00Z
model: opencode/deepseek-v4-flash-free
---

Origin `origin/fodmap.html` is the absolute source of truth for the FODMAP
overview app. The reimplementation must look and behave identically:
Tailwind removed (semantic CSS instead), Google Fonts kept via link, no
print CSS at this stage. The origin's Font Awesome icons are replaced by
corresponding emoji (e.g. 🔍 👍 ⚖️ ✋ ⚠️ 🌾 🥕 🍎 🐄 🥜 ☕ 🍗 🍞 🧊 🌶️ 🧴) —
a deliberate visual deviation, consistent with the masthead's emoji.
Item small-print notes are merged into plain item text from the start
(user decision; the origin flattens them after the first search anyway).
Norwegian text stays verbatim except the user-approved
corrections in BLUEPRINT.md §12.1 (e.g. "Avokodo"→"Avokado",
"E938"→"E 968", "Rømme, kesam"→"Rømme"); "Nøtte", "Banos" and
"Lollosalat" were reviewed and confirmed unchanged.
Plan: `src/index.html` main entry, styles in `src/css/`, tests in `tests/`.
README is written in Norwegian (bokmål, klarspråk) because the app is
Norwegian-only — this overrides RULES §1.2 for user-facing docs; code,
comments, commits, and internal docs stay English.
