// 詩箋 (the owner's pick, 2026-11-19: the letters of the samples, set in the letterpress types — 「我只要改詩箋」): every
// 詩 piece read is a letter. The whole poem (the article's first quote that runs over several lines) is printed on
// gold-flecked laid paper with a faint robin watermark — its title, the poet, the original under the translation —
// lying on the open writing box where the earlier letters stand in their envelopes, the box's brass plate counting them.
// #/poems shows the newest; a swipe or the ‹ › on the box turns to the next, a tap on the poet's line opens the article.
// The letterpress types (Shippori Mincho B1, Old Standard TT) are only used here.
import { esc } from "./util.js";

const ROMAN = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
let topDate = null;

// The poem of an article: its first quote of four lines or more; the cite gives the poet, 〈title〉 and (original title).
export function poemOf(art) {
  const q = (art?.body || []).find((b) => b?.type === "quote" && String(b.text || "").split("\n").length >= 4);
  if (!q) return null;
  const cite = String(q.cite || ""), poet = cite.split(/[，,]/)[0].trim();
  const title = (cite.match(/〈([^〉]+)〉/) || [])[1] || "", orig = (cite.match(/〉（([^）]+)）/) || [])[1] || "";
  return { text: String(q.text), original: q.original ? String(q.original) : "", poet, title, orig };
}

const flecks = (() => { let s = ""; for (let i = 0; i < 46; i++) s += `<i style="left:${((i * 73) % 92) + 3}%;top:${((i * 131) % 94) + 2}%;width:${1 + (i % 3)}px;height:${1 + ((i * 7) % 3)}px;transform:rotate(${i * 37}deg)"></i>`; return s; })();

function sheetHtml(p, poem) {
  const head = poem ? `${poem.orig ? `<span class="po-orig">${esc(poem.orig)}</span>` : ""}<span class="po-title">${esc(poem.title || p.a.title)}</span>` : `<span class="po-title">${esc(p.a.title)}</span>`;
  return `<div class="po-sheet"><span class="po-flecks" aria-hidden="true">${flecks}</span><svg class="po-wm" viewBox="6 16 54 38" aria-hidden="true"><use href="#po-robin"/></svg>
      ${head}<i class="po-rule" aria-hidden="true"></i>
      ${poem ? `<p class="po-text">${esc(poem.text)}</p>${poem.original ? `<p class="po-de">${esc(poem.original)}</p>` : ""}` : '<p class="po-text po-wait">……</p>'}
      <a class="po-poet" href="#/a/${esc(p.date)}/poem">— ${esc(poem?.poet || "")}</a></div>`;
}

export function poemsHtml(list) {
  if (!list.length) return "";
  const i = Math.max(0, list.findIndex((p) => p.date === topDate));
  return `<svg class="po-defs" width="0" height="0" aria-hidden="true"><defs>
      <filter id="po-press" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="1.6" result="d"/><feGaussianBlur in="d" stdDeviation=".25"/></filter>
      <symbol id="po-robin" viewBox="6 16 54 38"><path d="M44.5 37.5 L55 30.5 L56.5 34 L46.5 41.5 Z"/><ellipse cx="33" cy="37" rx="15" ry="11.5" transform="rotate(-18 33 37)"/><circle cx="23" cy="25.5" r="8"/><path d="M15.4 24.2 L9.5 25.8 L15.6 27.4 Z"/></symbol></defs></svg>
    <div class="po-desk"><div class="po-top" data-date="${esc(list[i].date)}">${sheetHtml(list[i], null)}</div>
      <div class="po-box"><i class="po-well"></i>${list.slice(1, 6).map((_, k) => `<i class="po-env" style="--k:${k}"></i>`).join("")}
        <div class="po-sb">${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="-1" aria-label="較新的一封"${i ? "" : " disabled"}>‹</button>` : ""}
          <span class="sc-brass po-plate"><span class="sc-cut">Briefe · ${ROMAN(list.length)}</span></span>
          ${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="1" aria-label="較舊的一封"${i < list.length - 1 ? "" : " disabled"}>›</button>` : ""}</div></div></div>`;
}

// Draws the letter once its article is in (load(date) → the article json), and wires the turning.
export function wirePoems(scene, list, load) {
  if (!scene || !list.length) return;
  let i = Math.max(0, list.findIndex((p) => p.date === topDate)), seq = 0;
  const top = scene.querySelector(".po-top");
  const fill = async (step) => {
    const mine = ++seq, p = list[i];
    const a = await load(p.date).catch(() => null);
    if (mine !== seq || !top.isConnected) return;
    top.innerHTML = sheetHtml(p, poemOf(a));
    if (step) { top.classList.remove("turn-l", "turn-r"); void top.offsetWidth; top.classList.add(step > 0 ? "turn-l" : "turn-r"); }
  };
  fill(0);
  if (list.length < 2) return;
  const prev = scene.querySelector('[data-flip="-1"]'), next = scene.querySelector('[data-flip="1"]');
  const go = (step) => {
    const j = Math.min(list.length - 1, Math.max(0, i + step));
    if (j === i) return;
    i = j; topDate = list[i].date;
    prev.disabled = i === 0; next.disabled = i === list.length - 1;
    fill(step);
  };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  top.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  top.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (x0 > 24 && Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  top.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true);
}
