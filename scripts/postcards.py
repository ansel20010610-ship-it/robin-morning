#!/usr/bin/env python3
"""The postcards' cities (後院; assets/postcard.js): build, check and preview them.

The drawings live as parts in state/postcards/parts/*.js — each file a single `var CITIES_PART = { <city id>: {...}, ... };`
(see editorial/columns/postcards.md). This script turns them into
  assets/sights.js  — every city's sights: drawings and words (loaded by the app only when a postcard is shown), and
  assets/cities.js  — the small list nest.js needs: ids, names, souvenir, the six sights' names, the date each city
                      joins the robin's travels (`added`).
Parts are taken in file-name order and cities keep that order, so a city added later goes to the end and changes no
trip already made (nest.js lifeOf picks cities by their `added` date).

  python3 scripts/postcards.py check            run every sight (four seasons) and the words; exit 1 on any problem
  python3 scripts/postcards.py build            check, then write assets/sights.js and assets/cities.js
  python3 scripts/postcards.py sheet [city …]   write state/postcards/sheet.svg (and .png when a converter exists):
                                                every sight of those cities (default: the newest part) side by side
  python3 scripts/postcards.py list             the cities and their sights, with the date each joined
  python3 scripts/postcards.py demand [code]    how many cities the yard (NEST_CODE, or the code given) has not been to
                                                yet, computed by nest.js itself from the yard's feed log (read-only GET
                                                to the shared store); prints LOW and exits 3 when LOW_AT or fewer are left

Needs a JavaScript engine: node, or macOS's JavaScriptCore (jsc).
"""
import json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, "state", "postcards", "parts")
KIT = os.path.join(ROOT, "assets", "pc-kit.js")
FIRST_DAY = "2026-11-10"  # the thirty cities the travels began with
TAIWAN = {"taipei", "taiwan", "hualien", "kenting", "alishan", "kinmen", "tainan", "kaohsiung", "taichung", "taitung", "penghu", "yilan"}
JSC = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
LOW_AT = 6  # draw a new city when this many or fewer are left unvisited (the owner, 2026-11-10: 快用完再畫)


def engine():
    if shutil.which("node"):
        return ["node"], "console.log"
    if os.path.exists(JSC):
        return [JSC], "print"
    sys.exit("postcards.py: no JavaScript engine (node or jsc)")


def parts():
    return sorted(f for f in os.listdir(PARTS) if f.endswith(".js"))


def kit_source():
    return re.sub(r"^export\s+", "", open(KIT, encoding="utf-8").read(), flags=re.M)


def run_js(body):
    cmd, say = engine()
    src = kit_source() + "\nvar say = " + say + ";\n" + body
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
        t.write(src)
        name = t.name
    try:
        out = subprocess.run(cmd + [name], capture_output=True, text=True)
    finally:
        os.unlink(name)
    if out.returncode:
        sys.stderr.write(out.stderr[-2000:])
    return out.returncode, out.stdout


def load_all():
    js = []
    for i, f in enumerate(parts()):
        js.append(f"var P{i} = (function () {{\n{open(os.path.join(PARTS, f), encoding='utf-8').read()}\nreturn CITIES_PART;\n}})();")
        js.append(f"for (var k in P{i}) {{ P{i}[k].__file = {json.dumps(f)}; }}")
    js.append("var ALL = Object.assign({}, " + ", ".join(f"P{i}" for i in range(len(parts()))) + ");")
    return "\n".join(js)


CHECK = r"""
var problems = [], n = 0, ids = {};
for (var id in ALL) {
  var c = ALL[id];
  if (!/^[a-z]+$/.test(id)) problems.push(id + ": city id must be lowercase letters");
  if (!c.zh || !c.de || !c.gift || !Array.isArray(c.sights)) { problems.push(id + ": needs zh, de, gift, sights"); continue; }
  if (c.added && !/^\d{4}-\d{2}-\d{2}$/.test(c.added)) problems.push(id + ": added must be YYYY-MM-DD");
  if (c.sights.length !== 6) problems.push(id + ": has " + c.sights.length + " sights, needs 6");
  var seen = {};
  c.sights.forEach(function (s) {
    n++;
    if (seen[s.id]) problems.push(id + "/" + s.id + ": duplicate sight id"); seen[s.id] = 1;
    if (!s.zh || !Array.isArray(s.see) || s.see.length < 3 || !Array.isArray(s.spots) || s.spots.length < 2) problems.push(id + "/" + s.id + ": needs zh, 3 see, 2 spots");
    (s.see || []).concat(s.spots || []).forEach(function (w) { if (/[。！？]$/.test(w)) problems.push(id + "/" + s.id + ": no ending punctuation in 「" + w + "」"); });
    ["spring", "summer", "autumn", "winter"].forEach(function (sea, k) {
      try {
        var out = s.draw({ r: rngOf(.11 + k * .21), sea: sea, m: [4, 7, 10, 1][k], night: false, uid: "t" });
        if (!out || typeof out.s !== "string" || !Array.isArray(out.perch) || !out.perch.length) problems.push(id + "/" + s.id + ": draw must return {s, l, perch}");
        else if (/NaN|undefined|Infinity/.test(out.s)) problems.push(id + "/" + s.id + " (" + sea + "): NaN/undefined in the SVG");
        else if (/<text|<image|<script|href=|class=|style=/.test(out.s)) problems.push(id + "/" + s.id + ": only shapes — no text, images, links, classes or styles");
      } catch (e) { problems.push(id + "/" + s.id + " (" + sea + "): throws " + e); }
    });
  });
}
say(JSON.stringify({ n: n, problems: problems }));
"""

