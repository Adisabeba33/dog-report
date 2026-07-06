// Minimal offline-first service worker for the Walk Report PWA.
// Base-path aware: paths resolve against the SW scope, so it works whether
// the app is served from the root or a repo subpath (e.g. /dog-report on Pages).
const CACHE = "walk-report-v1";
const BASE = new URL("./", self.location.href).href; // e.g. https://host/dog-report/
const SHELL = [
  "today/",
  "schedule/",
  "clients/",
  "dogs/",
  "reports/",
  "settings/",
  "manifest.webmanifest",
  "icon.svg",
].map((p) => new URL(p, BASE).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations, falling back to cache then the Today shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((r) => r || caches.match(new URL("today/", BASE).href)),
        ),
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (
              res.ok &&
              ["style", "script", "image", "font"].includes(request.destination)
            ) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => cached),
    ),
  );
});
