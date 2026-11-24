// 你讀過的世界 (Gelesene Welt; app.js viewWorld, viewSaved, viewArticle): the countries the news column has taken the
// reader to. The index names, for every 快訊 article, the countries its items speak of (build_index.py, places.py), and
// at its top each code's Chinese name; a country counts as read once the news of an issue naming it is read (readSet).
// The map is assets/world.svg — one <path id="xx"> per ISO alpha-2 code, Taiwan "tw" — fetched once and kept here as
// text, so the page can be drawn again without asking for it.

// The countries met, newest first by the latest issue that named each: { code, n, latest: [{ date, title }] } — n issues
// in all, the two most recent kept for the list. `today`: the latest issue's countries while its news is still unread,
// the outlines the map offers. `issues` come newest first (publishedIssues).
export function worldState(issues, read) {
  const by = new Map();
  const newsOf = (i) => (i.articles || []).find((x) => x.column === "news");
  for (const i of issues) {
    const a = newsOf(i);
    if (!a || !Array.isArray(a.places) || !read.has(`${i.date}/news`)) continue;
    for (const c of a.places) {
      const k = String(c).toUpperCase(), e = by.get(k) || { code: k, n: 0, latest: [] };
      e.n++;
      if (e.latest.length < 2) e.latest.push({ date: i.date, title: a.title || "" });
      by.set(k, e);
    }
  }
  const first = issues[0], news = first && newsOf(first);
  const today = news && Array.isArray(news.places) && !read.has(`${first.date}/news`) ? news.places.map((c) => String(c).toUpperCase()) : [];
  return { read: [...by.values()].sort((a, b) => b.latest[0].date.localeCompare(a.latest[0].date) || b.n - a.n), today };
}

let svgText = null, loading = null;
function worldSvg() {
  if (svgText) return Promise.resolve(svgText);
  if (!loading) {
    loading = fetch("assets/world.svg").then(async (r) => {
      if (!r.ok) throw new Error(`${r.status} world.svg`);
      const t = await r.text();
      if (!t.includes("<svg")) throw new Error("not an svg"); // a captive portal answers every URL with its page
      return (svgText = t);
    }).finally(() => { loading = null; });
  }
  return loading;
}

const NS = "http://www.w3.org/2000/svg";
const code = (c) => (/^[A-Za-z]{2}$/.test(c) ? c.toLowerCase() : null);
// Draws the map into `box`: a read country gilt (.read), one of today's still unread outlined (.today), Taiwan ringed in
// the robin's colour as home, at the centre of its shape — measured once the SVG is in the page. The SVG keeps its own
// ids (two-letter codes) inside the box; nothing else in the app looks them up. A map that cannot be had says so and
// leaves the list to stand alone; a box the reader has left meanwhile is not drawn into.
export async function drawMap(box, { read = [], today = [] } = {}) {
  let text;
  try { text = await worldSvg(); } catch { text = null; }
  if (!box.isConnected) return;
  const doc = text ? new DOMParser().parseFromString(text, "image/svg+xml") : null;
  const svg = doc && !doc.querySelector("parsererror") && doc.documentElement?.localName === "svg" ? document.adoptNode(doc.documentElement) : null;
  if (!svg) { box.innerHTML = `<p class="empty">地圖暫時打不開</p>`; return; }
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", read.length ? `世界地圖，讀過的 ${read.length} 個國家上了金色` : "世界地圖，還沒有上色的國家");
  const at = (c) => { const id = code(c); return id ? svg.querySelector(`[id="${id}"]`) : null; };
  box.replaceChildren(svg);
  for (const c of read) at(c)?.classList.add("read");
  for (const c of today) { const p = at(c); if (p && !p.classList.contains("read")) p.classList.add("today"); }
  const tw = at("tw");
  if (!tw) return;
  const b = tw.getBBox();
  if (!(b.width > 0)) return; // not laid out (a hidden page): no centre to measure
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "home");
  g.setAttribute("aria-label", "台灣，家");
  // Radii in CSS pixels, not viewBox units: on a phone the 990-unit map is drawn a third its size.
  const k = (svg.viewBox?.baseVal?.width || 990) / Math.max(1, svg.getBoundingClientRect().width);
  for (const [r, cls] of [[9, "ring"], [2.2, "dot"]]) {
    const o = document.createElementNS(NS, "circle");
    o.setAttribute("cx", cx.toFixed(1)); o.setAttribute("cy", cy.toFixed(1)); o.setAttribute("r", (r * k).toFixed(1)); o.setAttribute("class", cls);
    g.append(o);
  }
  svg.append(g);
}

