---
topic: "FODMAP emoji icons (deprecated)"
importance: high
category: decision
tags: [fodmap, blueprint, fidelity, icons]
created: 2026-07-31T14:45:00Z
model: opencode/deepseek-v4-flash-free
---

> Deprecated: this entry records early reimplementation decisions that later
> sessions superseded. The "`origin/fodmap.html` as absolute source of
> truth" claim is overridden by `2026-08-01-fodmap-standalone.md` — the
> app now stands on its own, the origin file is deleted, and `BLUEPRINT.md`
> §12.1 defines the canonical content. The "Google Fonts kept via link"
> note is overridden by `2026-07-31-fodmap-system-fonts.md`. Still current:
> the emoji icon mapping, the merged small-print notes, and the Norwegian
> README convention.

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
