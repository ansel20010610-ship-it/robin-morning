// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: image;

// Wiener Galerie — the eight picture widgets of the Vienna home screen as one Scriptable script, in the colours of
// 知更鳥晨間記事. The paper, the gold frames and the drawn cards are built from Color.dynamic, so every widget turns
// from day to night the moment the phone does, like the Wiener Kalenderblatt beside them.
//
// Widget parameter (長按 → 編輯小工具 → Parameter):
//   naschmarkt · moser · mozart40          (medium)
//   vierbaeume · sonnenblumen · floege · kuss · weizenkorn   (small)
//   Chinese names work too: 納許市集 加爾達湖 莫札特 四棵樹 向日葵 芙洛格 吻 麥子
//   empty or "galerie" → Galerie des Tages: a different picture every day; "galerie 2" starts the round elsewhere.
// Tap a widget: its wall label (Saalzettel) opens. Run the script in the app: preview, or keep every picture offline.
//
// The pictures are fetched once from BASE and kept on the phone. Without a network, copy the iphone/galerie folder
// into iCloud Drive → Scriptable → wiener-galerie and the script takes them from there.

const BASE = "https://wiener-morgen-private.duckdns.org/iphone/";
const VERSION = "1";
const KORN = true; // paper grain over the paper colour; set false if the paper ever looks wrong

const C = {
  paper: Color.dynamic(new Color("#F5F0E6"), new Color("#15120E")),
  edge: Color.dynamic(new Color("#F5F0E6"), new Color("#0E0C09")), // the night vignette
  ink: Color.dynamic(new Color("#1F1B16"), new Color("#EDE4D3")),
  muted: Color.dynamic(new Color("#9A8F7E"), new Color("#7A705F")),
  gold: Color.dynamic(new Color("#A5843F"), new Color("#CDAE68")),
  goldInk: Color.dynamic(new Color("#7C642F"), new Color("#CDAE68")),
  rule: Color.dynamic(new Color("#CBB98F"), new Color("#564A33")),
  kink: Color.dynamic(new Color("#1F1B16"), new Color("#0B0906")), // Der Kuss: the black bars of the robe
  kinkEdge: Color.dynamic(new Color("#1F1B16"), new Color("#CDAE68")), //  … edged in gold at night
};

