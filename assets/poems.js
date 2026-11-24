// 詩箋 (the owner's pick, 2026-11-19: the letters of the samples, set in the letterpress types — 「我只要改詩箋」): every
// 詩 piece read is a letter. The whole poem (the article's first quote that runs over several lines) is printed on
// gold-flecked laid paper with a faint robin watermark — its title, the poet, the original under the translation —
// lying on the open writing box where the earlier letters stand in their envelopes, the box's brass plate counting them.
// #/poems shows the newest; a swipe or the ‹ › on the box turns to the next, a tap on the poet's line opens the article;
// a tap on the brass plate lays every letter out on the desk, folded, its title on it; the brass die draws one.
// 藏品標出處 (the owner's pick of the samples, 2026-11-25: the year alone): each folded letter, and the newest letter's
// envelope in front in the box, carries a round postmark with the year the poem was written (index.json `written`, from
// the article's 資料表 — build_index.py provenance); a poem whose year is not given has none. Drawn once, in ink under
// the type, never on the letter that turns.
// The letterpress types (Shippori Mincho B1, Old Standard TT) are only used here.
import { esc } from "./util.js";

const ROMAN = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
let topDate = null;
export const toTop = (date) => { topDate = date; }; // 新藏品入館: the letter just come in is the one on the desk

// the postmark: a ring, the year between two rules, the ink a little uneven (#po-ink)
const postmark = (y) => (/^\d{3,4}$/.test(String(y || "")) ? `<svg class="po-pm" viewBox="0 0 60 60" aria-hidden="true"><g filter="url(#po-ink)"><circle cx="30" cy="30" r="27.4" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="30" y="36" font-size="16.5" fill="currentColor" font-family="Old Standard TT, serif" font-weight="700" text-anchor="middle" letter-spacing=".2">${y}</text><path d="M16 41.5h28M16 20.5h28" stroke="currentColor" stroke-width=".7"/></g></svg>` : "");

// The poem of an article: its first quote of four lines or more; the cite gives the poet, 〈title〉 and (original title).
export function poemOf(art) {
  const q = (art?.body || []).find((b) => b?.type === "quote" && String(b.text || "").split("\n").length >= 4);
  if (!q) return null;
  const cite = String(q.cite || ""), poet = cite.split(/[，,]/)[0].trim();
  const title = (cite.match(/〈([^〉]+)〉/) || [])[1] || "", orig = (cite.match(/〉（([^）]+)）/) || [])[1] || "";
  return { text: String(q.text), original: q.original ? String(q.original) : "", poet, title, orig };
}

const flecks = (() => { let s = ""; for (let i = 0; i < 46; i++) s += `<i style="left:${((i * 73) % 92) + 3}%;top:${((i * 131) % 94) + 2}%;width:${1 + (i % 3)}px;height:${1 + ((i * 7) % 3)}px;transform:rotate(${i * 37}deg)"></i>`; return s; })();

function sheetHtml(p, poem, loaded = false) {
  const head = poem ? `${poem.orig ? `<span class="po-orig">${esc(poem.orig)}</span>` : ""}<span class="po-title">${esc(poem.title || p.a.title)}</span>` : `<span class="po-title">${esc(p.a.title)}</span>`;
  return `<div class="po-sheet"><span class="po-flecks" aria-hidden="true">${flecks}</span><svg class="po-wm" viewBox="6 16 54 38" aria-hidden="true"><use href="#po-robin"/></svg>
      ${head}<i class="po-rule" aria-hidden="true"></i>
      ${poem ? `<p class="po-text">${esc(poem.text)}</p>${poem.original ? `<p class="po-de">${esc(poem.original)}</p>` : ""}` : loaded ? `<p class="po-text">${esc(p.a.dek || "")}</p>` : '<p class="po-text po-wait">……</p>'}
      <a class="po-poet" href="#/a/${esc(p.date)}/poem">${poem?.poet ? `— ${esc(poem.poet)}` : "讀這一篇"}</a></div>`;
}

