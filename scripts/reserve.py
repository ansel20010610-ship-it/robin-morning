#!/usr/bin/env python3
"""Show the reserve stock (editorial/RESERVE.md): how many ready articles each column holds.

A reserve is stock only when validate.py finds no ERROR and none of the WARNs that the owner said make it 需修正
(validate.reserve_blocking: 機器腔, 出處類標籤, 分類詞小標, missing form/voice, no bold, and the rest of the stable rule
violations; LESSONS 31, 2026-11-08). The reserve shift fixes the 需修正 ones before it writes anything new.

Usage: python3 scripts/reserve.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import TARGET_NOTE, load_config, load_json, reserve_columns, reserve_target  # noqa: E402
import validate  # noqa: E402


def main():
    cfg = load_config()
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
        flag = "" if len(ok) >= target else "  ← 不足 %d 篇" % (target - len(ok))
        print("%-14s %-12s 可用 %d 篇%s" % (c, cfg["columns"][c]["name"], len(ok), flag))
        for written, fn, title, errs, blocking in items:
            if errs:
                why = "\n      ✗ 需修正：" + errs[0]
            elif blocking:  # a rule-violation WARN: written under the old rules, or never given its form and voice
                why = "\n      ✗ 需修正（不合現行規格，照 STYLE.md 重寫）：" + blocking[0]
            else:
                why = ""
            print("    %s  %s  %s%s" % (written or "????-??-??", fn, title, why))
            if errs or blocking:
                broken.append("%s/%s" % (c, fn))
        if len(ok) < target:
            need.append((len(ok), c))
    if broken:
        print("\n需修正的備稿（修好前不算庫存，備稿班先修這些再寫新稿）：" + "、".join(broken))
    if need:
        print("\n優先補寫（庫存少的先寫）：" + "、".join(c for _, c in sorted(need)))
    else:
        print("\n每欄都已達標（%s）。" % TARGET_NOTE)


if __name__ == "__main__":
    main()
