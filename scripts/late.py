#!/usr/bin/env python3
"""週日補刊: the weekly AI quota resets on Sunday at 15:00 Taiwan time. If it ran out overnight and Sunday's issue
is not complete, the morning reserve fill stands aside and the whole day's issue is written again after 15:00
by the 週日補刊 routine (社長's rule, 2026-10-31). content/late.json records it, so the app can say what is going on
and the late issue gets its own notification.

  python3 scripts/late.py status [--date D]   prints 需要補刊 / 不需補刊 (the 週日補刊 routine starts here), the missing
                                              columns and the stations nobody has checked
  python3 scripts/late.py start  [--date D]   state → regenerating (the app shows 補刊中)
  python3 scripts/late.py done   [--date D]   state → done (notify.yml then sends the late issue's notification);
                                              refused while a column is missing or a station is unchecked
  python3 scripts/late.py giveup [--date D]   state → unfinished: the 補刊 could not finish (quota still out, a source
                                              down); records what is left, so notify.yml sends the apology at once and
                                              the app stops saying 補刊中

fill_from_reserve.py calls hold() first; when it gives a reason, nothing is filled and the day is marked waiting.
A quota that ran out shows as shifts that never reported (state/runs/<date>.json): a routine that cannot get the
model never reaches its report. If every shift reported, a missing column is an ordinary failure and the reserves
fill it as on any other day.

The 補刊 also takes over the shifts the quota silenced (社長 2026-11-08: 補刊有沒有查訃聞等觀測站，要說得出來): the three
watch stations of shift 4 and the 06:17 演出班. unchecked() lists what still has no record; `done` will not close the
day while it is non-empty.

content/late.json: {"2026-11-01": {"state": "waiting" | "regenerating" | "done" | "unfinished", "held_at": "07:12",
                                   "missing": [...], "started_at": "15:09", "done_at": "16:40",
                                   "gave_up_at": "17:50", "left": [...]}}
"""
import argparse
import datetime as dt
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (CONTENT, ROOT, article_path, expected_columns, load_config, tw_now, watch_checked,  # noqa: E402
                    watch_columns)

FILE = os.path.join(CONTENT, "late.json")
RESET_HOUR = 15  # Taiwan time on Sunday
KEEP = 30        # entries kept (the archive shows the note on a late issue's front page)
OPEN = ("waiting", "regenerating")
CONCERTS = "concerts"  # the 06:17 演出班 (近期演出 + 歷史上的今天) in unchecked() and state/runs
LABEL = {CONCERTS: "演出班（近期演出／歷史上的今天）"}


