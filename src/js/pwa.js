// pwa.js — register the cache-free service worker (BLUEPRINT §9.6). The
// worker adds installability only; sw.js passes every request through to
// the network, so the page works identically with or without it.
// Registration is skipped when the browser lacks service worker support
// or the page is not a secure context (plain http), where registration
// would fail anyway. A failed registration is logged and never surfaced
// to the user: the page stays fully functional without the worker.
if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.warn(
      "Service worker registration failed; the page keeps working without it.",
      error,
    );
  });
}
