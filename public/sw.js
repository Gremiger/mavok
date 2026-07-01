const STATIC_CACHE = "mavok-9932964";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(["/index.html"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const { pathname } = new URL(event.request.url);

  // Static assets: cache-first (filenames are content-hashed)
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Navigation (HTML): network-first, fall back to cache for offline
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstWithFallback(event.request));
    return;
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put("/index.html", response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match("/index.html");
    return cached || new Response("Offline", { status: 503 });
  }
}