// ——— The works. Layers are one-colour cut-outs of the drawn cards, placed in px of the 3× render (galerie.py). ———
const W = {
  naschmarkt: {
    size: "medium", bild: "naschmarkt.jpg", aka: ["納許市集", "naschmarkt"],
    titel: "Der Naschmarkt in Wien", zh: "維也納納許市集", wer: "Carl Moll", jahr: "1894", ort: "Belvedere, Wien",
    text: "莫爾後來是 1897 年維也納分離派的創始成員之一，畫這幅市集時三十出頭。賣菜的婦人、竹籃、篷布底下的人群，都浸在同一層溫暖的光裡。納許市集到今天仍是維也納最熱鬧的露天市集。",
    quelle: "https://commons.wikimedia.org/wiki/File:Carl_Moll_-_Der_Naschmarkt_in_Wien_-_252_-_%C3%96sterreichische_Galerie_Belvedere.jpg",
  },
  moser: {
    size: "medium", bild: "moser.jpg", aka: ["加爾達湖", "gardasee"],
    titel: "Blick von Torbole auf das Westufer des Gardasees", zh: "從托爾博萊眺望加爾達湖西岸", wer: "Koloman Moser", jahr: "1912", ort: "Belvedere, Wien",
    text: "莫瑟是分離派的創始成員，1903 年和霍夫曼一起創辦維也納工坊，從書籍、家具到郵票都設計過。離開工坊以後，他把最後幾年留給油畫，加爾達湖是他反覆回去畫的地方。",
    quelle: "https://commons.wikimedia.org/wiki/File:Koloman_Moser_-_Blick_von_Torbole_auf_das_Westufer_des_Gardasees_-_2153_-_Belvedere.jpg",
  },
  mozart40: {
    size: "medium", aka: ["莫札特", "mozart"],
    layers: [["mozart40-tinte", 86, 1006, 92, 346, "ink"], ["mozart40-welle", 86, 1006, 348, 376, "gold"], ["mozart40-zeile", 86, 1006, 384, 416, "goldInk"]],
    titel: "Symphonie Nr. 40 g-Moll", zh: "g 小調第四十號交響曲", wer: "W. A. Mozart", jahr: "KV 550 · Wien 1788", ort: "Anfang, von Hand gezeichnet",
    text: "1788 年夏天，莫札特在大約六週內寫完最後三首交響曲，第四十號是其中唯一的小調。開頭沒有和弦，只有中提琴不安的八分音符，小提琴在上面輕聲嘆息，就是卡片上這幾小節。",
    hoeren: "https://open.spotify.com/search/Mozart%20Symphony%20No.%2040%20KV%20550",
  },
  vierbaeume: {
    size: "small", bild: "vierbaeume.jpg", aka: ["四棵樹", "schiele"],
    titel: "Vier Bäume", zh: "四棵樹", wer: "Egon Schiele", jahr: "1917", ort: "Belvedere, Wien",
    text: "席勒以緊繃扭曲的人體聞名，風景卻畫得出奇安靜：四棵秋天的栗樹站成一列，背後是一層一層的晚霞。隔年秋天，他死於西班牙流感，二十八歲。",
    quelle: "https://commons.wikimedia.org/wiki/File:Egon_Schiele_-_Vier_B%C3%A4ume_-_3917_-_%C3%96sterreichische_Galerie_Belvedere.jpg",
  },
  sonnenblumen: {
    size: "small", bild: "sonnenblumen.jpg", aka: ["向日葵"],
    titel: "Bauerngarten mit Sonnenblumen", zh: "有向日葵的農家花園", wer: "Gustav Klimt", jahr: "um 1907", ort: "Belvedere, Wien",
    text: "克林姆每年夏天到上奧地利的阿特湖畔度假，風景畫幾乎都在那裡完成。他偏愛正方形的畫布，常常不留天空，讓花園把整個畫面填滿，像一塊織錦。",
    quelle: "https://commons.wikimedia.org/wiki/File:Gustav_Klimt,_1907,_Farm_Garden_with_Sunflowers,_%C3%96sterreichische_Galerie_Belvedere.jpg",
  },
  floege: {
    size: "small", bild: "floege.jpg", aka: ["芙洛格", "flöge"],
    titel: "Bildnis Emilie Flöge", zh: "艾蜜莉・芙洛格肖像", wer: "Gustav Klimt", jahr: "1902", ort: "Wien Museum",
    text: "芙洛格是時裝設計師，1904 年和姊妹在維也納開了 Schwestern Flöge 服裝沙龍。她也是克林姆一生最親近的伴侶，兩人每年夏天一起在阿特湖畔度過。",
    quelle: "https://commons.wikimedia.org/wiki/File:Gustav_Klimt_-_Bildnis_Emilie_Fl%C3%B6ge.jpg",
  },
  kuss: {
    size: "small", aka: ["吻", "der kuss", "kiss"], robe: true,
    layers: [["kuss-feld", 214, 362, 66, 382, "gold"], ["kuss-titel", 150, 362, 400, 430, "goldInk"]],
    titel: "Der Kuss", zh: "吻", wer: "nach Gustav Klimt", jahr: "1908/09", ort: "Original: Belvedere, Wien",
    text: "這張不是原畫，是照原作的紋樣重新畫的金色馬賽克：左邊是男子長袍上直立的黑金方塊，右邊是女子衣裙上的圓環與花點，中間一道 S 形的線把兩人分開，又連在一起。原作是克林姆「黃金時期」的代表作，畫上貼著真的金箔。",
  },
  weizenkorn: {
    size: "small", aka: ["麥子", "一粒麥子"],
    layers: [["weizenkorn-zitat", 102, 134, 140, 372, "goldInk"], ["weizenkorn-vers", 160, 400, 140, 372, "ink"]],
    titel: "Das Weizenkorn", zh: "一粒麥子", wer: "約翰福音 12 : 24", jahr: "Chinese Union Version", ort: "1919",
    vers: "我實實在在的告訴你們，一粒麥子不落在地裡死了，仍舊是一粒，若是死了，就結出許多子粒來。",
  },
};
const ROUND = { small: ["vierbaeume", "kuss", "sonnenblumen", "weizenkorn", "floege"], medium: ["naschmarkt", "mozart40", "moser"] };
ROUND.large = ROUND.small;

