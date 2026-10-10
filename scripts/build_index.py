#!/usr/bin/env python3
"""Build content/index.json (issue list for the app). Runs in GitHub Actions on every push."""
import datetime as dt
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (CONTENT, WEEKDAY_ZH, cjk_count, issue_number, iter_articles,  # noqa: E402
                    load_config, load_json)


def thumb(hero):
    if not isinstance(hero, dict):
        return None
    if hero.get("src"):
        return {k: hero.get(k) for k in ("src", "width", "height", "alt", "kind") if hero.get(k) is not None}
    return {"diagram": hero.get("type")}


def main():
    cfg = load_config()
    days = {}
    for day, col, path in iter_articles():
        try:
            art = load_json(path)
        except Exception as e:  # noqa: BLE001
            print("skip %s: %s" % (path, e), file=sys.stderr)
            continue
        if col not in cfg["columns"]:
            continue
        n = cjk_count(art)
        days.setdefault(day, []).append({
            "column": col,
            "title": art.get("title", ""),
            "dek": art.get("dek", ""),
            "hero": thumb(art.get("hero")),
            "minutes": max(1, math.ceil(n / 450)),
            "status": art.get("status"),
            "spoiler": art.get("spoiler"),
            "updated_at": art.get("updated_at"),
        })
    issues = []
    for day in sorted(days, reverse=True):
        d = dt.date.fromisoformat(day)
        issues.append({"date": day, "no": issue_number(cfg, d), "weekday": WEEKDAY_ZH[d.weekday()],
                       "articles": days[day]})
    out = {"generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "issues": issues}
    with open(os.path.join(CONTENT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("index.json：%d 期，%d 篇" % (len(issues), sum(len(i["articles"]) for i in issues)))


if __name__ == "__main__":
    main()
