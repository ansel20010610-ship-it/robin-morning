#!/usr/bin/env python3
"""Show the reserve stock (editorial/RESERVE.md): how many ready articles each column holds.

Usage: python3 scripts/reserve.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import RESERVE_TARGET, iter_reserve, load_config, load_json, reserve_columns  # noqa: E402


def main():
    cfg = load_config()
    cols = reserve_columns(cfg)
    stock = {c: [] for c in cols}
    for c, p in iter_reserve():
        try:
            art = load_json(p)
            title = art.get("title", "") if isinstance(art, dict) else ""
            written = art.get("reserve_written", "") if isinstance(art, dict) else ""
        except Exception:  # noqa: BLE001
            title, written = "（無法讀取）", ""
        stock.setdefault(c, []).append((written, os.path.basename(p), title))
    need = []
    for c in cols:
        items = sorted(stock[c])
        flag = "" if len(items) >= RESERVE_TARGET else "  ← 不足 %d 篇" % (RESERVE_TARGET - len(items))
        print("%-14s %-12s %d 篇%s" % (c, cfg["columns"][c]["name"], len(items), flag))
        for written, fn, title in items:
            print("    %s  %s  %s" % (written or "????-??-??", fn, title))
        if len(items) < RESERVE_TARGET:
            need.append((len(items), c))
    if need:
        print("\n優先補寫（庫存少的先寫）：" + "、".join(c for _, c in sorted(need)))
    else:
        print("\n每欄都已達 %d 篇。" % RESERVE_TARGET)


if __name__ == "__main__":
    main()
