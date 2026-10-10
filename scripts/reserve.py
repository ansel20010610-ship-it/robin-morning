#!/usr/bin/env python3
"""Show the reserve stock (editorial/RESERVE.md): how many ready articles each column holds.

Usage: python3 scripts/reserve.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import RESERVE_TARGET, load_config, load_json, reserve_columns  # noqa: E402
import validate  # noqa: E402


def main():
    cfg = load_config()
    cols = reserve_columns(cfg)
    status = validate.reserve_status(cfg)
    stock = {c: [] for c in cols}
    for c, rows in status.items():
        for p, errs in rows:
            try:
                art = load_json(p)
                title = art.get("title", "") if isinstance(art, dict) else ""
                w = art.get("reserve_written") if isinstance(art, dict) else ""
                written = w if isinstance(w, str) else ""
            except Exception:  # noqa: BLE001
                title, written = "（無法讀取）", ""
            stock.setdefault(c, []).append((written, os.path.basename(p), title, errs))
    need, broken = [], []
    for c in cols:
        items = sorted(stock[c], key=lambda x: (x[0], x[1]))
        ok = [x for x in items if not x[3]]
        flag = "" if len(ok) >= RESERVE_TARGET else "  ← 不足 %d 篇" % (RESERVE_TARGET - len(ok))
        print("%-14s %-12s 可用 %d 篇%s" % (c, cfg["columns"][c]["name"], len(ok), flag))
        for written, fn, title, errs in items:
            print("    %s  %s  %s%s" % (written or "????-??-??", fn, title, "" if not errs else "\n      ✗ 需修正：" + errs[0]))
            if errs:
                broken.append("%s/%s" % (c, fn))
        if len(ok) < RESERVE_TARGET:
            need.append((len(ok), c))
    if broken:
        print("\n需修正的備稿（修好前不算庫存）：" + "、".join(broken))
    if need:
        print("\n優先補寫（庫存少的先寫）：" + "、".join(c for _, c in sorted(need)))
    else:
        print("\n每欄都已達 %d 篇。" % RESERVE_TARGET)


if __name__ == "__main__":
    main()
