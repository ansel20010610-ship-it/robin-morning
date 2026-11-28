// 遊戲桌 (#/games, a corner of 收藏; the owner's pick 2026-11-26, sample 甲 「牆角遊戲桌」): two things on one table —
// 明早開獎, a guess at the next 台股 close (收紅 or 收黑), settled by the close the paper's own quote board reads
// (content/market.json, written at every deploy: boerse.js hands each read to noteTaiex), and 西洋棋 against the phone,
// three levels, worked out here on the phone (no API, no Worker). Everything is kept on this phone (localStorage).
import { store, twNow } from "./util.js";
import { fetchMarket } from "./market.js";
import { LESSONS, TOTAL, stageOf } from "./lessons.js";

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
  // 「禮拜五要改成下週開獎」 (the owner 2026-11-27): a guess for a day more than one ahead (Friday after the open, Saturday) is for next week.
  const head = Date.parse(`${t}T00:00:00Z`) - Date.parse(`${twNow().date}T00:00:00Z`) > DAY ? "下週開獎" : "明早開獎";
  const done = all.filter((p) => !p.open && !p.void).sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0; for (let k = done.length - 1; k >= 0 && done[k].win; k--) streak++;
  const hits = done.filter((p) => p.win).length;
  const last = all.filter((p) => !p.open && p.date < t).sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastLine = !last ? "" : last.void
    ? `<p class="gm-last">${md(last.date)}${last.closed ? "休市，這張不算" : "平盤，這張不算"}</p>`
    : `<p class="gm-last ${last.win ? "win" : "lose"}">${md(last.date)}　猜${last.pick > 0 ? "收紅" : "收黑"}，開出 <b>${signed(last.change)}</b>　${last.win ? "猜中" : "沒中"}</p>`;
  const btn = (v, label) => `<button type="button" class="gm-pick${v > 0 ? " up" : " down"}" data-pick="${v}" aria-pressed="${mine?.pick === v}">${label}</button>`;
  return `<div class="gm-slip gm-tw" role="group" aria-label="${head}">
    <p class="gm-head">${head}</p>
    <p class="gm-q">${md(t)}　台股收盤</p>
    <div class="gm-picks">${btn(1, "▲ 收紅")}${btn(-1, "▼ 收黑")}</div>
    <p class="gm-shut">${mine ? "已押好，" : ""}開盤前都能改</p>
    ${lastLine}
    <p class="gm-tally">連勝 <b>${streak}</b>　共猜中 <b>${hits}</b> / ${done.length}</p>
  </div>`;
}
function wireSlip(root) {
  root.querySelector(".gm-tw .gm-picks")?.addEventListener("click", (ev) => { // .gm-tw, not the first slip: 今日一課 and 巴薩 are slips too
    const b = ev.target.closest("[data-pick]"); if (!b) return;
    const t = target(), v = Number(b.dataset.pick);
    const picks = store.get("games.picks", []).filter((p) => p.date !== t);
    picks.push({ date: t, pick: v });
    store.set("games.picks", picks.sort((a, b) => a.date.localeCompare(b.date)).slice(-120));
    const slip = root.querySelector(".gm-tw"); slip.outerHTML = slipHtml(); wireSlip(root);
  });
}

// ——— 巴薩 (the owner, 2026-11-26: 「比賽猜巴薩就好」, 「用 ESPN 那份公開資料」) ———
// The next Barça match from ESPN's public site API (CORS open, not an official service: it may change its shape one day,
// the owner was told); a score guessed before kick-off, settled from that league's scoreboard on the match's date.
// 全中 = the exact score; 猜中勝負 = the right winner (or a draw); the streak counts the right 勝負.
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const BAR = "83";
const ZH = { "Real Madrid": "皇馬", "Atlético Madrid": "馬競", "Atletico Madrid": "馬競", "Athletic Club": "畢爾包", "Real Sociedad": "皇家社會", "Villarreal": "比利亞雷亞爾",
  "Real Betis": "貝提斯", "Sevilla": "塞維亞", "Valencia": "瓦倫西亞", "Celta Vigo": "塞爾塔", "Getafe": "赫塔費", "Osasuna": "奧薩蘇納", "Girona": "赫羅納",
  "Rayo Vallecano": "巴列卡諾", "Mallorca": "馬略卡", "Alavés": "阿拉維斯", "Espanyol": "西班牙人", "Elche": "埃爾切", "Levante": "萊萬特", "Deportivo": "拉科魯尼亞",
  "Real Oviedo": "奧維耶多", "Manchester City": "曼城", "Sporting CP": "葡萄牙體育", "Como": "科莫", "Bayern Munich": "拜仁", "Paris Saint-Germain": "巴黎聖日耳曼", "Internazionale": "國際米蘭", "Liverpool": "利物浦", "Arsenal": "兵工廠", "Chelsea": "切爾西", "Juventus": "尤文圖斯", "Borussia Dortmund": "多特蒙德", "AC Milan": "AC 米蘭", "Benfica": "本菲卡", "Napoli": "拿坡里", "Manchester United": "曼聯", "Tottenham Hotspur": "熱刺", "Atalanta": "亞特蘭大", "Bayer Leverkusen": "勒沃庫森", "Newcastle United": "紐卡索", "Aston Villa": "阿斯頓維拉", "Porto": "波爾圖", "Club Brugge": "布魯日", "Racing Santander": "桑坦德競技", "Las Palmas": "拉斯帕爾馬斯", "Leganés": "雷加內斯", "Valladolid": "瓦拉多利德" };
