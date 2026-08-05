---
topic: "FODMAP PWA installability: manifest + cache-free service worker"
importance: high
category: decision
tags: [fodmap, pwa, installability, manifest, service-worker, icons]
created: 2026-08-05T17:24:24Z
model: opencode/deepseek-v4-flash-free
---

The page is installable as a PWA with no caching (user: "do not make a
cache system"; BLUEPRINT §9.6, deviation 20). `src/manifest.webmanifest`
(standalone, `start_url`/`scope` "."), `src/sw.js` (fetch handler never
calls `respondWith`, no caches), and `src/js/pwa.js` (registration
guarded by `serviceWorker in navigator` + `isSecureContext`). Head links
(manifest, theme-color from config, apple-touch) live in
`render-html.js`, so rebuilds keep them. Icons `icon-192.png`,
`icon-512.png`, `apple-touch-icon.png` are rasterized once from
`favicon.svg` via headless Chromium (opaque white background, system
emoji font) — regenerate with `node tmp/render-icon.mjs <size> <out>`
(temporary script, not committed). Chromium path:
`~/.cache/ms-playwright/chromium-1232/chrome-linux64/chrome`;
playwright-cli browsers cannot reach localhost, file:// URLs are blocked.
