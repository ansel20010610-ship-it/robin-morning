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
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
export function nestState(n = nest()) {
  if (!n) return null;
  const today = twNow().date, feeds = n.feeds || [];
  const total = feeds.length, si = STAGES.reduce((i, s, j) => (total >= s.at ? j : i), 0), stage = STAGES[si], next = STAGES[si + 1] || null;
  const byMember = (list) => { const m = {}; for (const f of list) m[f.w] = (m[f.w] || 0) + 1; return m; };
  const todays = feeds.filter((f) => f.d === today), todayBy = byMember(todays);
  const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i - 6); return { d, n: feeds.filter((f) => f.d === d).length }; });
  const last = feeds.reduce((m, f) => (f.d > m ? f.d : m), ""), idle = last ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / 864e5) : null;
  const fed = todays.length;
  const hunger = fed === 0 ? (idle !== null && idle >= 3 ? "瘦了一點，等人來餵。" : "今天還沒吃東西。") : fed <= 2 ? "今天吃了一點。" : fed <= 5 ? "今天吃飽了。" : "今天吃得圓滾滾。";
  const who = Object.entries(todayBy).sort((a, b) => b[1] - a[1]).map(([id, c]) => `${id === n.me ? "你" : esc(n.members?.[id] || "朋友")} ${c}`);
  return { total, stage, si, next, toNext: next ? next.at - total : 0, fed, todayBy, who, week, idle, hunger, full: fed >= 3, members: byMember(feeds), everyone: Object.keys(todayBy).length };
}

// ——— Drawing ———
// The bird at its stage: the crest's robin (util.js ROBIN_PATHS) on its perch, grown by CSS from a grey nestling to the
// red-breasted singer (style.css .nest .bird.sN); the egg is its own small drawing.
const EGG = `<ellipse class="shell" cx="32" cy="35" rx="13.5" ry="17"/><circle class="spk" cx="27" cy="29" r="1.1"/><circle class="spk" cx="36.5" cy="25" r=".9"/><circle class="spk" cx="38" cy="39" r="1.2"/><circle class="spk" cx="26.5" cy="42" r=".8"/><path class="e-legs" d="M15 53 L50 53" stroke-width="1.3" stroke-linecap="round"/>`;
export const birdSvg = (st) => `<div class="bird s${st.si}${st.full ? " full" : ""}" aria-hidden="true"><svg viewBox="0 0 64 64">${st.si ? ROBIN_PATHS : EGG}</svg>${st.si >= 5 ? '<i class="note">♪</i><i class="note two">♫</i>' : ""}</div>`;
const bar = (st) => st.next ? `<span class="bar"><i style="width:${Math.round(((st.total - st.stage.at) / (st.next.at - st.stage.at)) * 100)}%"></i></span><span class="next">再 ${st.toNext} 口就${st.next.zh === "破殼" ? "破殼" : st.next.zh}</span>` : `<span class="next">已經是${st.stage.zh}了，接著餵就好。</span>`;

