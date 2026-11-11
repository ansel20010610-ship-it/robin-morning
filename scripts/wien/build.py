# Build the inner-city model for the Wien map prototype from the raw Stadt Wien responses (fetch.py).
# Datenquelle: Stadt Wien - data.wien.gv.at (CC BY 4.0): Baukörpermodell (FMZKBKMOGD), FMZK Gewässer, öffentlich
# zugängliche Grünflächen, Straßengraph, Sehenswürdigkeiten.
#
# Output: one binary file. uint32 magic "WIEN", uint32 json length, JSON (stops, route, counts, credit), then prisms:
#   uint8 kind (0 building, 1 water, 2 green), uint8 stop (0 = none, else 1-based stop index), uint8 rings, uint8 wide,
#   uint16 base, uint16 top (0.1 m above the ground plane), uint16 verts, uint16 tris,
#   uint16 route (metres along the route where it passes this front; 65535 = not on the route), uint16 0,
#   uint16 ring length x rings, int16 x,y x verts (0.1 m east/north of the origin), tri indices (uint8, or uint16 if wide)
import glob, heapq, json, math, os, struct, sys
from collections import Counter, defaultdict

DATA, OUT = sys.argv[1], sys.argv[2]
LON0, LAT0 = 16.36975, 48.20750
W, S, E, N = 16.3480, 48.1915, 16.3920, 48.2230
CW, CS, CE, CN = 16.3535, 48.1960, 16.3860, 48.2190  # the core: full detail; the ring round it is coarser
KX, KY = 111320.0 * math.cos(math.radians(LAT0)), 110574.0
Q = 10  # units per metre
def proj(c): return ((c[0] - LON0) * KX, (c[1] - LAT0) * KY)
XMIN, YMIN = proj((W, S)); XMAX, YMAX = proj((E, N))
CX0, CY0 = proj((CW, CS)); CX1, CY1 = proj((CE, CN))

# ---------- geometry (integers, 0.1 m) ----------
def cross(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
def area2(r): return sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r)))

def dp(pts, tol):
    """Douglas-Peucker on an open polyline."""
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    st = [(0, len(pts) - 1)]
    while st:
        a, b = st.pop()
        ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy)
        best, bi = 0.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs((px - ax) * dy - (py - ay) * dx) / L if L > 1e-9 else math.hypot(px - ax, py - ay)
            if d > best: best, bi = d, i
        if best > tol: keep[bi] = True; st += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def simplify_ring(r, tol):
    """Closed ring (no repeated last point), metres -> simplified."""
    if len(r) < 5: return r
    # split at the two far-apart anchors so the ring keeps its extent
    i0 = min(range(len(r)), key=lambda i: r[i]);
    i1 = max(range(len(r)), key=lambda i: (r[i][0] - r[i0][0]) ** 2 + (r[i][1] - r[i0][1]) ** 2)
    a, b = sorted((i0, i1))
    h1 = dp(r[a:b + 1], tol); h2 = dp(r[b:] + r[:a + 1], tol)
    return h1[:-1] + h2[:-1]

def clean(r):
    """Drop repeated and collinear points."""
    changed = True
    while changed and len(r) >= 3:
        changed = False; out = []
        n = len(r)
        for i in range(n):
            p, c, x = r[i - 1], r[i], r[(i + 1) % n]
            if c == p: changed = True; continue
            if cross(p, c, x) == 0 and (c[0] - p[0]) * (x[0] - c[0]) + (c[1] - p[1]) * (x[1] - c[1]) >= 0: changed = True; continue
            out.append(c)
        r = out
    # spikes (a-b-a) leave duplicates behind; one more pass for exact repeats
    return r if len(r) >= 3 else []

def on_seg(a, b, p): return min(a[0], b[0]) <= p[0] <= max(a[0], b[0]) and min(a[1], b[1]) <= p[1] <= max(a[1], b[1])
def blocks(a, b, c, d):
    """Does edge c-d get in the way of the bridge a-b? (edges that end at a or b are skipped by the caller)"""
    d1, d2, d3, d4 = cross(a, b, c), cross(a, b, d), cross(c, d, a), cross(c, d, b)
    if ((d1 > 0) != (d2 > 0)) and d1 != 0 and d2 != 0 and ((d3 > 0) != (d4 > 0)) and d3 != 0 and d4 != 0: return True
    if d1 == 0 and on_seg(a, b, c): return True
    if d2 == 0 and on_seg(a, b, d): return True
    if d3 == 0 and on_seg(c, d, a): return True
    if d4 == 0 and on_seg(c, d, b): return True
    return False

