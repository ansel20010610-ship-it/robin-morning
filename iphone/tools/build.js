// The iPhone set: the home-screen wallpaper (day, night), three drawn widgets and seven framed pictures.
// Usage: bun add @resvg/resvg-js@2.6.2, then FONTS=<dir> bun build.js <outdir>. <dir> holds Cormorant Garamond
// (500, 600, 500 italic) and Noto Serif TC (300, 600) as TTF, from Google Fonts (both OFL). Convert the PNGs to
// JPEG (quality 92) before committing: the paper grain makes them large. The pictures are in photos/, already
// cropped to the widget's shape; where they come from and their licences are in ../README.md.
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { THEMES, SIZE, KIT_STILLS, home, fontFiles } from "./kit.js";
import { photoCard } from "./photo.js";
import { draw as mozart } from "./motifs/mozart40.js";
import { draw as kiss } from "./motifs/kuss-mosaik.js";

const OUT = process.argv[2] || "out";
const pic = (name) => "data:image/jpeg;base64," + readFileSync(join(import.meta.dir, "photos", `${name}.jpg`)).toString("base64");
const PHOTOS = { kaffeehaus: "medium", karlskirche: "medium", attersee: "medium", secession: "small", schiele: "small", melange: "small", wagner: "small" };
const STILLS = {
  ...KIT_STILLS,
  "mozart40-mittel": (t) => mozart(t, ...SIZE.medium),
  "kuss-klein": (t) => kiss(t, ...SIZE.small),
  ...Object.fromEntries(Object.entries(PHOTOS).map(([n, s]) => [`${n}-${s === "small" ? "klein" : "mittel"}`, (t) => photoCard(t, ...SIZE[s], pic(n))])),
};
const render = (svg, file) => writeFileSync(join(OUT, file), new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Noto Serif TC" } }).render().asPng());
mkdirSync(join(OUT, "wallpaper"), { recursive: true }); mkdirSync(join(OUT, "widgets"), { recursive: true });
for (const t of Object.values(THEMES)) {
  const tag = t.name === "light" ? "tag" : "nacht";
  render(home(t), `wallpaper/wien-${tag}.png`);
  for (const [k, fn] of Object.entries(STILLS)) render(fn(t), `widgets/${k}-${tag}.png`);
}
console.log("done:", Object.keys(STILLS).join(", "));
