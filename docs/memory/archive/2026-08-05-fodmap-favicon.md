---
topic: "FODMAP favicon: filled-canvas emoji SVG + PNG fallback"
importance: medium
category: decision
tags: [favicon, emoji, svg, design]
created: 2026-08-05T16:55:50Z
---

Favicon is `src/favicon.svg` (🥗 as SVG `<text>`, font-size 69.49 in a
64×64 viewBox, baseline y=54.875) plus `src/favicon-32x32.png`
(browser-rendered from the SVG, then Lanczos-scaled). The tuning makes
the glyph ink exactly fill the canvas width (0.921em ink per em) and
centers the ~60.5-unit ink height with ~1.75-unit margins — the largest
unclipped fill for this glyph. Rasterize via Chromium (ImageMagick
cannot render color emoji); the PNG keyed from a magenta background.
Links live in the generated head (`render-html.js`), so rebuilds keep
them.