// ——— 地球儀 (the owner, 2026-11-11): the same page on a globe that turns ———
// assets/globe.json (scripts/globe/build.py, from Natural Earth's 1:50m countries, public domain) holds every code of
// world.svg as outlines in longitude and latitude, or as a dot for a state too small to draw; it is fetched on the
// first visit and kept by the service worker like the postcards. Each point is turned into a unit vector once; a frame
// is then one rotation and an orthographic drop onto the disc, drawn on a canvas. A country read is gold leaf (the
// foil's band slides as the globe turns), one in today's unread 快訊 a gold outline, Taiwan ringed in the robin's
// colour. It opens on Taiwan and turns to the country read last; a finger across it turns it (sideways only — up and
// down still scrolls the page) and it runs on a little after the finger lifts. Nothing is drawn while it rests.
// Without the file the flat map above is drawn instead. The globe in 收藏's room (salon.js) is drawn from the same
// data by the same frame (paintGlobe).
let globeData = null, globeLoading = null;
const RAD = Math.PI / 180;
export const GLOBE_DPR = 2; // the globe's canvas here: at most two pixels to a point (the room's, moving in, the same)
export function globe() {
  if (globeData) return Promise.resolve(globeData);
  if (!globeLoading) {
    globeLoading = fetch("assets/globe.json").then(async (r) => {
      if (!r.ok) throw new Error(`${r.status} globe.json`);
      const j = await r.json();
      if (!j || typeof j.c !== "object") throw new Error("not the globe");
      const vec = (lon, lat) => { const a = lon * RAD, b = lat * RAD, c = Math.cos(b); return [c * Math.cos(a), c * Math.sin(a), Math.sin(b)]; };
      const lands = [], centre = {};
      for (const [c, rings] of Object.entries(j.c)) {
        for (const flat of rings) { // the first point in 0.01°, then differences
          const n = flat.length >> 1, v = new Float32Array(n * 3);
          let x = 0, y = 0, sx = 0, sy = 0, sz = 0;
          for (let i = 0; i < n; i++) {
            x += flat[2 * i]; y += flat[2 * i + 1];
            const p = vec(x / 100, y / 100);
            v[3 * i] = p[0]; v[3 * i + 1] = p[1]; v[3 * i + 2] = p[2]; sx += p[0]; sy += p[1]; sz += p[2];
          }
          lands.push({ c, v });
          if (!centre[c]) { const m = Math.hypot(sx, sy, sz) || 1; centre[c] = [Math.atan2(sy, sx) / RAD, Math.asin(sz / m) / RAD]; } // the largest piece comes first
        }
      }
      const dots = Object.entries(j.p || {}).map(([c, at]) => { if (!centre[c]) centre[c] = at; return { c, v: vec(at[0], at[1]) }; });
      const most = Math.max(...lands.map((l) => l.v.length / 3));
      return (globeData = { lands, dots, centre, home: centre.tw || [121, 23.7], buf: new Float32Array(most * 2) }); // buf: a ring's points on the disc, scratch for a frame
    }).finally(() => { globeLoading = null; });
  }
  return globeLoading;
}

