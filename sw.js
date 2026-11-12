// Offline reading. The app shell lives in a cache versioned per deploy, so the page and its JS always come from the
// same version; content (config, issue index, articles) lives in its own cache, kept across versions and checked online first.
// scripts/version_shell.py swaps the placeholder in CACHE for a hash of the shell files, so sw.js only changes when the shell does.
const CACHE = "robin-shell-__SHELL_HASH__";
const CONTENT = "robin-content";
// Pictures and font files, kept as they are seen so an article read once still shows its images offline.
const IMAGES = "robin-images";
const FONTS = "robin-fonts";
const KEEP = [CACHE, CONTENT, IMAGES, FONTS];
const LIMIT = { [IMAGES]: 400, [FONTS]: 400 }; // entries; the oldest go first
const BYTES = { [IMAGES]: 60 * 1024 * 1024 }; // and a byte budget for the pictures: 400 heroes ran to ~180 MB (audit 2026-11-08), Safari's quota is the real limit
const IMAGE_HOSTS = new Set(["upload.wikimedia.org", "thumb.wikimedia.org", "tile.loc.gov"]);
const SHELL = ["index.html", "assets/style.css", "assets/app.js", "assets/util.js", "assets/blocks.js", "assets/stamps.js", "assets/feasts.js",
  "assets/pitch.js", "assets/pull.js", "assets/spotify.js", "assets/speak.js", "assets/notify.js", "assets/motion.js", "assets/marks.js", "assets/press.js", "assets/wetter.js", "assets/world.js", "assets/nest.js", "assets/jupiter.js", "assets/cities.js", "assets/robin.svg", "assets/world.svg", "assets/globe.json", "manifest.webmanifest"];
const DATA = ["content/config.json", "content/index.json", "content/onthisday.json"];
const TIMEOUT = 4000; // ms to wait for the network before answering content from the cache
const ROOT = new URL(self.registration.scope).pathname;
const reload = (u) => new Request(u, { cache: "reload" }); // skip the HTTP cache (GitHub Pages sends max-age=600)

self.addEventListener("install", (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(SHELL.map(reload))),
    // best effort: three small files kept for a first offline open. One of them failing (a dropped connection, a file
    // renamed) must not fail the install — the old shell then stayed, and every start downloaded the new one again for nothing
    caches.open(CONTENT).then((c) => c.addAll(DATA.map(reload))).catch(() => {}),
  ]).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("robin-") && !KEEP.includes(k))
    .map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// The app is one page: any query (?code=… back from Spotify, ?preview) gets this version's index.html.
async function appPage(req) {
  return (await (await caches.open(CACHE)).match("index.html")) || fetch(req);
}
// Shell URLs carry ?v=<this version> (scripts/version_shell.py); the precached copies are stored without it.
async function cacheFirst(req) {
  const c = await caches.open(CACHE);
  // A page answered in place of a script or a picture (a captive portal's 200 text/html) is not kept: it would stand
  // for that file until the next deploy (the postcard drawings are fetched here on first use, not precached).
  const page = (r) => /text\/html/.test(r.headers.get("content-type") || "") && !/\.html(\?|$)/.test(req.url);
  return (await c.match(req, { ignoreSearch: true })) || fetch(req).then((r) => { if (r.ok && !page(r)) c.put(req, r.clone()); return r; });
}
// On a stalled connection, answer from the cache after TIMEOUT; a late network copy is still stored.
// With nothing cached, wait for the network; JSON never falls back to index.html. Only a good answer is stored or
// preferred over the cached copy: a captive portal (hotel Wi-Fi) answers every URL with 200 text/html.
const good = (req, r) => r.ok && (!/\.json(\?|$)/.test(req.url) || /json/.test(r.headers.get("content-type") || ""));
async function networkFirst(e) {
  const req = e.request, c = await caches.open(CONTENT);
  const net = fetch(req, { cache: "no-cache" }).then(async (r) => { if (good(req, r)) await c.put(req, r.clone()).catch(() => {}); return r; });
  e.waitUntil(net.catch(() => {}));
  const hit = await c.match(req);
  if (!hit) return net.catch(() => Response.error());
  return Promise.race([net.then((r) => (good(req, r) ? r : hit)).catch(() => hit), new Promise((res) => setTimeout(() => res(hit), TIMEOUT))]);
}

