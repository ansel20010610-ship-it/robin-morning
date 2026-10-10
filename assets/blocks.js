// Render article blocks (editorial/SCHEMA.md) into DOM.
import { esc, inline, paragraphs, $ } from "./util.js";
import { renderPitch } from "./pitch.js";
import { renderMusic } from "./spotify.js";

const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content; };

function credit(f) {
  const bits = [];
  if (f.made) bits.push(`<span class="when">製作 ${esc(f.made)}</span>`);
  if (f.depicts) bits.push(`<span class="when">描繪 ${esc(f.depicts)}</span>`);
  if (f.credit) bits.push(esc(f.credit));
  if (f.license) bits.push(f.license_url ? `<a href="${esc(f.license_url)}" target="_blank" rel="noopener">${esc(f.license)}</a>` : esc(f.license));
  if (f.source_url) bits.push(`<a href="${esc(f.source_url)}" target="_blank" rel="noopener">來源</a>`);
  return bits.length ? `<span class="credit">${bits.join(" · ")}</span>` : "";
}

export function figureEl(f, { hero = false } = {}) {
  const el = html(`<figure class="fig${hero ? " hero" : ""}">
    <div class="frame"><img src="${esc(f.src)}" alt="${esc(f.alt || "")}" width="${f.width || ""}" height="${f.height || ""}"
      ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer"></div>
    <figcaption>${inline(f.caption || "")}${credit(f)}</figcaption></figure>`).firstElementChild;
  el.querySelector(".frame").addEventListener("click", () => openViewer(f.src_large || f.src, f.caption, f.alt));
  return el;
}

function detailEl(b, figs) {
  const f = figs[b.of];
  if (!f) return html(`<p class="banner">（局部圖找不到原圖：${esc(b.of)}）</p>`);
  const [x, y, w, h] = b.region;
  const src = f.src_large || f.src;
  const ratio = (w * f.width) / (h * f.height);
  const posX = w >= 1 ? 0 : (x / (1 - w)) * 100, posY = h >= 1 ? 0 : (y / (1 - h)) * 100;
  const el = html(`<figure class="detail">
    <div class="pair">
      <div class="crop" role="img" aria-label="${esc(b.caption)}" style="aspect-ratio:${ratio.toFixed(4)};background-image:url('${esc(src)}');background-size:${(100 / w).toFixed(3)}% auto;background-position:${posX.toFixed(3)}% ${posY.toFixed(3)}%"></div>
      <div><div class="mini"><img src="${esc(f.src)}" alt="" loading="lazy" referrerpolicy="no-referrer"><b style="left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${h * 100}%"></b></div>
      <div class="pos">局部・${esc(b.position || "")}</div></div>
    </div>
    <figcaption>${inline(b.caption || "")}<span class="credit">同一作品的局部放大，非另一張圖。${f.credit ? esc(f.credit) : ""}</span></figcaption></figure>`).firstElementChild;
  el.querySelector(".crop").addEventListener("click", () => openViewer(src, b.caption, b.position));
  return el;
}

function sanitizeSvg(src) {
  let text = String(src).trim();
  if (!/^<svg[^>]*\sxmlns=/.test(text)) text = text.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.documentElement;
  if (!svg || svg.nodeName !== "svg" || doc.querySelector("parsererror")) return null;
  svg.querySelectorAll("script, foreignObject, iframe, image[href^='http'], a").forEach((n) => n.remove());
  for (const n of [svg, ...svg.querySelectorAll("*")]) {
    for (const a of [...n.attributes]) {
      if (/^on/i.test(a.name) || /javascript:/i.test(a.value)) n.removeAttribute(a.name);
    }
  }
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("role", "img");
  return document.importNode(svg, true);
}

function svgEl(b) {
  const el = html(`<figure class="svgfig">${b.title ? `<div class="tt">${esc(b.title)}</div>` : ""}<div class="canvas"></div>
    <figcaption>${inline(b.caption || "")}${b.credit ? `<span class="credit">${esc(b.credit)}</span>` : ""}</figcaption></figure>`).firstElementChild;
  const svg = sanitizeSvg(b.svg || "");
  if (svg) { if (b.caption) svg.setAttribute("aria-label", b.caption); el.querySelector(".canvas").appendChild(svg); }
  return el;
}

function timelineEl(b) {
  return html(`<figure class="timeline">${b.title ? `<div class="tt">${esc(b.title)}</div>` : ""}<ol>
    ${(b.items || []).map((it) => `<li><span class="when">${esc(it.when)}</span><span class="lbl">${inline(it.label || "")}</span>${it.note ? `<span class="nt">${inline(it.note)}</span>` : ""}</li>`).join("")}
    </ol>${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ""}</figure>`).firstElementChild;
}

function tableEl(b) {
  return html(`<figure class="table">${b.title ? `<div class="tt">${esc(b.title)}</div>` : ""}<div class="scroll"><table>
    <thead><tr>${(b.head || []).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>
    <tbody>${(b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${inline(String(c))}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ""}</figure>`).firstElementChild;
}

function scriptureEl(b) {
  const vs = (b.verses || []).map((v) => `<sup>${v.c && v.c !== b.chapter ? `${v.c}:` : ""}${v.n}</sup>${esc(v.text)}`).join("");
  return html(`<section class="scripture" aria-label="經文">
    <div class="ref">${esc(b.ref)}</div><div class="verses">${vs}</div>
    <div class="src">譯本：${esc(b.version)}<br>${esc(b.source || "")}</div></section>`).firstElementChild;
}

