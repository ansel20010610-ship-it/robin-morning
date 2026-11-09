// 巢 (Nest; app.js nestBox, viewNest, markRead): a robin that two or more readers of this paper raise together. Every
// article read is one bite (一口); the bites of everyone in the nest add up, and the bird grows from an egg to a singer
// by what the whole nest has read. One nest is one invite code (NEST-XXXX-XXXX): whoever enters it in 設定 joins. The
// owner, 2026-11-09: 和有這個 app 的人共同養寵物，發邀請碼，讀一篇就可以餵知更鳥.
//
// State lives in rm.nest: { code, me, name, members: {id: name}, feeds: [{d, w, k}], pending: [...], since, synced }
// — d the day (Taiwan), w the member who fed, k the article (date/column). The bird's whole condition is computed from
// `feeds`, nothing else is stored. Sharing needs a tiny store the phones can both reach (scripts/nest-worker.js, a
// Cloudflare Worker on the free tier): with config.json `nest.api` set, syncNest() posts what this phone fed and takes
// back the nest's members and every feed; without it the nest is this phone alone and says so. The bird never dies.
import { esc, store, twNow, fmtDate, toast, ROBIN_PATHS } from "./util.js";

const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, L, O, 0, 1: a code read aloud or typed from a photo stays right
const rnd = (n) => { const a = crypto.getRandomValues(new Uint8Array(n)); return [...a].map((b) => ALPHA[b % ALPHA.length]).join(""); };
export const CODE_RE = /^NEST-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
export const normCode = (s) => { const t = String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); const b = t.startsWith("NEST") ? t.slice(4) : t; return b.length === 8 ? `NEST-${b.slice(0, 4)}-${b.slice(4)}` : ""; };

export const nest = () => { const n = store.get("nest"); return n && typeof n.code === "string" && n.me ? n : null; };
const save = (n) => store.set("nest", n);

// A fresh nest with this phone as its first member; `name` is what the others will see beside this phone's bites.
export function buildNest(name) {
  const me = rnd(8), n = { code: `NEST-${rnd(4)}-${rnd(4)}`, me, name: name || "我", members: { [me]: name || "我" }, feeds: [], pending: [], since: twNow().date, synced: null };
  save(n);
  return n;
}
// Joining a nest someone else built: the code is the whole secret. Members and feeds arrive with the first sync.
export function joinNest(code, name) {
  const c = normCode(code);
  if (!CODE_RE.test(c)) return null;
  const me = rnd(8), n = { code: c, me, name: name || "我", members: { [me]: name || "我" }, feeds: [], pending: [], since: twNow().date, synced: null };
  save(n);
  return n;
}
export const leaveNest = () => store.del("nest");

// One bite for one article read by this phone, once (the owner reads the same piece twice: still one bite). Returns
// true when the bird was fed, so the caller can say so.
export function feedNest(k) {
  const n = nest();
  if (!n || typeof k !== "string") return false;
  if (n.feeds.some((f) => f.w === n.me && f.k === k)) return false;
  const f = { d: twNow().date, w: n.me, k };
  n.feeds.push(f); n.pending.push(f);
  save(n);
  return true;
}

