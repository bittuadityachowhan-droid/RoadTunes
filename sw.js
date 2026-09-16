const CACHE_NAME = "roadtunes-v3-preview-v3";

const APP_SHELL = [
  "/",
  "/index.html",
  "/background.png",
  "/favicon.png",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/village.png",
  "/town.png",
  "/mountain.png",
  "/river.png",
  "/rain.png",
  "/forest.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Never cache API
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(req));
    return;
  }

  // Songs: NETWORK FIRST (fixes streaming)
  if (url.pathname.startsWith("/songs/")) {
    e.respondWith(
      fetch(req)
        .then(r => r)
        .catch(() => caches.match(req))
    );
    return;
  }

  // App shell
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});