def in_cone(p, v, n, m):
    """Is m inside the polygon's corner at v (ring counter-clockwise, p before, n after)?"""
    if cross(p, v, n) > 0: return cross(v, n, m) > 0 and cross(p, v, m) > 0
    return not (cross(v, n, m) <= 0 and cross(p, v, m) <= 0)

def merge_holes(outer, holes):
    holes = sorted(holes, key=lambda h: min(h))
    for hi, h in enumerate(holes):
        j = min(range(len(h)), key=lambda i: h[i]); m = h[j]
        rest = holes[hi:]
        order = sorted(range(len(outer)), key=lambda i: (outer[i][0] - m[0]) ** 2 + (outer[i][1] - m[1]) ** 2)
        pick = None
        for i in order:
            v = outer[i]
            if v == m: continue
            if not in_cone(outer[i - 1], v, outer[(i + 1) % len(outer)], m): continue
            ok = True
            for ring in [outer] + rest:
                k = len(ring)
                for e in range(k):
                    c, d = ring[e], ring[(e + 1) % k]
                    if c == v or d == v or c == m or d == m: continue
                    if blocks(m, v, c, d): ok = False; break
                if not ok: break
            if ok: pick = i; break
        if pick is None: return None
        outer = outer[:pick + 1] + h[j:] + h[:j + 1] + outer[pick:]
    return outer

def in_tri(a, b, c, p, strict):
    d1, d2, d3 = cross(a, b, p), cross(b, c, p), cross(c, a, p)
    return (d1 > 0 and d2 > 0 and d3 > 0) if strict else (d1 >= 0 and d2 >= 0 and d3 >= 0)

def earclip(poly):
    """poly: list of points, counter-clockwise, may touch itself at bridges. Returns index triples or None."""
    n = len(poly); idx = list(range(n)); tris = []
    guard = 0
    while len(idx) > 3:
        m = len(idx); done = False
        for strict in (False, True):
            for k in range(m):
                ia, ib, ic = idx[k - 1], idx[k], idx[(k + 1) % m]
                a, b, c = poly[ia], poly[ib], poly[ic]
                cr = cross(a, b, c)
                if cr < 0: continue
                if cr == 0:
                    if (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]) > 0 or a == b or b == c: idx.pop(k); done = True; break
                    continue
                ear = True
                for q in idx:
                    if q == ia or q == ib or q == ic: continue
                    p = poly[q]
                    if p == a or p == b or p == c: continue
                    if in_tri(a, b, c, p, strict): ear = False; break
                if ear: tris.append((ia, ib, ic)); idx.pop(k); done = True; break
            if done: break
        if not done: return None
        guard += 1
        if guard > 4 * n + 10: return None
    if len(idx) == 3:
        a, b, c = (poly[i] for i in idx)
        if cross(a, b, c) > 0: tris.append(tuple(idx))
    return tris

def triangulate(rings):
    """rings: [outer, hole...] in integer units. Returns (verts, ringlens, tris, how) with triangles covering the area exactly."""
    outer = rings[0][:] if area2(rings[0]) > 0 else rings[0][::-1]
    holes = [h[:] if area2(h) < 0 else h[::-1] for h in rings[1:]]
    want = area2(outer) + sum(area2(h) for h in holes)
    def attempt(o, hs):
        verts = o + [p for h in hs for p in h]
        lens = [len(o)] + [len(h) for h in hs]
        if hs:
            merged = merge_holes(o, hs)
            if merged is None: return None
        else: merged = o
        t = earclip(merged)
        if t is None: return None
        at = {}
        for i, p in enumerate(verts): at.setdefault(p, i)
        tris = [tuple(at[merged[i]] for i in tr) for tr in t]
        got = sum(cross(verts[a], verts[b], verts[c]) for a, b, c in tris)
        if got != area2(o) + sum(area2(h) for h in hs): return None
        if any(cross(verts[a], verts[b], verts[c]) <= 0 for a, b, c in tris): return None
        return verts, lens, tris
    r = attempt(outer, holes)
    if r: return r + ("ok",)
    r = attempt(outer, [])
    if r:  # courtyards roofed over: walls of the holes are lost too
        return r + ("nohole",)
    return None

def clip_ring(r, x0, y0, x1, y1):
    """Sutherland-Hodgman against the model's rectangle (metres)."""
    def clip(pts, inside, cut):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            ia, ib = inside(a), inside(b)
            if ia and ib: out.append(b)
            elif ia and not ib: out.append(cut(a, b))
            elif not ia and ib: out.append(cut(a, b)); out.append(b)
        return out
    def cx(x): return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))
    def cy(y): return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    for inside, cut in ((lambda p: p[0] >= x0, cx(x0)), (lambda p: p[0] <= x1, cx(x1)), (lambda p: p[1] >= y0, cy(y0)), (lambda p: p[1] <= y1, cy(y1))):
        r = clip(r, inside, cut)
        if len(r) < 3: return []
    return r