// ——— The bird's condition, all from the feed log ———
// The stages, by what the whole nest has read; the words are the paper's, not a game's.
export const STAGES = [
  { at: 0, zh: "一顆蛋", de: "Ei", say: "還在蛋裡。讀完第一篇，牠就破殼。" },
  { at: 1, zh: "破殼", de: "Geschlüpft", say: "剛破殼，眼睛還沒全睜開，嘴倒是張得很大。" },
  { at: 12, zh: "長絨毛", de: "Flaum", say: "身上長出一層絨毛，餓了叫得整個巢都聽見。" },
  { at: 35, zh: "學飛", de: "Flügge", say: "站在巢邊撲翅膀，每天掉下去一次，再爬回來。" },
  { at: 80, zh: "成鳥", de: "Ausgewachsen", say: "胸前紅了，是一隻真正的知更鳥。" },
  { at: 160, zh: "歌者", de: "Sänger", say: "天還沒亮就開始唱，鄰居的鳥都安靜下來聽。" },
];
// The singer never stops growing (the owner, 2026-11-09: 鳥的成長要有一直的感覺，不能到一個程度就不見): every SONG bites
// after the last stage it learns one more song, counted without end — 會唱第幾首歌 — and the bar always has a next mark.
const SONG = 60;
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
export function nestState(n = nest()) {
  if (!n) return null;
  const today = twNow().date, feeds = n.feeds || [];
  const total = feeds.length, si = STAGES.reduce((i, s, j) => (total >= s.at ? j : i), 0), stage = STAGES[si];
  const last = STAGES[STAGES.length - 1].at, songs = total >= last ? 1 + Math.floor((total - last) / SONG) : 0;
  // what the bar runs to: the next stage, or for the singer the next song
  const next = STAGES[si + 1] ? { ...STAGES[si + 1], from: stage.at } : { at: last + songs * SONG, from: last + (songs - 1) * SONG, zh: `學會第${cn(songs + 1)}首歌`, song: true };
  const byMember = (list) => { const m = {}; for (const f of list) m[f.w] = (m[f.w] || 0) + 1; return m; };
  const todays = feeds.filter((f) => f.d === today), todayBy = byMember(todays);
  const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i - 6); return { d, n: feeds.filter((f) => f.d === d).length }; });
  const lastDay = feeds.reduce((m, f) => (f.d > m ? f.d : m), ""), idle = lastDay ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastDay}T00:00:00Z`)) / 864e5) : null;
  const fed = todays.length;
  const hunger = fed === 0 ? (idle !== null && idle >= 3 ? "瘦了一點，等人來餵。" : "今天還沒吃東西。") : fed <= 2 ? "今天吃了一點。" : fed <= 5 ? "今天吃飽了。" : "今天吃得圓滾滾。";
  const who = Object.entries(todayBy).sort((a, b) => b[1] - a[1]).map(([id, c]) => `${id === n.me ? "你" : esc(n.members?.[id] || "朋友")} ${c}`);
  // `grow` runs 0 → 1 from the first bite to the grown bird (80), so the bird is a little bigger and a little redder
  // after every single bite, not only at a stage (the owner, 2026-11-09: 外觀也要有變化).
  return { total, stage, si, next, toNext: next.at - total, songs, grow: Math.min(1, total / STAGES[4].at), fed, todayBy, who, week, idle, hunger, full: fed >= 3, members: byMember(feeds), everyone: Object.keys(todayBy).length };
}

// ——— Drawing ———
// The bird at its stage: the crest's robin (util.js ROBIN_PATHS) on its perch, grown by CSS from a grey nestling to the
// red-breasted singer (style.css .nest .bird.sN); the egg is its own small drawing.
const EGG = `<ellipse class="shell" cx="32" cy="35" rx="13.5" ry="17"/><circle class="spk" cx="27" cy="29" r="1.1"/><circle class="spk" cx="36.5" cy="25" r=".9"/><circle class="spk" cx="38" cy="39" r="1.2"/><circle class="spk" cx="26.5" cy="42" r=".8"/><path class="e-legs" d="M15 53 L50 53" stroke-width="1.3" stroke-linecap="round"/>`;
// The singer's perch comes alive, one thing per song learned: ten leaves first, then ten blossoms among them, then
// berries — so the picture keeps changing for as long as the nest keeps reading.
function branch(songs) {
  if (!songs) return "";
  const out = [];
  for (let i = 0; i < Math.min(songs, 10); i++) {
    const x = 16.5 + i * 3.6, up = i % 2 === 0, y = up ? 50.6 : 55.4;
    out.push(`<ellipse class="leaf" cx="${x}" cy="${y}" rx="2.4" ry="1.15" transform="rotate(${up ? -32 : 32} ${x} ${y})"/>`);
  }
  for (let i = 10; i < Math.min(songs, 20); i++) { const x = 18 + (i - 10) * 3.6, up = i % 2 === 1; out.push(`<circle class="bloom" cx="${x}" cy="${up ? 49.4 : 56.6}" r="1.25"/>`); }
  for (let i = 20; i < Math.min(songs, 30); i++) { const x = 16.5 + (i - 20) * 3.6, up = i % 2 === 0; out.push(`<circle class="berry" cx="${x + 1.6}" cy="${up ? 48.2 : 57.8}" r="1.1"/>`); }
  return out.join("");
}
export const birdSvg = (st) => `<div class="bird s${st.si}${st.full ? " full" : ""}" style="--g:${st.grow.toFixed(3)}" aria-hidden="true"><svg viewBox="0 0 64 64">${st.si ? ROBIN_PATHS + branch(st.songs) : EGG}</svg>${st.si >= 5 ? `<i class="note">♪</i><i class="note two">♫</i>${st.songs >= 3 ? '<i class="note three">♬</i>' : ""}` : ""}</div>`;
// Chinese numerals for the songs (第三首、第十二首、第一百零四首).
function cn(n) {
  const d = "零一二三四五六七八九", u = ["", "十", "百", "千"];
  if (n < 10) return d[n];
  if (n < 20) return `十${n % 10 ? d[n % 10] : ""}`;
  let out = "", zero = false;
  String(n).split("").map(Number).reverse().forEach((x, i) => { if (x) { out = d[x] + u[i] + out; zero = false; } else if (!zero && out) { out = d[0] + out; zero = true; } });
  return out.replace(/零+$/, "");
}
const bar = (st) => `<span class="bar"><i style="width:${Math.round(((st.total - st.next.from) / (st.next.at - st.next.from)) * 100)}%"></i></span><span class="next">再 ${st.toNext} 口就${st.next.zh}</span>`;
// The singer's line under its name: how many songs it knows.
const songLine = (st) => st.songs ? `<span class="songs">會唱${st.songs === 1 ? "一首歌" : `${cn(st.songs)}首歌`}</span>` : "";

// The plate at the head of 收藏 (app.js viewSaved; it was a box on the front page for a day, the owner, 2026-11-09:
// 放到收藏會好一點 — the nest is the reader's own thing, like the stamps): a framed card the width of the shelf, the bird
// on its perch at the left, the stage, who fed it today, a hairline to the next stage; with no nest yet, the same card
// with the egg and one line that opens the page where a nest is built.
export function nestBox() {
  const n = nest();
  if (!n) return `<a class="nest plate hint" href="#/nest" aria-label="巢：還沒有巢"><div class="bird s0" aria-hidden="true"><svg viewBox="0 0 64 64">${EGG}</svg></div><div class="txt"><span class="k">巢<i>Nest</i></span><b>還沒有巢</b><span class="say">和另一個有這份報紙的人一起養一隻知更鳥：讀完一篇就餵牠一口。</span><span class="next">築一個巢 →</span></div></a>`;
  const st = nestState(n);
  return `<a class="nest plate" href="#/nest" aria-label="巢：${esc(st.stage.zh)}，今天吃了 ${st.fed} 口">${birdSvg(st)}<div class="txt">
      <span class="k">巢<i>Nest</i></span>
      <b>${esc(st.stage.zh)}<i>${esc(st.stage.de)}</i>${songLine(st)}</b>
      <span class="say">${st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。` : st.hunger}</span>
      ${bar(st)}</div></a>`;
}
// Bites by the others that this reader has not looked at yet (rm.nest.seen = how many of theirs were there when 收藏
// was last opened): the 收藏 tab wears a small mark while there are any (app.js, like the serial's folded corner).
export function nestUnseen() { const n = nest(); return n ? Math.max(0, n.feeds.filter((f) => f.w !== n.me).length - (n.seen || 0)) : 0; }
export function nestSeen() { const n = nest(); if (n) { n.seen = n.feeds.filter((f) => f.w !== n.me).length; save(n); } }

