#!/usr/bin/env python3
"""Show the reserve stock (editorial/RESERVE.md): how many ready articles each column holds.

A reserve is stock only when validate.py finds no ERROR and none of the WARNs that the owner said make it 需修正
(validate.reserve_blocking: 機器腔, 出處類標籤, 分類詞小標, missing form/voice, no bold, and the rest of the stable rule
violations; LESSONS 31, 2026-11-08). The reserve shift fixes the 需修正 ones before it writes anything new.
A missing form or voice is filled in by --fill-labels, not by the shift; a column in RESERVE_PAUSE (common.py) is not
不足 until its date (RESERVE.md 寫法改了以後), and its 需修正 reserves are still listed.

Usage: python3 scripts/reserve.py [--fill-labels] [--date YYYY-MM-DD]
  --fill-labels  first give every reserve that lacks one its form and voice (only those two keys; the shift commits)
  --date         the day the pause is judged on (default: today, Taiwan time)
"""
import argparse
import datetime as dt
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (ISSUES, TARGET_NOTE, iter_reserve, load_config, load_json, reserve_columns, reserve_pause,  # noqa: E402
                    reserve_target, tw_now)
import forms  # noqa: E402
import validate  # noqa: E402


def last_form(col, day):
    """The form of the column's latest article published on or before `day`, or None."""
    days = sorted((x for x in os.listdir(ISSUES) if re.match(r"^\d{4}-\d{2}-\d{2}$", x) and x <= day.isoformat()),
                  reverse=True) if os.path.isdir(ISSUES) else []
    for x in days:
        p = os.path.join(ISSUES, x, col + ".json")
        if os.path.exists(p):
            try:
                art = load_json(p)
            except Exception:  # noqa: BLE001 — any file it cannot read (too deeply nested too) counts as no form
                return None
            return art.get("form") if isinstance(art, dict) else None
    return None