const zh = (n) => ZH[n] || n;
const COMP = { "esp.1": "西甲", "uefa.champions": "歐冠", "esp.super_cup": "超級盃", "esp.copa_del_rey": "國王盃", "club.friendly": "友誼賽" };
const twTime = (iso) => { const d = new Date(Date.parse(iso) + 8 * 36e5); return { date: d.toISOString().slice(0, 10), hm: d.toISOString().slice(11, 16) }; };
const getJ = async (u) => { try { const r = await fetch(u, { cache: "no-store" }); return r.ok ? await r.json() : null; } catch { return null; } };
function matchOf(e) {
  const c = e?.competitions?.[0], t = c?.competitors || [], me = t.find((x) => x.team?.id === BAR), them = t.find((x) => x.team?.id !== BAR);
  if (!me || !them || !e.date) return null;
  return { id: String(e.id), at: e.date, slug: e.league?.slug || "esp.1", comp: COMP[e.league?.slug] || "", home: me.homeAway === "home", name: zh(them.team.displayName || them.team.name || "") };
}
async function nextMatch() {
  const d = await getJ(`${ESPN}/all/teams/${BAR}/schedule?fixture=true`);
  const list = (d?.events || []).map(matchOf).filter((m) => m && Date.parse(m.at) > Date.now()).sort((a, b) => a.at.localeCompare(b.at));
  if (list[0]) store.set("games.barca.next", list[0]);
  return list[0] || null;
}
async function settleBarca() { // each guess past its kick-off and not yet settled: its league's scoreboard on the day (UTC, then the day before)
  const picks = store.get("games.barca.picks", []); let changed = false;
  for (const p of picks) {
    if (p.done || Date.parse(p.at) + 2 * 36e5 > Date.now()) continue;
    for (const day of [p.at.slice(0, 10), new Date(Date.parse(p.at) - 864e5).toISOString().slice(0, 10)]) {
      const d = await getJ(`${ESPN}/${p.slug}/scoreboard?dates=${day.replace(/-/g, "")}`), e = (d?.events || []).find((x) => String(x.id) === p.id);
      if (!e) continue;
      const c = e.competitions?.[0];
      if (c?.status?.type?.completed) {
        const t = c.competitors || [], me = t.find((x) => x.team?.id === BAR), them = t.find((x) => x.team?.id !== BAR);
        const a = Number(me?.score), b = Number(them?.score);
        if (Number.isFinite(a) && Number.isFinite(b)) { p.done = { bar: a, opp: b }; changed = true; }
      } else if (/POSTPONED|CANCELED/.test(c?.status?.type?.name || "")) { p.done = { void: true }; changed = true; }
      break;
    }
  }
  if (changed) store.set("games.barca.picks", picks);
  return changed;
}
const sgn = (x) => Math.sign(x);
function barcaHtml() {
  const m = store.get("games.barca.next", null), picks = store.get("games.barca.picks", []);
  const done = picks.filter((p) => p.done && !p.done.void);
  const hit = (p) => sgn(p.bar - p.opp) === sgn(p.done.bar - p.done.opp), exact = (p) => p.bar === p.done.bar && p.opp === p.done.opp;
  let streak = 0; for (let k = done.length - 1; k >= 0 && hit(done[k]); k--) streak++;
  const last = picks.filter((p) => p.done).at(-1);
  const vs = (x, a, b) => x.home ? `巴薩 <b>${a}</b> : <b>${b}</b> ${x.name}` : `${x.name} <b>${b}</b> : <b>${a}</b> 巴薩`;
  const lastLine = !last ? "" : last.done.void ? `<p class="gm-last">${last.name} 那場延期，這張不算</p>`
    : `<p class="gm-last ${hit(last) ? "win" : "lose"}">${vs(last, last.done.bar, last.done.opp)}　你猜 ${last.home ? `${last.bar}:${last.opp}` : `${last.opp}:${last.bar}`}　${exact(last) ? "全中" : hit(last) ? "猜中勝負" : "沒中"}</p>`;
  const tally = `<p class="gm-tally">連勝 <b>${streak}</b>　全中 <b>${done.filter(exact).length}</b>　猜中勝負 <b>${done.filter(hit).length}</b> / ${done.length}</p>`;
  if (!m || Date.parse(m.at) <= Date.now()) return `<div class="gm-slip gm-barca" role="group" aria-label="巴薩"><i class="gm-stub" aria-hidden="true">BARÇA</i><p class="gm-head">巴薩</p><p class="gm-shut">${m ? "比賽踢著，結束後開獎" : "賽程還沒讀到"}</p>${lastLine}${tally}</div>`;
  const mine = picks.find((p) => p.id === m.id), t = twTime(m.at), g = mine || { bar: 1, opp: 1 };
  const side = (k, label, v) => `<span class="gm-side"><span class="gm-team">${label}</span><span class="gm-step"><button type="button" data-step="${k}" data-d="-1" aria-label="${label}少一球">−</button><b data-v="${k}">${v}</b><button type="button" data-step="${k}" data-d="1" aria-label="${label}多一球">+</button></span></span>`;
  const sides = m.home ? side("bar", "巴薩", g.bar) + `<span class="gm-colon">:</span>` + side("opp", m.name, g.opp) : side("opp", m.name, g.opp) + `<span class="gm-colon">:</span>` + side("bar", "巴薩", g.bar);
  return `<div class="gm-slip gm-barca" role="group" aria-label="巴薩" data-id="${m.id}">
    <i class="gm-stub" aria-hidden="true">BARÇA</i><p class="gm-head">巴薩${m.comp ? `<span class="gm-comp">${m.comp}</span>` : ""}</p>
    <p class="gm-q">${md(t.date)} ${t.hm}　${m.home ? "主場" : "客場"}</p>
    <div class="gm-score">${sides}</div>
    <div class="gm-picks${mine ? " gm-betted" : ""}"><button type="button" class="gm-pick up" data-bet aria-pressed="${Boolean(mine)}">押這個比分</button><span class="gm-seal" aria-hidden="true">已押</span></div>
    <p class="gm-shut">開賽前都能改</p>
    ${lastLine}${tally}
  </div>`;
}
function wireBarca(root) {
  const box = root.querySelector(".gm-barca"); if (!box) return;
  const redraw = () => { box.outerHTML = barcaHtml(); wireBarca(root); };
  box.onclick = (ev) => {
    const m = store.get("games.barca.next", null); if (!m || Date.parse(m.at) <= Date.now()) return;
    const st = ev.target.closest("[data-step]"), bet = ev.target.closest("[data-bet]");
    if (st) { const v = box.querySelector(`[data-v="${st.dataset.step}"]`); v.textContent = Math.max(0, Math.min(9, Number(v.textContent) + Number(st.dataset.d)));
      box.querySelector("[data-bet]").setAttribute("aria-pressed", "false"); box.querySelector(".gm-picks").classList.remove("gm-betted"); return; }
    if (!bet) return;
    const picks = store.get("games.barca.picks", []).filter((p) => p.id !== m.id);
    picks.push({ ...m, bar: Number(box.querySelector('[data-v="bar"]').textContent), opp: Number(box.querySelector('[data-v="opp"]').textContent) });
    store.set("games.barca.picks", picks.sort((a, b) => a.at.localeCompare(b.at)).slice(-80)); redraw();
  };
  if (!root.dataset.asked) { root.dataset.asked = "1"; // once per page: the schedule, then any result due
    Promise.all([nextMatch(), settleBarca()]).then(() => { const b = root.isConnected && root.querySelector(".gm-barca"); if (b) { b.outerHTML = barcaHtml(); wireBarca(root); } }).catch(() => {});
  }
}

