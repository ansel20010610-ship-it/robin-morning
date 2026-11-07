// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: calendar-alt;

// Wiener Kalenderblatt — a day sheet for the iPhone in the colours of 知更鳥晨間記事, for Scriptable (free).
// Small: the weekday, the day, the month. Medium: the same beside the month's page (weeks begin on Monday, as in
// Vienna). Large: the month's page under a masthead. Lock screen: rectangular, circular and inline.
// Nothing is fetched and nothing leaves the phone.

const C = {
  paper: Color.dynamic(new Color("#F5F0E6"), new Color("#15120E")),
  ink: Color.dynamic(new Color("#1F1B16"), new Color("#EDE4D3")),
  ink2: Color.dynamic(new Color("#4A4237"), new Color("#CDC2AF")),
  muted: Color.dynamic(new Color("#9A8F7E"), new Color("#7A705F")),
  gold: Color.dynamic(new Color("#A5843F"), new Color("#CDAE68")),
  goldInk: Color.dynamic(new Color("#7C642F"), new Color("#CDAE68")),
  rule: Color.dynamic(new Color("#CBB98F"), new Color("#564A33")),
  onGold: Color.dynamic(new Color("#F5F0E6"), new Color("#15120E")),
};
const F = {
  roman: (s) => new Font("Baskerville", s),
  semi: (s) => new Font("Baskerville-SemiBold", s),
  bold: (s) => new Font("Baskerville-Bold", s),
  italic: (s) => new Font("Baskerville-Italic", s),
};
const WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WD2 = ["M", "D", "M", "D", "F", "S", "S"]; // Montag … Sonntag
const MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]; // Austrian Jänner
const ROMAN_M = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
function roman(n) { let s = ""; for (const [v, l] of [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]) while (n >= v) { s += l; n -= v; } return s; }
const spaced = (s) => s.toUpperCase().split("").join(" "); // small capitals, letter-spaced by thin spaces

const now = new Date();
const y = now.getFullYear(), m = now.getMonth(), d = now.getDate(), wd = now.getDay();

// ——— Drawn ornaments, as templates so they take the mode's gold ———
function img(w, h, draw) {
  const dc = new DrawContext();
  dc.size = new Size(w, h); dc.opaque = false; dc.respectScreenScale = true;
  dc.setFillColor(Color.black());
  draw(dc);
  return dc.getImage();
}
const corner = (fx, fy) => img(12, 12, (dc) => { // three squares of the Secession chequer, in an L
  for (const [i, j] of [[0, 0], [2, 0], [1, 1], [0, 2]]) dc.fillRect(new Rect(fx ? (2 - i) * 4 : i * 4, fy ? (2 - j) * 4 : j * 4, 4, 4));
});
const diamond = (s) => img(s, s, (dc) => { const p = new Path(); p.addLines([new Point(s / 2, 0), new Point(s, s / 2), new Point(s / 2, s), new Point(0, s / 2)]); p.closeSubpath(); dc.addPath(p); dc.fillPath(); });
const chequerBand = (n, s) => img(n * s, s, (dc) => { for (let i = 0; i < n; i += 2) dc.fillRect(new Rect(i * s, 0, s, s)); });

function put(stack, image, color, w, h) { const i = stack.addImage(image); i.tintColor = color; i.imageSize = new Size(w, h); return i; }
function txt(stack, s, font, color, { lines = 1, scale = 1 } = {}) { const t = stack.addText(s); t.font = font; t.textColor = color; t.lineLimit = lines; if (scale < 1) t.minimumScaleFactor = scale; return t; }
function hrow(stack) { const r = stack.addStack(); r.layoutHorizontally(); r.centerAlignContent(); return r; }
function vcol(stack) { const c = stack.addStack(); c.layoutVertically(); return c; }
function centred(stack, s, font, color, opts) { const r = hrow(stack); r.addSpacer(); txt(r, s, font, color, opts); r.addSpacer(); return r; }

// The card: paper, a gold rule inset from the edge, chequer corners inside it. Returns the content stack.
function card(w, padIn) {
  w.backgroundColor = C.paper;
  w.setPadding(8, 8, 8, 8);
  const frame = w.addStack();
  frame.layoutVertically();
  frame.borderColor = C.gold; frame.borderWidth = 1;
  frame.setPadding(3, 3, 3, 3);
  const top = hrow(frame); put(top, corner(false, false), C.gold, 9, 9); top.addSpacer(); put(top, corner(true, false), C.gold, 9, 9);
  const body = frame.addStack(); body.layoutVertically(); body.setPadding(...padIn);
  const bot = hrow(frame); put(bot, corner(false, true), C.gold, 9, 9); bot.addSpacer(); put(bot, corner(true, true), C.gold, 9, 9);
  return body;
}