// ——— 地球儀的晝夜 (the owner's pick of the samples, 2026-11-25, for the globe in 收藏's room) ———
// Where the sun stands overhead at `ms` (the low-precision formulas of the Astronomical Almanac / NOAA: well under a
// degree): { lon, lat } in degrees. It moves a quarter of a degree a minute; the room asks again every ten minutes.
export function subsolar(ms) {
  const d = (ms - 946728000000) / 864e5; // days from J2000.0
  const g = (357.529 + .98560028 * d) * RAD, q = 280.459 + .98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)) * RAD, e = (23.439 - .00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD, gmst = ((18.697374558 + 24.06570982441908 * d) % 24 + 24) % 24;
  return { lon: ((ra - gmst * 15 + 540) % 360 + 360) % 360 - 180, lat: Math.asin(Math.sin(e) * Math.sin(L)) / RAD };
}
// The night half, over the frame: the sun's height drawn as caps of the sphere — where it is below asin(k) — each a
// shape on the disc (the arc where that circle of the sphere faces us, closed along the rim on the night's side), filled
// one over another in warm dark ink, so the line between day and night is a soft band from about +3° down to −7° and
// the deep night NIGHT[1] dark; the lit half a shade warmer. Then the countries read are painted over the night again
// at READ_NIGHT of their own colour, so the wine still shows there. Shapes, not pixels: a frame costs a few hundred
// points, whatever the turn.
const NIGHT = ["26,15,6", .4], DAYWARM = ["255,238,196", .14], READ_NIGHT = .8;
const EDGE = .05, SOFT = .17, LAYERS = 6, WARM = 3;
const ssInv = (y) => .5 - Math.sin(Math.asin(1 - 2 * y) / 3); // where smoothstep reaches y
// the cap where the sun is below asin(k), on the disc of radius R about (cx, cy): its outline added to path `p`; false if
// none of it faces us. (us, ws, ds): the sun's direction seen from the view (across, up, toward us).
function cap(p, k, [us, ws, ds], cx, cy, R) {
  const rho = Math.hypot(us, ws), r = Math.sqrt(1 - k * k), ea = rho > 1e-9 ? [us / rho, ws / rho] : [1, 0];
  const at = (a, b) => [cx + R * (a * ea[0] - b * ea[1]), cy - R * (a * ea[1] + b * ea[0])];
  const pts = [];
  const c0 = rho > 1e-9 ? (k * ds) / (r * rho) : (k * ds >= 0 ? Infinity : -Infinity);
  if (c0 <= -1) { if (ds >= k) return false; p.moveTo(cx + R, cy); p.arc(cx, cy, R, 0, 2 * Math.PI); p.closePath(); return true; } // the circle all round the back: all night, or none
  const ring = (t0, t1, n) => { for (let i = 0; i <= n; i++) { const t = t0 + ((t1 - t0) * i) / n; pts.push(at(k * rho + r * ds * Math.cos(t), r * Math.sin(t))); } };
  if (c0 >= 1) { // all of the circle faces us: the night inside it, or round it
    ring(0, 2 * Math.PI, 48);
    if (ds > 0) { p.moveTo(cx + R, cy); p.arc(cx, cy, R, 0, 2 * Math.PI); p.closePath(); } // the day inside: the disc less it (evenodd)
  } else {
    const t0 = Math.acos(c0);
    ring(t0, 2 * Math.PI - t0, 40);
    const th = Math.atan2(r * Math.sin(t0), k / rho); // the rim back round the far side from the sun
    for (let i = 0; i <= 24; i++) { const a = -th - ((2 * Math.PI - 2 * th) * i) / 24; pts.push(at(Math.cos(a), Math.sin(a))); }
  }
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  p.closePath();
  return true;
}
function paintNight(ctx, sunView, { cx, cy, R }, again) {
  // the lit half a shade warmer, fading in from the line
  for (let i = 0; i < WARM; i++) {
    const k = EDGE + SOFT * ssInv((i + .5) / WARM), p = new Path2D();
    p.moveTo(cx + R, cy); p.arc(cx, cy, R, 0, 2 * Math.PI); p.closePath();
    cap(p, k, sunView, cx, cy, R);
    ctx.fillStyle = `rgba(${DAYWARM[0]},${(1 - Math.pow(1 - DAYWARM[1], 1 / WARM)).toFixed(4)})`; ctx.fill(p, "evenodd");
  }
  const a = (1 - Math.pow(1 - NIGHT[1], 1 / LAYERS)).toFixed(4);
  let outer = null;
  for (let i = 0; i < LAYERS; i++) {
    const k = EDGE - SOFT * ssInv((i + .5) / LAYERS), p = new Path2D();
    if (!cap(p, k, sunView, cx, cy, R)) continue;
    if (!outer) outer = p;
    ctx.fillStyle = `rgba(${NIGHT[0]},${a})`; ctx.fill(p, "evenodd");
  }
  if (outer && again) { ctx.save(); ctx.clip(outer, "evenodd"); ctx.globalAlpha = READ_NIGHT; again(); ctx.restore(); }
}