def fill_labels(cfg, day):
    """Give each reserve that has no form or voice (missing, null or "") one: voice is the column's reporter
    (forms.REPORTERS), form the first in forms.FORMS the column takes, no other reserve of the column uses and the
    column's last published article did not use (else the first it takes). Never qa: under it validate lets question
    headings pass (check_voice), so a label nobody chose would clear a 需修正. Values already there, right or wrong, are
    left for validate to report. Returns (reserves filled, reserves it could not read or write)."""
    watch = {k for k, v in cfg["columns"].items() if v.get("group") == "watch"}
    arts, bad = {}, 0
    for col, p in iter_reserve():
        if col in forms.EXEMPT or col in watch:  # the columns validate asks no form or voice of
            continue
        try:
            art = load_json(p)
        except Exception as e:  # noqa: BLE001 — RecursionError too: the flag must not crash where the plain run does not
            art = e
        if not isinstance(art, dict):
            print("讀不了，跳過：%s/%s" % (col, os.path.basename(p)))
            bad += 1
            continue
        arts.setdefault(col, []).append((p, art))
    n = 0
    for col, rows in arts.items():
        allowed = [f for f in forms.FORMS if f not in forms.NOT_FOR.get(col, ()) and f != "qa"]
        used = {a.get("form") for _, a in rows if isinstance(a.get("form"), str)}
        last = last_form(col, day)
        for p, art in rows:
            add = {}
            if art.get("voice") in (None, "") and forms.REPORTERS.get(col):
                add["voice"] = forms.REPORTERS[col]
            if art.get("form") in (None, "") and allowed:
                add["form"] = next((f for f in allowed if f not in used and f != last), allowed[0])
            if not add:
                continue
            tmp, made = p + ".tmp", False  # not .json: iter_reserve and the other scripts read *.json only
            try:  # made whole, written beside the file, then swapped in: a failure at any step leaves the old file as it was
                data = (json.dumps(dict(art, **add), ensure_ascii=False, indent=2) + "\n").encode("utf-8")
                open(p, "r+b").close()  # a file that may not be written is skipped, untouched (r+b does not truncate)
                with open(tmp, "wb") as f:
                    made = True
                    f.write(data)
                os.replace(tmp, p)
            except Exception as e:  # noqa: BLE001
                print("寫不了，跳過：%s/%s（%s）" % (col, os.path.basename(p), type(e).__name__))
                bad += 1
                continue
            finally:
                if made and os.path.lexists(tmp):  # a write stopped part-way: the half file goes, the old one stays
                    try:
                        os.remove(tmp)
                    except OSError:
                        pass
            if "form" in add:
                used.add(add["form"])
            n += 1
            print("補上 %s：%s/%s" % ("、".join("%s=%s" % (k, add[k]) for k in ("form", "voice") if k in add), col,
                                    os.path.basename(p)))
    return n, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fill-labels", action="store_true")
    ap.add_argument("--date", type=dt.date.fromisoformat)
    args = ap.parse_args()
    day = args.date or tw_now().date()
    cfg = load_config()
    filled, bad = fill_labels(cfg, day) if args.fill_labels else (None, 0)
    if filled or bad:
        print()
    paused, notes = reserve_pause(cfg, day)
    for line in notes:
        print(line)
    cols = reserve_columns(cfg)
    status = validate.reserve_status(cfg)
    stock = {c: [] for c in cols}
    for c, rows in status.items():
        for p, errs, blocking in rows:
            try:
                art = load_json(p)
                title = art.get("title", "") if isinstance(art, dict) else ""
                w = art.get("reserve_written") if isinstance(art, dict) else ""
                written = w if isinstance(w, str) else ""
            except Exception:  # noqa: BLE001
                title, written = "（無法讀取）", ""
            stock.setdefault(c, []).append((written, os.path.basename(p), title, errs, blocking))
    need, broken = [], []
    for c in cols:
        items = sorted(stock[c], key=lambda x: (x[0], x[1]))
        ok = [x for x in items if not x[3] and not x[4]]
        target = reserve_target(cfg, c)
        if c in paused:  # the way of writing just changed: no new reserves before that day; the stock is counted as it is
            flag = "  ← 暫停補寫到 %s（寫法剛改）" % paused[c].strftime("%m-%d")
        else:
            flag = "" if len(ok) >= target else "  ← 不足 %d 篇" % (target - len(ok))
        print("%-14s %-12s 可用 %d 篇%s" % (c, cfg["columns"][c]["name"], len(ok), flag))
        for written, fn, title, errs, blocking in items:
            if errs:
                why = "\n      ✗ 需修正：" + errs[0]
            elif blocking:  # a rule-violation WARN: written under the old rules, or never given its form and voice
                why = "\n      ✗ 需修正（不合現行規格，照 STYLE.md 重寫）：" + blocking[0]
            else:
                why = ""
            if why and c in paused:
                why += "（這一欄暫停，整篇重寫等到 %s）" % paused[c].strftime("%m-%d")
            print("    %s  %s  %s%s" % (written or "????-??-??", fn, title, why))
            if errs or blocking:
                broken.append("%s/%s" % (c, fn))
        if len(ok) < target and c not in paused:
            need.append((len(ok), c))
    if broken:
        print("\n需修正的備稿（修好前不算庫存，備稿班先修這些再寫新稿）：" + "、".join(broken))
    if need:
        print("\n優先補寫（庫存少的先寫）：" + "、".join(c for _, c in sorted(need)))
    else:
        print("\n每欄都已達標（%s%s）。" % (TARGET_NOTE, "；暫停補寫的欄除外" if paused else ""))
    if filled is not None:  # a reserve it could not read or write is never reported as nothing to fill
        last = ("程式補了 %d 篇的 form／voice。" % filled if filled else "") + ("有 %d 篇補不了，見上。" % bad if bad else "")
        print("\n" + (last or "沒有缺 form／voice 的備稿。"))


if __name__ == "__main__":
    main()