// The Kuss robe: three columns of bars (top, bottom, kind) — g gold, o gold outline with an inner bar, k ink.
const RUNS = [
  [[82, 132, "g"], [136, 158, "o"], [162, 196, "g"], [200, 250, "k"], [254, 288, "g"], [292, 314, "o"], [318, 366, "g"]],
  [[82, 114, "o"], [118, 168, "k"], [172, 206, "g"], [210, 260, "o"], [264, 298, "g"], [302, 336, "k"], [340, 366, "o"]],
  [[82, 100, "o"], [104, 154, "g"], [158, 180, "o"], [184, 218, "g"], [222, 244, "o"], [248, 282, "k"], [286, 308, "o"], [312, 366, "g"]],
];

// ——— Sizes. Everything is laid out in px of a 3× render of a 170 pt small widget, then scaled to this phone. ———
const SIZES = { // screen (pt) → small, medium w×h, large w×h
  "440x956": [170, 364, 170, 364, 382], "430x932": [170, 364, 170, 364, 382], "428x926": [170, 364, 170, 364, 382],
  "414x896": [169, 360, 169, 360, 379], "414x736": [159, 348, 157, 348, 357], "393x852": [158, 338, 158, 338, 354],
  "390x844": [158, 338, 158, 338, 354], "375x812": [155, 329, 155, 329, 345], "360x780": [155, 329, 155, 329, 345],
  "375x667": [148, 321, 148, 321, 324], "320x568": [141, 292, 141, 292, 311],
};
function widgetPt(fam) {
  const s = Device.screenSize(), sw = Math.round(Math.min(s.width, s.height)), sh = Math.round(Math.max(s.width, s.height));
  let t = SIZES[`${sw}x${sh}`];
  if (!t) { const k = Math.min(1.2, Math.max(0.8, (sw - 393) / 37)); t = [158 + 12 * k, 338 + 26 * k, 158 + 12 * k, 338 + 26 * k, 354 + 28 * k]; } // between 6.1" and 6.7"
  return fam === "small" ? [t[0], t[0]] : fam === "large" ? [t[3], t[4]] : [t[1], t[2]];
}
let S = 1;
const u = (px) => (px / 3) * S;

// ——— Stack helpers. Children are placed by explicit spacers; a flexible spacer closes each stack. ———
function stack(parent, wpx, hpx, horizontal) {
  const s = parent.addStack();
  if (horizontal) s.layoutHorizontally(); else s.layoutVertically();
  s.topAlignContent();
  if (wpx != null) s.size = new Size(u(wpx), u(hpx));
  return s;
}
const gap = (s, px) => { if (px > 0.05) s.addSpacer(u(px)); };
function block(parent, wpx, hpx, color) { const s = stack(parent, wpx, hpx); s.backgroundColor = color; return s; }
function picture(parent, image, wpx, hpx, tint) { const i = parent.addImage(image); i.imageSize = new Size(u(wpx), u(hpx)); if (tint) i.tintColor = tint; return i; }

function draw(w, h, fn) { const dc = new DrawContext(); dc.size = new Size(w, h); dc.opaque = false; dc.respectScreenScale = false; dc.setFillColor(Color.black()); fn(dc); return dc.getImage(); }
const corner = (fx, fy) => draw(30, 30, (dc) => { for (const [i, j] of [[0, 0], [2, 0], [1, 1], [0, 2]]) dc.fillRect(new Rect(fx ? (2 - i) * 10 : i * 10, fy ? (2 - j) * 10 : j * 10, 10, 10)); });
function cover(img, wpx, hpx) { // crop to the frame's shape, like CSS object-fit: cover
  const cw = Math.round(u(wpx) * Device.screenScale()), ch = Math.round(u(hpx) * Device.screenScale());
  const k = Math.max(cw / img.size.width, ch / img.size.height), iw = img.size.width * k, ih = img.size.height * k;
  const dc = new DrawContext(); dc.size = new Size(cw, ch); dc.opaque = true; dc.respectScreenScale = false;
  dc.drawImageInRect(img, new Rect((cw - iw) / 2, (ch - ih) / 2, iw, ih));
  return dc.getImage();
}

