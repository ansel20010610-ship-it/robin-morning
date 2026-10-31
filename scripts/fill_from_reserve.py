#!/usr/bin/env python3
"""Last line of defence against a missing column (editorial/RESERVE.md). No AI involved.

For every column of the day's issue that is missing or fails validation, take the oldest usable reserve article
of that column, re-date it, and publish it. A failing article is replaced only when a reserve that passes
validation is ready; with no usable reserve it stays where it is (a flawed article beats an empty column),
unless it cannot be shown at all (unparseable JSON, not an object, empty body).

On a Sunday whose AI quota ran out overnight, nothing is filled: the day is marked for 週日補刊 and written again
after the 15:00 quota reset (scripts/late.py). That is exit code 3.

Usage: python3 scripts/fill_from_reserve.py 2026-10-12 [--dry-run]
Exit code 2 when some column is still missing, or still failing, afterwards; 3 when held for 週日補刊.
"""
import argparse
import datetime as dt
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, article_path, expected_columns, iter_reserve, load_config, load_json, tw_now  # noqa: E402
import late  # noqa: E402
import validate  # noqa: E402


def reserve_paths():
    return [p for _, p in iter_reserve()]


def check(cfg, d, col, path, skip):
    """Validation errors of `path` as the day's `col`, against published articles only: the other reserves are
    left out, so two reserves sharing an image cannot block each other on the day one of them is needed."""
    validate.ledger_rows.cache_clear()
    imgs, tops = validate.ledgers_excluding(str(d), col, paths=[path, *skip, *reserve_paths()])
    errs, _ = validate.validate_file(cfg, d, col, path, False, imgs, tops)
    return errs


def displayable(path):
    """Whether the app can show the article at all, whatever else is wrong with it."""
    try:
        art = load_json(path)
    except Exception:  # noqa: BLE001
        return False
    return isinstance(art, dict) and isinstance(art.get("body"), list) and bool(art["body"])


def candidates(col):
    out = []
    for _, p in iter_reserve(col):
        try:
            art = load_json(p)
        except Exception:  # noqa: BLE001
            continue
        if not isinstance(art, dict) or art.get("hold"):  # a reserve on hold (review notes not yet applied) never runs
            continue
        w = art.get("reserve_written")
        out.append((w if isinstance(w, str) and w else "9999", os.path.basename(p), p))
    return [p for _, _, p in sorted(out)]


def ready_reserve(cfg, d, col, target):
    """Write the first usable reserve to a temporary file next to `target`; return (temp path, reserve path)."""
    tmp = os.path.join(os.path.dirname(target), ".%s.candidate" % col)  # iter_articles only reads *.json
    os.makedirs(os.path.dirname(target), exist_ok=True)
    for src in candidates(col):
        try:
            art = load_json(src)
            art["date"] = str(d)
            art["updated_at"] = tw_now().isoformat(timespec="seconds")
            art["from_reserve"] = True
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(art, f, ensure_ascii=False, indent=2)
                f.write("\n")
            errs = check(cfg, d, col, tmp, [target, src])
        except Exception as e:  # noqa: BLE001  # one broken reserve must not stop the others
            errs = ["%s: %s" % (type(e).__name__, e)]
        if not errs:
            return tmp, src
        print("  ✗ 備稿 %s 不能用：%s" % (os.path.relpath(src, CONTENT), errs[0]))
    if os.path.exists(tmp):
        os.remove(tmp)
    return None, None


def fill_column(cfg, d, col, dry_run):
    """Returns "ok", "filled", "kept" (failing article kept, no reserve) or "missing"."""
    target = article_path(d, col)
    exists = os.path.exists(target)
    if exists:
        errs = check(cfg, d, col, target, [])
        if not errs:
            return "ok"
        print("%s 驗證失敗（%s）" % (col, errs[0]))
    else:
        print("%s 缺稿" % col)
    tmp, src = ready_reserve(cfg, d, col, target)
    if not tmp:
        if exists and displayable(target):
            print("  ⚠ %s 沒有可用的備稿，保留原稿（有瑕疵但可閱讀）" % col)
            return "kept"
        if exists and not dry_run:
            bad_dir = os.path.join(CONTENT, "rejected", str(d))
            os.makedirs(bad_dir, exist_ok=True)
            shutil.move(target, os.path.join(bad_dir, col + ".json"))
        print("  ⚠ %s 沒有可用的備稿" % col)
        return "missing"
    if dry_run:
        os.remove(tmp)
        print("  （預演）會用備稿 %s 補上 %s" % (os.path.relpath(src, CONTENT), col))
        return "filled"
    if exists:
        bad_dir = os.path.join(CONTENT, "rejected", str(d))
        os.makedirs(bad_dir, exist_ok=True)
        shutil.move(target, os.path.join(bad_dir, col + ".json"))
    os.replace(tmp, target)
    os.remove(src)
    validate.ledger_rows.cache_clear()
    print("  ✓ 以備稿 %s 補上 %s：%s" % (os.path.relpath(src, CONTENT), col, load_json(target).get("title", "")))
    return "filled"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("date")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    cfg = load_config()
    d = dt.date.fromisoformat(a.date)
    held = None if a.dry_run else late.hold(cfg, d)
    if held:
        print(held)
        return 3
    day_dir = os.path.dirname(article_path(d, "x"))
    made_dir = not os.path.isdir(day_dir)
    problems = []
    for col in expected_columns(cfg, d):
        try:
            result = fill_column(cfg, d, col, a.dry_run)
        except Exception as e:  # noqa: BLE001  # carry on with the other columns
            print("  ⚠ %s 補位時出錯：%s: %s" % (col, type(e).__name__, e))
            result = "missing"
        if result in ("missing", "kept"):
            problems.append("%s（%s）" % (col, "缺稿" if result == "missing" else "有瑕疵、無備稿可換"))
    if made_dir and os.path.isdir(day_dir) and not os.listdir(day_dir):
        os.rmdir(day_dir)  # a dry run leaves no trace
    if problems:
        print("\n仍有問題：" + "、".join(problems))
        return 2
    print("\n%s 全刊齊備。" % d)
    return 0


if __name__ == "__main__":
    sys.exit(main())
