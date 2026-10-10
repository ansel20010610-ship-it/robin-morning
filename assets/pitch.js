// Step-by-step tactics board. Coordinates per editorial/SCHEMA.md:
// x 0–100 touchline to touchline, y 0 (blue's own goal) to 100 (opponent goal); blue attacks upward.
import { esc, inline } from "./util.js";

const W = 68, L = 105, M = 2.5;
const NS = "http://www.w3.org/2000/svg";

const px = (x) => (x / 100) * W;
const py = (y) => ((100 - y) / 100) * L;

function markings() {
  const box = (y0, h) => `<rect x="${(W - 40.32) / 2}" y="${y0}" width="40.32" height="${h}"/>`;
  const six = (y0, h) => `<rect x="${(W - 18.32) / 2}" y="${y0}" width="18.32" height="${h}"/>`;
  const arc = (cy, dir) => {
    // penalty arc outside the box: points where circle r=9.15 around the spot meets the box edge
    const spotY = cy, edge = dir > 0 ? 16.5 : L - 16.5, dy = Math.abs(edge - spotY), dx = Math.sqrt(9.15 ** 2 - dy ** 2);
    return `<path d="M ${W / 2 - dx} ${edge} A 9.15 9.15 0 0 ${dir > 0 ? 0 : 1} ${W / 2 + dx} ${edge}"/>`;
  };
  return `<g class="lines">
    <rect x="0" y="0" width="${W}" height="${L}"/>
    <line x1="0" y1="${L / 2}" x2="${W}" y2="${L / 2}"/>
    <circle cx="${W / 2}" cy="${L / 2}" r="9.15"/>
    ${box(0, 16.5)}${box(L - 16.5, 16.5)}${six(0, 5.5)}${six(L - 5.5, 5.5)}
    <rect x="${(W - 7.32) / 2}" y="-1.6" width="7.32" height="1.6"/>
    <rect x="${(W - 7.32) / 2}" y="${L}" width="7.32" height="1.6"/>
    ${arc(11, 1)}${arc(L - 11, -1)}
  </g>
  <g class="lines" style="fill: color-mix(in srgb, var(--ink) 35%, transparent)">
    <circle cx="${W / 2}" cy="11" r=".35"/><circle cx="${W / 2}" cy="${L - 11}" r=".35"/><circle cx="${W / 2}" cy="${L / 2}" r=".35"/>
  </g>`;
}

function wavy(x1, y1, x2, y2) {
  const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(4, Math.round(len / 2.2));
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, nx = -uy, ny = ux;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n, a = i === n ? 0 : (i % 2 ? 0.9 : -0.9);
    d += ` L ${x1 + ux * len * t + nx * a} ${y1 + uy * len * t + ny * a}`;
  }
  return d;
}

function arrowPath(a, pos) {
  const from = pos[a.from];
  if (!from) return "";
  let tx, ty, target = false;
  if (typeof a.to === "string") { if (!pos[a.to]) return ""; [tx, ty] = pos[a.to]; target = true; }
  else if (Array.isArray(a.to)) { tx = px(a.to[0]); ty = py(a.to[1]); }
  else return "";
  let [fx, fy] = from;
  const len = Math.hypot(tx - fx, ty - fy) || 1, ux = (tx - fx) / len, uy = (ty - fy) / len;
  fx += ux * 2.6; fy += uy * 2.6;
  if (target) { tx -= ux * 2.8; ty -= uy * 2.8; }
  const kind = a.kind || "pass";
  const d = kind === "dribble" ? wavy(fx, fy, tx, ty) : `M ${fx} ${fy} L ${tx} ${ty}`;
  return `<path class="ar ${kind}" d="${d}" marker-end="url(#mk-${kind})"/>`;
}