// One frame of the globe (`g`, from globe()) on `ctx`, whose transform is set to CSS pixels: the sphere of radius R about
// (cx, cy), seen from above (lon, lat) and its picture turned `roll` degrees (the room's globe leans on its stand) —
// the sea, the net of meridians and parallels every 30°, the land not read, the land read (`done`), today's unread
// outlined (`open`), the states too small to draw as dots, home ringed; the light on it is the caller's. `look`: the
// colours (read: a flat fill, else gold leaf from foil and hi; ink: the read land's edge) and, unless given, the page's
// line widths and mark sizes (dots: plain, read, today's; mark: home's ring, its dot, the ring's width). `sun` (the
// room's globe only; subsolar): the night half drawn over it (paintNight).
export function paintGlobe(ctx, g, { cx, cy, R, lon, lat, roll = 0, done, open, sun }, look) {
  const { sea, land, coast, net = coast, netA = .45, netW = .5, coastW = .6, read, foil, hi, ink, readW = .8, gold, todayW = 1.5, robin } = look;
  const { dots = [1.2, 2.6, 2.4], mark = [8, 2.2, 1.4] } = look, buf = g.buf;
  const co = Math.cos(lon * RAD), so = Math.sin(lon * RAD), cl = Math.cos(lat * RAD), sl = Math.sin(lat * RAD);
  // a point's place on the disc, and whether it faces us; one hidden is pushed out to the rim, so a shape half
  // round the back is closed along the edge of the globe
  const put = (x, y, z, o, i) => {
    const x1 = x * co + y * so, d = x1 * cl + z * sl;
    let u = -x * so + y * co, w = z * cl - x1 * sl;
    if (d < 0) { const m = Math.hypot(u, w) || 1; u /= m; w /= m; }
    o[i] = cx + R * u; o[i + 1] = cy - R * w;
    return d >= 0;
  };
  const ring = (v, p = ctx) => { // adds the ring to the current path (or to `p`) if any of it shows
    const n = v.length / 3; let any = false;
    for (let i = 0; i < n; i++) if (put(v[3 * i], v[3 * i + 1], v[3 * i + 2], buf, 2 * i)) any = true;
    if (!any) return;
    p.moveTo(buf[0], buf[1]);
    for (let i = 1; i < n; i++) p.lineTo(buf[2 * i], buf[2 * i + 1]);
    p.closePath();
  };
  ctx.lineJoin = "round";
  const readAgain = []; // with the night: what is painted over it again (the countries read, their dots)
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = sea; ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  if (roll) { ctx.translate(cx, cy); ctx.rotate(roll * RAD); ctx.translate(-cx, -cy); }
  // the net of meridians and parallels, every 30°
  const pt = [0, 0];
  ctx.beginPath();
  const line = (f) => { let on = false; for (let t = 0; t <= 360; t += 5) { const [a, b] = f(t), k = Math.cos(b * RAD); const see = put(k * Math.cos(a * RAD), k * Math.sin(a * RAD), Math.sin(b * RAD), pt, 0); if (see) { on ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); } on = see; } };
  for (let a = 0; a < 180; a += 30) line((t) => [t < 180 ? a : a + 180, t < 180 ? t - 90 : 270 - t]);
  for (let b = -60; b <= 60; b += 30) line((t) => [t, b]);
  ctx.strokeStyle = net; ctx.globalAlpha = netA; ctx.lineWidth = netW; ctx.stroke(); ctx.globalAlpha = 1;
  // the land not read, then the land read, then today's outlines
  ctx.beginPath();
  for (const l of g.lands) if (!done.has(l.c)) ring(l.v);
  ctx.fillStyle = land; ctx.fill(); ctx.strokeStyle = coast; ctx.lineWidth = coastW; ctx.stroke();
  if (done.size) {
    let fill = read;
    if (!fill) { // gold leaf: its band slides as the globe turns
      const k = (((lon % 90) + 90) % 90) / 90;
      fill = ctx.createLinearGradient(cx - 2 * R + 2 * R * k, cy - R, cx + 2 * R * k, cy + R);
      fill.addColorStop(0, foil); fill.addColorStop(.25, hi); fill.addColorStop(.5, foil); fill.addColorStop(.75, hi); fill.addColorStop(1, foil);
    }
    if (sun) { // kept, to be painted again over the night
      const P = new Path2D();
      for (const l of g.lands) if (done.has(l.c)) ring(l.v, P);
      readAgain.push(() => { ctx.fillStyle = fill; ctx.fill(P); ctx.strokeStyle = ink; ctx.lineWidth = readW; ctx.stroke(P); });
      readAgain[0]();
    } else {
      ctx.beginPath();
      for (const l of g.lands) if (done.has(l.c)) ring(l.v);
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = readW; ctx.stroke();
    }
  }
  if (open.size) {
    ctx.beginPath();
    for (const l of g.lands) if (open.has(l.c)) ring(l.v);
    ctx.strokeStyle = gold; ctx.lineWidth = todayW; ctx.stroke();
  }
  for (const d of g.dots) {
    if (!put(d.v[0], d.v[1], d.v[2], pt, 0)) continue;
    const got = done.has(d.c), due = open.has(d.c);
    ctx.beginPath(); ctx.arc(pt[0], pt[1], got ? dots[1] : due ? dots[2] : dots[0], 0, 7);
    if (due) { ctx.strokeStyle = gold; ctx.lineWidth = 1.3; ctx.stroke(); } else { ctx.fillStyle = got ? read || foil : coast; ctx.fill(); }
    if (sun && got && !due) { const [x, y] = pt; readAgain.push(() => { ctx.beginPath(); ctx.arc(x, y, dots[1], 0, 7); ctx.fillStyle = read || foil; ctx.fill(); }); }
  }
  const tw = [0, 0], h = g.home.map((x) => x * RAD), hk = Math.cos(h[1]);
  if (put(hk * Math.cos(h[0]), hk * Math.sin(h[0]), Math.sin(h[1]), tw, 0)) { // home
    ctx.beginPath(); ctx.arc(tw[0], tw[1], mark[0], 0, 7); ctx.strokeStyle = robin; ctx.lineWidth = mark[2]; ctx.stroke();
    ctx.beginPath(); ctx.arc(tw[0], tw[1], mark[1], 0, 7); ctx.fillStyle = robin; ctx.fill();
  }
  if (sun) { // the sun's direction as the view sees it, by the same turn as put()
    const sa = sun.lon * RAD, sb = sun.lat * RAD, x = Math.cos(sb) * Math.cos(sa), y = Math.cos(sb) * Math.sin(sa), z = Math.sin(sb), x1 = x * co + y * so;
    paintNight(ctx, [-x * so + y * co, z * cl - x1 * sl, x1 * cl + z * sl], { cx, cy, R }, readAgain.length ? () => readAgain.forEach((f) => f()) : null);
  }
  ctx.restore();
}