// ——— Pictures: kept on the phone; first from the iCloud folder, else from the site. ———
const fm = FileManager.local();
const DIR = fm.joinPath(fm.documentsDirectory(), `wiener-galerie-${VERSION}`);
async function asset(file) {
  if (!fm.fileExists(DIR)) fm.createDirectory(DIR, true);
  const p = fm.joinPath(DIR, file);
  if (fm.fileExists(p)) return fm.readImage(p);
  try {
    const ic = FileManager.iCloud(), q = ic.joinPath(ic.joinPath(ic.documentsDirectory(), "wiener-galerie"), file);
    if (ic.fileExists(q)) { await ic.downloadFileFromiCloud(q); fm.write(p, ic.read(q)); return fm.readImage(p); }
  } catch (e) { /* no iCloud: fetch instead */ }
  const r = new Request(`${BASE}galerie/${file}?v=${VERSION}`);
  r.timeoutInterval = 25;
  const data = await r.load();
  if (r.response.statusCode !== 200) throw new Error(`${file}: HTTP ${r.response.statusCode}`);
  fm.write(p, data);
  return fm.readImage(p);
}
const allFiles = () => Object.values(W).flatMap((w) => [w.bild, ...(w.layers || []).map((l) => `${l[0]}.png`)]).filter(Boolean)
  .concat(["korn-klein.png", "korn-mittel.png", "korn-gross.png"]);

// ——— The cards ———
// A drawn card: a gold rule 14 pt in, a hairline inside it, chequer corners, the motif's layers tinted in the mode.
async function drawnCard(root, werk, Wpx, Hpx) {
  root.setPadding(u(41), u(41), u(41), u(41));
  const gold = root.addStack(); gold.borderColor = C.gold; gold.borderWidth = u(2); gold.setPadding(u(9.5), u(9.5), u(9.5), u(9.5));
  const rule = gold.addStack(); rule.borderColor = C.rule; rule.borderWidth = u(1); rule.setPadding(u(1), u(1), u(1), u(1));
  const bw = Wpx - 103, bh = Hpx - 103;
  const body = stack(rule, bw, bh, true);
  const corners = (fx) => { const c = stack(body, 30, bh); picture(c, corner(fx, false), 30, 30, C.gold); c.addSpacer(); picture(c, corner(fx, true), 30, 30, C.gold); };
  corners(false);
  const centre = stack(body, bw - 60, bh);
  corners(true);
  // the motif is drawn for 510 px high and its own width; centre it in whatever the widget is
  const refW = werk.size === "medium" ? 1092 : 510, ox = 81.5 - (Wpx - refW) / 2, oy = 51.5 - (Hpx - 510) / 2;
  const pieces = (werk.layers || []).map(([f, x0, x1, y0, y1, tint]) => ({ f, x0, x1, y0, y1, tint }));
  if (werk.robe) pieces.push({ robe: true, x0: 150, x1: 214, y0: 66, y1: 382 });
  const rows = [];
  for (const p of pieces.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0)) {
    const r = rows.find((r) => r.y0 === p.y0 && r.y1 === p.y1);
    if (r) r.items.push(p); else rows.push({ y0: p.y0, y1: p.y1, items: [p] });
  }
  let y = oy;
  for (const r of rows) {
    gap(centre, r.y0 - y);
    const row = stack(centre, bw - 60, r.y1 - r.y0, true);
    let x = ox;
    for (const p of r.items.sort((a, b) => a.x0 - b.x0)) {
      gap(row, p.x0 - x);
      if (p.robe) robe(stack(row, p.x1 - p.x0, p.y1 - p.y0));
      else picture(row, await asset(`${p.f}.png`), p.x1 - p.x0, p.y1 - p.y0, C[p.tint]);
      x = p.x1;
    }
    row.addSpacer();
    y = r.y1;
  }
  centre.addSpacer();
}

