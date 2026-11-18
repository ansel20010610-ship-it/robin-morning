// 版畫冊 (the owner's pick, 2026-11-19: the leather portfolio of scene 5): every 建築 piece read is an etching — the
// article's picture bitten into cotton paper (sepia ink, cross-hatching, the plate mark pressed round it), the building's
// name under it (from the article's topic_key, as a printer would set it) with the headline in small type, the number
// and the day pencilled in the margins. #/prints is a blue leather portfolio open on the desk with the newest print on
// top under a half-lifted tissue; a swipe or the ‹ › on the desk turns to the next print, a tap on the print opens the
// article. Leather and wood are the bookcase's photographs (assets/shelf/, Poly Haven, CC0).
import { esc } from "./util.js";

const ROMAN = (n) => [[1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"], [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
const MONTH = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
// architecture:pantheon-rome → Pantheon Rome
export const buildingName = (a) => String(a.topic_key || "").replace(/^architecture:/, "").split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const dateLine = (d) => { const [y, m, dd] = d.split("-").map(Number); return `${dd}. ${MONTH[m - 1]}. ${ROMAN(y).toUpperCase()}`; };
let topDate = null; // the print left on top, kept while the reader opens its article and comes back

function printHtml(p, n, total) {
  const src = p.a.hero?.thumb || p.a.hero?.src || "";
  return `<a class="pr-sheet" href="#/a/${esc(p.date)}/architecture" aria-label="${esc(buildingName(p.a) || p.a.title)}：${esc(p.a.title)}，第 ${total - n} 張">
      <span class="pr-plate"><span class="pr-etch">${src ? `<img src="${esc(src)}" alt="" decoding="async" referrerpolicy="no-referrer">` : ""}<i></i><i></i></span></span>
      <span class="pr-name">${esc(buildingName(p.a))}</span>
      <span class="pr-head">${esc(p.a.title)}</span>
      <span class="pr-pencil l">N° ${ROMAN(total - n)}</span><span class="pr-pencil r">${esc(dateLine(p.date))}</span>
    </a><i class="pr-tissue" aria-hidden="true"></i>`;
}

export function printsHtml(list) {
  if (!list.length) return "";
  const i = Math.max(0, list.findIndex((p) => p.date === topDate));
  return `<div class="pr-folio"><i class="pr-gilt" aria-hidden="true"></i><i class="pr-tie l" aria-hidden="true"></i><i class="pr-tie r" aria-hidden="true"></i>
      <div class="pr-stack">${list.length > 1 ? '<i class="pr-under" aria-hidden="true"></i>' : ""}<div class="pr-top">${printHtml(list[i], i, list.length)}</div></div></div>
    ${list.length > 1 ? `<div class="pr-nav"><button type="button" class="cr-flip sh-foil" data-flip="-1" aria-label="較新的一張"${i ? "" : " disabled"}>‹</button><span class="pr-count sh-foil">${ROMAN(list.length).toUpperCase()}</span><button type="button" class="cr-flip sh-foil" data-flip="1" aria-label="較舊的一張"${i < list.length - 1 ? "" : " disabled"}>›</button></div>` : ""}`;
}

export function wirePrints(scene, list) {
  if (!scene || list.length < 2) return;
  let i = Math.max(0, list.findIndex((p) => p.date === topDate));
  const top = scene.querySelector(".pr-top"), prev = scene.querySelector('[data-flip="-1"]'), next = scene.querySelector('[data-flip="1"]');
  const go = (step) => {
    const j = Math.min(list.length - 1, Math.max(0, i + step));
    if (j === i) return;
    i = j; topDate = list[i].date;
    top.innerHTML = printHtml(list[i], i, list.length);
    top.classList.remove("turn-l", "turn-r"); void top.offsetWidth; top.classList.add(step > 0 ? "turn-l" : "turn-r");
    prev.disabled = i === 0; next.disabled = i === list.length - 1;
  };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  const folio = scene.querySelector(".pr-folio");
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  folio.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  folio.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (x0 > 24 && Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  folio.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true); // a swipe that ended on the print is not a tap on it
}
