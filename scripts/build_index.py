#!/usr/bin/env python3
"""Build content/index.json (issue list for the app). Runs in GitHub Actions on every push.

A malformed article is skipped with a ::warning:: annotation; it must never fail the deploy, or every
later issue would stay offline until someone fixes the file by hand.
"""
import datetime as dt
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (CONTENT, ROOT, WEEKDAY_ZH, cjk_count, issue_number, iter_articles,  # noqa: E402
                    load_config, load_json)


def thumb(hero):
    if not isinstance(hero, dict):
        return None
    if hero.get("src"):
        return {k: hero.get(k) for k in ("src", "width", "height", "alt", "kind") if hero.get(k) is not None}
    return {"diagram": hero.get("type")}


def skip(path, why):
    # GitHub Actions annotation (shown on the run page); the build carries on without this article.
    rel = os.path.relpath(path, ROOT)
    print("::warning file=%s::build_index 跳過 %s：%s" % (rel, rel, str(why).replace("\n", " ")))


def main():
    cfg = load_config()
    days = {}
    for day, col, path in iter_articles():
        if col not in cfg["columns"]:
            continue
        try:
            art = load_json(path)
            if not isinstance(art, dict):
                raise ValueError("頂層不是 JSON 物件")
            n = cjk_count(art)
            entry = {
                "column": col,
                "title": art.get("title", ""),
                "dek": art.get("dek", ""),
                "hero": thumb(art.get("hero")),
                "minutes": max(1, math.ceil(n / 450)),
                "status": art.get("status"),
                "spoiler": art.get("spoiler"),
                "updated_at": art.get("updated_at"),
            }
        except Exception as e:  # noqa: BLE001
            skip(path, "%s: %s" % (type(e).__name__, e))
            continue
        days.setdefault(day, []).append(entry)
    issues = []
    for day in sorted(days, reverse=True):
        try:
            d = dt.date.fromisoformat(day)
        except ValueError as e:  # e.g. a folder named 2026-02-30
            skip(os.path.join(CONTENT, "issues", day), e)
            continue
        issues.append({"date": day, "no": issue_number(cfg, d), "weekday": WEEKDAY_ZH[d.weekday()],
                       "articles": days[day]})
    out = {"generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "issues": issues}
    with open(os.path.join(CONTENT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("index.json：%d 期，%d 篇" % (len(issues), sum(len(i["articles"]) for i in issues)))


if __name__ == "__main__":
    main()