// The man's robe in Der Kuss, natively, so its black bars can turn into dark bars edged in gold at night.
function robe(p) { // origin (150, 66), 64 × 316 px; the field's border runs at x 152, y 76 and 372
  const line = () => { const r = stack(p, 64, 1.5, true); gap(r, 1.25); block(r, 62.75, 1.5, C.gold); r.addSpacer(); };
  gap(p, 9.25); line();
  const mid = stack(p, 64, 294.5, true);
  gap(mid, 1.25); block(mid, 1.5, 294.5, C.gold); gap(mid, 6.25);
  RUNS.forEach((run, ci) => {
    if (ci) gap(mid, 4);
    const col = stack(mid, 15, 294.5);
    let y = 76.75;
    for (const [a, b, k] of run) {
      gap(col, a - y); y = b;
      if (k === "g") block(col, 15, b - a, C.gold);
      else if (k === "k") { const s = block(col, 15, b - a, C.kink); s.borderColor = C.kinkEdge; s.borderWidth = u(1.5); }
      else { const s = stack(col, 15, b - a); s.borderColor = C.gold; s.borderWidth = u(1.5); s.setPadding(u(5), u(5), u(5), u(5)); block(s, 5, b - a - 10, C.gold); }
    }
    col.addSpacer();
  });
  mid.addSpacer();
  line(); p.addSpacer();
}

// A painting: the picture in a gold line, a hairline further out with a gold square at each corner.
async function paintingCard(root, werk, Wpx, Hpx) {
  const o = 16, m = 38;
  const sqRow = () => {
    const r = stack(root, Wpx, 10, true); r.centerAlignContent();
    gap(r, o - 5); block(r, 10, 10, C.gold); block(r, Wpx - 2 * o - 10, 1.5, C.rule); block(r, 10, 10, C.gold); r.addSpacer();
  };
  gap(root, o - 5); sqRow();
  const mid = stack(root, Wpx, Hpx - 2 * o - 10, true); mid.centerAlignContent();
  const vline = () => block(mid, 1.5, Hpx - 2 * o - 10, C.rule);
  gap(mid, o - 0.75); vline(); gap(mid, m - 5.25 - o - 0.75);
  const frame = mid.addStack(); frame.borderColor = C.gold; frame.borderWidth = u(2.5); frame.setPadding(u(5.25), u(5.25), u(5.25), u(5.25));
  picture(frame, cover(await asset(werk.bild), Wpx - 2 * m, Hpx - 2 * m), Wpx - 2 * m, Hpx - 2 * m);
  gap(mid, m - 5.25 - o - 0.75); vline(); mid.addSpacer();
  sqRow(); root.addSpacer();
}

function notice(root, Wpx, Hpx, lines) {
  root.setPadding(u(41), u(41), u(41), u(41));
  const gold = root.addStack(); gold.borderColor = C.gold; gold.borderWidth = u(2); gold.layoutVertically();
  gold.size = new Size(u(Wpx - 82), u(Hpx - 82)); gold.setPadding(u(24), u(24), u(24), u(24));
  gold.addSpacer();
  lines.forEach(([s, f, c]) => { const r = gold.addStack(); r.addSpacer(); const t = r.addText(s); t.font = f; t.textColor = c; t.centerAlignText(); t.minimumScaleFactor = 0.6; r.addSpacer(); });
  gold.addSpacer();
}

// ——— Which work, which size ———
function pick(param, fam) {
  const p = (param || "").trim().toLowerCase();
  const id = Object.keys(W).find((k) => k === p || W[k].aka.includes(p));
  if (id) return id;
  const round = ROUND[fam] || ROUND.small, n = parseInt(p.replace(/\D/g, ""), 10) || 0;
  const now = new Date(), day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  return round[(day + n) % round.length];
}

