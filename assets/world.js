// 你讀過的世界 (Gelesene Welt; app.js viewWorld, viewSaved, viewArticle): the countries the news column has taken the
// reader to. The index names, for every 快訊 article, the countries its items speak of (build_index.py, places.py), and
// at its top each code's Chinese name; a country counts as read once the news of an issue naming it is read (readSet).
// The map is assets/world.svg — one <path id="xx"> per ISO alpha-2 code, Taiwan "tw" — fetched once and kept here as
// text, so the page can be drawn again without asking for it.

// The countries met, newest first by the latest issue that named each: { code, n, latest: [{ date, title }] } — n issues
// in all, the two most recent kept for the list. `today`: the latest issue's countries while its news is still unread,
// the outlines the map offers. `issues` come newest first (publishedIssues).
export function worldState(issues, read) {
  const by = new Map();
  const newsOf = (i) => (i.articles || []).find((x) => x.column === "news");
  for (const i of issues) {
    const a = newsOf(i);
    if (!a || !Array.isArray(a.places) || !read.has(`${i.date}/news`)) continue;
    for (const c of a.places) {
      const k = String(c).toUpperCase(), e = by.get(k) || { code: k, n: 0, latest: [] };
      e.n++;
      if (e.latest.length < 2) e.latest.push({ date: i.date, title: a.title || "" });
      by.set(k, e);
    }
  }
  const first = issues[0], news = first && newsOf(first);
  const today = news && Array.isArray(news.places) && !read.has(`${first.date}/news`) ? news.places.map((c) => String(c).toUpperCase()) : [];
  return { read: [...by.values()].sort((a, b) => b.latest[0].date.localeCompare(a.latest[0].date) || b.n - a.n), today };
}

let svgText = null, loading = null;
function worldSvg() {
  if (svgText) return Promise.resolve(svgText);
  if (!loading) {
    loading = fetch("assets/world.svg").then(async (r) => {
      if (!r.ok) throw new Error(`${r.status} world.svg`);
      const t = await r.text();
      if (!t.includes("<svg")) throw new Error("not an svg"); // a captive portal answers every URL with its page
      return (svgText = t);
    }).finally(() => { loading = null; });
  }
  return loading;
}

const NS = "http://www.w3.org/2000/svg";
const code = (c) => (/^[A-Za-z]{2}$/.test(c) ? c.toLowerCase() : null);
// Draws the map into `box`: a read country gilt (.read), one of today's still unread outlined (.today), Taiwan ringed in
// the robin's colour as home, at the centre of its shape — measured once the SVG is in the page. The SVG keeps its own
// ids (two-letter codes) inside the box; nothing else in the app looks them up. A map that cannot be had says so and
// leaves the list to stand alone; a box the reader has left meanwhile is not drawn into.
export async function drawMap(box, { read = [], today = [] } = {}) {
  let text;
  try { text = await worldSvg(); } catch { text = null; }
  if (!box.isConnected) return;
  const doc = text ? new DOMParser().parseFromString(text, "image/svg+xml") : null;
  const svg = doc && !doc.querySelector("parsererror") && doc.documentElement?.localName === "svg" ? document.adoptNode(doc.documentElement) : null;
  if (!svg) { box.innerHTML = `<p class="empty">地圖暫時打不開</p>`; return; }
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", read.length ? `世界地圖，讀過的 ${read.length} 個國家上了金色` : "世界地圖，還沒有上色的國家");
  const at = (c) => { const id = code(c); return id ? svg.querySelector(`[id="${id}"]`) : null; };
  box.replaceChildren(svg);
  for (const c of read) at(c)?.classList.add("read");
  for (const c of today) { const p = at(c); if (p && !p.classList.contains("read")) p.classList.add("today"); }
  const tw = at("tw");
  if (!tw) return;
  const b = tw.getBBox();
  if (!(b.width > 0)) return; // not laid out (a hidden page): no centre to measure
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "home");
  g.setAttribute("aria-label", "台灣，家");
  for (const [r, cls] of [[9, "ring"], [2.2, "dot"]]) {
    const o = document.createElementNS(NS, "circle");
    o.setAttribute("cx", cx.toFixed(1)); o.setAttribute("cy", cy.toFixed(1)); o.setAttribute("r", r); o.setAttribute("class", cls);
    g.append(o);
  }
  svg.append(g);
}
