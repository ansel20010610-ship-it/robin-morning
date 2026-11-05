#!/usr/bin/env python3
"""文體 (STYLE.md 〇之四): which form each article took, so a shift can assign forms that do not repeat — not twice in one
issue, not twice in a row in one column, `scene` at most once an issue.

  python3 scripts/forms.py            # the last 7 issues: a table of column × date, and today's (or tomorrow's) picks
  python3 scripts/forms.py <date>     # that issue: forms used, repeats flagged
"""
import datetime as dt, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, TW, load_config  # noqa: E402

FORMS = ["scene", "document", "qa", "list", "timeline", "dialogue", "flow", "reverse", "argument", "walk", "compare", "number"]
REPORTERS = {"football": "fan", "news": "wire", "perio": "colleague", "music": "listener", "civilization": "lecturer", "literature": "correspondent", "philosophy": "socratic", "artwork": "appraiser", "architecture": "walker", "canon": "critic", "wildcard": "visitor", "concept": "tutor", "poem": "reader", "mystery": "detective", "obituary": "eulogist", "fm-watch": "watchman", "cosmere-watch": "watchman"}
EXEMPT = {"devotion", "news", "serial"}
ISSUES = os.path.join(ROOT, "content", "issues")


def forms_of(day):
    out = {}
    d = os.path.join(ISSUES, day)
    if not os.path.isdir(d):
        return out
    for f in sorted(os.listdir(d)):
        if not f.endswith(".json"):
            continue
        try:
            with open(os.path.join(d, f), encoding="utf-8") as fh:
                a = json.load(fh)
        except ValueError:
            continue
        out[f[:-5]] = (a.get("form"), a.get("voice"))
    return out


def main():
    cfg = load_config()
    watch = {k for k, v in cfg["columns"].items() if v.get("group") == "watch"}
    days = sorted(x for x in os.listdir(ISSUES) if len(x) == 10)
    if len(sys.argv) > 1:
        day = sys.argv[1]
        fs = forms_of(day)
        seen = {}
        for c, (f, v) in fs.items():
            if c in EXEMPT or c in watch:
                continue
            flags = []
            if not f: flags.append("沒有 form")
            elif f not in FORMS: flags.append("form 不在菜單裡")
            elif f in seen: flags.append("form 和 %s 重複" % seen[f])
            if f == "scene" and seen.get("scene") and seen["scene"] != c: flags.append("scene 一期最多一篇")
            if not v: flags.append("沒有 voice（這欄的記者是 %s）" % REPORTERS.get(c))
            elif v != REPORTERS.get(c): flags.append("voice 應是這欄的記者 %s" % REPORTERS.get(c))
            seen.setdefault(f, c)
            print("  %-13s %-10s %-12s%s" % (c, f or "—", v or "—", ("  ← " + "；".join(flags)) if flags else ""))
        return
    today = dt.datetime.now(TW).date()
    recent = [d for d in days if d >= (today - dt.timedelta(days=7)).isoformat()]
    cols = [c for c in cfg["columns"] if c not in EXEMPT and c not in watch and "until" not in cfg["columns"][c]]
    table = {d: forms_of(d) for d in recent}
    print("最近各欄的文體（%s）：" % "、".join(d[5:] for d in recent))
    for c in cols:
        row = [table[d].get(c, (None, None)) for d in recent]
        if any(c in table[d] for d in recent):
            print("  %-13s %s" % (c, "  ".join("%-18s" % (("%s/%s" % (f or "—", v or "—")) if (f or v) else "—") for f, v in row)))
    nxt = (today + dt.timedelta(days=1)).isoformat()
    for d in (nxt, today.isoformat()):
        fs = {c: fv for c, fv in forms_of(d).items() if c not in EXEMPT and c not in watch}
        if fs:
            print("\n%s 已派的文體／聲腔：%s" % (d, "、".join("%s=%s/%s" % (c, f or "—", v or "—") for c, (f, v) in fs.items())))
            break
    print("\n文體：" + "、".join(FORMS) + "\n同一期的文體不重複；同一欄不和前一篇相同；scene 一期最多一篇。聲腔照各欄固定的記者（STYLE.md 〇之四）：" + "、".join("%s=%s" % kv for kv in REPORTERS.items()))


if __name__ == "__main__":
    main()