def load():
    try:
        with open(FILE, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def save(data):
    data = dict(sorted(data.items())[-KEEP:])
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def runs_of(d):
    """state/runs/<d>.json: the shifts and routines that reported for that day."""
    try:
        with open(os.path.join(ROOT, "state", "runs", "%s.json" % d), encoding="utf-8") as f:
            runs = json.load(f)
        return runs if isinstance(runs, dict) else {}
    except (OSError, ValueError):
        return {}


def unfinished(cfg, d):
    """Columns of the day's issue that are missing or fail validation."""
    import validate
    out = []
    for col in expected_columns(cfg, d):
        p = article_path(d, col)
        if not os.path.exists(p):
            out.append(col)
            continue
        imgs, tops = validate.ledgers_excluding(str(d), col)
        if validate.validate_file(cfg, d, col, p, False, imgs, tops)[0]:
            out.append(col)
    return out


def unchecked(cfg, d):
    """What the silenced shifts left undone on day d, beyond the issue's columns. A watch station counts as unchecked
    when shift 4 never reported and nothing says it was checked (no article, no "<d> 已查" line in state/watch/); the
    演出班 when concerts.json was not checked that day, 歷史上的今天 has no entry for it, and no "concerts" run record
    exists (the shift records a run even when the feed was down, so the record is the primary signal). Codes, not
    names: "fm-watch", "cosmere-watch", "obituary", "concerts"."""
    from common import load_json
    runs = runs_of(d)
    out = []
    if "4" not in runs:
        out += [c for c in watch_columns(cfg) if not watch_checked(c, d)]
    if CONCERTS not in runs:
        try:
            checked = load_json(os.path.join(CONTENT, "concerts.json")).get("checked")
        except (OSError, ValueError, AttributeError):
            checked = None
        try:
            onthisday = load_json(os.path.join(CONTENT, "onthisday.json"))
        except (OSError, ValueError):
            onthisday = {}
        if checked != str(d) and str(d) not in onthisday:
            out.append(CONCERTS)
    return out


def labels(codes):
    return "、".join(LABEL.get(c, c) for c in codes)


def silent_shifts(d):
    """Shifts with no report for the day. Shift 5 runs the reserve fill itself before it reports, so only the
    GitHub Actions fallback (fill.yml, after shift 5 should be done) counts it."""
    runs = runs_of(d)
    shifts = "12345" if os.environ.get("GITHUB_ACTIONS") == "true" else "1234"
    return [g for g in shifts if g not in runs]


def hold(cfg, d, now=None):
    """Why the reserve fill must not run for issue `d` now, or None. Marks the day waiting when it holds.

    The state comes first and the clock not at all: a day already in late.json belongs to the 補刊 whatever the hour
    (a fill that GitHub started 3 h late on 2026-11-08 would otherwise have filled a day being rewritten), and a
    Sunday with silent shifts and missing columns is held even after 15:00 — the owner's rule is that a quota Sunday
    is regenerated, never filled from reserve, and the 15:00 escape only let a late fill break it."""
    now = now or tw_now()
    data = load()
    entry = data.get(str(d)) or {}
    if entry.get("state") in OPEN:
        return "今天已標記為週日補刊（%s）" % entry["state"]
    if entry.get("state") == "done":
        return "今天的週日補刊已完成，不再補位"
    if entry.get("state") == "unfinished":
        return "今天的週日補刊已放棄（unfinished）：缺的欄位留給社長，不用備稿"
    if d.weekday() != 6:
        return None
    missing = unfinished(cfg, d)
    silent = silent_shifts(d)
    if not missing or not silent:
        return None
    if now.date() == d and silent == ["5"] and (now.hour, now.minute) < (7, 20):  # shift 5 stops at 07:05 and may still be pushing or reporting
        return "第 5 班還沒回報，可能還在收尾：07:20 前不判斷額度，這次不補位"
    reason = "週日額度不足（第 %s 班沒有回報），缺 %s：不用備稿，%d:00 額度重置後由週日補刊重新製作" % (
        "、".join(silent), "、".join(missing), RESET_HOUR)
    if now.date() != d:
        return reason  # a past Sunday is not marked from today: the mark would only make the app say 補刊中 for a day nobody will rewrite
    data[str(d)] = {"state": "waiting", "held_at": now.strftime("%H:%M"), "missing": missing}
    save(data)
    return reason


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["status", "start", "done", "giveup"])
    ap.add_argument("--date")
    a = ap.parse_args()
    now = tw_now()
    d = dt.date.fromisoformat(a.date) if a.date else now.date()
    data = load()
    entry = data.get(str(d)) or {}
    cfg = load_config()
    if a.cmd == "status":
        missing = unfinished(cfg, d)
        todo = unchecked(cfg, d)
        if entry.get("state") in OPEN or (d.weekday() == 6 and missing and entry.get("state") not in ("done", "unfinished")):
            print("需要補刊：%s（狀態 %s）缺 %s" % (d, entry.get("state", "未標記"), "、".join(missing) or "無（只差 late.py done）"))
        else:
            print("不需補刊：%s（%s）" % (d, {"done": "已補刊完成", "unfinished": "補刊已放棄，缺 %s" % labels(entry.get("left") or [])}.get(
                entry.get("state"), "全刊齊備" if not missing else "不是週日")))
        if todo:
            print("還沒查核：%s" % labels(todo))
        return 0
    if a.cmd == "start":
        entry.setdefault("missing", unfinished(cfg, d))
        entry.update(state="regenerating", started_at=now.strftime("%H:%M"))
    elif a.cmd == "giveup":
        left = unfinished(cfg, d)
        todo = unchecked(cfg, d)
        entry.setdefault("missing", left)
        entry.update(state="unfinished", gave_up_at=now.strftime("%H:%M"), left=left + todo)
    else:
        left = unfinished(cfg, d)
        if left:
            print("還有欄位沒完成：%s。補完再跑 done。" % "、".join(left))
            return 1
        todo = unchecked(cfg, d)
        if todo:
            print("還有沒查核的：%s。查核紀錄寫進 state/watch/（演出班：concerts.json 的 checked 或 onthisday，或 report_run --group concerts）再跑 done。" % labels(todo))
            return 1
        entry.update(state="done", done_at=now.strftime("%H:%M"))
    data[str(d)] = entry
    save(data)
    print("%s 週日補刊：%s%s" % (d, entry["state"], "（缺 %s）" % labels(entry["left"]) if entry.get("left") else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