function block(b, figs) {
  switch (b.type) {
    case "p":
      return html(`<p>${b.tag ? `<span class="tag" data-t="${esc(b.tag)}">${esc(b.tag)}</span>` : ""}${inline(b.text)}</p>`);
    case "h":
      return html(`<h2>${inline(b.text)}</h2>`);
    case "quote":
      return html(`<blockquote>${b.original ? `<p class="orig">${esc(b.original)}</p>` : ""}<p class="zh">${inline(b.text || "")}</p>${b.cite ? `<cite>${inline(b.cite)}</cite>` : ""}</blockquote>`);
    case "list": {
      const tag = b.ordered ? "ol" : "ul";
      return html(`<${tag}>${(b.items || []).map((x) => `<li>${inline(x)}</li>`).join("")}</${tag}>`);
    }
    case "facts":
      return html(`<section class="facts">${b.title ? `<div class="ft">${esc(b.title)}</div>` : ""}<dl>${(b.items || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${inline(v)}</dd>`).join("")}</dl></section>`);
    case "figure":
      return figureEl(b);
    case "detail":
      return detailEl(b, figs);
    case "timeline":
      return timelineEl(b);
    case "table":
      return tableEl(b);
    case "pitch":
      return renderPitch(b);
    case "svg":
      return svgEl(b);
    case "news":
      return html(`<section class="news">${b.title ? `<div class="tt">${esc(b.title)}</div>` : ""}${(b.items || []).map((it) => `
        <article><h3>${inline(it.headline)}</h3><p>${inline(it.summary)}</p>
        <div class="src">${esc(it.source || "")}${it.when ? `・${esc(it.when)}` : ""}${it.url ? `・<a href="${esc(it.url)}" target="_blank" rel="noopener">原文</a>` : ""}</div></article>`).join("")}</section>`);
    case "scripture":
      return scriptureEl(b);
    case "prayer":
      return html(`<section class="prayer" aria-label="禱告">${paragraphs(b.text)}</section>`);
    case "music":
      return renderMusic(b);
    case "paper":
      return html(`<section class="paper-card"><div class="cit">${inline(b.citation)}</div>
        <div class="ids">${b.doi ? `<a href="https://doi.org/${esc(b.doi)}" target="_blank" rel="noopener">DOI ${esc(b.doi)}</a>` : ""}${b.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${esc(b.pmid)}/" target="_blank" rel="noopener">PMID ${esc(b.pmid)}</a>` : ""}${b.link ? `<a href="${esc(b.link)}" target="_blank" rel="noopener">期刊頁面</a>` : ""}</div>
        ${b.question || b.design || b.sample ? `<dl>${b.question ? `<dt>研究問題</dt><dd>${inline(b.question)}</dd>` : ""}${b.design ? `<dt>設計</dt><dd>${inline(b.design)}</dd>` : ""}${b.sample ? `<dt>樣本</dt><dd>${inline(b.sample)}</dd>` : ""}</dl>` : ""}</section>`);
    case "exercise":
      return html(`<section class="exercise"><div class="lbl">練習</div><h3>${inline(b.title || "")}</h3>${b.note ? `<p class="nt">${inline(b.note)}</p>` : ""}
        <h4>怎麼做</h4><ol>${(b.steps || []).map((s) => `<li>${inline(s)}</li>`).join("")}</ol>
        <h4>怎樣算做到</h4><ul>${(b.criteria || []).map((s) => `<li>${inline(s)}</li>`).join("")}</ul></section>`);
    case "callout":
      return html(`<section class="callout"><div class="lbl">${esc(b.label || "")}</div>${b.text ? paragraphs(b.text) : ""}${b.items ? `<ul>${b.items.map((s) => `<li>${inline(s)}</li>`).join("")}</ul>` : ""}</section>`);
    case "spoiler":
      return html(`<div class="spoiler" role="note">${esc(b.text || "以下有劇透")}</div>`);
    case "divider":
      return html(`<div class="ornament" aria-hidden="true"><i></i><i></i><i></i></div>`);
    default:
      return document.createTextNode("");
  }
}

export function renderHero(hero) {
  if (!hero) return null;
  const t = hero.type || "figure";
  if (t === "figure") return figureEl(hero, { hero: true });
  const el = block(hero, {});
  return el;
}

export function renderBody(article) {
  const frag = document.createDocumentFragment();
  const figs = {};
  if (article.hero && (article.hero.type || "figure") === "figure") figs.hero = article.hero;
  for (const b of article.body || []) if (b.type === "figure" && b.id) figs[b.id] = b;
  for (const b of article.body || []) {
    try { frag.append(block(b, figs)); } catch (e) { console.warn("block failed", b, e); }
  }
  return frag;
}

export function openViewer(src, caption, alt) {
  const dlg = $("#viewer");
  dlg.innerHTML = `<div class="viewer"><button class="icon-btn close" aria-label="關閉">✕</button>
    <div class="vi"><img src="${esc(src)}" alt="${esc(alt || "")}" referrerpolicy="no-referrer"></div>
    <div class="vc">${inline(caption || "")}</div></div>`;
  dlg.querySelector(".close").onclick = () => dlg.close();
  dlg.querySelector(".vi").onclick = (e) => { if (e.target.tagName !== "IMG") dlg.close(); };
  dlg.showModal();
}