def prep(poly, tol, clip=False):
    """GeoJSON polygon (rings with repeated last point) -> integer rings, simplified and cleaned; [] if nothing is left."""
    out = []
    for k, ring in enumerate(poly):
        r = [proj(c) for c in ring[:-1]]
        if clip: r = clip_ring(r, XMIN, YMIN, XMAX, YMAX)
        if len(r) < 3:
            if k == 0: return []
            continue
        r = simplify_ring(r, tol)
        r = clean([(round(x * Q), round(y * Q)) for x, y in r])
        if len(r) < 3 or abs(area2(r)) < 2 * 1.0 * Q * Q:  # under 1 m2
            if k == 0: return []
            continue
        out.append(r)
    return out

def polys_of(g):
    return [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"] if g["type"] == "MultiPolygon" else []

def pt_in_ring(p, r):
    x, y = p; ins = False
    for i in range(len(r)):
        (x1, y1), (x2, y2) = r[i - 1], r[i]
        if (y1 > y) != (y2 > y) and x < x1 + (x2 - x1) * (y - y1) / (y2 - y1): ins = not ins
    return ins

# ---------- buildings ----------
TOL = float(os.environ.get("TOL", "0.35"))
feats = {}
for fn in sorted(glob.glob(os.path.join(DATA, os.environ.get("BKM", "bkm2_") + "*.json"))):
    for f in json.load(open(fn))["features"]: feats[f["properties"]["FMZK_ID"]] = f
KEEP = {11, 12, 13, 14}
stats = Counter(); prisms = []  # dict(kind, stop, base, top, verts, lens, tris, geb)
for f in feats.values():
    p = f["properties"]
    if p["F_KLASSE"] not in KEEP: stats["skip class"] += 1; continue
    if p["O_KOTE"] is None: stats["no top"] += 1; continue
    ground = p["HOEHE_DGM"] if p["HOEHE_DGM"] is not None else p["T_KOTE"]
    if ground is None: stats["no ground"] += 1; continue
    top = p["O_KOTE"] - ground
    base = max(0.0, p["U_KOTE"] - ground) if p["U_KOTE"] is not None else 0.0
    if top - base < 0.8 or top < 1.5: stats["too low"] += 1; continue
    for poly in polys_of(f["geometry"]):
        cx, cy = proj(poly[0][0])
        core = CX0 <= cx <= CX1 and CY0 <= cy <= CY1
        if not (XMIN - 30 <= cx <= XMAX + 30 and YMIN - 30 <= cy <= YMAX + 30): stats["outside"] += 1; continue
        if not core and p["F_KLASSE"] != 11: stats["margin skip"] += 1; continue
        rings = prep(poly, TOL if core else 2.0)
        if rings and not core and abs(area2(rings[0])) < 2 * 60 * Q * Q: rings = []
        if not rings: stats["sliver"] += 1; continue
        t = triangulate(rings)
        if t is None and TOL < 0.05: t = None
        if t is None:
            rings = prep(poly, 0.01); t = triangulate(rings) if rings else None  # the simplification may have crossed the ring
            if t: stats["retry unsimplified"] += 1
        if t is None:
            stats["FAILED"] += 1; print("FAILED prism at %.0f,%.0f area %.0f m2 top %.0f core %s" % (cx, cy, abs(area2([(round(x*Q),round(y*Q)) for x,y in map(proj, poly[0][:-1])]))/2/Q/Q, top, core)); continue
        verts, lens, tris, how = t
        stats[how] += 1
        if len(verts) > 65000: stats["FAILED"] += 1; continue
        prisms.append(dict(kind=0, stop=0, base=base, top=top, verts=verts, lens=lens, tris=tris, geb=p["BW_GEB_ID"], src=[proj(c) for c in poly[0][:-1]], core=core))

# ---------- water and parks (flat) ----------
def flat(features, kind, keep=lambda p: True, tol=0.8):
    for f in features:
        if not keep(f["properties"]): continue
        for poly in polys_of(f["geometry"]):
            rings = prep(poly, tol, clip=True)
            if not rings: continue
            t = triangulate(rings)
            if t is None: stats["flat FAILED %d" % kind] += 1; continue
            verts, lens, tris, how = t
            stats["flat %d %s" % (kind, how)] += 1
            prisms.append(dict(kind=kind, stop=0, base=0, top=0, verts=verts, lens=lens, tris=tris, geb=None))
flat(json.load(open(os.path.join(DATA, "FMZKGEWOGD" + os.environ.get("SUF", "2") + ".json")))["features"], 1, lambda p: p.get("F_KLASSE") in (41, 43))
flat(json.load(open(os.path.join(DATA, "OEFFGRUENFLOGD" + os.environ.get("SUF", "2") + ".json")))["features"], 2)

# ---------- stops ----------
sights = {f["properties"]["NAME"]: proj(f["geometry"]["coordinates"]) for f in json.load(open(os.path.join(DATA, "sights.json")))["features"]}
streets = json.load(open(os.path.join(DATA, "STRASSENGRAPHOGD" + os.environ.get("SUF", "2") + ".json")))["features"]
def crossing(a, b):
    """The street-graph node where two named streets meet."""
    ends = defaultdict(set)
    for f in streets:
        nm = f["properties"]["FEATURENAME"]; c = f["geometry"]["coordinates"]
        if f["geometry"]["type"] != "LineString": continue
        for nid, pt in ((f["properties"]["NODEFROM_OBJECTID"], c[0]), (f["properties"]["NODETO_OBJECTID"], c[-1])): ends[nid].add((nm, tuple(pt[:2])))
    for nid, s in ends.items():
        names = {n for n, _ in s}
        if a in names and b in names: return proj(next(iter(s))[1])
    raise SystemExit("no crossing %s / %s" % (a, b))
STOPS = [  # column, Chinese name, German name, where (a sight of the city's list, or a street corner), search radius for the building
    ("devotion", "聖史蒂芬大教堂", "Stephansdom", sights["Stephansdom"]),
    ("music", "國家歌劇院", "Wiener Staatsoper", sights["Wiener Staatsoper"]),
    ("architecture", "卡爾教堂", "Karlskirche", sights["Karlskirche"]),
    ("artwork", "藝術史博物館", "Kunsthistorisches Museum", sights["Kunsthistorisches Museum"]),
    ("news", "國會大廈", "Parlament", sights["Parlament"]),
    # Palais Ferstel's corner house: the address point Herrengasse 14/1 = Strauchgasse 4/1 (ogdwien:ADRESSENOGD)
    ("philosophy", "中央咖啡館", "Café Central", proj((16.36547525, 48.2105021))),
]
stops = []
for si, (col, zh, de, at) in enumerate(STOPS, 1):
    # the building the point stands in, else the nearest one; all prisms of that building light up at this stop
    inside = [p for p in prisms if p["kind"] == 0 and pt_in_ring(at, p["src"])]
    if inside: geb = Counter(p["geb"] for p in inside).most_common(1)[0][0]; how = "inside"
    else:
        near = min((p for p in prisms if p["kind"] == 0 and p["top"] > 8), key=lambda p: min((x - at[0]) ** 2 + (y - at[1]) ** 2 for x, y in p["src"]))
        geb = near["geb"]; how = "nearest %.0f m" % math.sqrt(min((x - at[0]) ** 2 + (y - at[1]) ** 2 for x, y in near["src"]))
    mine = [p for p in prisms if p["kind"] == 0 and p["geb"] == geb]
    for p in mine: p["stop"] = si
    xs = [x for p in mine for x, _ in p["src"]]; ys = [y for p in mine for _, y in p["src"]]
    c = ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2)
    stops.append(dict(column=col, zh=zh, de=de, x=round(c[0], 1), y=round(c[1], 1), r=round(max(max(xs) - min(xs), max(ys) - min(ys)) / 2, 1),
                      h=round(max(p["top"] for p in mine), 1), at=[round(at[0], 1), round(at[1], 1)]))
    print("stop", de, how, "geb", geb, "prisms", len(mine), "centre", stops[-1]["x"], stops[-1]["y"], "r", stops[-1]["r"], "h", stops[-1]["h"])

