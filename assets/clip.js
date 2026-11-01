// 剪報 (Ausschnitt): one article as a picture to pass on. A private paper has no link worth sending, so the share is a
// portrait card, 1080×1350 (the size a photo roll or LINE shows whole), drawn on a canvas in the paper's own dress:
// cream paper, the double rules, the checker band, the emblem, the column with its German kicker, the title, the
// brief (the perio takeaway when there is one) and the paper's line at the foot. The opening picture sits small at
// the top right when it loads with CORS; a picture that will not (offline, a host without the header) is left out,
// since a tainted canvas cannot be exported. Colours are the stylesheet's tokens, so the night theme's card is dark.
import { ROBIN_PATHS, fmtDate } from "./util.js";

const W = 1080, H = 1350, M = 72; // the card and its margin
const SERIF = '"Noto Serif TC", "Songti TC", "Source Han Serif TC", serif';
const LATIN = '"Cormorant Garamond", "Cormorant", Georgia, serif';
const SANS = '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif';
const TOKENS = ["paper", "paper-2", "paper-3", "ink", "ink-2", "muted", "rule", "gold", "gold-ink", "robin"];
const CONTAIN = new Set(["artwork", "document", "portrait", "illustration"]); // shown whole, as on the front page
const NO_START = new Set("，。、；：！？」』）》〉…—～,.;:!?)]"); // punctuation that never opens a line

// The stylesheet's colours as they stand, or for `theme` ("light" | "dark"): the root's data-theme is set and put
// back within one synchronous read, so nothing is painted in between.
function palette(theme) {
  const root = document.documentElement, was = root.dataset.theme;
  if (theme) root.dataset.theme = theme;
  try {
    const cs = getComputedStyle(root);
    return Object.fromEntries(TOKENS.map((k) => [k, cs.getPropertyValue(`--${k}`).trim()]));
  } finally {
    if (theme) { if (was == null) delete root.dataset.theme; else root.dataset.theme = was; }
  }
}

