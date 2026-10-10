// Offline reading: app shell and articles are kept; the issue index is always checked online first.
const CACHE = "robin-v1";
const SHELL = ["./", "index.html", "assets/style.css", "assets/app.js", "assets/util.js", "assets/blocks.js",
  "assets/pitch.js", "assets/spotify.js", "assets/robin.svg", "manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req) {
  const c = await caches.open(CACHE);
  try { const r = await fetch(req, { cache: "no-cache" }); if (r.ok) c.put(req, r.clone()); return r; }
  catch { return (await c.match(req)) || (await c.match("index.html")) || Response.error(); }
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
}

self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (e.request.mode === "navigate" || /\/content\/(index|config)\.json$/.test(u.pathname)) e.respondWith(networkFirst(e.request));
  else e.respondWith(staleWhileRevalidate(e.request));
});
