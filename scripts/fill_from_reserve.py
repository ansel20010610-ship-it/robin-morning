#!/usr/bin/env python3
"""Last line of defence against a missing column (editorial/RESERVE.md). No AI involved.

For every column of the day's issue that is missing or fails validation, take the oldest reserve article of
that column, re-date it, and publish it. A failing article is moved to content/rejected/<date>/ first.

Usage: python3 scripts/fill_from_reserve.py 2026-10-12 [--dry-run]
Exit code 2 when some column is still missing afterwards (no usable reserve).
"""
import argparse
import datetime as dt
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, article_path, expected_columns, iter_reserve, load_config, load_json, tw_now  # noqa: E402
import validate  # noqa: E402


def is_valid(cfg, d, col, path, extra_skip=()):
    imgs, tops = validate.ledgers_excluding(str(d), col, paths=[path, *extra_skip])
    errs, _ = validate.validate_file(cfg, d, col, path, False, imgs, tops)
    return errs


def candidates(col):
    out = []
    for c, p in iter_reserve(col):
        try:
            art = load_json(p)
            written = art.get("reserve_written", "") if isinstance(art, dict) else ""
        except Exception:  # noqa: BLE001
            continue
        out.append((written or "9999", os.path.basename(p), p))
    return [p for _, _, p in sorted(out)]


def promote(cfg, d, col, dry_run):
    target = article_path(d, col)
    for src in candidates(col):
        art = load_json(src)
        art["date"] = str(d)
        art["updated_at"] = tw_now().isoformat(timespec="seconds")
        art["from_reserve"] = True
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            json.dump(art, f, ensure_ascii=False, indent=2)
            f.write("\n")
        validate.ledger_rows.cache_clear()
        errs = is_valid(cfg, d, col, target, extra_skip=[src])
        if errs:
            os.remove(target)
            print("  ✗ 備稿 %s 不能用：%s" % (os.path.relpath(src, CONTENT), errs[0]))
            continue
        if dry_run:
            os.remove(target)
            print("  （預演）會用備稿 %s 補上 %s" % (os.path.relpath(src, CONTENT), col))
        else:
            os.remove(src)
            print("  ✓ 以備稿 %s 補上 %s：%s" % (os.path.relpath(src, CONTENT), col, art.get("title", "")))
        validate.ledger_rows.cache_clear()
        return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("date")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    cfg = load_config()
    d = dt.date.fromisoformat(a.date)
    still_missing = []
    for col in expected_columns(cfg, d):
        path = article_path(d, col)
        if os.path.exists(path):
            errs = is_valid(cfg, d, col, path)
            if not errs:
                continue
            print("%s 驗證失敗（%s）" % (col, errs[0]))
            if not a.dry_run:
                bad_dir = os.path.join(CONTENT, "rejected", str(d))
                os.makedirs(bad_dir, exist_ok=True)
                shutil.move(path, os.path.join(bad_dir, col + ".json"))
                validate.ledger_rows.cache_clear()
        else:
            print("%s 缺稿" % col)
        if not promote(cfg, d, col, a.dry_run):
            print("  ⚠ %s 沒有可用的備稿" % col)
            still_missing.append(col)
    if still_missing:
        print("\n仍缺：" + "、".join(still_missing))
        return 2
    print("\n%s 全刊齊備。" % d)
    return 0


if __name__ == "__main__":
    sys.exit(main())
