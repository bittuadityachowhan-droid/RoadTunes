const CACHE_NAME = "roadtunes-v3-shell-v1";

const APP_SHELL = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/favicon.png",
    "/background.png",
    "/village.png",
    "/town.png",
    "/mountain.png",
    "/river.png",
    "/rain.png",
    "/forest.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Don't cache API responses or music files.
    if (
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/songs/")
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});