// 版畫冊 (the owner's pick, 2026-11-19: the leather portfolio of scene 5): every 建築 piece read is an etching — the
// article's picture bitten into cotton paper (sepia ink, cross-hatching, the plate mark pressed round it), the building's
// name under it (from the article's topic_key, as a printer would set it) with the headline in small type, the number
// and the day pencilled in the margins. #/prints is a blue leather portfolio open on the desk with the newest print on
// top under a half-lifted tissue; a swipe or the ‹ › on the desk turns to the next print, a tap on the print opens the
// article; a tap on the brass plate lays every print out on the desk (a tap on one brings it back on top), the brass die
// draws one at random. Leather and wood are the bookcase's photographs (assets/shelf/, Poly Haven, CC0).
import { esc } from "./util.js";

const ROMAN = (n) => [[1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"], [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
const MONTH = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
// architecture:pantheon-rome → Pantheon Rome
export const buildingName = (a) => String(a.topic_key || "").replace(/^architecture:/, "").split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
// The Chinese name set above the Latin one (the owner, 2026-11-22: 「我的版畫冊想要加上中文建築名」, layout 甲): the
// article's name_zh (SCHEMA.md); a print without one keeps only its Latin name, as before.
const nameZh = (a) => (typeof a.name_zh === "string" ? a.name_zh.trim() : "");
const nameHtml = (a, cls) => { const zh = nameZh(a); return `<span class="${cls}${zh ? " zh" : ""}">${zh ? `<span class="pr-zh">${esc(zh)}</span><span class="pr-en">${esc(buildingName(a))}</span>` : esc(buildingName(a))}</span>`; };
const label = (a) => [nameZh(a), buildingName(a)].filter(Boolean).join(" ") || a.title;
const dateLine = (d) => { const [y, m, dd] = d.split("-").map(Number); return `${dd}. ${MONTH[m - 1]}. ${ROMAN(y).toUpperCase()}`; };
let topDate = null; // the print left on top, kept while the reader opens its article and comes back
// The way in is every print laid out on the desk (the owner, 2026-11-19: 入口是很多的那個); a print picked from it opens
// the portfolio at that print, and the reader coming back from its article finds the portfolio again.
let lastMode = "all";
export const resetPrints = () => { lastMode = "all"; };

function printHtml(p, n, total) {
  const src = p.a.hero?.thumb || p.a.hero?.src || "";
  return `<a class="pr-sheet" href="#/a/${esc(p.date)}/architecture" aria-label="${esc(label(p.a))}：${esc(p.a.title)}，第 ${total - n} 張">
      <span class="pr-plate"><span class="pr-etch">${src ? `<img src="${esc(src)}" alt="" decoding="async" referrerpolicy="no-referrer">` : ""}<i></i><i></i></span></span>
      ${nameHtml(p.a, "pr-name")}
      <span class="pr-head">${esc(p.a.title)}</span>
      <span class="pr-pencil l">N° ${ROMAN(total - n)}</span><span class="pr-pencil r">${esc(dateLine(p.date))}</span>
    </a><i class="pr-tissue" aria-hidden="true"></i>`;
}

export function printsHtml(list) {
  if (!list.length) return "";
  const i = Math.max(0, list.findIndex((p) => p.date === topDate));
  return `<div class="pr-folio"><i class="pr-gilt" aria-hidden="true"></i><i class="pr-tie l" aria-hidden="true"></i><i class="pr-tie r" aria-hidden="true"></i>
      <div class="pr-stack">${list.length > 1 ? '<i class="pr-under" aria-hidden="true"></i>' : ""}<div class="pr-top">${printHtml(list[i], i, list.length)}</div></div></div>
    ${list.length > 1 ? `<div class="pr-nav"><button type="button" class="cr-flip sh-foil" data-flip="-1" aria-label="較新的一張"${i ? "" : " disabled"}>‹</button><button type="button" class="sc-brass sc-plate-btn" data-all aria-label="全部攤開，${list.length} 張"><span class="sc-cut">Radierungen · ${ROMAN(list.length).toUpperCase()}</span></button><button type="button" class="cr-flip sh-foil" data-flip="1" aria-label="較舊的一張"${i < list.length - 1 ? "" : " disabled"}>›</button><button type="button" class="sc-die" data-die aria-label="隨機抽一張"><i></i><i></i><i></i></button></div>
    <div class="pr-all" hidden>${list.map((p, k) => `<button type="button" class="pr-mini${nameZh(p.a) ? " zh" : ""}" data-pick="${k}" aria-label="${esc(label(p.a))}"><span class="pr-mini-e">${p.a.hero?.thumb || p.a.hero?.src ? `<img src="${esc(p.a.hero.thumb || p.a.hero.src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}</span>${nameHtml(p.a, "pr-mini-n")}</button>`).join("")}
      <div class="pr-all-bar"><button type="button" class="sc-brass sc-plate-btn" data-all aria-label="收回畫夾"><span class="sc-cut">Alle · ${ROMAN(list.length).toUpperCase()}</span></button><button type="button" class="sc-die" data-die aria-label="隨機抽一張"><i></i><i></i><i></i></button></div></div>` : ""}`;
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
  // 全部攤開 and back; a print picked from the desk comes back on top; the die draws any other one
  const all = scene.querySelector(".pr-all"), spread = (on) => { scene.classList.toggle("spread", on); all.hidden = !on; lastMode = on ? "all" : "one"; window.scrollTo(0, 0); };
  if (lastMode === "all") spread(true);
  scene.querySelectorAll("[data-all]").forEach((b) => b.addEventListener("click", () => spread(all.hidden)));
  all.addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (!b) return; const k = Number(b.dataset.pick); spread(false); if (k !== i) go(k - i); });
  scene.querySelectorAll("[data-die]").forEach((b) => b.addEventListener("click", () => {
    let k = Math.floor(Math.random() * (list.length - 1)); if (k >= i) k++;
    b.classList.remove("roll"); void b.offsetWidth; b.classList.add("roll");
    spread(false); go(k - i);
  }));
  const folio = scene.querySelector(".pr-folio");
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  folio.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  folio.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (x0 > 24 && Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  folio.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true); // a swipe that ended on the print is not a tap on it
}
