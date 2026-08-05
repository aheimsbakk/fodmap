// sw.js — cache-free service worker for PWA installability (BLUEPRINT §9.6).
//
// This worker never caches and never goes offline. It exists only because
// the installability criteria of some browsers require a service worker
// with a fetch handler. Every request goes to the network exactly as
// without the worker, so the page content stays fully owned by the build
// pipeline and behaves identically whether or not the worker is active.
self.addEventListener("install", () => {
  // Activate immediately so the worker is active, not waiting, after the
  // first load — installability checks query the active worker.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of already-open pages so the worker's fetch handler is
  // registered for the current page too. No caches are touched.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No respondWith() call: the browser performs the default network fetch.
  // Deliberately empty — adding any caching here would be a cache system.
});