export function poemsHtml(list) {
  if (!list.length) return "";
  const i = Math.max(0, list.findIndex((p) => p.date === topDate));
  return `<svg class="po-defs" width="0" height="0" aria-hidden="true"><defs>
      <filter id="po-press" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="1.6" result="d"/><feGaussianBlur in="d" stdDeviation=".25"/></filter>
      <filter id="po-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
      <symbol id="po-robin" viewBox="6 16 54 38"><path d="M44.5 37.5 L55 30.5 L56.5 34 L46.5 41.5 Z"/><ellipse cx="33" cy="37" rx="15" ry="11.5" transform="rotate(-18 33 37)"/><circle cx="23" cy="25.5" r="8"/><path d="M15.4 24.2 L9.5 25.8 L15.6 27.4 Z"/></symbol></defs></svg>
    <div class="po-desk"><div class="po-top" data-date="${esc(list[i].date)}"><div class="po-leaf cur">${sheetHtml(list[i], null)}</div></div>
      <div class="po-box"><i class="po-well"></i>${list.slice(1, 6).map((_, k, e) => (k < e.length - 1 || !postmark(list[0].a.written) ? `<i class="po-env" style="--k:${k}"></i>` : `<i class="po-env pm" style="--k:${k}">${postmark(list[0].a.written)}</i>`)).join("")}
        <div class="po-sb">${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="-1" aria-label="較新的一封"${i ? "" : " disabled"}>‹</button>` : ""}
          ${list.length > 1 ? `<button type="button" class="sc-brass po-plate sc-plate-btn" data-all aria-label="全部攤開，${list.length} 封"><span class="sc-cut">Briefe · ${ROMAN(list.length)}</span></button>` : `<span class="sc-brass po-plate"><span class="sc-cut">Briefe · ${ROMAN(list.length)}</span></span>`}
          ${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="1" aria-label="較舊的一封"${i < list.length - 1 ? "" : " disabled"}>›</button><button type="button" class="sc-die" data-die aria-label="隨機抽一張"><i></i><i></i><i></i></button>` : ""}</div></div></div>
    ${list.length > 1 ? `<div class="po-all" hidden>${list.map((p, k) => `<button type="button" class="po-note" data-pick="${k}">${postmark(p.a.written)}<b>……</b><i></i><span class="po-wax" aria-hidden="true"></span></button>`).join("")}
      <div class="pr-all-bar"><button type="button" class="sc-brass po-plate sc-plate-btn" data-all aria-label="收回信盒"><span class="sc-cut">Alle · ${ROMAN(list.length)}</span></button><button type="button" class="sc-die" data-die aria-label="隨機抽一張"><i></i><i></i><i></i></button></div></div>` : ""}`;
}