META = r"""
var meta = {};
for (var id in ALL) meta[id] = { zh: ALL[id].zh, de: ALL[id].de, gift: ALL[id].gift, added: ALL[id].added || FIRST, sights: ALL[id].sights.map(function (s) { return s.zh; }), file: ALL[id].__file };
say(JSON.stringify(meta));
"""


def check(quiet=False):
    if not os.path.isdir(PARTS) or not parts():
        sys.exit("postcards.py: no parts in state/postcards/parts")
    code, out = run_js(load_all() + CHECK)
    if code or not out.strip():
        print("postcards.py: the parts do not run (syntax error?)")
        return False, {}
    res = json.loads(out.strip().splitlines()[-1])
    code, out = run_js(load_all() + f"var FIRST = {json.dumps(FIRST_DAY)};" + META)
    meta = json.loads(out.strip().splitlines()[-1])
    bad = sorted(set(meta) & TAIWAN)
    if bad:
        res["problems"].append("no places in Taiwan (the owner): " + ", ".join(bad))
    for p in res["problems"]:
        print("  ✗", p)
    if not quiet or res["problems"]:
        print(f"{len(meta)} cities, {res['n']} sights, {len(res['problems'])} problems")
    return not res["problems"], meta


def build():
    ok, meta = check()
    if not ok:
        sys.exit(1)
    body = []
    for i, f in enumerate(parts()):
        body.append(f"const P{i} = (() => {{\n{open(os.path.join(PARTS, f), encoding='utf-8').read()}\nreturn CITIES_PART;\n}})();")
    sights = ("// The sights the robin's postcards show (postcard.js): the cities abroad, six famous sights each, every one drawn\n"
              "// by hand in SVG from its best-known silhouette, with its name, three things the robin sees there and where it\n"
              "// perches. GENERATED by scripts/postcards.py build from state/postcards/parts/ — edit the parts, not this file.\n"
              "// Loaded only when a postcard is on screen.\n"
              'import { rngOf, pick, btw, f1, LEAF, TIMES, SEASON, tree, water, boat, hills, lit, houses } from "./pc-kit.js";\n\n'
              + "\n".join(body) + "\n\nexport const CITIES = { " + ", ".join(f"...P{i}" for i in range(len(parts()))) + " };\n")
    open(os.path.join(ROOT, "assets", "sights.js"), "w", encoding="utf-8").write(sights)
    slim = {k: {kk: v[kk] for kk in ("zh", "de", "gift", "added", "sights")} for k, v in meta.items()}
    open(os.path.join(ROOT, "assets", "cities.js"), "w", encoding="utf-8").write(
        "// The cities abroad the yard's robin travels to (nest.js lifeOf): names, the souvenir it brings home, the names of\n"
        "// their six sights and the day each joined the travels. GENERATED by scripts/postcards.py build — edit the parts.\n"
        "export const CITY_META = " + json.dumps(slim, ensure_ascii=False, indent=1) + ";\n")
    print(f"wrote assets/sights.js ({os.path.getsize(os.path.join(ROOT, 'assets', 'sights.js')) // 1024} KB) and assets/cities.js")


