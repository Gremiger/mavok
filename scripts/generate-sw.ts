import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

const sha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  execSync("git rev-parse HEAD").toString().trim();

const short = sha.slice(0, 7);

const sw = `const STATIC_CACHE = "mavok-${short}";

self.addEventListener("install", () => {
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
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirst(event.request));
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
`;

writeFileSync(resolve(__dirname, "../public/sw.js"), sw);
console.log(`Generated sw.js with cache: mavok-${short}`);
