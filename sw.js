// Offline reading. The app shell lives in a cache versioned per deploy, so the page and its JS always come from the
// same version; content (config, issue index, articles) lives in its own cache, kept across versions and checked online first.
// publish.yml swaps the placeholder in CACHE for a hash of the shell files, so sw.js only changes when the shell does.
const CACHE = "robin-shell-__SHELL_HASH__";
const CONTENT = "robin-content";
const SHELL = ["index.html", "assets/style.css", "assets/app.js", "assets/util.js", "assets/blocks.js",
  "assets/pitch.js", "assets/spotify.js", "assets/speak.js", "assets/robin.svg", "manifest.webmanifest"];
const DATA = ["content/config.json", "content/index.json"];
const TIMEOUT = 4000; // ms to wait for the network before answering content from the cache
const ROOT = new URL(self.registration.scope).pathname;
const reload = (u) => new Request(u, { cache: "reload" }); // skip the HTTP cache (GitHub Pages sends max-age=600)

self.addEventListener("install", (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(SHELL.map(reload))),
    caches.open(CONTENT).then((c) => c.addAll(DATA.map(reload))),
  ]).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("robin-") && k !== CACHE && k !== CONTENT)
    .map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// The app is one page: any query (?code=… back from Spotify, ?preview) gets this version's index.html.
async function appPage(req) {
  return (await (await caches.open(CACHE)).match("index.html")) || fetch(req);
}
async function cacheFirst(req) {
  const c = await caches.open(CACHE);
  return (await c.match(req)) || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; });
}
// On a stalled connection, answer from the cache after TIMEOUT; a late network copy is still stored.
// With nothing cached, wait for the network; JSON never falls back to index.html.
async function networkFirst(e) {
  const req = e.request, c = await caches.open(CONTENT);
  const net = fetch(req, { cache: "no-cache" }).then(async (r) => { if (r.ok) await c.put(req, r.clone()).catch(() => {}); return r; });
  e.waitUntil(net.catch(() => {}));
  const hit = await c.match(req);
  if (!hit) return net.catch(() => Response.error());
  return Promise.race([net.catch(() => hit), new Promise((res) => setTimeout(() => res(hit), TIMEOUT))]);
}

self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith(ROOT)) return;
  const p = u.pathname.slice(ROOT.length);
  // Other pages (oauth/spotify/callback) are left to the network.
  if (e.request.mode === "navigate") { if (p === "" || p === "index.html") e.respondWith(appPage(e.request)); }
  else if (p.startsWith("content/")) e.respondWith(networkFirst(e));
  else e.respondWith(cacheFirst(e.request));
});
