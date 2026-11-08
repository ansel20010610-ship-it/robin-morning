// 郵票冊 (Briefmarken; app.js viewStamps, viewSaved): the day's postage stamp. A day whose paper was read to the end
// (digestDone) has earned its stamp; a day missed is an empty perforated slot, so the album shows where the holes are.
// The stamp is a sheet of light paper, perforated by a CSS mask (style.css .stamp .sp), with a thin frame holding
// the day's picture: the opening picture of the first article from a picture column (art, architecture, photo) or with
// an artwork hero, else the first article with a picture at all, else the robin crest. Lettered like an engraved stamp,
// in Latin only (the owner, 2026-11-06: no Chinese on the stamp): the number top left, the year top right, the
// issuer's name ROTKEHLCHENS MORGENBLATT in spaced capitals under the picture, the German weekday and the Viennese
// day (6. XI.) along the foot. A hash of the date picks one of six frames and one of five paper tints and leans the
// stamp a degree or so, so no two days in the album look alike. The margin keeps its light paper in dark mode: it is
// a stamp on a dark album page.
import { esc, fmtDate, roman, ROBIN_PATHS } from "./util.js";

// Which picture the day's stamp carries (the owner, 2026-11-08: 所有郵票要挑那期好看的照片，不要足球那類的): a painting
// first, then an engraving, a portrait, a photograph — and never the sports, news and clinical columns, whose pictures
// are a coach at a press conference or a gum. The picture columns and the verse's paintings get a little extra; among
// equals the first in the issue's order wins. Nothing suitable → the robin crest (stampHtml).
const NO_STAMP = new Set(["football", "tactics", "news", "perio", "fm-watch", "cosmere-watch", "obituary", "serial"]);
const KIND_SCORE = { artwork: 6, illustration: 4, portrait: 3, photo: 3, map: 2, document: 1 };
const PICTURE = new Set(["artwork", "architecture", "art", "photo", "city"]);
export function stampPicture(issue) {
  let best = null, bestScore = 0;
  for (const a of issue?.articles || []) {
    if (!a?.hero?.src || NO_STAMP.has(a.column)) continue;
    const score = (KIND_SCORE[a.hero.kind] ?? 2) + (PICTURE.has(a.column) ? 2 : a.column === "devotion" ? 1 : 0);
    if (score > bestScore) { best = a; bestScore = score; }
  }
  return best;
}
// djb2 over the date, then murmur's final mix: the same day always gets the same stamp, and neighbouring days (which
// differ in their last character only) do not walk through the frames in order.
function hash(s) {
  let h = 5381;
  for (const c of String(s)) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

// The frames, drawn in an 86 × 92 box laid over the picture (one unit is one hundredth of the stamp's width).
const W = 86, H = 80;
const rect = (i, cls = "") => `<rect${cls ? ` class="${cls}"` : ""} x="${i}" y="${i}" width="${W - 2 * i}" height="${H - 2 * i}"/>`;
// A wave round the frame: an even number of bumps a side, so the phase meets itself at each corner.
function wave(i, a = .9) {
  const side = (len, ux, uy, nx, ny) => {
    const n = 2 * Math.round(len / 8.6), L = len / n;
    let d = "";
    for (let k = 0; k < n; k++) { const s = k % 2 ? a : -a; d += ` q${(ux * L / 2 + nx * s).toFixed(2)} ${(uy * L / 2 + ny * s).toFixed(2)} ${(ux * L).toFixed(2)} ${(uy * L).toFixed(2)}`; }
    return d;
  };
  const w = W - 2 * i, h = H - 2 * i;
  return `<path d="M${i} ${i}${side(w, 1, 0, 0, 1)}${side(h, 0, 1, -1, 0)}${side(w, -1, 0, 0, -1)}${side(h, 0, -1, 1, 0)}Z"/>`;
}
// A laurel sprig growing out of a corner along the diagonal: a stem, two leaves either side, one at the tip.
const sprig = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0L6.2 6.2"/><ellipse class="leaf" cx="4.3" cy="1.9" rx="2.1" ry=".85" transform="rotate(45 4.3 1.9)"/><ellipse class="leaf" cx="1.9" cy="4.3" rx="2.1" ry=".85" transform="rotate(45 1.9 4.3)"/><ellipse class="leaf" cx="7.4" cy="7.4" rx="2.1" ry=".85" transform="rotate(45 7.4 7.4)"/></g>`;
// 創刊紀念郵票's frame: the outer rule, the Secession band, a hairline, laurel in all four corners — the picture sits inside
// it all (style.css .stamp.erst .fr img).
const ERST_FRAME = () => rect(.6) + rect(2.4, "band") + rect(4.8, "thin") + sprig(5.8, 5.8, 0) + sprig(W - 5.8, 5.8, 90) + sprig(W - 5.8, H - 5.8, 180) + sprig(5.8, H - 5.8, 270);
const FRAMES = [
  () => rect(.6), // plain
  () => rect(.6) + rect(3, "thin"), // double rule
  () => rect(1.2, "dots"), // dotted
  () => wave(1.6), // wavy
  () => rect(.6) + sprig(1.6, 1.6, 0) + sprig(W - 1.6, 1.6, 90) + sprig(W - 1.6, H - 1.6, 180) + sprig(1.6, H - 1.6, 270), // laurel corners
  () => rect(.5) + rect(2.6, "band"), // chequer: the Secession checker as a dashed band
];

// `earned`: the stamp in colour; otherwise the empty slot, which `open` marks as today's (still to be read). `href`
// makes the tile a link; without it the slot is a plain span. `i` staggers the entrance (style.css), `size` a width
// in px for a stamp outside the album's grid.
export function stampHtml(issue, { earned = false, open = false, href = null, i = 0, size = 0, bird = false } = {}) {
  const date = issue?.date || "", [y, m, d] = date.split("-").map(Number);
  // 創刊紀念郵票 (the owner, 2026-11-08: 特別浮誇好看): No. 1 has its own issue — gold-foil paper with a sheen, a huge
  // faint 1 behind the picture, band and laurel round it, ERSTAUSGABE on a wine ribbon under the picture and the
  // issuer's name along the foot; it stands straight and glows, at the album's ordinary size (style.css .stamp.erst).
  const erst = Number(issue?.no) === 1;
  const h = hash(date), frame = erst ? 4 : h % 6, tint = erst ? 5 : (h >>> 8) % 5, tilt = erst ? 0 : (((h >>> 16) % 5) - 2) * .6;
  const day = Number.isFinite(d) ? `${d}. ${roman(m)}.` : "", wd = date ? fmtDate(date, "de").split(",")[0] : "";
  const label = [date && fmtDate(date, "short"), issue?.no && `第 ${issue.no} 期`, earned ? "已蓋郵票" : open ? "今天還沒讀完" : "錯過，留白"].filter(Boolean).join("・");
  const style = `--i:${i}${earned ? `;--tilt:${tilt}deg` : ""}${size > 0 ? `;width:${size}px` : ""}`;
  const tag = href ? `a href="${esc(href)}"` : `span role="img"`; // a role, or the span's aria-label is not read out
  let inner;
  if (earned) {
    const pic = stampPicture(issue), hero = pic?.hero;
    const art = hero?.src ? `<img src="${esc(hero.thumb || hero.src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
      : `<svg class="bird" viewBox="0 0 64 64" aria-hidden="true">${ROBIN_PATHS}</svg>`;
    inner = `<span class="no">No. ${esc(issue?.no ?? "")}</span><span class="yr">${esc(Number.isFinite(y) ? y : "")}</span>
      <span class="fr">${art}<svg class="bd" viewBox="0 0 ${W} ${H}" aria-hidden="true">${erst ? ERST_FRAME() : FRAMES[frame]()}</svg></span>
      <span class="name">${erst ? "Erstausgabe" : "Rotkehlchens Morgenblatt"}</span>
      <span class="foot"><i>${erst ? "Rotkehlchens Morgenblatt" : esc(wd)}</i><b>${esc(day)}</b></span>${bird ? `<svg class="perch" viewBox="0 0 64 64" aria-hidden="true">${ROBIN_PATHS}</svg>` : ""}`;
  } else {
    inner = `<span class="no">No. ${esc(issue?.no ?? "")}</span><span class="miss"><b>${esc(day)}</b>${open ? "<small>Heute</small>" : erst ? "<small>Erstausgabe</small>" : ""}</span>`;
  }
  return `<${tag} class="stamp ${earned ? `earned f${frame} t${tint}` : `slot${open ? " open" : ""}`}${erst ? " erst" : ""}" style="${style}" aria-label="${esc(label)}${erst ? "・創刊紀念郵票" : ""}"><span class="sp">${inner}</span></${href ? "a" : "span"}>`;
}