# ---------- route along the streets ----------
nodes = {}; adj = defaultdict(list)
for f in streets:
    if f["geometry"]["type"] != "LineString": continue
    c = [proj(q) for q in f["geometry"]["coordinates"]]
    a, b = f["properties"]["NODEFROM_OBJECTID"], f["properties"]["NODETO_OBJECTID"]
    nodes[a] = c[0]; nodes[b] = c[-1]
    L = sum(math.dist(c[i], c[i + 1]) for i in range(len(c) - 1))
    adj[a].append((b, L, c)); adj[b].append((a, L, c[::-1]))
def nearest_node(p, edge_of=None):
    return min(nodes, key=lambda n: math.dist(nodes[n], p))
def path(a, b):
    dist = {a: 0.0}; prev = {}; pq = [(0.0, a)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == b: break
        if d > dist.get(u, 1e18): continue
        for v, L, c in adj[u]:
            nd = d + L
            if nd < dist.get(v, 1e18): dist[v] = nd; prev[v] = (u, c); heapq.heappush(pq, (nd, v))
    if b not in prev and a != b: raise SystemExit("no path")
    out = []; u = b
    while u != a:
        pu, c = prev[u]; out = c[1:] + out; u = pu
    return [nodes[a]] + out
# each stop is approached at the street node nearest the building's edge facing the previous stop: simply the node nearest its point
snap = [nearest_node(tuple(s["at"])) for s in stops]
route = []; marks = [0.0]  # marks: route length at each stop
order = list(range(len(stops))) + [0]
acc = 0.0
for k in range(len(order) - 1):
    seg = dp(path(snap[order[k]], snap[order[k + 1]]), 0.6)
    acc += sum(math.dist(seg[i], seg[i + 1]) for i in range(len(seg) - 1)); marks.append(acc)
    route += seg[1:] if route else seg
print("route %.0f m, %d points, marks %s" % (acc, len(route), [round(m) for m in marks]))

# ---------- write ----------
meta = dict(credit="Datenquelle: Stadt Wien - data.wien.gv.at (CC BY 4.0)", origin=[LON0, LAT0], unit=1 / Q,
            bounds=[round(XMIN, 1), round(YMIN, 1), round(XMAX, 1), round(YMAX, 1)], stops=stops,
            route=[[round(x, 1), round(y, 1)] for x, y in route], marks=[round(m, 1) for m in marks], prisms=len(prisms))
import numpy as np
RA = np.array(route[:-1]); RB = np.array(route[1:]); RD = RB - RA; RL = np.maximum((RD ** 2).sum(1), 1e-9)
RC = np.concatenate([[0.0], np.cumsum(np.sqrt((RD ** 2).sum(1)))])
def route_s(p, reach=16.0):
    """Route length (m) where the route first passes this building's front, or None."""
    V = np.array(p["verts"], dtype=float) / Q
    # also the middles of the edges, so a long front with far corners still counts
    V = np.concatenate([V, (V + np.roll(V, -1, 0)) / 2])
    t = np.clip(((V[:, None, :] - RA[None]) * RD[None]).sum(2) / RL[None], 0, 1)
    d = np.sqrt((((RA[None] + t[..., None] * RD[None]) - V[:, None, :]) ** 2).sum(2))
    hit = d < reach
    if not hit.any(): return None
    s = RC[:-1][None] + t * np.sqrt(RL)[None]
    return float(s[hit].min())
blob = bytearray(); nv = nt = nw = 0; fronts = 0
for p in prisms:
    v = p["verts"]; wide = len(v) > 256
    rs = route_s(p) if p["kind"] == 0 and p.get("core") else None
    fronts += rs is not None
    blob += struct.pack("<BBBBHHHHHH", p["kind"], p["stop"], len(p["lens"]), 1 if wide else 0,
                        min(65535, round(p["base"] * Q)), min(65535, round(p["top"] * Q)), len(v), len(p["tris"]),
                        65535 if rs is None else min(65000, round(rs)), 0)
    blob += struct.pack("<%dH" % len(p["lens"]), *p["lens"])
    blob += struct.pack("<%dh" % (2 * len(v)), *[c for pt in v for c in pt])
    flat_t = [i for t in p["tris"] for i in t]
    blob += struct.pack("<%d%s" % (len(flat_t), "H" if wide else "B"), *flat_t)
    nv += len(v); nt += len(p["tris"]); nw += len(v) if p["kind"] == 0 else 0
meta.update(verts=nv, cap_tris=nt, wall_quads=nw, fronts=fronts)
js = json.dumps(meta, ensure_ascii=False, separators=(",", ":")).encode()
js += b" " * (-len(js) % 4)
with open(OUT, "wb") as fh:
    fh.write(b"WIEN"); fh.write(struct.pack("<I", len(js))); fh.write(js); fh.write(blob)
print(dict(stats))
print("prisms %d, ring verts %d, cap tris %d, wall quads %d -> GPU verts ~%d, tris ~%d" % (len(prisms), nv, nt, nw, 2 * nw + nv, nt + 2 * nw))
print("file %.2f MB (json %d B)" % ((8 + len(js) + len(blob)) / 1e6, len(js)))