// ——— 西洋棋 ——— (the owner 2026-11-26 「換掉五子棋」; 「誰先手要隨機」: each new game you draw white or black, white moves first). The board turns so your side is at the bottom. Squares 0..63, 0 = a8, 63 = h1.
// Moves are kept as a list ([from, to, promo]) and the position replayed from it, so undo is dropping the last two.
const LEVELS = [["easy", "初段"], ["mid", "中段"], ["hard", "高段"]];
const START = "rnbqkbnrpppppppp" + ".".repeat(32) + "PPPPPPPPRNBQKBNR";
const fresh = (level = "mid") => ({ level, moves: [], over: null, you: Math.random() < .5 ? "w" : "b" });
const compTurn = () => (G.moves.length % 2 ? "b" : "w") !== G.you;
const mine = () => (G.you === "w" ? Math.ceil(G.moves.length / 2) : Math.floor(G.moves.length / 2));
const ZHC = (c) => (c === "w" ? "白" : "黑");
let G = null, SEL = -1;
const white = (p) => p !== "." && p === p.toUpperCase();
const sideOf = (p) => (p === "." ? null : white(p) ? "w" : "b");
const fr = (s) => [s & 7, s >> 3];
const KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const KG = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const ROOK = KG.slice(0, 4), BISHOP = KG.slice(4);
function startPos() { return { b: START.split(""), turn: "w", castle: "KQkq", ep: -1, half: 0 }; }
function attacked(b, s, by) { // is square s attacked by side `by`?
  const [f, r] = fr(s), at = (x, y) => (x < 0 || y < 0 || x > 7 || y > 7 ? null : b[y * 8 + x]);
  const mine = (p, t) => p && p !== "." && sideOf(p) === by && p.toLowerCase() === t;
  const pr = by === "w" ? r + 1 : r - 1;
  if (mine(at(f - 1, pr), "p") || mine(at(f + 1, pr), "p")) return true;
  for (const [dx, dy] of KN) if (mine(at(f + dx, r + dy), "n")) return true;
  for (const [dx, dy] of KG) if (mine(at(f + dx, r + dy), "k")) return true;
  for (const [dirs, t] of [[ROOK, "r"], [BISHOP, "b"]]) for (const [dx, dy] of dirs) {
    for (let k = 1; ; k++) { const p = at(f + dx * k, r + dy * k); if (p === null) break; if (p === ".") continue; if (mine(p, t) || mine(p, "q")) return true; break; }
  }
  return false;
}
function pseudo(P) {
  const { b, turn } = P, out = [], at = (x, y) => (x < 0 || y < 0 || x > 7 || y > 7 ? null : b[y * 8 + x]);
  for (let s = 0; s < 64; s++) {
    const p = b[s]; if (sideOf(p) !== turn) continue;
    const [f, r] = fr(s), t = p.toLowerCase(), add = (x, y) => { const q = at(x, y); if (q === null || sideOf(q) === turn) return false; out.push([s, y * 8 + x]); return q === "."; };
    if (t === "p") {
      const d = turn === "w" ? -1 : 1, home = turn === "w" ? 6 : 1;
      if (at(f, r + d) === ".") { out.push([s, (r + d) * 8 + f]); if (r === home && at(f, r + 2 * d) === ".") out.push([s, (r + 2 * d) * 8 + f]); }
      for (const dx of [-1, 1]) { const q = at(f + dx, r + d), to = (r + d) * 8 + f + dx; if (q === null) continue; if ((q !== "." && sideOf(q) !== turn) || to === P.ep) out.push([s, to]); }
    } else if (t === "n") KN.forEach(([dx, dy]) => add(f + dx, r + dy));
    else if (t === "k") {
      KG.forEach(([dx, dy]) => add(f + dx, r + dy));
      const foe = turn === "w" ? "b" : "w", row = turn === "w" ? 56 : 0, [K, Q] = turn === "w" ? ["K", "Q"] : ["k", "q"];
      if (s === row + 4 && !attacked(b, s, foe)) {
        if (P.castle.includes(K) && b[row + 5] === "." && b[row + 6] === "." && !attacked(b, row + 5, foe) && !attacked(b, row + 6, foe)) out.push([s, row + 6]);
        if (P.castle.includes(Q) && b[row + 3] === "." && b[row + 2] === "." && b[row + 1] === "." && !attacked(b, row + 3, foe) && !attacked(b, row + 2, foe)) out.push([s, row + 2]);
      }
    } else for (const [dx, dy] of t === "r" ? ROOK : t === "b" ? BISHOP : KG) for (let k = 1; add(f + dx * k, r + dy * k); k++);
  }
  return out;
}
function play(P, [from, to, promo]) { // a new position; P is left as it was
  const b = P.b.slice(), p = b[from], t = p.toLowerCase(), w = P.turn === "w";
  let castle = P.castle, ep = -1, half = P.half + 1;
  if (t === "p" || b[to] !== ".") half = 0;
  if (t === "p" && to === P.ep) b[to + (w ? 8 : -8)] = ".";
  if (t === "p" && Math.abs(to - from) === 16) ep = (to + from) / 2;
  b[to] = t === "p" && (to < 8 || to > 55) ? (w ? (promo || "Q") : (promo || "q").toLowerCase()) : p; b[from] = ".";
  if (t === "k" && Math.abs(to - from) === 2) { const row = from - 4; if (to > from) { b[row + 5] = b[row + 7]; b[row + 7] = "."; } else { b[row + 3] = b[row]; b[row] = "."; } }
  for (const [sq, c] of [[60, "KQ"], [4, "kq"], [63, "K"], [56, "Q"], [7, "k"], [0, "q"]]) if (from === sq || to === sq) castle = castle.replace(new RegExp(`[${c}]`, "g"), "");
  return { b, turn: w ? "b" : "w", castle, ep, half };
}
const kingAt = (b, side) => b.indexOf(side === "w" ? "K" : "k");
const inCheck = (P) => attacked(P.b, kingAt(P.b, P.turn), P.turn === "w" ? "b" : "w");
function legal(P) { return pseudo(P).filter((m) => { const n = play(P, m); return !attacked(n.b, kingAt(n.b, P.turn), n.turn); }); }
const keyOf = (P) => P.b.join("") + P.turn + P.castle + P.ep;
function replay(moves) { let P = startPos(); const seen = [keyOf(P)]; for (const m of moves) { P = play(P, m); seen.push(keyOf(P)); } P.seen = seen; return P; }
function verdict(P) { // null while the game goes on
  if (!legal(P).length) return inCheck(P) ? { who: P.turn === "w" ? "b" : "w", how: "將死" } : { who: 0, how: "逼和" };
  if (P.half >= 100) return { who: 0, how: "五十步" };
  if (P.seen.filter((k) => k === P.seen.at(-1)).length >= 3) return { who: 0, how: "三次重複" };
  const left = P.b.filter((p) => p !== "." && p.toLowerCase() !== "k");
  if (!left.length || (left.length === 1 && "nbNB".includes(left[0]))) return { who: 0, how: "子力不足" };
  return null;
}
// The phone (whichever side you did not draw): material and a little for good squares, searched with alpha-beta. 初段 looks one move ahead and
// sometimes takes a lesser move; 中段 two; 高段 three, then follows captures to the end so it does not walk into one.
const VAL = { p: 100, n: 310, b: 330, r: 500, q: 900, k: 0 };
const CENTRE = (s) => { const [f, r] = fr(s); return 3.5 - Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5)); };
function evalW(b) { // from white's side
  let v = 0;
  for (let s = 0; s < 64; s++) {
    const p = b[s]; if (p === ".") continue;
    const t = p.toLowerCase(), w = white(p), r = s >> 3;
    let x = VAL[t];
    if (t === "p") x += (w ? 6 - r : r - 1) * 8 + (CENTRE(s) > 2 ? 10 : 0);
    else if (t === "n" || t === "b") x += CENTRE(s) * 8;
    else if (t === "q") x += CENTRE(s) * 2;
    else if (t === "k") x += (w ? r === 7 : r === 0) ? 15 : -10;
    v += w ? x : -x;
  }
  return v;
}
function ordered(P, ms) { return ms.map((m) => [m, (P.b[m[1]] !== "." ? 10 * VAL[P.b[m[1]].toLowerCase()] - VAL[P.b[m[0]].toLowerCase()] : 0)]).sort((a, c) => c[1] - a[1]).map((x) => x[0]); }
function quiet(P, a, z, d) {
  const stand = (P.turn === "w" ? 1 : -1) * evalW(P.b);
  if (stand >= z || d > 6) return stand;
  if (stand > a) a = stand;
  for (const m of ordered(P, legal(P).filter((m) => P.b[m[1]] !== "."))) { const v = -quiet(play(P, m), -z, -a, d + 1); if (v >= z) return v; if (v > a) a = v; }
  return a;
}
function search(P, depth, a, z, deep) {
  const ms = legal(P);
  if (!ms.length) return inCheck(P) ? -1e5 - depth : 0;
  if (!depth) return deep ? quiet(P, a, z, 0) : (P.turn === "w" ? 1 : -1) * evalW(P.b);
  for (const m of ordered(P, ms)) { const v = -search(play(P, m), depth - 1, -z, -a, deep); if (v >= z) return v; if (v > a) a = v; }
  return a;
}
function think(moves, level) {
  const P = replay(moves), ms = ordered(P, legal(P)), depth = { easy: 1, mid: 2, hard: 3 }[level], deep = level === "hard";
  const rated = ms.map((m) => [m, -search(play(P, m), depth - 1, -1e6, 1e6, deep) + Math.random() * (level === "easy" ? 60 : 8)]).sort((a, c) => c[1] - a[1]);
  if (level === "easy" && rated.length > 1 && Math.random() < .3) return rated[1][0];
  return rated[0][0];
}
// 招數 (the owner 2026-11-27 「西洋棋可以加上招數嗎（開局或防禦之類的）」): the mainstream openings, each named once its line is on the board. Matched by
// position, so a line reached in another order still counts, and the name stays after play leaves the book.
const BOOK = [
  ["e2e4", "王兵開局"], ["d2d4", "后兵開局"], ["c2c4", "英國式開局"], ["g1f3", "雷蒂開局"], ["f2f4", "伯德開局"],
  ["e2e4 e7e5", "開放式開局"], ["e2e4 e7e5 g1f3 b8c6 f1c4", "義大利開局"], ["e2e4 e7e5 g1f3 b8c6 f1c4 g8f6", "雙馬防禦"],
  ["e2e4 e7e5 g1f3 b8c6 f1b5", "西班牙開局"], ["e2e4 e7e5 g1f3 b8c6 f1b5 a7a6", "西班牙開局・莫菲防禦"], ["e2e4 e7e5 g1f3 b8c6 f1b5 g8f6", "西班牙開局・柏林防禦"],
  ["e2e4 e7e5 g1f3 b8c6 d2d4", "蘇格蘭開局"], ["e2e4 e7e5 g1f3 b8c6 b1c3 g8f6", "四馬開局"], ["e2e4 e7e5 g1f3 g8f6", "俄羅斯防禦"],
  ["e2e4 e7e5 g1f3 d7d6", "菲利道爾防禦"], ["e2e4 e7e5 f2f4", "王翼棄兵"], ["e2e4 e7e5 b1c3", "維也納開局"],
  ["e2e4 c7c5", "西西里防禦"], ["e2e4 c7c5 c2c3", "西西里防禦・阿拉平變例"], ["e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6", "西西里防禦・納道夫變例"],
  ["e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6", "西西里防禦・龍式變例"],
  ["e2e4 e7e6", "法蘭西防禦"], ["e2e4 c7c6", "卡羅－康防禦"], ["e2e4 d7d5", "斯堪地那維亞防禦"], ["e2e4 g8f6", "阿廖欣防禦"],
  ["e2e4 g7g6", "現代防禦"], ["e2e4 d7d6 d2d4 g8f6 b1c3 g7g6", "皮爾茨防禦"],
  ["d2d4 d7d5 c2c4", "后翼棄兵"], ["d2d4 d7d5 c2c4 e7e6", "后翼棄兵・拒絕"], ["d2d4 d7d5 c2c4 d5c4", "后翼棄兵・接受"], ["d2d4 d7d5 c2c4 c7c6", "斯拉夫防禦"],
  ["d2d4 d7d5 c1f4", "倫敦系統"], ["d2d4 g8f6 c1f4", "倫敦系統"], ["d2d4 g8f6", "印度防禦"], ["d2d4 f7f5", "荷蘭防禦"],
  ["d2d4 g8f6 c2c4 g7g6 b1c3 f8g7", "古印度防禦"], ["d2d4 g8f6 c2c4 g7g6 b1c3 d7d5", "格林菲爾德防禦"],
  ["d2d4 g8f6 c2c4 e7e6 b1c3 f8b4", "尼姆佐維奇印度防禦"], ["d2d4 g8f6 c2c4 e7e6 g1f3 b7b6", "后翼印度防禦"],
  // 2026-11-27 「西洋棋招數再多一點」: the variations under them, and the less common first moves.
  ["e2e4 e7e5 g1f3 b8c6 f1c4 f8c5", "義大利開局・皮亞諾變例"], ["e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4", "伊文斯棄兵"], ["e2e4 e7e5 g1f3 b8c6 f1c4 f8e7", "匈牙利防禦"],
  ["e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5 e4d5 f6d5 g5f7", "雙馬防禦・炸肝攻擊"],
  ["e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5c6", "西班牙開局・交換變例"], ["e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7", "西班牙開局・封閉變例"],
  ["e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f6e4", "西班牙開局・開放變例"],
  ["e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 e8g8 c2c3 d7d5", "西班牙開局・馬歇爾攻擊"],
  ["e2e4 e7e5 g1f3 b8c6 f1b5 f8c5", "西班牙開局・古典防禦"], ["e2e4 e7e5 g1f3 b8c6 f1b5 f7f5", "西班牙開局・施利曼防禦"],
  ["e2e4 e7e5 g1f3 b8c6 f1b5 g8f6 e1g1 f6e4 d2d4 e4d6 b5c6 d7c6 d4e5 d6f5 d1d8 e8d8", "柏林防禦・柏林牆"],
  ["e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f1c4", "蘇格蘭棄兵"], ["e2e4 e7e5 g1f3 b8c6 c2c3", "龐齊安尼開局"],
  ["e2e4 e7e5 g1f3 b8c6 b1c3 g8f6 f1b5", "四馬開局・西班牙變例"], ["e2e4 e7e5 g1f3 f7f5", "拉脫維亞棄兵"],
  ["e2e4 e7e5 d2d4 e5d4", "中心開局"], ["e2e4 e7e5 d2d4 e5d4 c2c3", "丹麥棄兵"], ["e2e4 e7e5 f1c4", "主教開局"],
  ["e2e4 e7e5 f2f4 e5f4", "王翼棄兵・接受"], ["e2e4 e7e5 f2f4 f8c5", "王翼棄兵・古典拒絕"], ["e2e4 e7e5 f2f4 d7d5", "法爾克比爾反棄兵"],
  ["e2e4 e7e5 b1c3 g8f6 f2f4", "維也納棄兵"],
  ["e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6", "西西里防禦・舍維寧根變例"],
  ["e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 f2f3", "西西里龍式・南斯拉夫攻擊"],
  ["e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g7g6", "西西里防禦・加速龍式"], ["e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5", "西西里防禦・斯維什尼科夫變例"],
  ["e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 a7a6", "西西里防禦・坎恩變例"], ["e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 b8c6", "西西里防禦・泰馬諾夫變例"],
  ["e2e4 c7c5 b1c3", "封閉式西西里"], ["e2e4 c7c5 g1f3 b8c6 f1b5", "西西里防禦・羅索利莫變例"], ["e2e4 c7c5 g1f3 d7d6 f1b5", "西西里防禦・莫斯科變例"],
  ["e2e4 c7c5 d2d4 c5d4 c2c3", "史密斯－莫拉棄兵"],
  ["e2e4 e7e6 d2d4 d7d5", "法蘭西防禦"], ["e2e4 e7e6 d2d4 d7d5 e4e5", "法蘭西防禦・推進變例"], ["e2e4 e7e6 d2d4 d7d5 b1c3 f8b4", "法蘭西防禦・溫納威爾變例"],
  ["e2e4 e7e6 d2d4 d7d5 b1d2", "法蘭西防禦・塔拉什變例"], ["e2e4 e7e6 d2d4 d7d5 e4d5 e6d5", "法蘭西防禦・交換變例"], ["e2e4 e7e6 d2d4 d7d5 b1c3 g8f6", "法蘭西防禦・古典變例"],
  ["e2e4 c7c6 d2d4 d7d5 e4e5", "卡羅－康防禦・推進變例"], ["e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5", "卡羅－康防禦・古典變例"],
  ["e2e4 c7c6 d2d4 d7d5 e4d5 c6d5", "卡羅－康防禦・交換變例"], ["e2e4 c7c6 d2d4 d7d5 e4d5 c6d5 c2c4", "卡羅－康防禦・潘諾夫攻擊"],
  ["e2e4 d7d5 e4d5 d8d5", "斯堪地那維亞防禦・后吃回"], ["e2e4 d7d5 e4d5 g8f6", "斯堪地那維亞防禦・現代變例"],
  ["e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 f2f4", "阿廖欣防禦・四兵攻擊"], ["e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4", "皮爾茨防禦・奧地利攻擊"],
  ["e2e4 b7b6", "歐文防禦"], ["e2e4 b8c6", "尼姆佐維奇防禦"],
  ["d2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7", "后翼棄兵拒絕・正統防禦"], ["d2d4 d7d5 c2c4 e7e6 b1c3 c7c5", "塔拉什防禦"],
  ["d2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c4d5", "后翼棄兵拒絕・交換變例"], ["d2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6", "半斯拉夫防禦"],
  ["d2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6 e2e3 b8d7 f1d3 d5c4 d3c4 b7b5", "半斯拉夫・梅蘭變例"], ["d2d4 d7d5 c2c4 c7c6 c4d5 c6d5", "斯拉夫防禦・交換變例"],
  ["d2d4 d7d5 c2c4 e7e5", "阿爾賓反棄兵"], ["d2d4 d7d5 c2c4 b8c6", "契戈林防禦"],
  ["d2d4 g8f6 c2c4 e7e6 g2g3", "卡塔蘭開局"],
  ["d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8 f1e2 e7e5", "古印度防禦・古典變例"], ["d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f3", "古印度防禦・薩米施變例"],
  ["d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f4", "古印度防禦・四兵攻擊"], ["d2d4 g8f6 c2c4 g7g6 b1c3 d7d5 c4d5 f6d5 e2e4", "格林菲爾德防禦・交換變例"],
  ["d2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3", "尼姆佐維奇印度・魯賓斯坦變例"], ["d2d4 g8f6 c2c4 e7e6 b1c3 f8b4 d1c2", "尼姆佐維奇印度・古典變例"],
  ["d2d4 g8f6 c2c4 e7e6 g1f3 f8b4", "波哥柳波夫印度防禦"],
  ["d2d4 g8f6 c2c4 c7c5 d4d5", "別諾尼防禦"], ["d2d4 g8f6 c2c4 c7c5 d4d5 e7e6 b1c3 e6d5 c4d5 d7d6", "現代別諾尼防禦"],
  ["d2d4 g8f6 c2c4 c7c5 d4d5 b7b5", "伏爾加棄兵"], ["d2d4 g8f6 c2c4 e7e5", "布達佩斯棄兵"],
  ["d2d4 f7f5 g2g3 g8f6 f1g2 g7g6", "荷蘭防禦・列寧格勒變例"], ["d2d4 f7f5 e2e4", "斯湯頓棄兵"],
  ["d2d4 g8f6 c1g5", "特朗波夫斯基攻擊"], ["d2d4 d7d5 g1f3 g8f6 e2e3", "科勒系統"], ["d2d4 g8f6 g1f3 e7e6 c1g5", "托雷攻擊"],
  ["d2d4 d7d5 e2e4", "布萊克瑪－迪默棄兵"],
  ["c2c4 e7e5", "英國式開局・反向西西里"], ["c2c4 c7c5", "英國式開局・對稱變例"], ["g1f3 d7d5 c2c4", "雷蒂開局"],
  ["g1f3 d7d5 g2g3", "王翼印度攻擊"], ["f2f4 e7e5", "弗羅姆棄兵"], ["b2b3", "拉爾森開局"], ["b2b4", "波蘭開局"], ["g2g3", "匈牙利開局"],
];
const uciSq = (u) => (8 - Number(u[1])) * 8 + u.charCodeAt(0) - 97;
const bookKey = (P) => P.b.join("") + P.turn + P.castle; // no en passant square: e2e4 sets one whether or not it can be used
let OPENINGS = null;
function openingOf(moves) { // the name of the last position on the board that a book line reaches
  if (!OPENINGS) {
    OPENINGS = new Map();
    for (const [line, name] of BOOK) {
      let P = startPos();
      for (const u of line.split(" ")) { const m = legal(P).find((x) => x[0] === uciSq(u) && x[1] === uciSq(u.slice(2))); if (!m) throw new Error(`book: ${line}`); P = play(P, m); }
      OPENINGS.set(bookKey(P), name);
    }
  }
  let P = startPos(), name = "";
  for (const m of moves.slice(0, 24)) { P = play(P, m); name = OPENINGS.get(bookKey(P)) || name; }
  return name;
}
// 勢力 (the same day: 「會變動的勢力就是+-那個」): who stands better, in pawns, from white's side — a two-move look with the captures played out, worked
// once per position (never on a tap) and kept.
let EVAL = { at: "", v: 0 };
function standing(moves) {
  const at = moves.map((m) => m.join(",")).join(";");
  if (EVAL.at === at) return EVAL.v;
  const P = replay(moves), o = verdict(P);
  let v;
  if (o) v = o.who === "w" ? 1e5 : o.who === "b" ? -1e5 : 0;
  else { const s = search(P, 2, -1e6, 1e6, true); v = P.turn === "w" ? s : -s; }
  EVAL = { at, v };
  return v;
}
const SQ = 40, PAD = 16, SIZE = PAD * 2 + SQ * 8;
const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NAME = { k: "王", q: "后", r: "車", b: "象", n: "馬", p: "兵" };
// The men (the owner's pick 2026-11-26: 甲 象牙烏木雕) are the font's glyphs, given a body: a gradient for the material and a light from the upper left that
// raises their edges, so they read as carved pieces rather than print.
const PIECE_DEFS = `
  <linearGradient id="gc-ivory" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset=".55" stop-color="#efe1c0"/><stop offset="1" stop-color="#b89c6c"/></linearGradient>
  <linearGradient id="gc-ebony" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#7a6a5a"/><stop offset=".45" stop-color="#2a1f18"/><stop offset="1" stop-color="#080504"/></linearGradient>
  <filter id="gc-carve" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b"/>
    <feSpecularLighting in="b" surfaceScale="3.2" specularConstant=".9" specularExponent="22" lighting-color="#fff" result="l"><fePointLight x="-120" y="-200" z="220"/></feSpecularLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lit"/>
    <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k2="1" k3=".75" result="body"/>
    <feDropShadow dx=".8" dy="1.8" stdDeviation="1.1" flood-opacity=".55"/>
  </filter>`;
