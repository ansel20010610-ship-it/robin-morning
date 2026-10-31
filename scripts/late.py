#!/usr/bin/env python3
"""週日補刊: the weekly AI quota resets on Sunday at 15:00 Taiwan time. If it ran out overnight and Sunday's issue
is not complete, the morning reserve fill stands aside and the whole day's issue is written again after 15:00
by the 週日補刊 routine (社長's rule, 2026-10-31). content/late.json records it, so the app can say what is going on
and the late issue gets its own notification.

  python3 scripts/late.py status [--date D]   prints 需要補刊 / 不需補刊 (the 週日補刊 routine starts here)
  python3 scripts/late.py start  [--date D]   state → regenerating (the app shows 補刊中)
  python3 scripts/late.py done   [--date D]   state → done (notify.yml then sends the late issue's notification)

fill_from_reserve.py calls hold() first; when it gives a reason, nothing is filled and the day is marked waiting.
A quota that ran out shows as shifts that never reported (state/runs/<date>.json): a routine that cannot get the
model never reaches its report. If every shift reported, a missing column is an ordinary failure and the reserves
fill it as on any other day.

content/late.json: {"2026-11-01": {"state": "waiting" | "regenerating" | "done", "held_at": "07:12",
                                   "missing": [...], "started_at": "15:09", "done_at": "16:40"}}
"""
import argparse
import datetime as dt
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, ROOT, article_path, expected_columns, load_config, tw_now  # noqa: E402

FILE = os.path.join(CONTENT, "late.json")
RESET_HOUR = 15  # Taiwan time on Sunday
KEEP = 30        # entries kept (the archive shows the note on a late issue's front page)
OPEN = ("waiting", "regenerating")


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


def silent_shifts(d):
    """Shifts with no report for the day. Shift 5 runs the reserve fill itself before it reports, so only the
    GitHub Actions fallback (fill.yml, after shift 5 should be done) counts it."""
    try:
        with open(os.path.join(ROOT, "state", "runs", "%s.json" % d), encoding="utf-8") as f:
            runs = json.load(f)
    except (OSError, ValueError):
        runs = {}
    shifts = "12345" if os.environ.get("GITHUB_ACTIONS") == "true" else "1234"
    return [g for g in shifts if g not in runs]


def hold(cfg, d, now=None):
    """Why the reserve fill must not run for issue `d` now, or None. Marks the day waiting when it holds."""
    now = now or tw_now()
    if d.weekday() != 6 or now.date() != d or now.hour >= RESET_HOUR:
        return None
    data = load()
    entry = data.get(str(d)) or {}
    if entry.get("state") in OPEN:
        return "今天已標記為週日補刊（%s）" % entry["state"]
    missing = unfinished(cfg, d)
    silent = silent_shifts(d)
    if not missing or not silent:
        return None
    data[str(d)] = {"state": "waiting", "held_at": now.strftime("%H:%M"), "missing": missing}
    save(data)
    return "週日額度不足（第 %s 班沒有回報），缺 %s：不用備稿，%d:00 額度重置後由週日補刊重新製作" % (
        "、".join(silent), "、".join(missing), RESET_HOUR)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["status", "start", "done"])
    ap.add_argument("--date")
    a = ap.parse_args()
    now = tw_now()
    d = dt.date.fromisoformat(a.date) if a.date else now.date()
    data = load()
    entry = data.get(str(d)) or {}
    if a.cmd == "status":
        cfg = load_config()
        missing = unfinished(cfg, d)
        if entry.get("state") in OPEN or (d.weekday() == 6 and missing and entry.get("state") != "done"):
            print("需要補刊：%s（狀態 %s）缺 %s" % (d, entry.get("state", "未標記"), "、".join(missing) or "無（只差 late.py done）"))
        else:
            print("不需補刊：%s（%s）" % (d, "已補刊完成" if entry.get("state") == "done" else "全刊齊備" if not missing else "不是週日"))
        return 0
    if a.cmd == "start":
        entry.setdefault("missing", unfinished(load_config(), d))
        entry.update(state="regenerating", started_at=now.strftime("%H:%M"))
    else:
        left = unfinished(load_config(), d)
        if left:
            print("還有欄位沒完成：%s。補完再跑 done。" % "、".join(left))
            return 1
        entry.update(state="done", done_at=now.strftime("%H:%M"))
    data[str(d)] = entry
    save(data)
    print("%s 週日補刊：%s" % (d, entry["state"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