// The front page's box (app.js viewFront, under the day's stamp): the bird, its stage, who fed it today; with no nest
// yet, one line that opens the page where a nest is built.
export function nestBox() {
  const n = nest();
  if (!n) return `<section class="nest hint" aria-label="巢"><a href="#/nest"><svg viewBox="0 0 64 64" aria-hidden="true">${EGG}</svg><span>和另一個有這份報紙的人一起養一隻知更鳥：讀完一篇就餵牠一口。<b>築一個巢 →</b></span></a></section>`;
  const st = nestState(n);
  return `<section class="nest" aria-label="巢">
    <div class="lbl">巢<span class="de">Nest</span></div>
    <a class="body" href="#/nest">${birdSvg(st)}<div class="txt">
      <b>${esc(st.stage.zh)}<i>${esc(st.stage.de)}</i></b>
      <span class="say">${st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。` : st.hunger}</span>
      ${bar(st)}</div></a></section>`;
}

// ——— The page (#/nest) ———
// Without a nest: build one or join one. With one: the bird large, the week, the members, the invite code to pass on,
// and the way out. `api` is config.json nest.api; without it the page says the nest is this phone alone.
export function renderNest(el, api) {
  const n = nest();
  const head = `<header class="page-title"><h1>巢</h1><span class="de">Nest</span></header>`;
  if (!n) {
    el.innerHTML = `${head}
      <p class="gig-intro">兩個人以上一起養一隻知更鳥。每讀完一篇，就是餵牠一口；大家讀的加在一起，牠從一顆蛋長成會唱歌的鳥。餓著不會死，只會瘦一點。</p>
      <section class="set"><h2>築一個巢</h2><p class="small">你會拿到一組邀請碼，傳給另一個有這份報紙的人。</p>
        <input class="search" data-build-name maxlength="12" placeholder="巢裡怎麼叫你（最多 12 字）" aria-label="你的名字">
        <div class="btns"><button type="button" class="btn" data-build>築巢</button></div></section>
      <section class="set"><h2>加入別人的巢</h2>
        <input class="search" data-join-code autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="NEST-XXXX-XXXX" aria-label="邀請碼">
        <input class="search" data-join-name maxlength="12" placeholder="巢裡怎麼叫你（最多 12 字）" aria-label="你的名字">
        <div class="btns"><button type="button" class="btn ghost" data-join>加入</button></div></section>
      ${api ? "" : `<p class="small nest-note">共用儲存還沒接上：現在築的巢只在這支手機裡，接上以後，餵食紀錄和巢裡的人會自動同步。</p>`}`;
    el.querySelector("[data-build]").onclick = () => { buildNest(el.querySelector("[data-build-name]").value.trim().slice(0, 12)); toast("巢築好了"); renderNest(el, api); syncNest(api).then((ok) => ok && renderNest(el, api)); };
    el.querySelector("[data-join]").onclick = () => {
      const code = normCode(el.querySelector("[data-join-code]").value);
      if (!CODE_RE.test(code)) { toast("邀請碼要像 NEST-XXXX-XXXX"); return; }
      joinNest(code, el.querySelector("[data-join-name]").value.trim().slice(0, 12)); toast("加入了"); renderNest(el, api); syncNest(api).then((ok) => ok && renderNest(el, api));
    };
    return;
  }
  const st = nestState(n), today = twNow().date;
  const names = Object.entries(n.members || {}).map(([id, name]) => `<li><span>${id === n.me ? `${esc(name)}（你）` : esc(name)}</span><b>${st.members[id] || 0} 口</b></li>`).join("");
  const wk = st.week.map((w) => `<li${w.d === today ? ' class="today"' : ""}><i style="height:${Math.min(100, w.n * 14)}%"></i><span>${Number(w.d.slice(8))}</span></li>`).join("");
  const synced = n.synced ? `上次同步 ${new Date(n.synced).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}` : "";
  el.innerHTML = `${head}
    <div class="nest-stage">${birdSvg(st)}
      <b>${esc(st.stage.zh)}<i>${esc(st.stage.de)}</i></b>
      <p class="say">${esc(st.stage.say)}</p>
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
  syncNest(api).then((ok) => { if (ok && el.isConnected && location.hash.startsWith("#/nest")) renderNest(el, api); });
}

// ——— Sharing ———
// POST {api}/{code} with this phone's member and its pending feeds; the answer is the nest as the store holds it
// (members, every feed), which replaces the local log — the store is the one truth, the phone's pending list the only
// thing it can add. Resolves true when the local state changed. No api, offline, or a failing store: nothing changes,
// the pending feeds wait for next time.
let syncing = null;
export function syncNest(api) {
  const n = nest();
  if (!n || !api || !/^https:\/\//.test(api)) return Promise.resolve(false);
  if (syncing) return syncing;
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
    } catch { return false; } finally { syncing = null; }
  })();
  return syncing;
}
