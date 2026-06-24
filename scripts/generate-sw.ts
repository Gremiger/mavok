import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

const sha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  execSync("git rev-parse HEAD").toString().trim();

const short = sha.slice(0, 7);

const sw = `const CACHE_NAME = "mavok-${short}";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", "/manifest.json"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match("/"))
  );
});
`;

writeFileSync(resolve(__dirname, "../public/sw.js"), sw);
console.log(`Generated sw.js with cache: mavok-${short}`);
