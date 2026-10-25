#!/usr/bin/env python3
"""Build content/index.json (issue list for the app) and content/search/<YYYY-MM>.json (full text for search).
Runs in GitHub Actions on every push.

A malformed article is skipped with a ::warning:: annotation; it must never fail the deploy, or every
later issue would stay offline until someone fixes the file by hand.
"""
import datetime as dt
import hashlib
import json
import math
import re
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (CONTENT, ROOT, WEEKDAY_ZH, cjk_count, issue_number, iter_articles,  # noqa: E402
                    load_config, load_json, text_of_block, wm_thumb)


def thumb(hero):
    if not isinstance(hero, dict):
        return None
    if hero.get("src"):
        out = {k: hero.get(k) for k in ("src", "width", "height", "alt", "kind") if hero.get(k) is not None}
        small = wm_thumb(hero["src"], 500, hero.get("width") if isinstance(hero.get("width"), int) else None)
        if small:
            out["thumb"] = small  # front-page cards load a 500px image instead of the 1280px one
        return out
    return {"diagram": hero.get("type")}


def epigraph(art):
    """The first verse of the day's scripture, for the masthead (e.g. 起初，　神創造天地。— 創世記 1:1)."""
    for b in art.get("body") or []:
        if isinstance(b, dict) and b.get("type") == "scripture" and b.get("verses"):
            v = b["verses"][0]
            text = re.sub(r"^（[^）]*）", "", str(v.get("text", ""))).strip()
            if len(text) > 46:  # keep one sentence
                m = re.match(r"^(.{12,46}?[。；！？])", text)
                text = m.group(1) if m else text[:46] + "……"
            book = re.sub(r"\s*\d.*$", "", str(b.get("ref", ""))).strip()
            return {"text": text, "ref": "%s %s:%s" % (book, v.get("c", b.get("chapter")), v.get("n"))}
    return None


def plain_text(art):
    parts = [art.get("title", ""), art.get("dek", "")]
    for b in art.get("body") or []:
        if isinstance(b, dict):
            try:
                parts.append(text_of_block(b))
            except Exception:  # noqa: BLE001
                pass
    return re.sub(r"\s+", " ", " ".join(p for p in parts if isinstance(p, str)))


def push_devices():
    """Short hashes of the devices that get the 07:30 notice (scripts/push.py), so the app's settings page can tell
    whether this phone is on the list. The subscriptions themselves stay in state/, which is not published."""
    path = os.path.join(ROOT, "state", "push", "devices.json")
    if not os.path.exists(path):
        return []
    try:
        return [hashlib.sha256(d["subscription"]["endpoint"].encode()).hexdigest()[:16] for d in load_json(path)["devices"]]
    except Exception as e:  # noqa: BLE001
        skip(path, "%s: %s" % (type(e).__name__, e))
        return []


def skip(path, why):
    # GitHub Actions annotation (shown on the run page); the build carries on without this article.
    rel = os.path.relpath(path, ROOT)
    print("::warning file=%s::build_index 跳過 %s：%s" % (rel, rel, str(why).replace("\n", " ")))


def main():
    cfg = load_config()
    days, epigraphs, search = {}, {}, {}
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
                "brief": art.get("brief") or "",
                "hero": thumb(art.get("hero")),
                "minutes": max(1, math.ceil(n / 450)),
                "status": art.get("status"),
                "spoiler": art.get("spoiler"),
                "updated_at": art.get("updated_at"),
            }
            if art.get("from_reserve"):
                entry["from_reserve"] = True
            if col == "devotion":
                epi = epigraph(art)
            else:
                epi = None
            search.setdefault(day[:7], []).append({"d": day, "c": col, "t": art.get("title", ""), "x": plain_text(art)})
        except Exception as e:  # noqa: BLE001
            skip(path, "%s: %s" % (type(e).__name__, e))
            continue
        days.setdefault(day, []).append(entry)
        if epi:
            epigraphs[day] = epi
    issues = []
    for day in sorted(days, reverse=True):
        try:
            d = dt.date.fromisoformat(day)
        except ValueError as e:  # e.g. a folder named 2026-02-30
            skip(os.path.join(CONTENT, "issues", day), e)
            continue
        issue = {"date": day, "no": issue_number(cfg, d), "weekday": WEEKDAY_ZH[d.weekday()], "articles": days[day]}
        if day in epigraphs:
            issue["epigraph"] = epigraphs[day]
        issues.append(issue)
    out = {"generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "issues": issues,
           "push": push_devices()}
    with open(os.path.join(CONTENT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    sdir = os.path.join(CONTENT, "search")
    os.makedirs(sdir, exist_ok=True)
    for month, rows in search.items():
        with open(os.path.join(sdir, month + ".json"), "w", encoding="utf-8") as f:
            json.dump(sorted(rows, key=lambda r: r["d"], reverse=True), f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(sdir, "months.json"), "w", encoding="utf-8") as f:
        json.dump(sorted(search, reverse=True), f)
    print("index.json：%d 期，%d 篇；搜尋資料 %d 個月" % (len(issues), sum(len(i["articles"]) for i in issues), len(search)))


if __name__ == "__main__":
    main()