def sheet(cities):
    ok, meta = check(quiet=True)
    if not cities:
        newest = parts()[-1]
        cities = [k for k, v in meta.items() if v["file"] == newest]
    js = load_all() + r"""
var want = WANT, cells = [], W = 300, H = 200, cols = 3, row = 0;
want.forEach(function (id) { (ALL[id] ? ALL[id].sights : []).forEach(function (s, i) {
  ["summer", "winter"].forEach(function (sea, k) {
    var out; try { out = s.draw({ r: rngOf(.3 + i * .07 + k * .4), sea: sea, m: k ? 1 : 7, night: false, uid: "s" + cells.length }); } catch (e) { out = { s: "", perch: [] }; }
    var x = (cells.length % cols) * (W + 10), y = Math.floor(cells.length / cols) * (H + 30);
    cells.push('<g transform="translate(' + x + ' ' + y + ')"><rect width="300" height="200" fill="#CFE3EE"/>' + out.s + '<text x="4" y="216" font-size="13" font-family="sans-serif">' + id + ' / ' + s.zh + ' (' + sea + ')</text></g>');
  });
}); });
var rows = Math.ceil(cells.length / cols);
say('<svg xmlns="http://www.w3.org/2000/svg" width="' + (cols * (W + 10)) + '" height="' + (rows * (H + 30)) + '"><rect width="100%" height="100%" fill="#fff"/>' + cells.join("") + '</svg>');
""".replace("WANT", json.dumps(cities))
    code, out = run_js(js)
    os.makedirs(os.path.join(ROOT, "state", "postcards"), exist_ok=True)
    svg = os.path.join(ROOT, "state", "postcards", "sheet.svg")
    open(svg, "w", encoding="utf-8").write(out.strip())
    png = svg[:-4] + ".png"
    if shutil.which("rsvg-convert"):
        subprocess.run(["rsvg-convert", "-o", png, svg])
    else:
        try:
            import cairosvg  # noqa
            cairosvg.svg2png(url=svg, write_to=png)
        except Exception:
            png = None
    print("sheet:", svg, "and", png if png and os.path.exists(png) else "(no PNG converter: try `pip install cairosvg`)")


def listing():
    ok, meta = check(quiet=True)
    for k, v in meta.items():
        print(f"{v['added']}  {k:12} {v['zh']}（{v['de']}）  " + "、".join(v["sights"]))
    print(f"\n{len(meta)} cities")


def demand(code):
    """The yard's travels, as the app computes them: nest.js lifeOf over the yard's feed log."""
    import urllib.request
    code = (code or os.environ.get("NEST_CODE", "")).strip().upper()
    if not re.match(r"^NEST-[A-Z2-9]{4}-[A-Z2-9]{4}$", code):
        sys.exit("postcards.py demand: give the yard's code (NEST-XXXX-XXXX) or set NEST_CODE")
    api = json.load(open(os.path.join(ROOT, "content", "config.json"), encoding="utf-8"))["nest"]["api"].rstrip("/")
    req = urllib.request.Request(f"{api}/{code}", headers={"User-Agent": "robin-morning-postcards"})
    data = json.load(urllib.request.urlopen(req, timeout=30))
    if not isinstance(data.get("feeds"), list):
        sys.exit(f"postcards.py demand: no yard {code} ({data})")
    tmp = tempfile.mkdtemp()
    try:
        for f in ("util.js", "nest.js", "cities.js"):
            shutil.copy(os.path.join(ROOT, "assets", f), tmp)
        open(os.path.join(tmp, "package.json"), "w").write('{"type": "module"}')
        cmd, say = engine()
        n = {"code": code, "feeds": data["feeds"], "pet": data.get("pet") or {}, "me": "", "members": {}, "pending": []}
        open(os.path.join(tmp, "run.js"), "w", encoding="utf-8").write(
            'import { lifeOf } from "./nest.js";\nimport { CITY_META } from "./cities.js";\n'
            f"const n = {json.dumps(n)};\n"
            "const life = lifeOf(n), today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);\n"
            "const open = Object.entries(CITY_META).filter(([, c]) => (c.added || \"\") <= today).map(([id]) => id);\n"
            "const left = open.filter((id) => !life.went.includes(id));\n"
            f"{say}(JSON.stringify({{ today, cities: open.length, visited: open.length - left.length, left: left.length, trips: life.went.length, away: life.trip ? life.trip.place : null }}));\n")
        run = cmd + (["-m"] if cmd[0] == JSC else []) + [os.path.join(tmp, "run.js")]
        out = subprocess.run(run, capture_output=True, text=True, cwd=tmp)
        if out.returncode:
            sys.exit("postcards.py demand: nest.js did not run\n" + out.stderr[-1500:])
        res = json.loads(out.stdout.strip().splitlines()[-1])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"{res['today']}: {res['visited']} of {res['cities']} cities visited, {res['left']} not yet ({res['trips']} trips so far"
          + (f"; away in {res['away']} now" if res["away"] else "") + ")")
    if res["left"] <= LOW_AT:
        print(f"LOW: {res['left']} left — draw a new city")
        sys.exit(3)
    print(f"OK: more than {LOW_AT} left — nothing to draw")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd == "check":
        sys.exit(0 if check()[0] else 1)
    elif cmd == "build":
        build()
    elif cmd == "sheet":
        sheet(sys.argv[2:])
    elif cmd == "list":
        listing()
    elif cmd == "demand":
        demand(sys.argv[2] if len(sys.argv) > 2 else "")
    else:
        sys.exit(__doc__)