async function build(id, fam) {
  const werk = W[id], w = new ListWidget();
  w.setPadding(0, 0, 0, 0);
  w.url = `scriptable:///run/${encodeURIComponent(Script.name())}?werk=${id}`;
  if (fam.startsWith("accessory")) {
    const t = w.addText(fam === "accessoryInline" ? `${werk.wer} · ${werk.titel}` : `${werk.titel}\n${werk.wer}`);
    t.font = new Font("Baskerville-Italic", 14); t.minimumScaleFactor = 0.6;
    return w;
  }
  const [wpt, hpt] = widgetPt(fam);
  S = fam === "large" ? wpt / 364 : hpt / 170;
  const Wpx = wpt / S * 3, Hpx = hpt / S * 3;
  const g = new LinearGradient(); g.colors = [C.edge, C.paper, C.paper, C.edge]; g.locations = [0, 0.28, 0.72, 1];
  w.backgroundColor = C.paper; w.backgroundGradient = g;
  const root = stack(w, Wpx, Hpx);
  if (KORN) { try { root.backgroundImage = await asset(`korn-${fam === "small" ? "klein" : fam === "large" ? "gross" : "mittel"}.png`); } catch (e) { /* plain paper */ } }
  try {
    if (werk.size === "medium" && fam === "small") throw new Error("medium");
    if (werk.bild) await paintingCard(root, werk, Wpx, Hpx); else await drawnCard(root, werk, Wpx, Hpx);
  } catch (e) {
    console.error(e); // start afresh: a plain card that says what is missing
    const clean = new ListWidget(); clean.setPadding(0, 0, 0, 0); clean.backgroundColor = C.paper; clean.url = w.url;
    const cr = stack(clean, Wpx, Hpx);
    const medium = String(e.message) === "medium";
    notice(cr, Wpx, Hpx, medium
      ? [[werk.titel, new Font("Baskerville-Italic", 13), C.ink], ["這一幅要放中型", new Font("PingFangTC-Light", 10), C.muted]]
      : [["Wiener Galerie", new Font("Baskerville-Italic", 14), C.gold], ["第一次需要連網取得圖檔", new Font("PingFangTC-Light", 10), C.muted]]);
    clean.refreshAfterDate = new Date(Date.now() + 15 * 60e3);
    return clean;
  }
  const t = new Date(); w.refreshAfterDate = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, 0, 1); // the next day's picture
  return w;
}