function boardSvg() { return drawBoard(replay(G.moves), G.moves.at(-1), SEL, G.you === "b", `西洋棋盤，第 ${Math.ceil(G.moves.length / 2) + (G.moves.length % 2 ? 0 : 1)} 回合`); }
function drawBoard(P, last, SEL, flip, label) { // the lesson board (每日一課) is drawn the same way
  const targets = SEL >= 0 ? legal(P).filter((m) => m[0] === SEL).map((m) => m[1]) : [];
  const check = inCheck(P) ? kingAt(P.b, P.turn) : -1;
  let sq = "", pcs = "", marks = "", coords = "";
  for (let s = 0; s < 64; s++) {
    const v = flip ? 63 - s : s, [f, r] = fr(v), x = PAD + f * SQ, y = PAD + r * SQ;
    sq += `<rect x="${x}" y="${y}" width="${SQ}" height="${SQ}" class="gc-${(f + r) % 2 ? "dark" : "light"}"/>`;
    if (last && (s === last[0] || s === last[1])) marks += `<rect x="${x}" y="${y}" width="${SQ}" height="${SQ}" class="gc-last"/>`;
    if (s === SEL) marks += `<rect x="${x + 1.5}" y="${y + 1.5}" width="${SQ - 3}" height="${SQ - 3}" class="gc-sel"/>`;
    if (s === check) marks += `<circle cx="${x + SQ / 2}" cy="${y + SQ / 2}" r="${SQ * .46}" class="gc-check"/>`;
    const p = P.b[s];
    if (p !== ".") pcs += `<text x="${x + SQ / 2}" y="${y + SQ * .8}" class="gc-pc ${white(p) ? "w" : "b"}">${GLYPH[p.toLowerCase()]}︎</text>`;
    if (targets.includes(s)) marks += p !== "." ? `<circle cx="${x + SQ / 2}" cy="${y + SQ / 2}" r="${SQ * .44}" class="gc-take"/>` : `<circle cx="${x + SQ / 2}" cy="${y + SQ / 2}" r="${SQ * .14}" class="gc-dot"/>`;
  }
  for (let i = 0; i < 8; i++) coords += `<text x="${PAD + i * SQ + SQ / 2}" y="${SIZE - 4}" class="gc-co">${"abcdefgh"[flip ? 7 - i : i]}</text><text x="${PAD / 2}" y="${PAD + i * SQ + SQ / 2 + 3.5}" class="gc-co">${flip ? i + 1 : 8 - i}</text>`;
  return `<svg class="gc-board" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${label}">
    <defs>${PIECE_DEFS}</defs><rect width="${SIZE}" height="${SIZE}" class="gc-rim"/><g>${sq}</g><g>${marks.replace(/class="gc-(dot|take)"/g, (m) => m)}</g><g class="gc-pcs">${pcs}</g>${coords}</svg>`;
}
function takenHtml(side) { // what `side` has captured from the other
  const P = replay(G.moves), count = (p) => P.b.filter((x) => x === p).length, full = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  let out = "";
  for (const t of ["q", "r", "b", "n", "p"]) { const p = side === "w" ? t : t.toUpperCase(), n = Math.max(0, full[t] - count(p)); out += `<span class="gc-pc ${side === "w" ? "b" : "w"}">${GLYPH[t]}︎</span>`.repeat(n); }
  return `<div class="gc-taken ${side}" aria-label="${side === G.you ? "你吃到的" : "電腦吃到的"}">${out}</div>`;
}
function wordOf() {
  const w = store.get("games.chess.tally", {}), t = w[G.level] || [0, 0, 0], o = G.over;
  const state = o ? (o.who === G.you ? `你贏了（${o.how}）` : o.who ? `電腦贏了（${o.how}）` : `和棋（${o.how}）`) : G.busy || compTurn() ? `這局你執${ZHC(G.you)}，電腦想一下……` : `${inCheck(replay(G.moves)) ? "將軍！" : ""}輪到你（${ZHC(G.you)}）`;
  return `<span class="gm-state">${o ? "" : `<i class="gc-turn ${G.you}" aria-hidden="true"></i>`}${state}</span><span class="gm-rec">這一段 ${t[0]} 勝 ${t[1]} 敗 ${t[2]} 和</span>`;
}
// The standing (the owner's pick 2026-11-27: 甲): a bar beside the board, your side at the bottom and filling up as you stand better, the number from your side.
const pawns = (v) => (Math.abs(v) >= 5e4 ? "勝勢" : Math.abs(v) < 5 ? "0.0" : `${v > 0 ? "+" : "−"}${(Math.abs(v) / 100).toFixed(1)}`);
function standHtml() {
  const w = standing(G.moves), mineV = G.you === "w" ? w : -w, part = (v) => 50 + 50 * Math.tanh(v / 450); // share of the bar, 0..100
  const who = (v) => (Math.abs(v) < 30 ? "均勢" : v > 0 ? "你優" : "電腦優");
  return `<div class="ge-vbar" role="img" aria-label="勢力 ${pawns(mineV)}，${who(mineV)}"><i class="ge-fill ${G.you}" style="height:${part(mineV).toFixed(1)}%"></i><b class="ge-num ${mineV >= 0 ? "lo" : "hi"}">${pawns(mineV).replace(/[+−]/, "")}</b></div>`;
}
function goHtml() {
  const op = openingOf(G.moves);
  return `<div class="gm-go gc">
    <div class="gm-levels" role="group" aria-label="難度">${LEVELS.map(([k, n]) => `<button type="button" data-level="${k}" aria-pressed="${G.level === k}">${n}</button>`).join("")}</div>
    <p class="ge-open">${op ? `<span>開局</span>${op}` : `<span>開局</span>—`}</p>
    ${takenHtml(G.you === "w" ? "b" : "w")}<div class="ge-row">${standHtml()}<div class="gm-bwrap">${boardSvg()}</div></div>${takenHtml(G.you)}
    <p class="gm-word">${wordOf()}</p>
    <div class="gm-acts"><button type="button" data-act="undo"${!mine() || G.busy ? " disabled" : ""}>悔棋</button><button type="button" data-act="new">新的一局</button></div>
  </div>`;
}
const save = () => store.set("games.chess", { level: G.level, moves: G.moves, over: G.over, you: G.you });
function finish() {
  const o = verdict(replay(G.moves)); if (!o) return;
  G.over = o;
  const w = store.get("games.chess.tally", {}), t = w[G.level] || [0, 0, 0];
  t[o.who === G.you ? 0 : o.who ? 1 : 2]++; w[G.level] = t; store.set("games.chess.tally", w);
}
function compMove(root) { // the phone's move, a moment after the board has been drawn
  if (G.over || !compTurn()) return;
  G.busy = true;
  setTimeout(() => {
    G.moves.push(think(G.moves, G.level)); G.busy = false; finish(); save();
    if (root.isConnected) { const nb = root.querySelector(".gm-go"); if (nb) { nb.outerHTML = goHtml(); wireGo(root); } }
  }, 260);
}
function wireGo(root) {
  const box = root.querySelector(".gm-go");
  const redraw = () => { box.outerHTML = goHtml(); wireGo(root); };
  box.querySelector(".gm-levels").onclick = (ev) => {
    const b = ev.target.closest("[data-level]"); if (!b || G.busy || b.dataset.level === G.level) return;
    G = fresh(b.dataset.level); SEL = -1; save(); redraw(); compMove(root);
  };
  box.querySelector(".gm-acts").onclick = (ev) => {
    const a = ev.target.closest("[data-act]")?.dataset.act; if (!a || G.busy) return;
    if (a === "new") G = fresh(G.level);
    else if (a === "undo") { const n = mine() - 1; while (G.moves.length && (mine() > n || compTurn())) G.moves.pop(); G.over = null; } // back to just before your last move
    SEL = -1; save(); redraw(); compMove(root);
  };
  box.querySelector(".gc-board").onclick = (ev) => {
    if (G.over || G.busy) return;
    const r = ev.currentTarget.getBoundingClientRect(), k = SIZE / r.width;
    const f = Math.floor(((ev.clientX - r.left) * k - PAD) / SQ), rk = Math.floor(((ev.clientY - r.top) * k - PAD) / SQ);
    if (f < 0 || rk < 0 || f > 7 || rk > 7 || compTurn()) return;
    const s = G.you === "b" ? 63 - (rk * 8 + f) : rk * 8 + f, P = replay(G.moves);
    if (SEL >= 0) {
      const m = legal(P).find((x) => x[0] === SEL && x[1] === s);
      if (m) {
        G.moves.push(m); SEL = -1; finish(); save(); redraw(); compMove(root);
        return;
      }
    }
    SEL = sideOf(P.b[s]) === G.you && s !== SEL ? s : -1; redraw();
  };
}

