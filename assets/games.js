// 遊戲桌 (#/games, a corner of 收藏; the owner's pick 2026-11-26, sample 甲 「牆角遊戲桌」): two things on one table —
// 明早開獎, a guess at the next 台股 close (收紅 or 收黑), settled by the close the paper's own quote board reads
// (content/market.json, written at every deploy: boerse.js hands each read to noteTaiex), and 五子棋 against the phone,
// three levels, worked out here on the phone (no API, no Worker). Everything is kept on this phone (localStorage).
import { store, twNow } from "./util.js";
import { fetchMarket } from "./market.js";

const DAY = 864e5;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const isWeekday = (d) => ![0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay());
const nextWeekday = (d) => { let t = Date.parse(`${d}T00:00:00Z`) + DAY; while (!isWeekday(iso(t))) t += DAY; return iso(t); };
const WD = "日一二三四五六";
const md = (d) => `${Number(d.slice(5, 7))} 月 ${Number(d.slice(8, 10))} 日（${WD[new Date(`${d}T00:00:00Z`).getUTCDay()]}）`;
const OPEN = 9 * 60; // 09:00: a guess for a day is shut when that day's market opens

// ——— 明早開獎 ———
// The closes seen so far, { date: change }, the last 40 market days: every read of market.json passes through here.
export function noteTaiex(items) {
  try {
    const i = (items || []).find((x) => x && x.key === "taiex" && x.ok === true && typeof x.change === "number" && Number.isFinite(x.change));
    const d = String(i?.asof || "").slice(0, 10);
    if (!i || !/^\d{4}-\d\d-\d\d$/.test(d) || i.stale === true) return;
    const c = store.get("games.closes", {});
    if (c[d] === i.change) return;
    c[d] = i.change;
    store.set("games.closes", Object.fromEntries(Object.entries(c).sort().slice(-40)));
  } catch { /* the guess waits for another read */ }
}
// The day a guess made now is for: today before 09:00 on a weekday, else the next weekday (a holiday is found out later).
const target = (now = twNow()) => (isWeekday(now.date) && now.minutes < OPEN ? now.date : nextWeekday(now.date));
// Each guess with its outcome: win true/false, void (休市, or a flat close), or still to come.
function settled() {
  const picks = store.get("games.picks", []), closes = store.get("games.closes", {});
  const seen = Object.keys(closes).sort(), lastSeen = seen.at(-1) || "";
  return picks.map((p) => {
    const ch = closes[p.date];
    if (typeof ch === "number") return { ...p, change: ch, void: ch === 0, win: ch !== 0 && Math.sign(ch) === p.pick };
    if (lastSeen > p.date) return { ...p, void: true, closed: true }; // a later close is in and this day's never came: no market that day
    return { ...p, open: true };
  });
}
const signed = (x) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x).toFixed(2)}`;
function slipHtml() {
  const all = settled(), t = target(), mine = all.find((p) => p.date === t);
  const done = all.filter((p) => !p.open && !p.void).sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0; for (let k = done.length - 1; k >= 0 && done[k].win; k--) streak++;
  const hits = done.filter((p) => p.win).length;
  const last = all.filter((p) => !p.open && p.date < t).sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastLine = !last ? "" : last.void
    ? `<p class="gm-last">${md(last.date)}${last.closed ? "休市，這張不算" : "平盤，這張不算"}</p>`
    : `<p class="gm-last ${last.win ? "win" : "lose"}">${md(last.date)}　猜${last.pick > 0 ? "收紅" : "收黑"}，開出 <b>${signed(last.change)}</b>　${last.win ? "猜中" : "沒中"}</p>`;
  const btn = (v, label) => `<button type="button" class="gm-pick${v > 0 ? " up" : " down"}" data-pick="${v}" aria-pressed="${mine?.pick === v}">${label}</button>`;
  return `<div class="gm-slip" role="group" aria-label="明早開獎">
    <p class="gm-head">明早開獎</p>
    <p class="gm-q">${md(t)}　台股收盤</p>
    <div class="gm-picks">${btn(1, "收紅")}${btn(-1, "收黑")}</div>
    <p class="gm-shut">${mine ? "已押好，" : ""}開盤前都能改</p>
    ${lastLine}
    <p class="gm-tally">連勝 <b>${streak}</b>　共猜中 <b>${hits}</b> / ${done.length}</p>
  </div>`;
}
function wireSlip(root) {
  root.querySelector(".gm-picks")?.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-pick]"); if (!b) return;
    const t = target(), v = Number(b.dataset.pick);
    const picks = store.get("games.picks", []).filter((p) => p.date !== t);
    picks.push({ date: t, pick: v });
    store.set("games.picks", picks.sort((a, b) => a.date.localeCompare(b.date)).slice(-120));
    const slip = root.querySelector(".gm-slip"); slip.outerHTML = slipHtml(); wireSlip(root);
  });
}

// ——— 五子棋 ———
const N = 15, CELL = 22, PAD = 14, SIZE = PAD * 2 + CELL * (N - 1);
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
const LEVELS = [["easy", "初段"], ["mid", "中段"], ["hard", "高段"]];
const fresh = (level = "mid") => ({ level, moves: [], over: null });
let G = null;
const at = (b, x, y) => (x < 0 || y < 0 || x >= N || y >= N ? -1 : b[y * N + x]);
function boardOf(moves) { const b = new Array(N * N).fill(0); moves.forEach(([x, y], k) => { b[y * N + x] = k % 2 ? 2 : 1; }); return b; }
function fiveAt(b, x, y) {
  const c = at(b, x, y); if (c <= 0) return null;
  for (const [dx, dy] of DIRS) {
    const line = [[x, y]];
    for (let s = 1; at(b, x + dx * s, y + dy * s) === c; s++) line.push([x + dx * s, y + dy * s]);
    for (let s = 1; at(b, x - dx * s, y - dy * s) === c; s++) line.push([x - dx * s, y - dy * s]);
    if (line.length >= 5) return line;
  }
  return null;
}
// How good a stone of colour c at (x, y) would be: each of the four lines through it, by its length and open ends.
function lineScore(b, x, y, c) {
  let sum = 0, fours = 0, threes = 0;
  for (const [dx, dy] of DIRS) {
    let n = 1, open = 0, s;
    for (s = 1; at(b, x + dx * s, y + dy * s) === c; s++) n++;
    if (at(b, x + dx * s, y + dy * s) === 0) open++;
    for (s = 1; at(b, x - dx * s, y - dy * s) === c; s++) n++;
    if (at(b, x - dx * s, y - dy * s) === 0) open++;
    if (n >= 5) sum += 1e6;
    else if (n === 4) { sum += open === 2 ? 1e5 : open ? 1e4 : 0; if (open) fours++; }
    else if (n === 3) { sum += open === 2 ? 5e3 : open ? 400 : 0; if (open === 2) threes++; }
    else if (n === 2) sum += open === 2 ? 300 : open ? 40 : 0;
    else sum += open * 4;
  }
  if (fours >= 2 || (fours && threes)) sum += 5e4; // two threats at once
  else if (threes >= 2) sum += 2e4;
  return sum;
}
function candidates(b) {
  const out = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (b[y * N + x]) continue;
    let near = false;
    for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (at(b, x + dx, y + dy) > 0) { near = true; break; }
    if (near) out.push([x, y]);
  }
  return out;
}
function scored(b, me, foe, defence) {
  return candidates(b).map(([x, y]) => ({ x, y, s: lineScore(b, x, y, me) + defence * lineScore(b, x, y, foe) + (7 - Math.max(Math.abs(x - 7), Math.abs(y - 7))) }))
    .sort((p, q) => q.s - p.s);
}
// The phone's move (white). 初段 picks among its five best, guarding less; 中段 the best; 高段 also looks at the reply.
function think(moves, level) {
  const b = boardOf(moves);
  if (!moves.length) return [7, 7];
  const me = 2, foe = 1;
  if (level === "easy") {
    const list = scored(b, me, foe, .6), win = list.find((p) => p.s >= 1e6);
    if (win) return [win.x, win.y];
    const p = list[Math.floor(Math.random() * Math.min(5, list.length))]; return [p.x, p.y];
  }
  const list = scored(b, me, foe, .9);
  if (level === "mid" || list[0].s >= 1e5) return [list[0].x, list[0].y];
  let best = list[0], bestV = -Infinity;
  for (const p of list.slice(0, 8)) {
    b[p.y * N + p.x] = me;
    const reply = scored(b, foe, me, .9)[0];
    b[p.y * N + p.x] = 0;
    const v = p.s - .85 * (reply ? reply.s : 0);
    if (v > bestV) { bestV = v; best = p; }
  }
  return [best.x, best.y];
}
const px = (i) => PAD + i * CELL;
function boardSvg() {
  const b = boardOf(G.moves), last = G.moves.at(-1), win = G.over?.line || [];
  let lines = "";
  for (let i = 0; i < N; i++) lines += `<path d="M${px(0)} ${px(i)}H${px(N - 1)}M${px(i)} ${px(0)}V${px(N - 1)}"/>`;
  const stars = [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]].map(([x, y]) => `<circle cx="${px(x)}" cy="${px(y)}" r="2.2" class="gm-star"/>`).join("");
  let stones = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = b[y * N + x]; if (!c) continue;
    stones += `<circle cx="${px(x)}" cy="${px(y)}" r="${CELL * .44}" fill="url(#gm-${c === 1 ? "black" : "white"})" class="gm-st"/>`;
  }
  const mark = last ? `<circle cx="${px(last[0])}" cy="${px(last[1])}" r="3" class="gm-lastm"/>` : "";
  const five = win.length ? `<path class="gm-five" d="M${px(win[0][0])} ${px(win[0][1])}${win.map(([x, y]) => `L${px(x)} ${px(y)}`).join("")}"/>` : "";
  return `<svg class="gm-board" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="五子棋盤，${G.moves.length} 手">
    <defs><radialGradient id="gm-black" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#5a5550"/><stop offset=".5" stop-color="#1a1714"/><stop offset="1" stop-color="#050404"/></radialGradient>
    <radialGradient id="gm-white" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece6da"/><stop offset="1" stop-color="#b9b0a0"/></radialGradient></defs>
    <rect width="${SIZE}" height="${SIZE}" rx="4" class="gm-wood"/><g class="gm-grid">${lines}</g>${stars}${stones}${mark}${five}</svg>`;
}
function wordOf() {
  const w = store.get("games.gomoku.tally", {}), t = w[G.level] || [0, 0];
  const state = G.over ? (G.over.who === 1 ? "你贏了" : G.over.who === 2 ? "電腦贏了" : "和棋") : G.busy ? "電腦想一下……" : "輪到你（黑）";
  return `<span class="gm-state">${state}</span><span class="gm-rec">這一段 ${t[0]} 勝 ${t[1]} 敗</span>`;
}
function goHtml() {
  return `<div class="gm-go">
    <div class="gm-levels" role="group" aria-label="難度">${LEVELS.map(([k, n]) => `<button type="button" data-level="${k}" aria-pressed="${G.level === k}">${n}</button>`).join("")}</div>
    <div class="gm-bwrap">${boardSvg()}</div>
    <p class="gm-word">${wordOf()}</p>
    <div class="gm-acts"><button type="button" data-act="undo"${G.moves.length < 2 || G.busy ? " disabled" : ""}>悔棋</button><button type="button" data-act="new">新的一局</button></div>
  </div>`;
}
const save = () => store.set("games.gomoku", { level: G.level, moves: G.moves, over: G.over });
function tally(who) {
  const w = store.get("games.gomoku.tally", {}), t = w[G.level] || [0, 0];
  if (who === 1) t[0]++; else if (who === 2) t[1]++;
  w[G.level] = t; store.set("games.gomoku.tally", w);
}
function finish(x, y) {
  const b = boardOf(G.moves), line = fiveAt(b, x, y);
  if (line) { G.over = { who: b[y * N + x], line }; tally(G.over.who); }
  else if (G.moves.length >= N * N) G.over = { who: 0 };
}
function wireGo(root) {
  const box = root.querySelector(".gm-go");
  const redraw = () => { box.outerHTML = goHtml(); wireGo(root); };
  box.querySelector(".gm-levels").onclick = (ev) => {
    const b = ev.target.closest("[data-level]"); if (!b || G.busy || b.dataset.level === G.level) return;
    G = fresh(b.dataset.level); save(); redraw();
  };
  box.querySelector(".gm-acts").onclick = (ev) => {
    const a = ev.target.closest("[data-act]")?.dataset.act; if (!a || G.busy) return;
    if (a === "new") G = fresh(G.level);
    else if (a === "undo") { G.moves = G.moves.slice(0, G.moves.length % 2 ? -1 : -2); G.over = null; }
    save(); redraw();
  };
  box.querySelector(".gm-board").onclick = (ev) => {
    if (G.over || G.busy) return;
    const svg = ev.currentTarget, r = svg.getBoundingClientRect(), k = SIZE / r.width;
    const x = Math.round(((ev.clientX - r.left) * k - PAD) / CELL), y = Math.round(((ev.clientY - r.top) * k - PAD) / CELL);
    if (x < 0 || y < 0 || x >= N || y >= N || boardOf(G.moves)[y * N + x]) return;
    G.moves.push([x, y]); finish(x, y);
    if (!G.over) G.busy = true;
    save(); redraw();
    if (!G.busy) return;
    setTimeout(() => {
      const [mx, my] = think(G.moves, G.level);
      G.moves.push([mx, my]); G.busy = false; finish(mx, my); save();
      if (root.isConnected) { const nb = root.querySelector(".gm-go"); if (nb) { nb.outerHTML = goHtml(); wireGo(root); } }
    }, 260);
  };
}

export function gamesHtml() {
  if (!G) { const k = store.get("games.gomoku", null); G = k && Array.isArray(k.moves) ? { level: k.level || "mid", moves: k.moves, over: k.over || null } : fresh(); }
  G.busy = false;
  if (!G.over && G.moves.length % 2) { const [mx, my] = think(G.moves, G.level); G.moves.push([mx, my]); finish(mx, my); save(); } // left while the phone was thinking
  return `<div class="gm-table">${slipHtml()}${goHtml()}</div>`;
}
export function wireGames(root) {
  if (!root) return;
  noteTaiex(store.get("market.last", null)?.items);
  wireSlip(root); wireGo(root);
  fetchMarket().then((d) => { // the file as it stands now: a close that came in since the front page was read settles here too
    if (!d || !root.isConnected) return;
    noteTaiex(d.items);
    const slip = root.querySelector(".gm-slip"); if (slip) { slip.outerHTML = slipHtml(); wireSlip(root); }
  }).catch(() => {});
}