export function renderPitch(b) {
  const half = b.view === "half";
  const vb = half ? `${-M} ${-M - 1.6} ${W + 2 * M} ${L / 2 + 2 * M + 1.6}` : `${-M} ${-M - 1.6} ${W + 2 * M} ${L + 2 * M + 3.2}`;
  const wrap = document.createElement("figure");
  wrap.className = "pitch";
  const steps = b.steps || [];
  wrap.innerHTML = `
    ${b.title ? `<div class="tt">${esc(b.title)}</div>` : ""}
    <div class="board"><svg viewBox="${vb}" role="img" aria-label="${esc(b.title || "戰術示意")}">
      <defs>
        ${["pass", "run", "dribble", "press"].map((k) => `<marker id="mk-${k}" viewBox="0 0 6 6" refX="4.6" refY="3" markerWidth="3.6" markerHeight="3.6" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 z" class="ar-head ${k}"/></marker>`).join("")}
      </defs>
      ${markings()}
      <g class="arrows"></g>
      <g class="players"></g>
      <circle class="ball" r=".95" style="transition: transform .45s ease"/>
    </svg></div>
    ${steps.length > 1 ? `<div class="steps" role="tablist">${steps.map((s, i) => `<button type="button" role="tab" data-i="${i}">${i + 1}</button>`).join("")}</div>` : ""}
    <div class="note" aria-live="polite"></div>
    <div class="legend"><span>━ 傳球</span><span>┅ 無球跑動</span><span>〰 帶球</span><span style="color:var(--red)">━ 逼搶</span><span>藍隊向上進攻</span></div>
    ${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ""}`;

  // marker colours follow the arrow kinds
  const style = document.createElementNS(NS, "style");
  style.textContent = `.ar-head.pass,.ar-head.dribble{fill:var(--ink)}.ar-head.run{fill:var(--blue)}.ar-head.press{fill:var(--red)}`;
  wrap.querySelector("svg").prepend(style);

  const gPlayers = wrap.querySelector(".players"), gArrows = wrap.querySelector(".arrows"), ball = wrap.querySelector(".ball");
  const nodes = {};

  function show(i) {
    const s = steps[i];
    if (!s) return;
    const pos = {};
    for (const p of s.players || []) pos[p.id] = [px(p.x), py(p.y)];
    for (const p of s.players || []) {
      let g = nodes[p.id];
      if (!g) {
        g = document.createElementNS(NS, "g");
        g.setAttribute("class", p.team === "red" ? "p-red" : "p-blue");
        g.style.transition = "transform .45s ease, opacity .3s";
        g.innerHTML = `<circle r="2.25"/><text>${esc(p.label ?? "")}</text>`;
        gPlayers.appendChild(g);
        nodes[p.id] = g;
      }
      g.style.opacity = 1;
      g.style.transform = `translate(${pos[p.id][0]}px, ${pos[p.id][1]}px)`;
    }
    for (const id in nodes) if (!pos[id]) nodes[id].style.opacity = 0;
    gArrows.innerHTML = (s.arrows || []).map((a) => arrowPath(a, pos)).join("");
    let bx, by;
    if (typeof s.ball === "string" && pos[s.ball]) { [bx, by] = pos[s.ball]; bx += 1.9; by -= 1.9; }
    else if (Array.isArray(s.ball)) { bx = px(s.ball[0]); by = py(s.ball[1]); }
    ball.style.opacity = bx == null ? 0 : 1;
    if (bx != null) ball.style.transform = `translate(${bx}px, ${by}px)`;
    wrap.querySelector(".note").innerHTML = `<b>${esc(s.label || `第 ${i + 1} 步`)}</b>${inline(s.note || "")}`;
    wrap.querySelectorAll(".steps button").forEach((btn, j) => btn.setAttribute("aria-current", String(j === i)));
  }

  wrap.querySelectorAll(".steps button").forEach((btn) => btn.addEventListener("click", () => show(Number(btn.dataset.i))));
  show(0);
  return wrap;
}

export function pitchThumb() {
  return `<svg viewBox="-3 -3 74 111" class="lines" style="width:auto;height:84%;stroke:currentColor;fill:none;stroke-width:1.4">${markings().replace(/class="lines"/g, "")}</svg>`;
}