// ——— Life ———
// The bird is never quite still (the owner, 2026-11-09: 我要他會飛來飛去，但不是單調的飛): every few seconds, at a random
// moment, it does one random thing from what its age allows. An egg rocks. A nestling hops, pecks, looks round. From
// the fledgling on it also flies — a swoop out and back, a loop, a dash to one side and a glide home, a hop along the
// branch — never the same path twice in a row, as far as the box is wide, wings beating (style.css .flying), and lands
// back on its perch. `fly: false` (the plate on 收藏) keeps it to the small things. Reduced motion: it only sits.
const between = (a, b) => a + Math.random() * (b - a);
export function liveBird(root, { fly = true } = {}) {
  const bird = root?.querySelector(".bird");
  if (!bird || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const si = Number((bird.className.match(/\bs(\d)\b/) || [])[1] || 0);
  const timers = [];
  const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
  const run = (frames, ms, easing = "ease-in-out") => bird.animate(frames, { duration: ms, easing, fill: "none" }).finished.catch(() => {});
  const T = (x, y, flip = false, rot = 0) => ({ transform: `translate(${x}px, ${y}px) scaleX(${flip ? -1 : 1}) rotate(${rot}deg)` });
  const amp = () => Math.max(60, Math.min(230, (root.clientWidth || 320) / 2 - 60));
  const rock = () => run([T(0, 0), T(0, 0, false, -6), T(0, 0, false, 5), T(0, 0, false, -3), T(0, 0)], 900);
  const hop = () => run([T(0, 0), T(0, -7), T(0, 0), T(0, -4), T(0, 0)], 520, "ease-out");
  const peck = () => run([T(0, 0), T(0, 3, false, 10), T(0, 0), T(0, 3, false, 10), T(0, 0)], 700);
  const look = async () => { await run([T(0, 0), T(0, 0, true)], 120); await wait(between(500, 1500)); await run([T(0, 0, true), T(0, 0)], 120); };
  const preen = () => run([T(0, 0), T(2, 1, false, -14), T(2, 1, false, -12), T(2, 1, false, -14), T(0, 0)], 1300);
  const fliers = [
    () => { const a = amp(), d = Math.random() < .5 ? 1 : -1; // swoop out and back
      return run([T(0, 0), T(.3 * a * d, -55, d > 0), T(.75 * a * d, -25, d > 0), T(a * d, -80, d > 0), T(.5 * a * d, -115, d < 0), T(.1 * a * d, -40, d < 0), T(0, 0)], between(2600, 3400)); },
    () => { const a = amp() * .8, d = Math.random() < .5 ? 1 : -1; // a loop in the air
      return run([T(0, 0), T(.4 * a * d, -70, d > 0), T(a * d, -40, d > 0), T(.9 * a * d, -120, d < 0), T(.3 * a * d, -130, d < 0), T(-.2 * a * d, -70, d < 0), T(0, 0)], between(3000, 3800)); },
    () => { const a = amp(), d = Math.random() < .5 ? 1 : -1; // a dash to the side, a pause there, a glide home
      return (async () => { await run([T(0, 0), T(.6 * a * d, -60, d > 0), T(a * d, -30, d > 0)], 1100, "ease-out"); await wait(between(500, 1400)); await run([T(a * d, -30, d < 0), T(.5 * a * d, -70, d < 0), T(0, 0)], 1300, "ease-in-out"); })(); },
    () => run([T(0, 0), T(-10, -6), T(-14, 0), T(-4, -6), T(6, 0), T(14, -6), T(10, 0), T(0, -4), T(0, 0)], 1500, "ease-in-out"), // hopping along the branch
  ];
  let lastFly = -1;
  const pick = () => {
    if (si === 0) return rock;
    if (si < 3 || !fly) return [hop, peck, look, preen, hop][Math.floor(Math.random() * 5)];
    if (Math.random() < .45) return [hop, look, preen][Math.floor(Math.random() * 3)];
    let i; do { i = Math.floor(Math.random() * fliers.length); } while (i === lastFly && fliers.length > 1);
    lastFly = i;
    return () => { bird.classList.add("flying"); return fliers[i]().finally(() => bird.classList.remove("flying")); };
  };
  (async () => {
    await wait(between(800, 2000));
    while (bird.isConnected) { await pick()(); await wait(between(1800, 6000)); }
    timers.forEach(clearTimeout);
  })();
}

// ——— The page (#/nest) ———
// Without a nest: build one or join one. With one: the bird large, the week, the members, the invite code to pass on,
// and the way out. `api` is config.json nest.api; without it the page says the nest is this phone alone.
// `afterSync`: this draw follows a sync, so it does not start another (a draw that synced, and a sync that redrew,
// chased each other round until the store refused the phone, 2026-11-09).
export function renderNest(el, api, afterSync = false) {
  const n = nest();
  const head = `<header class="page-title"><h1>巢</h1><span class="de">Nest</span></header>`;
  if (!n) {
    el.innerHTML = `${head}
      <p class="gig-intro">兩個人以上一起養一隻知更鳥。每讀完一篇，就是餵牠一口；大家讀的加在一起，牠從一顆蛋長成會唱歌的鳥。餓著不會死，只會瘦一點。</p>
      <section class="set"><h2>築一個巢</h2><p class="small">先填一個名字，巢裡的人會看到是誰餵的；築好會拿到一組邀請碼，傳給另一個有這份報紙的人。</p>
        <input class="search" data-build-name maxlength="12" placeholder="你的名字（朋友會看到，最多 12 字）" aria-label="你的名字">
        <div class="btns"><button type="button" class="btn" data-build>築巢</button></div></section>
      <section class="set"><h2>加入別人的巢</h2>
        <input class="search" data-join-code autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="NEST-XXXX-XXXX" aria-label="邀請碼">
        <input class="search" data-join-name maxlength="12" placeholder="你的名字（朋友會看到，最多 12 字）" aria-label="你的名字">
        <div class="btns"><button type="button" class="btn ghost" data-join>加入</button></div></section>
      ${api ? "" : `<p class="small nest-note">共用儲存還沒接上：現在築的巢只在這支手機裡，接上以後，餵食紀錄和巢裡的人會自動同步。</p>`}`;
    el.querySelector("[data-build]").onclick = () => { buildNest(el.querySelector("[data-build-name]").value.trim().slice(0, 12)); toast("巢築好了"); renderNest(el, api, true); syncNest(api).then((ok) => ok && el.isConnected && renderNest(el, api, true)); };
    el.querySelector("[data-join]").onclick = () => {
      const code = normCode(el.querySelector("[data-join-code]").value);
      if (!CODE_RE.test(code)) { toast("邀請碼要像 NEST-XXXX-XXXX"); return; }
      joinNest(code, el.querySelector("[data-join-name]").value.trim().slice(0, 12)); toast("加入了"); renderNest(el, api, true); syncNest(api).then((ok) => ok && el.isConnected && renderNest(el, api, true));
    };
    return;
  }
  const st = nestState(n), today = twNow().date;
  const names = Object.entries(n.members || {}).map(([id, name]) => `<li><span>${id === n.me ? `${esc(name)}（你）` : esc(name)}</span><b>${st.members[id] || 0} 口</b></li>`).join("");
  const wk = st.week.map((w) => `<li${w.d === today ? ' class="today"' : ""}><i style="height:${Math.min(100, w.n * 14)}%"></i><span>${Number(w.d.slice(8))}</span></li>`).join("");
  const synced = n.synced ? `上次同步 ${new Date(n.synced).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}` : "";
  el.innerHTML = `${head}
    <div class="nest-stage">${birdSvg(st)}
      <b>${esc(st.stage.zh)}<i>${esc(st.stage.de)}</i>${songLine(st)}</b>
      <p class="say">${st.songs > 1 ? `又學會了一首，現在會唱${cn(st.songs)}首歌；每首都比上一首長一點。` : esc(st.stage.say)}</p>
      <p class="today">${st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。${st.everyone > 1 ? "大家都餵過了。" : ""}` : st.hunger}</p>
      ${bar(st)}
      <p class="small">全巢一共讀了 ${st.total} 篇${n.since ? `，從 ${esc(fmtDate(n.since, "short"))} 築巢算起` : ""}。</p></div>
    <section class="set"><h2>這七天</h2><ol class="nest-week" aria-label="這七天每天餵了幾口">${wk}</ol></section>
    <section class="set"><h2>巢裡的人</h2><ul class="nest-members">${names}</ul>
      ${api ? `<p class="small">${synced || "還沒同步過"}。</p>` : `<p class="small nest-note">共用儲存還沒接上：現在只有這支手機的紀錄，接上以後會把大家的餵食和名字同步過來。</p>`}</section>
    <section class="set"><h2>邀請碼</h2><p class="small">給另一個有這份報紙的人，在設定裡的「巢」輸入，就進同一個巢。</p>
      <div class="nest-code"><code>${esc(n.code)}</code><button type="button" class="btn ghost" data-copy>複製</button></div></section>
    <section class="set"><h2>離開</h2><p class="small">離開以後，這支手機不再餵這隻鳥；巢和鳥都還在，別人可以繼續養。</p>
      <div class="btns"><button type="button" class="btn ghost" data-leave>離開這個巢</button></div></section>`;
  el.querySelector("[data-copy]").onclick = async () => { try { await navigator.clipboard.writeText(n.code); toast("邀請碼複製好了"); } catch { toast("複製不了，請長按邀請碼複製"); } };
  el.querySelector("[data-leave]").onclick = (e) => {
    if (e.currentTarget.dataset.sure) { leaveNest(); toast("離開了"); renderNest(el, api); return; }
    e.currentTarget.dataset.sure = "1"; e.currentTarget.textContent = "確定離開？再按一次";
  };
  liveBird(el.querySelector(".nest-stage"));
  if (!afterSync) syncNest(api).then((ok) => { if (ok && el.isConnected && location.hash.startsWith("#/nest")) renderNest(el, api, true); });
}

// ——— Sharing ———
// POST {api}/{code} with this phone's member and its pending feeds; the answer is the nest as the store holds it
// (members, every feed), which replaces the local log — the store is the one truth, the phone's pending list the only
// thing it can add. Resolves true when the local state changed. No api, offline, or a failing store: nothing changes,
// the pending feeds wait for next time.
let syncing = null, again = false;
export function syncNest(api) {
  const n = nest();
  if (!n || !api || !/^https:\/\//.test(api)) return Promise.resolve(false);
  // A feed during a sync in flight is not in that request: run once more when it is done, so nothing waits for the
  // next page (the owner's first bite on 2026-11-09 sat pending until the nest page was opened again).
  if (syncing) { again = true; return syncing; }
  syncing = (async () => {
    try {
      const r = await fetch(`${api.replace(/\/$/, "")}/${n.code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ member: { id: n.me, name: n.name }, feeds: n.pending || [] }) });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      if (!data || typeof data.members !== "object" || !Array.isArray(data.feeds)) throw new Error("shape");
      const sent = new Set((n.pending || []).map((f) => `${f.w}|${f.k}`)), got = new Set(data.feeds.map((f) => `${f.w}|${f.k}`));
      const cur = nest(); if (!cur || cur.code !== n.code) return false;
      cur.members = { ...data.members, [cur.me]: cur.name };
      cur.feeds = data.feeds.filter((f) => f && typeof f.d === "string" && typeof f.w === "string" && typeof f.k === "string");
      cur.pending = (cur.pending || []).filter((f) => !sent.has(`${f.w}|${f.k}`) || !got.has(`${f.w}|${f.k}`)); // kept: fed since the request went out, or the store lost it
      for (const f of cur.pending) if (!cur.feeds.some((g) => g.w === f.w && g.k === f.k)) cur.feeds.push(f);
      cur.synced = Date.now();
      save(cur);
      return true;
    } catch { return false; } finally { syncing = null; if (again) { again = false; syncNest(api); } }
  })();
  return syncing;
}