// ——— 每日一課 ——— (the owner 2026-11-28; his picks: 乙 讀一段＋走一題, 照自己的進度, 365 課, 甲 老師口吻 — lessons.js; then 「我要循序漸進 真的要學會」:
// 一課三題 — the lesson's own position and two from real games, all three found by yourself before the lesson counts as learned). One new lesson a day:
// the next opens on the first day after the last was finished, so a day away skips nothing. A puzzle whose answer you looked at comes back the next day,
// before that day's new lesson. The move is judged here, on the phone.
const sqName = (s) => "abcdefgh"[s & 7] + (8 - (s >> 3));
const uci = (m) => sqName(m[0]) + sqName(m[1]);
function fromFen(fen) {
  const [rows, turn, castle] = fen.split(" "), b = [];
  for (const ch of rows.replace(/\//g, "")) /\d/.test(ch) ? b.push(...".".repeat(Number(ch))) : b.push(ch);
  const P = { b, turn, castle: castle === "-" ? "" : castle, ep: -1, half: 0 }; P.seen = [keyOf(P)];
  return P;
}
export const LESSON_ENGINE = { fromFen, legal, play, inCheck, uci, sqName }; // for scripts/check_lessons.js and scripts/pick_puzzles.js
// Not open yet (the owner 2026-11-28 15:3x 「明天做完再放第一課」, then 「分頁留著、只把內容換成『明天開課』」): the tab stays and says only that.
// When it opens it starts from lesson 1 — what was done on the phone before that does not count.
const LESSON_OPEN = false;
const lessonOf = (n) => LESSONS.find((x) => x.n === n);
const puzzleOf = (n, i) => { const k = lessonOf(n); return i ? k.practice[i - 1] : k; }; // 0 = the lesson's own, 1–2 = from real games
const PER = 3;
// Kept on the phone: { n: today's lesson, got: { n: [i found by yourself] }, peek: { n: [i looked at] }, done: { n: { on: date } }, again: [[n, i, day looked]] }.
// A puzzle in `again` comes back on any day after the day it was looked at, before that day's lesson; looked at once more, it moves on a day.
function lessonState() {
  const st = { n: 1, got: {}, peek: {}, done: {}, again: [], ...store.get("games.lesson", {}) }, d = st.done[st.n];
  if (d && d.on < twNow().date && st.n < TOTAL && lessonOf(st.n + 1)) { st.n++; store.set("games.lesson", st); }
  return st;
}
const dueAgain = (st) => st.again.find(([, , on]) => on < twNow().date);
let L = null; // the puzzle on the sheet: { n, i, again, moves, sel, last, say, kind, busy }
function pickTask(st) {
  const a = dueAgain(st); if (a) return { n: a[0], i: a[1], again: true, kind: "" };
  if (st.done[st.n]) return { n: st.n, i: 0, again: false, kind: "learned" };
  const got = [...(st.got[st.n] || []), ...(st.peek[st.n] || [])];
  return { n: st.n, i: [0, 1, 2].find((i) => !got.includes(i)), again: false, kind: "" };
}
const lessonPos = () => { const k = puzzleOf(L.n, L.i); let P = fromFen(k.fen); for (const u of L.moves) P = play(P, legal(P).find((m) => uci(m) === u)); return P; };
const moveWord = (P, m) => `${NAME[P.b[m[0]].toLowerCase()]}走到 ${sqName(m[1])}`;
const goalOf = (q) => q.goal || (q.mate ? "一步將死" : "找出那一招");
function dots(st, n) { const got = st.got[n] || [], peek = st.peek[n] || []; return [0, 1, 2].map((i) => `<i class="${got.includes(i) ? "on" : peek.includes(i) ? "peek" : ""}${!L.again && L.n === n && L.i === i && !["solved", "learned"].includes(L.kind) ? " now" : ""}"></i>`).join(""); }
function lessonHtml() {
  if (!LESSON_OPEN) return `<div class="gm-slip gl-lesson" role="group" aria-label="今日一課"><p class="gm-head">今日一課</p><p class="gl-wait">明天開課</p></div>`;
  const st = lessonState(), k = lessonOf(st.n);
  if (!k) return `<div class="gm-slip gl-lesson"><p class="gm-head">今日一課</p><p class="gl-wait">第 ${st.n} 課還在寫，明天見。</p></div>`;
  if (!L || (!L.again && L.n !== st.n)) L = { ...pickTask(st), moves: [], sel: -1, say: "" };
  const K = lessonOf(L.n), q = puzzleOf(L.n, L.i), T = K.say, P = lessonPos(), side = fromFen(q.fen).turn, [stage, si, len] = stageOf(K.n);
  const solved = L.kind === "solved" || L.kind === "learned", lastOne = !L.again && !!st.done[st.n];
  const head = L.again ? `<p class="gl-no">再考一次　<span>第 ${K.n} 課 ${K.title}　第 ${L.i + 1} 題</span></p><p class="gl-text gl-again">昨天這一題看了答案，今天自己走走看。</p>`
    : `<p class="gl-no">第 ${K.n} 課　<span>${stage} ${si}／${len}</span></p><h3 class="gl-title">${K.title}</h3>${T.text.map((t) => `<p class="gl-text">${t}</p>`).join("")}
      <p class="gl-step"><b>${L.kind === "learned" ? "三題都做完了" : `第 ${L.i + 1} 題／${PER}`}</b><span class="gl-dots" aria-hidden="true">${dots(st, K.n)}</span>${L.i && L.kind !== "learned" ? `<em>真實對局</em>` : ""}</p>`;
  let says = L.say ? `<p class="gl-say ${L.kind === "learned" ? "solved" : L.kind}">${L.say}</p>` : "";
  if (L.kind === "learned") {
    const pk = (st.peek[st.n] || []).filter((i) => !(st.got[st.n] || []).includes(i));
    says = `<p class="gl-say solved">${T.done}</p><p class="gl-next">${pk.length ? `第 ${pk.map((i) => i + 1).join("、")} 題看了答案，明天先再考一次。<br>` : ""}${st.n < TOTAL ? `明天開第 ${st.n + 1} 課` : ""}</p>`;
  }
  const acts = solved ? (L.kind === "learned" ? "" : `<div class="gm-acts gl-acts"><button type="button" data-l="next">${L.again ? (dueAgain(st) ? "下一題" : "開始今天的課") : lastOne ? "這一課學完了" : "下一題"}</button></div>`)
    : `<div class="gm-acts gl-acts"><button type="button" data-l="hint">提示</button><button type="button" data-l="show">看答案</button></div>`;
  return `<div class="gm-slip gl-lesson" role="group" aria-label="今日一課">
    <p class="gm-head">今日一課</p>${head}
    <div class="gm-bwrap gl-bwrap">${drawBoard(P, L.last, L.sel, side === "b", `${K.title}，第 ${L.i + 1} 題的棋盤`)}</div>
    ${solved ? "" : `<p class="gl-goal"><i class="gc-turn ${side}" aria-hidden="true"></i>${L.busy ? `${ZHC(side === "w" ? "b" : "w")}方想一下……` : `輪到你（${ZHC(side)}）：${goalOf(q)}`}</p>`}
    ${says}${acts}
  </div>`;
}
function settle(peeked) { // the puzzle on the sheet is finished: by yourself, or by looking
  const st = lessonState(), { n, i } = L, today = twNow().date, add = (o) => { o[n] = [...new Set([...(o[n] || []), i])]; };
  st.again = st.again.filter(([a, b]) => !(a === n && b === i));
  if (peeked) st.again.push([n, i, today]); // comes back tomorrow
  if (!L.again) { add(peeked ? st.peek : st.got); if ([0, 1, 2].every((j) => [...(st.got[n] || []), ...(st.peek[n] || [])].includes(j))) st.done[n] = { on: today }; }
  store.set("games.lesson", st); L.kind = "solved";
}
function wireLesson(root) {
  const box = root.querySelector(".gl-lesson"); if (!box || !L || !lessonOf(L.n)) return;
  const K = lessonOf(L.n), q = puzzleOf(L.n, L.i), T = K.say, redraw = () => { box.outerHTML = lessonHtml(); wireLesson(root); };
  box.querySelector(".gl-acts")?.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-l]")?.dataset.l; if (!a || L.busy) return;
    if (a === "next") { L = null; redraw(); return; }
    if (L.kind === "solved") return;
    if (a === "hint") { L.kind = "hint"; L.say = `提示：${L.i || L.again ? T.tip : T.hint}`; }
    else { // 看答案: play out what is left
      let P = lessonPos(); const words = [];
      if (q.mate) { const m = legal(P).find((x) => { const n = play(P, x); return inCheck(n) && !legal(n).length; }); words.push(moveWord(P, m)); L.moves.push(uci(m)); L.last = m; }
      else for (let j = L.moves.length; j < q.line.length; j++) { const m = legal(P).find((x) => uci(x) === q.line[j]); if (j % 2 === 0) words.push(moveWord(P, m)); P = play(P, m); L.moves.push(q.line[j]); L.last = m; }
      L.sel = -1; settle(true); L.say = `答案：${words.join("，再")}。這題明天再考一次。`;
    }
    redraw();
  });
  box.querySelector(".gc-board").onclick = (ev) => {
    if (L.kind === "solved" || L.kind === "learned" || L.busy) return;
    const P = lessonPos(), flip = fromFen(q.fen).turn === "b", r = ev.currentTarget.getBoundingClientRect(), z = SIZE / r.width;
    const f = Math.floor(((ev.clientX - r.left) * z - PAD) / SQ), rk = Math.floor(((ev.clientY - r.top) * z - PAD) / SQ);
    if (f < 0 || rk < 0 || f > 7 || rk > 7) return;
    const s = flip ? 63 - (rk * 8 + f) : rk * 8 + f, m = L.sel >= 0 && legal(P).find((x) => x[0] === L.sel && x[1] === s);
    if (!m) { L.sel = sideOf(P.b[s]) === P.turn && s !== L.sel ? s : -1; redraw(); return; }
    L.sel = -1;
    const n = play(P, m), foe = n.turn === "w" ? "白王" : "黑王", good = () => (L.i === 0 && !L.again ? T.done : L.again ? "對！這次自己找到了。" : L.i === 2 ? "對！三題都走完了。" : "對！同一招，換了局面也找得到。");
    if (q.mate) {
      if (inCheck(n) && !legal(n).length) { L.moves.push(uci(m)); L.last = m; settle(false); L.say = good(); }
      else { L.kind = "wrong"; const run = legal(n).filter((x) => x[0] === kingAt(n.b, n.turn)).map((x) => sqName(x[1]));
        L.say = inCheck(n) ? `將軍了，可是${foe}還能${run.length ? `逃到 ${run.join("、")}` : "擋住或吃掉這一子"}。再想想。` : `${moveWord(P, m)}，還沒有將軍，${foe}很安全。再想想。`; }
      redraw(); return;
    }
    if (uci(m) !== q.line[L.moves.length]) { L.kind = "wrong"; L.say = `不是這一步。再想想，或按「提示」。`; redraw(); return; }
    L.moves.push(uci(m)); L.last = m; L.say = "";
    if (L.moves.length >= q.line.length) { settle(false); L.say = good(); redraw(); return; }
    L.kind = ""; L.busy = true; redraw(); // the other side answers, then it is your move again
    setTimeout(() => {
      const Q = lessonPos(), r2 = legal(Q).find((x) => uci(x) === q.line[L.moves.length]);
      L.moves.push(q.line[L.moves.length]); L.last = r2; L.busy = false; L.kind = "go"; L.say = `${ZHC(Q.turn)}${moveWord(Q, r2)}。好，換你。`;
      if (root.isConnected && root.querySelector(".gl-lesson")) { root.querySelector(".gl-lesson").outerHTML = lessonHtml(); wireLesson(root); }
    }, 600);
  };
}

