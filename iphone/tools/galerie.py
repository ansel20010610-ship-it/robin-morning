"""Assets for wiener-galerie.js (the Scriptable gallery that follows the system's light and dark mode).

A Scriptable widget cannot swap a picture when the phone goes dark, but it can tint a one-colour picture with a
colour that does. So the drawn cards are split here into one-colour layers (ink, gold, gold-ink) that the script tints
with Color.dynamic, while the paper, the frames and the Kuss robe are drawn natively by the script.

The layers are unmixed from the day and night renders in ../widgets/: in a region that holds one colour, a pixel is
paper + a * (colour - paper) in both modes, so a is its projection on that line across the six channels.

Usage: python3 galerie.py            → ../galerie/*.png, *.jpg
       python3 galerie.py <dir>      → also writes day/night previews of every card to <dir>
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
WIDGETS = HERE.parent / "widgets"
OUT = HERE.parent / "galerie"

LIGHT = dict(paper="#F5F0E6", paper2="#EDE5D5", ink="#1F1B16", gold="#A5843F", goldInk="#7C642F", rule="#CBB98F", kink="#1F1B16")
DARK = dict(paper="#15120E", paper2="#0E0C09", ink="#EDE4D3", gold="#CDAE68", goldInk="#CDAE68", rule="#564A33", kink="#0B0906")
rgb = lambda s: np.array([int(s[i:i + 2], 16) for i in (1, 3, 5)], float) / 255

# Pieces in px of the 3x render (small 510×510, medium 1092×510). x0 x1 y0 y1, tint. Must match LAYERS in the script.
PIECES = {
    "mozart40-mittel": [("mozart40-tinte", 86, 1006, 92, 346, "ink"), ("mozart40-welle", 86, 1006, 348, 376, "gold"),
                        ("mozart40-zeile", 86, 1006, 384, 416, "goldInk")],
    "kuss-klein": [("kuss-feld", 214, 362, 66, 382, "gold"), ("kuss-titel", 150, 362, 400, 430, "goldInk")],
    "weizenkorn-klein": [("weizenkorn-zitat", 102, 134, 140, 372, "goldInk"), ("weizenkorn-vers", 160, 400, 140, 372, "ink")],
}
PAINTINGS = {"naschmarkt": 1100, "moser": 1200, "vierbaeume": 1000, "sonnenblumen": 1000, "floege": 1000}


def load(stem, mode):
    return np.asarray(Image.open(WIDGETS / f"{stem}-{mode}.jpg").convert("RGB"), float) / 255


def unmix(day, night, tint):
    P = np.concatenate([rgb(LIGHT["paper"]), rgb(DARK["paper"])])
    C = np.concatenate([rgb(LIGHT[tint]), rgb(DARK[tint])]) - P
    X = np.concatenate([day, night], 2) - P
    a = (X @ C) / (C @ C)
    return np.clip((a - 0.09) / 0.86, 0, 1)  # the paper grain sits below ~0.09


def layers():
    OUT.mkdir(exist_ok=True)
    spec = {}
    for stem, pieces in PIECES.items():
        day, night = load(stem, "tag"), load(stem, "nacht")
        for name, x0, x1, y0, y1, tint in pieces:
            a = unmix(day[y0:y1, x0:x1], night[y0:y1, x0:x1], tint)
            edge = max(a[0].max(), a[-1].max(), a[:, 0].max(), a[:, -1].max())
            if edge > 0.3 and name != "kuss-feld":  # the field's border runs out of the crop on purpose
                print(f"warning: {name} touches its crop edge ({edge:.2f})")
            alpha = Image.fromarray((a * 255).round().astype(np.uint8))
            Image.merge("LA", (Image.new("L", alpha.size, 0), alpha)).save(OUT / f"{name}.png", optimize=True)
            spec[name] = [x0, x1, y0, y1, tint]
    return spec


def grain(w, h, seed):
    """Paper tooth: fine flecks plus long fibres and a soft vignette, as one dark, very thin layer."""
    rng = np.random.default_rng(seed)
    n = rng.random((h, w))
    fleck = np.clip(0.30 * n - 0.20, 0, None)  # most pixels clear; a sprinkling of dark specks
    fib = rng.random((h // 24 + 2, w // 3 + 2))
    fib = np.asarray(Image.fromarray((fib * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), float) / 255
    fibre = np.clip(fib - 0.62, 0, None) * 0.05
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot((xx - w / 2) / (w / 2), (yy - h * 0.46) / (h / 2)) / 1.25
    vig = np.clip((r - 0.55) / 0.45, 0, 1) ** 2 * 0.05
    a = np.clip(fleck + fibre + vig, 0, 1)
    a = (np.round(a * 255 / 4) * 4).clip(0, 255).astype(np.uint8)  # coarse steps keep the PNG small
    col = Image.new("RGB", (w, h), "#2A2216")
    img = col.copy()
    img.putalpha(Image.fromarray(a))
    return img


def assets():
    spec = layers()
    for name, (w, h) in {"klein": (510, 510), "mittel": (1092, 510), "gross": (1092, 1146)}.items():
        grain(w, h, len(name)).save(OUT / f"korn-{name}.png", optimize=True)
    for name, edge in PAINTINGS.items():
        im = Image.open(HERE / "photos" / f"{name}.jpg").convert("RGB")
        k = min(1, edge / max(im.size))
        if k < 1:
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im.save(OUT / f"{name}.jpg", quality=88, optimize=True, progressive=True)
    print(json.dumps(spec))


# ——— Previews: the cards as the script lays them out, in both modes (to check the layers and the geometry) ———
def tinted(path, color):
    a = Image.open(path).getchannel("A")
    im = Image.new("RGBA", a.size, color)
    im.putalpha(a)
    return im


def base(t, w, h, korn):
    im = Image.new("RGBA", (w, h), t["paper"])
    if t is DARK:  # the night vignette is the widget's dynamic gradient
        g = Image.linear_gradient("L").resize((w, h))
        g = Image.fromarray((np.abs(np.asarray(g, float) - 127.5) / 127.5 * 255 * 0.55).astype(np.uint8))
        im = Image.composite(Image.new("RGBA", (w, h), t["paper2"]), im, g)
    im.alpha_composite(korn.resize((w, h)))
    return im


def frame_card(t, w, h, korn):
    im = base(t, w, h, korn)
    d = ImageDraw.Draw(im)
    d.rectangle([41, 41, w - 42, h - 42], outline=t["gold"], width=2)
    d.rectangle([50, 50, w - 51, h - 51], outline=t["rule"], width=1)
    for fx, fy in ((0, 0), (1, 0), (0, 1), (1, 1)):
        for i, j in ((0, 0), (2, 0), (1, 1), (0, 2)):
            x = (w - 52 - (i + 1) * 10) if fx else 52 + i * 10
            y = (h - 52 - (j + 1) * 10) if fy else 52 + j * 10
            d.rectangle([x, y, x + 9, y + 9], fill=t["gold"])
    return im


def photo_card(t, w, h, korn, pic):
    im = base(t, w, h, korn)
    d = ImageDraw.Draw(im)
    o, m = 16, 38
    d.rectangle([o, o, w - o - 1, h - o - 1], outline=t["rule"], width=1)
    for x, y in ((o, o), (w - o, o), (o, h - o), (w - o, h - o)):
        d.rectangle([x - 5, y - 5, x + 4, y + 4], fill=t["gold"])
    pw, ph = w - 2 * m, h - 2 * m
    src = Image.open(pic).convert("RGB")
    k = max(pw / src.width, ph / src.height)
    src = src.resize((round(src.width * k), round(src.height * k)), Image.LANCZOS)
    src = src.crop(((src.width - pw) // 2, (src.height - ph) // 2, (src.width - pw) // 2 + pw, (src.height - ph) // 2 + ph))
    im.paste(src, (m, m))
    d.rectangle([m - 5, m - 5, w - m + 4, h - m + 4], outline=t["gold"], width=3)
    return im


RUNS = [
    [[82, 132, "g"], [136, 158, "o"], [162, 196, "g"], [200, 250, "k"], [254, 288, "g"], [292, 314, "o"], [318, 366, "g"]],
    [[82, 114, "o"], [118, 168, "k"], [172, 206, "g"], [210, 260, "o"], [264, 298, "g"], [302, 336, "k"], [340, 366, "o"]],
    [[82, 100, "o"], [104, 154, "g"], [158, 180, "o"], [184, 218, "g"], [222, 244, "o"], [248, 282, "k"], [286, 308, "o"], [312, 366, "g"]],
]


def robe(im, t):
    d = ImageDraw.Draw(im)
    d.rectangle([151, 75, 213, 76], fill=t["gold"]); d.rectangle([151, 371, 213, 372], fill=t["gold"])
    d.rectangle([151, 75, 152, 372], fill=t["gold"])
    for ci, run in enumerate(RUNS):
        x = 159 + ci * 19
        for a, b, k in run:
            if k == "g":
                d.rectangle([x, a, x + 14, b - 1], fill=t["gold"])
            elif k == "k":
                d.rectangle([x, a, x + 14, b - 1], fill=t["kink"], outline=t["gold"] if t is DARK else t["kink"], width=1)
            else:
                d.rectangle([x, a, x + 14, b - 1], outline=t["gold"], width=1)
                d.rectangle([x + 5, a + 5, x + 9, b - 6], fill=t["gold"])


def previews(dest):
    dest = Path(dest); dest.mkdir(parents=True, exist_ok=True)
    korn = {n: Image.open(OUT / f"korn-{n}.png") for n in ("klein", "mittel")}
    for t, tag in ((LIGHT, "tag"), (DARK, "nacht")):
        for stem, pieces in PIECES.items():
            w = 1092 if "mittel" in stem else 510
            im = frame_card(t, w, 510, korn["mittel" if w > 600 else "klein"])
            for name, x0, x1, y0, y1, tint in pieces:
                im.alpha_composite(tinted(OUT / f"{name}.png", t[tint]), (x0, y0))
            if stem.startswith("kuss"):
                robe(im, t)
            im.convert("RGB").save(dest / f"{stem}-{tag}.png")
        for name in PAINTINGS:
            w = 1092 if name in ("naschmarkt", "moser") else 510
            photo_card(t, w, 510, korn["mittel" if w > 600 else "klein"], OUT / f"{name}.jpg").convert("RGB").save(dest / f"{name}-{tag}.png")


if __name__ == "__main__":
    assets()
    if len(sys.argv) > 1:
        previews(sys.argv[1])
