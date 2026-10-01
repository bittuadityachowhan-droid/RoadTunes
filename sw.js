/*
 * RoadTunes V2 — service-worker retirement switch
 *
 * The previous V2 used a cache/preview Service Worker.
 * The streaming build no longer uses offline audio caching,
 * so this worker only removes the old RoadTunes caches
 * and unregisters itself.
 */

self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key => key.toLowerCase().includes("roadtunes"))
                    .map(key => caches.delete(key))
            );
        } catch (error) {
            console.warn("[RoadTunes] Cache cleanup failed:", error);
        }

        try {
            await self.registration.unregister();
        } catch (error) {
            console.warn("[RoadTunes] Service Worker unregister failed:", error);
        }
    })());
});

// No fetch handler on purpose.
// Browser requests go directly to the network.