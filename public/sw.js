const CACHE = "repoguessr-daily-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/api/daily" && event.request.method === "GET") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match("/api/daily-today");
        try {
          const res = await fetch(event.request);
          if (res.ok) {
            const clone = res.clone();
            cache.put("/api/daily-today", clone);
          }
          return res;
        } catch {
          if (cached) return cached;
          throw new Error("Offline and no cached daily");
        }
      })
    );
  }
});