// The day itself: weekday in italic gold, the numeral, the month in spaced capitals, a diamond between rules.
function sheet(stack, big) {
  centred(stack, WD[wd], F.italic(big ? 16 : 14), C.gold);
  stack.addSpacer(big ? 0 : 1);
  centred(stack, String(d), F.roman(big ? 66 : 58), C.ink);
  stack.addSpacer(big ? 2 : 1);
  const orn = hrow(stack); orn.addSpacer();
  const l = orn.addStack(); l.size = new Size(big ? 22 : 18, 1); l.backgroundColor = C.rule;
  orn.addSpacer(5); put(orn, diamond(5), C.gold, 5, 5); orn.addSpacer(5);
  const r = orn.addStack(); r.size = new Size(big ? 22 : 18, 1); r.backgroundColor = C.rule;
  orn.addSpacer();
  stack.addSpacer(big ? 6 : 5);
  centred(stack, spaced(MON[m]), F.semi(big ? 10.5 : 9.5), C.goldInk, { scale: 0.7 });
  stack.addSpacer(2);
  centred(stack, roman(y), F.italic(big ? 11 : 10), C.muted);
}

// The month's page: Monday first, today on a gold square, the other days in ink, Sundays in gold. `ch` is the cell
// height for a five-week month, `ch6` for a six-week one (November 2026, August 2026), so the page fits the same box.
const FIRST = (new Date(y, m, 1).getDay() + 6) % 7, DAYS = new Date(y, m + 1, 0).getDate(), WEEKS = Math.ceil((FIRST + DAYS) / 7);
function monthGrid(stack, cw, ch5, ch6, fontSize) {
  const ch = WEEKS > 5 ? ch6 : ch5;
  const head = hrow(stack);
  WD2.forEach((l, i) => { const c = head.addStack(); c.size = new Size(cw, ch); c.centerAlignContent(); txt(c, l, F.italic(fontSize * 0.9), i === 6 ? C.gold : C.goldInk); });
  stack.addSpacer(2);
  const ruleRow = stack.addStack(); ruleRow.size = new Size(cw * 7, 1); ruleRow.backgroundColor = C.rule;
  stack.addSpacer(3);
  const first = FIRST, days = DAYS;
  for (let w = 0; w < WEEKS; w++) {
    const r = hrow(stack);
    for (let i = 0; i < 7; i++) {
      const n = w * 7 + i - first + 1;
      const c = r.addStack(); c.size = new Size(cw, ch); c.centerAlignContent();
      if (n < 1 || n > days) continue;
      if (n === d) { c.backgroundColor = C.gold; txt(c, String(n), F.bold(fontSize), C.onGold); }
      else txt(c, String(n), F.roman(fontSize), n < d ? C.muted : i === 6 ? C.goldInk : C.ink);
    }
  }
}

const fam = config.widgetFamily || "medium";
const w = new ListWidget();
if (fam.startsWith("accessory")) w.setPadding(0, 0, 0, 0);
if (fam === "accessoryInline") {
  txt(w, `${WD[wd]}, ${d}. ${MON[m]}`, F.italic(13), Color.white());
} else if (fam === "accessoryCircular") {
  const c = vcol(w);
  centred(c, WD[wd].slice(0, 2).toUpperCase(), F.semi(10), Color.white());
  centred(c, String(d), F.roman(24), Color.white());
} else if (fam === "accessoryRectangular") {
  txt(w, WD[wd], F.italic(15), Color.white());
  txt(w, `${d}. ${MON[m]}`, F.semi(17), Color.white(), { scale: 0.8 });
  txt(w, roman(y), F.italic(11), new Color("#FFFFFF", 0.7));
} else if (fam === "small") {
  const b = card(w, [0, 4, 0, 4]);
  b.addSpacer();
  sheet(b, false);
  b.addSpacer();
} else if (fam === "medium") {
  const b = card(w, [0, 8, 0, 8]);
  b.addSpacer();
  const r = hrow(b);
  const left = vcol(r); left.size = new Size(112, 0); sheet(left, false);
  r.addSpacer(8);
  const sep = r.addStack(); sep.size = new Size(1, 112); sep.backgroundColor = C.rule;
  r.addSpacer(12);
  const right = vcol(r); monthGrid(right, 23, 16, 15, 10.5);
  b.addSpacer();
} else {
  const b = card(w, [4, 10, 4, 10]);
  centred(b, spaced("Wiener Kalenderblatt"), F.semi(9), C.goldInk, { scale: 0.7 });
  b.addSpacer(6);
  const band = hrow(b); band.addSpacer(); put(band, chequerBand(21, 4), C.gold, 84, 4); band.addSpacer();
  b.addSpacer();
  sheet(b, false);
  b.addSpacer();
  const g = hrow(b); g.addSpacer(); const grid = vcol(g); monthGrid(grid, 40, 24, 21, 13); g.addSpacer();
  b.addSpacer();
}
// A new sheet just after midnight.
const midnight = new Date(y, m, d + 1, 0, 1);
w.refreshAfterDate = midnight;
if (config.runsInWidget) Script.setWidget(w);
else if (fam === "small") await w.presentSmall(); else if (fam === "large") await w.presentLarge(); else await w.presentMedium();
Script.complete();