// A picture or font file never changes at its URL: answer from the cache, else fetch it with CORS (these hosts allow it)
// so the cache holds a real response rather than an opaque one, which browsers count as megabytes against the quota.
// If the CORS request fails, the browser's own request goes ahead uncached.
async function kept(e, name) {
  const c = await caches.open(name);
  const hit = await c.match(e.request.url);
  if (hit) return hit;
  let r;
  try { r = await fetch(e.request.url, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" }); }
  catch { return fetch(e.request); }
  if (r.ok) e.waitUntil(c.put(e.request.url, r.clone()).then(() => trim(c, LIMIT[name], BYTES[name])).catch(() => {}));
  return r;
}
// The Google Fonts stylesheet can change (new font files): answer from the cache at once and refresh it behind.
async function revalidated(e, name) {
  const c = await caches.open(name);
  const hit = await c.match(e.request.url);
  const net = fetch(e.request.url, { mode: "cors", credentials: "omit" })
    .then(async (r) => { if (r.ok) await c.put(e.request.url, r.clone()).catch(() => {}); return r; });
  e.waitUntil(net.catch(() => {}));
  return hit || net.catch(() => fetch(e.request));
}
let adds = 0; // additions to a budgeted cache since this worker woke (trim)
async function trim(c, max, bytes) {
  const keys = await c.keys(); // in the order they were stored
  for (const k of keys.slice(0, Math.max(0, keys.length - max))) await c.delete(k);
  // The byte budget: measured every twentieth addition once the cache is big enough to matter (a scan reads every
  // entry's size), the oldest dropped first until it fits.
  if (!bytes) return;
  const rest = await c.keys();
  // Every twentieth addition while the cache grows (by its size, which outlives this worker). Once it stands at the
  // entry limit its size no longer moves — a multiple of twenty, so every picture added read all four hundred entries
  // again (audit 2026-11-11): there the count is this worker's own, the first addition after it wakes and every
  // twentieth after (iOS stops an idle worker within seconds, so a count from zero alone would seldom reach twenty).
  adds += 1;
  if (rest.length < 100 || (rest.length < max ? rest.length % 20 : adds % 20 !== 1)) return;
  let total = 0;
  const sizes = [];
  for (const k of rest) {
    const r = await c.match(k);
    const n = r ? Number(r.headers.get("content-length")) || (await r.clone().blob()).size : 0;
    sizes.push([k, n]); total += n;
  }
  for (const [k, n] of sizes) { if (total <= bytes) break; await c.delete(k); total -= n; }
}

self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (IMAGE_HOSTS.has(u.hostname)) return e.respondWith(kept(e, IMAGES));
  if (u.hostname === "fonts.gstatic.com") return e.respondWith(kept(e, FONTS));
  if (u.hostname === "fonts.googleapis.com") return e.respondWith(revalidated(e, FONTS));
  if (u.origin !== location.origin || !u.pathname.startsWith(ROOT)) return;
  const p = u.pathname.slice(ROOT.length);
  // Other pages (oauth/spotify/callback) are left to the network.
  if (e.request.mode === "navigate") { if (p === "" || p === "index.html") e.respondWith(appPage(e.request)); }
  else if (p.startsWith("content/") || p.startsWith("ics/")) e.respondWith(networkFirst(e)); // ics/: calendar files, rewritten at every deploy
  else e.respondWith(cacheFirst(e.request));
});

// 出刊通知 (scripts/push.py, sent by notify.yml at 07:30): show it and put a badge on the home-screen icon.
// iOS stops delivering to a web app that receives a push without showing a notification, so one is always shown.
const inScope = (p) => new URL(p || "./", self.registration.scope).href;
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data?.json() || {}; } catch { d = { body: e.data?.text() || "" }; }
  e.waitUntil((async () => {
    // A reminder (push.py remind) for a day the reader has already finished: app.js mirrors digest.done into the rm-state
    // cache. iOS still wants a notification shown for every push, so one is shown silent and closed at once.
    let finished = false;
    if (d.kind === "remind" && d.date) {
      try { finished = ((await (await caches.open("rm-state")).match("state/done"))?.json ? await (await (await caches.open("rm-state")).match("state/done")).json() : []).includes(d.date); } catch { finished = false; }
    }
    await self.registration.showNotification(d.title || "知更鳥晨間記事", {
      body: d.body || "", tag: d.tag || "issue", lang: "zh-Hant-TW", icon: inScope("assets/icon-192.png"), data: { url: inScope(d.url) }, silent: finished,
    });
    if (finished) { (await self.registration.getNotifications({ tag: d.tag || "issue" })).forEach((n) => n.close()); return; }
    if (d.badge && navigator.setAppBadge) await navigator.setAppBadge(d.badge).catch(() => {});
  })());
});
// A tap opens the paper where the notice points: in the window already open if there is one (app.js listens), else a new one.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || self.registration.scope;
  e.waitUntil((async () => {
    for (const w of await self.clients.matchAll({ type: "window", includeUncontrolled: true })) {
      try { await w.focus(); w.postMessage({ type: "open", url }); return; } catch { /* not allowed to focus: open one instead */ }
    }
    await self.clients.openWindow(url);
  })());
});