// The desk under the three boxes (the owner's pick 2026-11-26: 乙 鑲嵌木框): a marquetry band let into the cherry, four gilt corner pieces.
const CORNER = `<svg viewBox="0 0 44 44" aria-hidden="true"><defs><linearGradient id="gd-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe9b0"/><stop offset=".5" stop-color="#c9a456"/><stop offset="1" stop-color="#7a5a1e"/></linearGradient></defs>
  <g fill="none" stroke="url(#gd-g)" stroke-linecap="round"><path d="M2 42V2H42" stroke-width="1.6"/><path d="M6 42V6H42" stroke-width=".7"/>
  <path d="M6 22C12 22 14 16 12 12C16 14 22 12 22 6" stroke-width="1.1"/><path d="M10 30C14 26 12 20 9 18M30 10C26 14 20 12 18 9" stroke-width=".8"/></g>
  <path d="M12 12l3.2-1.2L12 7.6l-1.2 3.2Z" fill="url(#gd-g)"/><circle cx="12" cy="12" r="2.2" fill="url(#gd-g)"/><circle cx="12" cy="12" r=".9" fill="#5a3a10"/>
  <circle cx="22" cy="6" r="1.2" fill="url(#gd-g)"/><circle cx="6" cy="22" r="1.2" fill="url(#gd-g)"/></svg>`;
