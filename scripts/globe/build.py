# Build assets/globe.json for 你讀過的世界: country outlines in longitude/latitude, small enough for a phone.
# Source: Natural Earth 1:50m Admin 0 – Countries (public domain, naturalearthdata.com), via the nvkelso/natural-earth-vector
# repository's GeoJSON. Conventions kept from assets/world.svg: one shape per ISO 3166-1 alpha-2 code, Taiwan "tw",
# Crimea drawn as Ukraine, territories with limited recognition folded into the state they are usually counted with.
# Output: {"c": {code: [ring, ...]}, "p": {code: [lon, lat]}} — a ring is a flat list of integers, the first point in
# 0.01° (lon, lat), every later one the difference from the point before; "p" is a dot for a state too small to draw.
import json, math, re, sys

SRC, SVG, INDEX, OUT = sys.argv[1:5]
TOL = 0.22      # degrees, Douglas-Peucker
MIN_AREA = 0.35 # square degrees: smaller islands are dropped (the largest piece of a country always stays)
DOT_AREA = 0.6  # a country whose largest piece is smaller than this also gets a dot

def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts) - 1)]
    while st:
        a, b = st.pop(); ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy)
        best, bi = 0.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs((px - ax) * dy - (py - ay) * dx) / L if L > 1e-12 else math.hypot(px - ax, py - ay)
            if d > best: best, bi = d, i
        if best > tol: keep[bi] = True; st += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def area(r): return abs(sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r)))) / 2
def centroid(r):
    return [sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r)]

d = json.load(open(SRC, encoding="utf-8"))
svg_ids = set(re.findall(r'<path id="([a-z]{2})"', open(SVG, encoding="utf-8").read()))
places = {k.lower() for k in (json.load(open(INDEX, encoding="utf-8")).get("places") or {})}

# codes Natural Earth leaves as -99, and the folds this paper's map makes
FIX = {"France": "fr", "Norway": "no", "Taiwan": "tw"}
# as on world.svg: no shape of its own for Kosovo (with Serbia), N. Cyprus (Cyprus), Somaliland (Somalia), Åland (Finland)
FOLD = {"Kosovo": "rs", "N. Cyprus": "cy", "Somaliland": "so", "Aland": "fi", "Åland": "fi", "Heard I. and McDonald Is.": None, "Siachen Glacier": None}
# codes world.svg draws that Natural Earth keeps inside France, the Netherlands or leaves out: a dot each, placed by hand
# to the nearest half degree or so (a dot is 3 px on the globe)
EXTRA = {"gf": [-53.1, 3.9], "gp": [-61.6, 16.2], "mq": [-61.0, 14.6], "re": [55.5, -21.1], "yt": [45.2, -12.8], "gi": [-5.35, 36.1], "bq": [-68.3, 12.2], "tk": [-171.8, -9.2]}

shapes = {}; notes = []
for f in d["features"]:
    p = f["properties"]; name = p.get("NAME") or p.get("ADMIN")
    code = None
    for k in ("ISO_A2_EH", "ISO_A2"):
        v = p.get(k)
        if isinstance(v, str) and re.fullmatch(r"[A-Z]{2}", v): code = v.lower(); break
    if name in FIX: code = FIX[name]
    if name in FOLD: code = FOLD[name]
    if name in ("Taiwan", "Russia", "Ukraine", "Kosovo", "Palestine", "W. Sahara", "N. Cyprus", "Somaliland", "Hong Kong", "Macao"):
        notes.append((name, p.get("ISO_A2"), p.get("ISO_A2_EH"), "->", code))
    if not code: notes.append(("NO CODE", name, p.get("ISO_A2"), p.get("ISO_A2_EH"))); continue
    g = f["geometry"]; polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
    for poly in polys:
        ring = [(float(x), float(y)) for x, y in poly[0][:-1]]   # outer ring only: lakes do not matter at this size
        c = centroid(ring)
        # Crimea: Natural Earth draws it with Russia; this paper's map draws it as Ukraine
        if code == "ru" and 32.3 < c[0] < 36.8 and 44.2 < c[1] < 46.3:
            notes.append(("Crimea piece moved ru -> ua", round(c[0], 1), round(c[1], 1), "area", round(area(ring), 2))); shapes.setdefault("ua", []).append(ring); continue
        shapes.setdefault(code, []).append(ring)

out_c = {}; out_p = {}; npts = 0
for code, rings in sorted(shapes.items()):
    rings.sort(key=area, reverse=True)
    keep = [r for i, r in enumerate(rings) if i == 0 or area(r) >= MIN_AREA]
    enc = []
    for r in keep:
        i0 = min(range(len(r)), key=lambda i: r[i]); i1 = max(range(len(r)), key=lambda i: (r[i][0] - r[i0][0]) ** 2 + (r[i][1] - r[i0][1]) ** 2)
        a, b = sorted((i0, i1))
        s = dp(r[a:b + 1], TOL)[:-1] + dp(r[b:] + r[:a + 1], TOL)[:-1]
        q = []
        for x, y in s:
            pt = (round(x * 100), round(y * 100))
            if not q or q[-1] != pt: q.append(pt)
        if len(q) > 1 and q[0] == q[-1]: q.pop()
        if len(q) < 3:
            if r is keep[0]: out_p[code] = [round(v, 2) for v in centroid(r)]
            continue
        flat = [q[0][0], q[0][1]]
        for (x0, y0), (x1, y1) in zip(q, q[1:]): flat += [x1 - x0, y1 - y0]
        enc.append(flat); npts += len(q)
    if enc: out_c[code] = enc
    if area(rings[0]) < DOT_AREA: out_p[code] = [round(v, 2) for v in centroid(rings[0])]

for k, v in EXTRA.items(): out_p.setdefault(k, v)
have = set(out_c) | set(out_p)
print("notes:"); [print("  ", n) for n in notes]
print("countries with a shape", len(out_c), "dots", len(out_p), "points", npts)
print("in world.svg but not on the globe:", sorted(svg_ids - have))
print("in the index's places but not on the globe:", sorted(places - have))
print("on the globe but not in world.svg:", sorted(have - svg_ids))
tw = out_c.get("tw"); print("tw rings", len(tw or []), "first point", tw and (tw[0][0] / 100, tw[0][1] / 100))
ua = out_c.get("ua"); print("ua rings", len(ua or []))
txt = json.dumps({"src": "Natural Earth 1:50m Admin 0 (public domain)", "c": out_c, "p": out_p}, separators=(",", ":"))
open(OUT, "w", encoding="utf-8").write(txt)
print("bytes", len(txt))