// ——— The wall label (Saalzettel), opened by tapping a widget ———
async function saalzettel(id) {
  const k = W[id];
  let img = "";
  if (k.bild) {
    let data = null;
    try { await asset(k.bild); data = Data.fromFile(fm.joinPath(DIR, k.bild)); } catch (e) { /* offline */ }
    img = data ? `<img src="data:image/jpeg;base64,${data.toBase64String()}" alt="">` : "";
  } else {
    const stem = `${BASE}widgets/${id}-${k.size === "medium" ? "mittel" : "klein"}`;
    img = `<picture><source srcset="${stem}-nacht.jpg" media="(prefers-color-scheme: dark)"><img src="${stem}-tag.jpg" alt=""></picture>`;
  }
  const cornerSvg = (cls) => `<svg class="c ${cls}" viewBox="0 0 3 3"><path d="M0 0h1v1H0zM2 0h1v1H2zM1 1h1v1H1zM0 2h1v1H0z"/></svg>`;
  const links = [k.hoeren && `<a class="btn" href="${k.hoeren}">♪ &nbsp;Anhören · 聆聽</a>`, k.quelle && `<a class="btn quiet" href="${k.quelle}">Wikimedia Commons · 原作</a>`].filter(Boolean).join("");
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Noto+Serif+TC:wght@300;600&display=swap">
<style>
:root{--paper:#F5F0E6;--ink:#1F1B16;--ink2:#4A4237;--muted:#9A8F7E;--gold:#A5843F;--goldInk:#7C642F;--rule:#CBB98F}
@media (prefers-color-scheme:dark){:root{--paper:#15120E;--ink:#EDE4D3;--ink2:#CDC2AF;--muted:#7A705F;--gold:#CDAE68;--goldInk:#CDAE68;--rule:#564A33}}
*{box-sizing:border-box}html,body{margin:0;background:var(--paper);color:var(--ink)}
body{font:300 16px/1.9 "Noto Serif TC","Songti TC",serif;padding:calc(env(safe-area-inset-top) + 20px) 18px calc(env(safe-area-inset-bottom) + 28px);-webkit-text-size-adjust:100%}
.sheet{position:relative;max-width:560px;margin:0 auto;border:1.5px solid var(--gold);padding:7px}
.inner{border:1px solid var(--rule);padding:30px 22px 26px}
.c{position:absolute;width:10px;height:10px;fill:var(--gold)}.tl{top:13px;left:13px}.tr{top:13px;right:13px;transform:scaleX(-1)}
.bl{bottom:13px;left:13px;transform:scaleY(-1)}.br{bottom:13px;right:13px;transform:scale(-1)}
.kick{font:600 11px/1 "Cormorant Garamond",Baskerville,serif;letter-spacing:.34em;text-transform:uppercase;color:var(--goldInk);text-align:center}
figure{margin:20px 0 0}figure img{display:block;width:100%;border:1.5px solid var(--gold);padding:3px;background:var(--paper)}
h1{font:italic 500 29px/1.15 "Cormorant Garamond",Baskerville,serif;text-align:center;margin:24px 0 6px}
.zh{text-align:center;font-weight:600;font-size:15px;letter-spacing:.14em;color:var(--ink2)}
.orn{display:flex;align-items:center;justify-content:center;gap:10px;margin:20px 0 16px}.orn i{width:46px;height:1px;background:var(--rule)}
.orn b{width:6px;height:6px;background:var(--gold);transform:rotate(45deg)}
.meta{text-align:center;font:500 17px/1.5 "Cormorant Garamond",Baskerville,serif;color:var(--ink2)}.meta em{color:var(--muted)}
p{margin:18px 0 0;text-align:justify;color:var(--ink2)}
.vers{writing-mode:vertical-rl;margin:22px auto 0;height:15em;font-size:19px;line-height:2.1;letter-spacing:.12em;color:var(--ink)}
.btn{display:block;margin-top:14px;padding:12px;text-align:center;text-decoration:none;border:1px solid var(--gold);color:var(--goldInk);
 font:600 12px/1 "Cormorant Garamond",Baskerville,serif;letter-spacing:.22em;text-transform:uppercase}
.btn.quiet{border-color:var(--rule)}.btn:first-of-type{margin-top:24px}
</style></head><body><div class="sheet">${cornerSvg("tl")}${cornerSvg("tr")}${cornerSvg("bl")}${cornerSvg("br")}<div class="inner">
<div class="kick">Wiener Galerie · Saalzettel</div>
<figure>${img}</figure>
<h1>${k.titel}</h1><div class="zh">${k.zh}</div>
<div class="orn"><i></i><b></b><i></i></div>
<div class="meta">${k.wer}<br><em>${k.jahr} · ${k.ort}</em></div>
${k.vers ? `<div class="vers">${k.vers}</div>` : ""}${k.text ? `<p>${k.text}</p>` : ""}
${links}</div></div></body></html>`;
  const wv = new WebView();
  let ready = false;
  wv.shouldAllowRequest = (req) => { if (!ready) return true; Safari.open(req.url); return false; }; // links leave for Safari / Spotify
  await wv.loadHTML(html, "https://wiener-morgen-private.duckdns.org/");
  ready = true;
  await wv.present(false);
}

// ——— Run ———
const q = args.queryParameters || {};
if (config.runsInWidget) {
  const fam = config.widgetFamily || "small";
  Script.setWidget(await build(pick(args.widgetParameter, fam), fam));
} else if (q.werk && W[q.werk]) {
  await saalzettel(q.werk);
} else {
  const ids = Object.keys(W), a = new Alert();
  a.title = "Wiener Galerie";
  a.message = "預覽一件作品，或先把全部圖檔存到手機上（離線也能顯示）。";
  ids.forEach((id) => a.addAction(`${W[id].zh} · ${W[id].wer}`));
  a.addAction("存下全部圖檔");
  a.addCancelAction("關閉");
  const i = await a.presentSheet();
  if (i >= 0 && i < ids.length) {
    const fam = W[ids[i]].size;
    const w = await build(ids[i], fam);
    if (fam === "medium") await w.presentMedium(); else await w.presentSmall();
  } else if (i === ids.length) {
    const files = allFiles(); let ok = 0;
    for (const f of files) { try { await asset(f); ok++; } catch (e) { console.error(e); } }
    const d = new Alert(); d.title = "Wiener Galerie"; d.message = `已存下 ${ok} / ${files.length} 個圖檔。`; d.addAction("好"); await d.present();
  }
}
Script.complete();