export function deskHtml() {
  return `<i class="gd-panel" aria-hidden="true">${[1, 2, 3, 4].map((k) => `<b class="gd-c gd-c${k}">${CORNER}</b>`).join("")}</i>`;
}
export function gamesHtml() {
  if (!G) { const k = store.get("games.chess", null); G = k && Array.isArray(k.moves) ? { level: k.level || "mid", moves: k.moves, over: k.over || null, you: k.you === "b" ? "b" : "w" } : fresh(); save(); }
  G.busy = false; SEL = -1;
  if (!G.over && compTurn()) { G.moves.push(think(G.moves, G.level)); finish(); save(); } // the phone's turn: left while it was thinking, or it opens as white
  // The page in three tabs (the owner 2026-11-28 「美化編排一下整個遊戲頁面」, his pick 乙 分頁): 對局 first and the default (西洋棋在最上面，社長 2026-11-27),
  // 今日一課, 開獎・巴薩; the tab last open is kept on the phone.
  // The men's gradients and light, once and never hidden: a board inside a hidden tab would otherwise hold the first copy, and url(#gc-ivory) on the
  // shown board would find that one and paint nothing.
  const defs = `<svg class="gc-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>${PIECE_DEFS}</defs></svg>`;
  const sec = (k, html) => `<section class="gp-sec" id="gp-${k}" data-sec="${k}" role="tabpanel">${html}</section>`;
  const tabs = [["go", "對局"], ["lesson", "今日一課"], ["bet", "開獎・巴薩"]], kept = store.get("games.tab", "go"), tab = tabs.some(([k]) => k === kept) ? kept : "go";
  return `${defs}<nav class="gp-tabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join("")}</nav>
    <div class="gm-table gp-b" data-tab="${tab}">${sec("go", goHtml())}${sec("lesson", lessonHtml())}${sec("bet", slipHtml() + barcaHtml())}</div>`;
}
export function wireGames(root) {
  if (!root) return;
  noteTaiex(store.get("market.last", null)?.items);
  wireSlip(root); wireBarca(root); wireGo(root); wireLesson(root);
  const scene = root.parentElement;
  scene.querySelector(".gp-tabs")?.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-tab]"); if (!b) return; store.set("games.tab", b.dataset.tab);
    root.dataset.tab = b.dataset.tab; scene.querySelectorAll(".gp-tabs [data-tab]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
  });
  fetchMarket().then((d) => { // the file as it stands now: a close that came in since the front page was read settles here too
    if (!d || !root.isConnected) return;
    noteTaiex(d.items);
    const slip = root.querySelector(".gm-tw"); if (slip) { slip.outerHTML = slipHtml(); wireSlip(root); } // the 台股 slip only (11-28: 「今日一課有台股」 — the first .gm-slip is the lesson sheet)
  }).catch(() => {});
}