// Draws the letter once its article is in (load(date) → the article json), and wires the turning.
export function wirePoems(scene, list, load) {
  if (!scene || !list.length) return;
  let i = Math.max(0, list.findIndex((p) => p.date === topDate)), seq = 0, moving = null;
  const top = scene.querySelector(".po-top");
  // 翻閱 (the owner, 2026-11-19: 詩箋左右滑我要有翻閱動畫): turning on, the letter on top lifts from its left edge and is
  // turned over and away, the next one lying under it; turning back, the earlier letter is turned back over onto it.
  // Smooth on the phone (the owner, 2026-11-19: 詩箋翻起來很卡; again 2026-11-24): drawing a letter — its pressed type above
  // all — is what holds a turn back. The old turn drew two or three (a copy turned, the new letter, the held one at the
  // end): 65–190 ms in WebKit before the leaf moved, median 105 (2026-11-24). Now every letter is a leaf of its own: the one
  // read lies in the flow, the letters either side wait under it unseen, laid out with their type loaded (after the turn),
  // and a turn only moves leaves (transform, opacity) and changes which one is read: 26–99 ms, median about 72. WebKit still draws a leaf again as it comes into
  // view (~55 ms with the pressed type, ~21 without), and, inferred from one run, as it starts to turn; that much is left.
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const leaves = new Map([[i, top.querySelector(".po-leaf")]]), drawn = new Set();
  const show = () => leaves.forEach((g, k) => { g.classList.toggle("cur", k === i); g.inert = k !== i; if (k === i) g.removeAttribute("aria-hidden"); else g.setAttribute("aria-hidden", "true"); });
  const settle = () => { top.querySelectorAll(".po-leaf.away, .po-leaf.back, .po-leaf.under").forEach((g) => g.classList.remove("away", "back", "under")); moving = null; };
  const put = (k, html) => {
    let g = leaves.get(k);
    if (!g) { g = document.createElement("div"); g.className = "po-leaf"; leaves.set(k, g); top.append(g); }
    g.innerHTML = html; show();
    return g;
  };
  // a letter's leaf, drawn once its article is in (load(date) → the article json); only near the one read, or the one turned to
  const ready = (k, to = false) => drawn.has(k) ? Promise.resolve() : load(list[k].date).catch(() => null).then((a) => {
    if (drawn.has(k) || !top.isConnected || (!to && Math.abs(k - i) > 1)) return;
    if (a) drawn.add(k); // not in: the opening lines for now, fetched again when it is turned to
    put(k, sheetHtml(list[k], poemOf(a), true));
  });
  // after a turn: the letters either side drawn, the ones further off put away
  const around = () => {
    leaves.forEach((g, k) => { if (Math.abs(k - i) > 1 && !g.matches(".away, .back, .under")) { g.remove(); leaves.delete(k); drawn.delete(k); } });
    [i - 1, i + 1].forEach((k) => list[k] && ready(k));
  };
  ready(i).then(() => list.length > 1 && around());
  if (list.length < 2) return;
  top.addEventListener("animationend", (e) => { if (e.target === moving && !e.pseudoElement) { settle(); around(); } });
  const prev = scene.querySelector('[data-flip="-1"]'), next = scene.querySelector('[data-flip="1"]');
  const go = async (step) => {
    const j = Math.min(list.length - 1, Math.max(0, i + step));
    if (j === i) return;
    const mine = ++seq;
    if (!drawn.has(j)) { await ready(j, true); if (mine !== seq || !top.isConnected) return; } // a draw of the die, a pick from the desk, a tap while a turn is on: the letter first, as before
    settle();
    const from = leaves.get(i), to = leaves.get(j);
    i = j; topDate = list[i].date;
    prev.disabled = i === 0; next.disabled = i === list.length - 1;
    [i - 1, i + 1].forEach((k) => list[k] && load(list[k].date).catch(() => null)); // fetched now, drawn once the turn is over
    show();
    if (top.getBoundingClientRect().top < 0) window.scrollTo(0, 0); // a long poem turned from the foot of the page: start the next at its head
    if (still() || !from || !to) return around();
    if (step > 0) { from.classList.add("away"); moving = from; } else { to.classList.add("back"); from.classList.add("under"); moving = to; }
    const m = moving;
    setTimeout(() => { if (mine === seq && moving === m) { settle(); around(); } }, 1200); // in case the animation never runs (not a later turn's: a leaf turned on and straight back is the same leaf)
  };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  // 全部攤開: every letter folded on the desk with its title (the poems are read once, when the desk is first spread)
  const all = scene.querySelector(".po-all"), desk = scene.querySelector(".po-desk");
  let named = false;
  const name = () => { if (named) return; named = true;
    all.querySelectorAll("[data-pick]").forEach((b) => { const p = list[Number(b.dataset.pick)];
      load(p.date).then((a) => { const m = poemOf(a); b.querySelector("b").textContent = m?.title || p.a.title; b.querySelector("i").textContent = m?.orig || m?.poet || ""; b.setAttribute("aria-label", m?.title || p.a.title); }).catch(() => { b.querySelector("b").textContent = p.a.title; }); }); };
  const spread = (on) => { scene.classList.toggle("spread", on); all.hidden = !on; desk.hidden = on; if (on) name(); window.scrollTo(0, 0); };
  scene.querySelectorAll("[data-all]").forEach((b) => b.addEventListener("click", () => spread(all.hidden)));
  all.addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (!b) return; const k = Number(b.dataset.pick); spread(false); if (k !== i) go(k - i); });
  scene.querySelectorAll("[data-die]").forEach((b) => b.addEventListener("click", () => {
    let k = Math.floor(Math.random() * (list.length - 1)); if (k >= i) k++;
    b.classList.remove("roll"); void b.offsetWidth; b.classList.add("roll");
    spread(false); go(k - i);
  }));
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  top.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  top.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (x0 > 24 && Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  top.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true);
}
