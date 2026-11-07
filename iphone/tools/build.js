// The iPhone set: the home-screen wallpaper (day, night) and nine distinct widget images.
// Usage: bun add @resvg/resvg-js@2.6.2, then FONTS=<dir> bun build.js <outdir>. <dir> holds Cormorant Garamond
// (500, 600, 500 italic) and Noto Serif TC (300, 600) as TTF, from Google Fonts (both OFL). Convert the PNGs to
// JPEG (quality 93) before committing: the paper grain makes them large.
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { THEMES, SIZE, KIT_STILLS, home, fontFiles } from "./kit.js";
import { draw as skyline } from "./motifs/wien-skyline.js";
import { draw as waltz } from "./motifs/donauwalzer.js";
import { draw as thonet } from "./motifs/thonet.js";
import { draw as sunflower } from "./motifs/sonnenblume.js";
import { draw as kiss } from "./motifs/kuss-mosaik.js";

const OUT = process.argv[2] || "out";
const STILLS = {
  ...KIT_STILLS,
  "wien-mittel": (t) => skyline(t, ...SIZE.medium),
  "donauwalzer-mittel": (t) => waltz(t, ...SIZE.medium),
  "thonet-klein": (t) => thonet(t, ...SIZE.small),
  "sonnenblume-klein": (t) => sunflower(t, ...SIZE.small),
  "kuss-klein": (t) => kiss(t, ...SIZE.small),
};
const render = (svg, file) => writeFileSync(join(OUT, file), new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Noto Serif TC" } }).render().asPng());
mkdirSync(join(OUT, "wallpaper"), { recursive: true }); mkdirSync(join(OUT, "widgets"), { recursive: true });
for (const t of Object.values(THEMES)) {
  const tag = t.name === "light" ? "tag" : "nacht";
  render(home(t), `wallpaper/wien-${tag}.png`);
  for (const [k, fn] of Object.entries(STILLS)) render(fn(t), `widgets/${k}-${tag}.png`);
}
console.log("done:", Object.keys(STILLS).join(", "));
