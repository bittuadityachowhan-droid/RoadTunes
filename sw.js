const CACHE_NAME = "roadtunes-v3-preview-v2";

const APP_SHELL = [
  "/",
  "/index.html",
  "/background.png",
  "/favicon.png",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// One intentionally preloaded song from each playlist.
const PREVIEW_SONGS = [
  "/songs/village/Gori Tera Gaon Bada Pyara  K J Yesudas  Chitchor  Lyrical Video  Old Hindi Song.mp3",

  "/songs/town/a ROCKSTAR _ Sheher Mein Song With LYRICS  Ranbir Kapoor  Nargis Fakhri  A.R. Rahman.mp3",

  "/songs/mountain/a Pahadon Mein (Lyrical)  Mera Dil Pahadon Mein Kho Gaya.mp3",

  "/songs/river/Lae Dooba 8K Video _ Aiyaary _ Sidharth Malhotra, Rakul Preet _ Sunidhi Chauhan _ Rochak Kohli.mp3",

  "/songs/rain/A.R. Rahman - Barso Re (Lyric Video).mp3",

  "/songs/forest/a The Jungle Book Hindi  Mowgli Story  Opening Song  Jungle Jungle Baat Chali Hai.mp3"
];


// ─────────────────────────────────────────────
// INSTALL
// ─────────────────────────────────────────────

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache app shell.
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
          console.log("Shell cached:", url);
        } catch (error) {
          console.warn("Shell cache failed:", url, error);
        }
      }

      // Cache only our intentionally selected preview songs.
      for (const url of PREVIEW_SONGS) {
        try {
          await cache.add(url);
          console.log("Preview song cached:", url);
        } catch (error) {
          console.warn("Preview song cache failed:", url, error);
        }
      }

      await self.skipWaiting();
    })()
  );
});


// ─────────────────────────────────────────────
// ACTIVATE
// ─────────────────────────────────────────────

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});


// ─────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle RoadTunes requests.
  if (url.origin !== self.location.origin) return;

  // Never intercept API calls.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Page navigation: instant cached app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then(cachedPage => {
        return cachedPage || fetch(request);
      })
    );

    return;
  }

  // Songs:
  // Use cached version when available.
  // Otherwise fetch normally.
  if (url.pathname.startsWith("/songs/")) {
    event.respondWith(
      caches.match(request).then(cachedSong => {
        return cachedSong || fetch(request);
      })
    );

    return;
  }

  // Other assets: cache first, network fallback.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request);
    })
  );
});