// A photograph or painting as a widget: set in the paper like a print in a gilt frame — the picture, a gold line
// close round it, a hairline further out, a small gold square at each corner of the outer line. The iOS mask rounds
// the card's own corners. Usage: FONTS=<dir> bun photo.js <picture.jpg> <small|medium> <out-prefix>  → <out>-tag.png, <out>-nacht.png
import { THEMES, SIZE, defs, paper, diamond, fontFiles } from "./kit.js";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";

export function photoCard(t, w, h, uri) {
  const m = Math.round(Math.min(w, h) * 0.075); // the paper margin round the picture
  const o = Math.round(m * 0.42);               // the outer hairline, between the picture and the edge
  const sq = (x, y) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${t.gold}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(t)}${paper(t, w, h)}
    <rect x="${o}" y="${o}" width="${w - 2 * o}" height="${h - 2 * o}" fill="none" stroke="${t.rule}" stroke-width="1.5"/>
    ${sq(o, o)}${sq(w - o, o)}${sq(o, h - o)}${sq(w - o, h - o)}
    <image href="${uri}" x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" preserveAspectRatio="xMidYMid slice"/>
    <rect x="${m - 4}" y="${m - 4}" width="${w - 2 * m + 8}" height="${h - 2 * m + 8}" fill="none" stroke="${t.gold}" stroke-width="2.5"/>
  </svg>`;
}

if (import.meta.main) {
  const [src, size, out] = process.argv.slice(2);
  const [w, h] = SIZE[size];
  const uri = "data:image/jpeg;base64," + readFileSync(src).toString("base64");
  for (const t of Object.values(THEMES)) {
    const svg = photoCard(t, w, h, uri);
    writeFileSync(`${out}-${t.name === "light" ? "tag" : "nacht"}.png`, new Resvg(svg, { font: { fontFiles, loadSystemFonts: false } }).render().asPng());
  }
}