export async function drawGlobe(box, { read = [], today = [] } = {}) {
  let g;
  try { g = await globe(); } catch { g = null; }
  if (!box.isConnected) return;
  if (!g) { box.classList.remove("globe"); return drawMap(box, { read, today }); }
  const cv = document.createElement("canvas"), ctx = cv.getContext("2d");
  cv.setAttribute("role", "img");
  cv.setAttribute("aria-label", read.length ? `地球儀，讀過的 ${read.length} 個國家上了金色` : "地球儀，還沒有上色的國家");
  box.replaceChildren(cv);
  const lc = (c) => String(c).toLowerCase();
  const done = new Set(read.map(lc)), open = new Set(today.map(lc).filter((c) => !done.has(c)));
  const home = g.home, last = read.length ? g.centre[lc(read[0])] : null;
  const tilt = (la) => Math.max(-32, Math.min(42, la * .75)); // the globe leans toward the place, never onto a pole
  let lon = home[0], lat = tilt(home[1]), R = 0, raf = 0, vel = 0, drag = null, fly = null;

  const colours = () => {
    const s = getComputedStyle(box), v = (n) => s.getPropertyValue(n).trim(), dark = /dark/.test(getComputedStyle(document.documentElement).colorScheme);
    return { dark, sea: v(dark ? "--paper-2" : "--paper-3"), land: v(dark ? "--paper-3" : "--paper"), coast: v("--rule"), gold: v("--gold"), ink: v("--gold-ink"), foil: v("--foil"), hi: v("--foil-hi"), robin: v("--robin") };
  };
  const render = () => {
    const size = Math.round(cv.clientWidth), dpr = Math.min(window.devicePixelRatio || 1, GLOBE_DPR);
    if (!size) return;
    if (cv.width !== Math.round(size * dpr)) cv.width = cv.height = Math.round(size * dpr);
    R = size / 2 - 6;
    const c = colours(), cx = size / 2, cy = size / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    paintGlobe(ctx, g, { cx, cy, R, lon, lat, done, open }, c);
    // the roundness: light from the upper left, shade toward the lower right, and a gold rim
    const round = ctx.createRadialGradient(cx - R * .42, cy - R * .46, R * .05, cx, cy, R * 1.02);
    round.addColorStop(0, c.dark ? "rgba(255,240,205,.12)" : "rgba(255,255,255,.42)");
    round.addColorStop(.55, "rgba(255,255,255,0)");
    round.addColorStop(1, c.dark ? "rgba(0,0,0,.5)" : "rgba(70,50,20,.24)");
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = round; ctx.fill();
    ctx.strokeStyle = c.gold; ctx.lineWidth = 1; ctx.stroke();
  };

  const tick = (now) => {
    raf = 0;
    if (!cv.isConnected) return;
    let more = false;
    if (fly) {
      fly.t0 ??= now;
      const t = Math.min(1, (now - fly.t0) / fly.ms), e = 1 - (1 - t) ** 3;
      lon = fly.from[0] + fly.by[0] * e; lat = fly.from[1] + fly.by[1] * e;
      if (t < 1) more = true; else fly = null;
    } else if (!drag && Math.abs(vel) > .03) { lon -= vel; vel *= .94; more = true; }
    render();
    if (more) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const turnTo = (to, ms) => { fly = { from: [lon, lat], by: [((to[0] - lon + 540) % 360) - 180, tilt(to[1]) - lat], ms, t0: null }; kick(); };

  cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, lon, px: e.clientX, t: performance.now() }; vel = 0; fly = null; try { cv.setPointerCapture(e.pointerId); } catch { /* an old pointer */ } });
  cv.addEventListener("pointermove", (e) => {
    if (!drag || !R) return;
    const k = 180 / (Math.PI * R), now = performance.now();
    lon = drag.lon - (e.clientX - drag.x) * k;
    vel = Math.max(-6, Math.min(6, ((e.clientX - drag.px) * k) / Math.max(1, (now - drag.t) / 16.7))); // degrees a frame; a flick coasts a quarter turn at most
    drag.px = e.clientX; drag.t = now;
    kick();
  });
  const lift = () => { if (drag) { drag = null; kick(); } };
  cv.addEventListener("pointerup", lift);
  cv.addEventListener("pointercancel", lift);
  const again = () => { if (cv.isConnected) render(); else removeEventListener("resize", again); };
  addEventListener("resize", again);

  box.globe = { render: (lo, la) => { fly = null; vel = 0; lon = lo; lat = la; render(); }, at: () => [lon, lat] }; // for a look at a fixed angle, and where it stands
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { if (last) { lon = last[0]; lat = tilt(last[1]); } render(); return; }
  render();
  if (last) turnTo(last, 1700); // from home to the country read last
  else { lon = home[0] - 70; render(); turnTo(home, 2200); } // nothing read yet: a quarter turn that comes to rest on home
}
