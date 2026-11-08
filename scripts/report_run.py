#!/usr/bin/env python3
"""Leave a short record that a shift finished, in state/runs/<date>.json. watch.yml checks at 07:45 that
shifts 1–5 all reported: a shift that ran but could not push (or never ran) shows up as missing.

Usage: python3 scripts/report_run.py --group 4 --note "巴薩晨報已更新賽後版；觀測站靜默"
       python3 scripts/report_run.py --group reserve --note "備稿 art、city"
       python3 scripts/report_run.py --group concerts --note "新增 2、更新 1；歷史上的今天 1922"
       python3 scripts/report_run.py --group serial --note "譯到 11-14"
Then commit and push state/runs/ (editorial/README.md, last step of every shift).

Groups: 1–5 are the night shifts and report for the coming issue (the default date); reserve, audit, late, concerts
and serial run in the afternoon or early morning and are filed under the calendar day they ran. Every record has the
same shape, {finished_at, missing, note}: for the shifts `missing` is the issue's missing columns; for concerts it is
what that shift left undone (concerts.json 未查核, 歷史上的今天 空白); for serial it is empty and the note carries
serial.py's 缺 count — the 06:17 演出班 and the 16:07 連載班 used to leave no record at all, so nothing noticed when they
did not run (review 2026-11-08).
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, ROOT, article_path, expected_columns, load_config, load_json, parse_date, tw_now  # noqa: E402
import validate  # noqa: E402

SHIFTS = ("1", "2", "3", "4", "5")


def issue_missing(cfg, d):
    missing = []
    for col in expected_columns(cfg, d):
        p = article_path(d, col)
        if not os.path.exists(p):
            missing.append(col)
            continue
        imgs, tops = validate.ledgers_excluding(str(d), col)
        if validate.validate_file(cfg, d, col, p, False, imgs, tops)[0]:
            missing.append(col + "（驗證失敗）")
    return missing


def concerts_missing(d):
    """What the 演出班 did not get to on day d. `checked` stays on yesterday when the feed was down (the prompt says not
    to run `close` then), and onthisday.md allows skipping the line when out of time, so each is a note, not an alarm
    by itself; the run record is the primary signal that the shift ran."""
    out = []
    try:
        checked = load_json(os.path.join(CONTENT, "concerts.json")).get("checked")
    except (OSError, ValueError, AttributeError):
        checked = None
    if checked != str(d):
        out.append("concerts.json 未查核")
    try:
        onthisday = load_json(os.path.join(CONTENT, "onthisday.json"))
    except (OSError, ValueError):
        onthisday = {}
    if str(d) not in onthisday:
        out.append("歷史上的今天 空白")
    return out


def serial_note(d):
    """serial.py's own count of installments due and untranslated, appended to the 連載班's note."""
    import serial
    parts = []
    for slug in serial.all_slugs():
        plan = serial.load_plan(slug)
        inst = plan.get("installments", [])
        have = [i for i in inst if os.path.exists(serial.issue_file(i["date"]))]
        last = max((i["date"] for i in have), default=None)
        parts.append("《%s》缺 %d 回%s" % (plan["title"], len(serial.missing_due(plan, d)), "，譯到 %s" % last if last else ""))
    return "；".join(parts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--group", required=True, help="1–5（夜班，記在刊期下），或 reserve／audit／late／concerts／serial（記在執行當天）")
    ap.add_argument("--note", default="")
    ap.add_argument("--date")
    a = ap.parse_args()
    cfg = load_config()
    # the night shifts report for the coming issue; anything else (reserve, audit, 週日補刊, 演出班, 連載班) runs in the
    # afternoon or before the issue and is filed under the calendar day it ran
    d = tw_now().date() if a.group not in SHIFTS and not a.date else parse_date(a.date)
    note = a.note
    if a.group == "concerts":
        missing = concerts_missing(d)
    elif a.group == "serial":
        missing = []
        extra = serial_note(d)
        note = "%s；%s" % (note, extra) if note and extra else (note or extra)
    else:
        missing = issue_missing(cfg, d)
    path = os.path.join(ROOT, "state", "runs", "%s.json" % d)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        with open(path, encoding="utf-8") as f:
            runs = json.load(f)
    except (OSError, ValueError):
        runs = {}
    runs[str(a.group)] = {"finished_at": tw_now().isoformat(timespec="seconds"), "missing": missing, "note": note}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(runs, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    who = "第 %s 班" % a.group if a.group in SHIFTS else {"concerts": "演出班", "serial": "連載班", "reserve": "備稿班", "audit": "稽核", "late": "週日補刊"}.get(a.group, a.group)
    print("已記錄%s：%s；%s %s" % (who, d, "未完成" if a.group == "concerts" else "缺稿", "、".join(missing) or "無"))
    print("接著：git add state/runs && git commit -m \"%s %s回報\" && git pull --rebase origin main && git push origin HEAD:main" % (d, who))


if __name__ == "__main__":
    main()
