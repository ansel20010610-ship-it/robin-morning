#!/usr/bin/env python3
"""Tell the on-duty editor what to write today.

Usage: python3 scripts/plan_day.py [--date YYYY-MM-DD] [--group 1-4]
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (GROUPS, WEEKDAY_ZH, article_path, columns_for_group, expected_columns,  # noqa: E402
                    issue_number, load_config, parse_date, supplements_for, tw_now)
import validate  # noqa: E402


def status(cfg, d, col):
    p = article_path(d, col)
    if not os.path.exists(p):
        return "未完成"
    # Same checks as validate.py, including images and topic_keys already used elsewhere.
    imgs, tops = validate.ledgers_excluding(str(d), col)
    errs, _ = validate.validate_file(cfg, d, col, p, False, imgs, tops)
    return "已完成 ✓" if not errs else "已存在但驗證失敗（%d 個錯誤）" % len(errs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date")
    ap.add_argument("--group", type=int, choices=sorted(GROUPS))
    a = ap.parse_args()
    cfg = load_config()
    d = parse_date(a.date)
    cols = cfg["columns"]
    print("現在台灣時間：%s" % tw_now().strftime("%Y-%m-%d %H:%M"))
    print("刊期：%s（星期%s）第 %d 期，07:30 發布" % (d, WEEKDAY_ZH[d.weekday()], issue_number(cfg, d)))
    print("今日副刊：" + "、".join("%s（%s）" % (cols[c]["name"], c) for c in supplements_for(cfg, d)))
    print()
    if a.group:
        print("第 %d 班負責：" % a.group)
        for c in columns_for_group(cfg, d, a.group):
            print("  - %-14s %-12s %s" % (c, cols[c]["name"], status(cfg, d, c)))
            print("    規格：editorial/columns/%s.md" % c)
            print("    檔案：content/issues/%s/%s.json" % (d, c))
        print()
    print("全刊狀態：")
    missing = []
    for c in expected_columns(cfg, d):
        s = status(cfg, d, c)
        if s != "已完成 ✓":
            missing.append(c)
        print("  - %-14s %-12s %s" % (c, cols[c]["name"], s))
    for c in ("fm-watch", "cosmere-watch"):
        p = article_path(d, c)
        print("  - %-14s %-12s %s" % (c, cols[c]["name"], "已刊出" if os.path.exists(p) else "未刊出（無新進展時靜默）"))
    if missing:
        print("\n缺稿：" + "、".join(missing))


if __name__ == "__main__":
    main()