// The masthead's emblem (app.js EMBLEM) as an image: the robin's classes become fill and stroke attributes in real
// colours, since an SVG drawn into a canvas brings no stylesheet with it.
function emblemImage(p) {
  const fills = { "e-frame": `fill="none" stroke="${p.gold}"`, "e-gold": `fill="${p.gold}"`, "e-ink": `fill="${p.ink}"`, "e-robin": `fill="${p.robin}"`,
    "e-paper": `fill="${p.paper}"`, "e-wing": `fill="none" stroke="${p.gold}"`, "e-legs": `fill="none" stroke="${p.ink}"` };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect x="3" y="3" width="58" height="58" class="e-frame" stroke-width="1.4"/><rect x="6" y="6" width="52" height="52" class="e-frame" stroke-width=".6"/>
    <g class="e-gold"><rect x="1" y="1" width="4" height="4"/><rect x="59" y="1" width="4" height="4"/><rect x="1" y="59" width="4" height="4"/><rect x="59" y="59" width="4" height="4"/></g>
    ${ROBIN_PATHS}</svg>`.replace(/class="([\w-]+)"/g, (_, c) => fills[c] || "");
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}
// A picture, or null when it does not arrive in time or will not come with CORS (the canvas must stay clean).
function loadImage(src, { cors = false, timeout = 0 } = {}) {
  return new Promise((res) => {
    const im = new Image();
    if (cors) { im.crossOrigin = "anonymous"; im.referrerPolicy = "no-referrer"; }
    let t = 0;
    const done = (v) => { clearTimeout(t); res(v); };
    im.onload = () => done(im);
    im.onerror = () => done(null);
    if (timeout) t = setTimeout(() => done(null), timeout);
    im.src = src;
  });
}

// Lines of `text` no wider than `max`, measured in the context's current font. A Han character is a unit of its own,
// a run of Latin letters or figures (a name, "21%", "Cochrane") stays whole, a space may break; closing punctuation
// is kept on the line it closes, a hair over the measure if need be. More than `maxLines` lines end in an ellipsis.
export function wrapCJK(ctx, text, max, maxLines = Infinity) {
  const units = String(text || "").trim().match(/\s+|[A-Za-z0-9À-ɏ%.,'’\-–]+|[\s\S]/gu) || [];
  const lines = [];
  let line = "";
  const push = () => { if (line.trim()) lines.push(line.trimEnd()); line = ""; };
  for (const u of units) {
    if (/^\s+$/.test(u)) { if (line) line += " "; continue; }
    if (ctx.measureText(line + u).width <= max || !line.trim() || NO_START.has(u)) { line += u; continue; }
    push();
    line = u;
  }
  push();
  if (lines.length > maxLines) {
    const keep = lines.slice(0, maxLines), last = Array.from(keep[maxLines - 1]);
    while (last.length && ctx.measureText(`${last.join("")}……`).width > max) last.pop();
    keep[maxLines - 1] = `${last.join("")}……`;
    return keep;
  }
  return lines;
}

// Letter-spaced small type (the topline), drawn a glyph at a time: canvas letterSpacing is not everywhere yet.
function spaced(ctx, text, x, y, ls, align = "left") {
  const chars = Array.from(text), ws = chars.map((c) => ctx.measureText(c).width);
  const total = ws.reduce((s, w) => s + w, 0) + ls * (chars.length - 1);
  let cx = align === "right" ? x - total : align === "center" ? x - total / 2 : x;
  ctx.textAlign = "left";
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + ls; });
}
const lines = (ctx, arr, x, y, lh) => { arr.forEach((l, i) => ctx.fillText(l, x, y + i * lh)); return y + arr.length * lh; };

// The Secession checker (style.css .checker): two rows of squares, ink on paper.
function checker(ctx, y, s, color) {
  ctx.fillStyle = color;
  for (let x = M; x < W - M - s / 2; x += s * 2) { ctx.fillRect(x, y, s, s); ctx.fillRect(x + s, y + s, s, s); }
}
function ruleDouble(ctx, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(M, y, W - 2 * M, 1.5);
  ctx.fillRect(M, y + 6, W - 2 * M, 1.5);
}

// One card. `a` is the article; `date`, `no` and `column` ({ name, latin }) are what the issue and config say of it;
// `theme` forces a palette (the current one otherwise). Resolves to a PNG blob.
export async function clipCard(a, { date, no, column, theme } = {}) {
  const p = palette(theme);
  const title = a.title || "", text = a.takeaway || a.brief || a.dek || "", label = a.takeaway ? "帶得走的結論" : "";
  const credit = a.hero?.credit ? String(a.hero.credit) : "";
  // Fonts first: a canvas falls back silently, and Noto Serif TC comes in unicode-range slices, so the text itself
  // names the slices wanted. A failure here only means the system's serif.
  await Promise.all([
    document.fonts.load(`700 64px ${SERIF}`, title), document.fonts.load(`400 34px ${SERIF}`, `${label}${text}${column?.name || ""}知更鳥晨間記事第期年月日星期一二三四五六`),
    document.fonts.load(`italic 500 40px ${LATIN}`, column?.latin || "a"), document.fonts.load(`500 24px ${LATIN}`, "WIEN TAIPEI No.0123456789"),
  ]).catch(() => {});
  const [emblem, hero] = await Promise.all([
    emblemImage(p),
    a.hero?.src ? loadImage(a.hero.thumb || a.hero.src, { cors: true, timeout: 4000 }) : null,
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const draw = (pic) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = p.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";
    // Masthead: the double rule, the topline (place · number · day), the checker.
    ruleDouble(ctx, M, p.rule);
    ctx.font = `500 24px ${LATIN}`;
    ctx.fillStyle = p["ink-2"];
    spaced(ctx, "WIEN · TAIPEI", M, M + 48, 3.4);
    spaced(ctx, fmtDate(date, "de").split(", ")[1] || "", W - M, M + 48, 3.4, "right");
    if (no) { ctx.fillStyle = p["gold-ink"]; ctx.font = `600 24px ${LATIN}`; spaced(ctx, `No. ${no}`, W / 2, M + 48, 3.4, "center"); }
    checker(ctx, M + 70, 6, p.ink);
    // The head: emblem at the left, the column and its German beside it, the picture (when it came) at the right.
    const y0 = M + 112, picW = 300, picH = 225;
    if (emblem) ctx.drawImage(emblem, M, y0, 120, 120);
    ctx.textAlign = "left";
    ctx.fillStyle = p.ink;
    ctx.font = `700 30px ${SERIF}`;
    const nameMax = W - 2 * M - 150 - (pic ? picW + 28 : 0);
    ctx.fillText(wrapCJK(ctx, column?.name || "", nameMax, 1)[0] || "", M + 150, y0 + 44);
    ctx.fillStyle = p.gold;
    ctx.font = `italic 500 40px ${LATIN}`;
    ctx.fillText(wrapCJK(ctx, column?.latin || "", nameMax, 1)[0] || "", M + 150, y0 + 96);
    if (pic) {
      // The frame as the plate's: a thin gold line a little inside the picture's edge.
      const x = W - M - picW, contain = CONTAIN.has(a.hero?.kind);
      ctx.fillStyle = p["paper-3"];
      ctx.fillRect(x, y0, picW, picH);
      const r = Math[contain ? "min" : "max"](picW / pic.naturalWidth, picH / pic.naturalHeight);
      const dw = pic.naturalWidth * r, dh = pic.naturalHeight * r;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y0, picW, picH); ctx.clip();
      ctx.drawImage(pic, x + (picW - dw) / 2, y0 + (picH - dh) / 2, dw, dh);
      ctx.restore();
      ctx.strokeStyle = p.gold; ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 7, y0 + 7, picW - 14, picH - 14);
      if (credit) {
        ctx.fillStyle = p.muted; ctx.font = `400 17px ${SANS}`; ctx.textAlign = "right";
        ctx.fillText(wrapCJK(ctx, credit, picW, 1)[0] || "", x + picW, y0 + picH + 26);
        ctx.textAlign = "left";
      }
    }
    const y1 = y0 + (pic ? picH + 56 : 150);
    ctx.fillStyle = p.rule;
    ctx.fillRect(M, y1, W - 2 * M, 1.5);
    // The title: 64px, four lines at most; a long one is set a size smaller first.
    let size = 64, tl;
    for (;;) { ctx.font = `700 ${size}px ${SERIF}`; tl = wrapCJK(ctx, title, W - 2 * M); if (tl.length <= 3 || size <= 52) break; size -= 6; }
    tl = wrapCJK(ctx, title, W - 2 * M, 4);
    ctx.fillStyle = p.ink;
    let y = lines(ctx, tl, M, y1 + 40 + size, size * 1.32) - size * 0.32 + 30;
    // The ornament (style.css .ornament): gold, ink, gold.
    [p.gold, p.ink, p.gold].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(M + i * 20, y, 10, 10); });
    y += 56;
    // What to take away: the perio takeaway under its label, set large, with the brief under a hairline where it
    // fits; else the brief alone, as many lines as fit above the foot.
    const footTop = H - M - 120, fit = (lh) => Math.max(1, Math.floor((footTop - y) / lh));
    if (label) {
      ctx.fillStyle = p["gold-ink"]; ctx.font = `600 20px ${SANS}`; spaced(ctx, label, M, y, 4); y += 48;
      ctx.font = `500 40px ${SERIF}`; ctx.fillStyle = p.ink;
      y = lines(ctx, wrapCJK(ctx, a.takeaway, W - 2 * M, fit(66)), M, y + 40, 66) - 40 + 36;
      if (a.brief && footTop - y > 160) { ctx.fillStyle = p.rule; ctx.fillRect(M, y, 120, 1.5); y += 44; } else y = footTop; // no room: the brief is left out
    }
    if (y < footTop) {
      const body = label ? a.brief : text;
      ctx.font = `400 ${label ? 30 : 34}px ${SERIF}`;
      ctx.fillStyle = p["ink-2"];
      const lh = label ? 52 : 58;
      lines(ctx, wrapCJK(ctx, body, W - 2 * M, fit(lh)), M, y + lh * 0.6, lh);
    }
    // The foot: checker, the paper's name with number and day, the German under it, the double rule.
    checker(ctx, H - M - 96, 6, p.ink);
    ctx.textAlign = "center";
    ctx.fillStyle = p.ink;
    ctx.font = `600 26px ${SERIF}`;
    ctx.fillText(`知更鳥晨間記事${no ? `・No. ${no}` : ""}・${fmtDate(date)}`, W / 2, H - M - 44);
    ctx.fillStyle = p.gold;
    ctx.font = `italic 500 24px ${LATIN}`;
    ctx.fillText("Rotkehlchens Morgenblatt", W / 2, H - M - 14);
    ruleDouble(ctx, H - M + 4, p.rule);
  };
  const blobOf = () => new Promise((res, rej) => { try { canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"); } catch (e) { rej(e); } });
  draw(hero);
  try { return await blobOf(); }
  catch { draw(null); return blobOf(); } // a tainted canvas (a picture without CORS after all): the card without it
}
