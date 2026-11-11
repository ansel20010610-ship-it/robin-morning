# Fetch Stadt Wien open data (CC BY 4.0) for the inner city, tile by tile, raw responses kept.
import json, os, sys, time, urllib.request, urllib.parse
OUT = sys.argv[1]
W, S, E, N = 16.3480, 48.1915, 16.3920, 48.2230
BASE = "https://data.wien.gv.at/daten/geo"
def get(layer, bbox, name):
    p = os.path.join(OUT, name)
    if os.path.exists(p) and os.path.getsize(p) > 50: return json.load(open(p))
    q = urllib.parse.urlencode({"service": "WFS", "version": "1.1.0", "request": "GetFeature", "typeName": "ogdwien:" + layer,
        "srsName": "EPSG:4326", "outputFormat": "json", "bbox": ",".join(f"{v:.5f}" for v in bbox) + ",EPSG:4326"})
    req = urllib.request.Request(BASE + "?" + q, headers={"User-Agent": "curl"})
    for attempt in range(3):
        try:
            raw = urllib.request.urlopen(req, timeout=180).read(); break
        except Exception as ex:
            print("retry", name, ex); time.sleep(5)
    else: raise SystemExit("failed " + name)
    open(p, "wb").write(raw); time.sleep(1)
    return json.loads(raw)
n = 5
tot = 0
for i in range(n):
    for j in range(n):
        b = (W + (E - W) * i / n, S + (N - S) * j / n, W + (E - W) * (i + 1) / n, S + (N - S) * (j + 1) / n)
        d = get("FMZKBKMOGD", b, f"bkm2_{i}_{j}.json")
        print(i, j, len(d["features"]), d.get("totalFeatures"), d.get("numberMatched"), d.get("numberReturned")); tot += len(d["features"])
print("bkm total (with overlap)", tot)
for layer in ["FMZKGEWOGD", "STRASSENGRAPHOGD", "OEFFGRUENFLOGD"]:
    d = get(layer, (W, S, E, N), layer + "2.json")
    print(layer, len(d["features"]), d.get("totalFeatures"), os.path.getsize(os.path.join(OUT, layer + "2.json")))
