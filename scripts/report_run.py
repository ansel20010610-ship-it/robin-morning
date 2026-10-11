#!/usr/bin/env python3
"""Leave a short record that a shift finished, in state/runs/<date>.json. watch.yml checks at 07:45 that
shifts 1–5 all reported: a shift that ran but could not push (or never ran) shows up as missing.

Usage: python3 scripts/report_run.py --group 4 --note "巴薩晨報已更新賽後版；觀測站靜默"
       python3 scripts/report_run.py --group reserve --note "備稿 art、city"
Then commit and push state/runs/ (editorial/README.md, last step of every shift).
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, article_path, expected_columns, load_config, parse_date, tw_now  # noqa: E402
import validate  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--group", required=True, help="1–5，或 reserve")
    ap.add_argument("--note", default="")
    ap.add_argument("--date")
    a = ap.parse_args()
    cfg = load_config()
    # the reserve shift runs in the afternoon: file it under the calendar day it ran
    d = tw_now().date() if a.group == "reserve" and not a.date else parse_date(a.date)
    missing = []
    for col in expected_columns(cfg, d):
        p = article_path(d, col)
        if not os.path.exists(p):
            missing.append(col)
            continue
        imgs, tops = validate.ledgers_excluding(str(d), col)
        if validate.validate_file(cfg, d, col, p, False, imgs, tops)[0]:
            missing.append(col + "（驗證失敗）")
    path = os.path.join(ROOT, "state", "runs", "%s.json" % d)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        with open(path, encoding="utf-8") as f:
            runs = json.load(f)
    except (OSError, ValueError):
        runs = {}
    runs[str(a.group)] = {"finished_at": tw_now().isoformat(timespec="seconds"), "missing": missing, "note": a.note}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(runs, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    print("已記錄第 %s 班：%s；缺稿 %s" % (a.group, d, "、".join(missing) or "無"))
    print("接著：git add state/runs && git commit -m \"%s 第 %s 班回報\" && git pull --rebase origin main && git push origin HEAD:main" % (d, a.group))


if __name__ == "__main__":
    main()
