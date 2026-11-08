#!/usr/bin/env python3
"""Last line of defence against a missing column (editorial/RESERVE.md). No AI involved.

For every column of the day's issue that is missing or fails validation, take the oldest usable reserve article
of that column, re-date it, and publish it. A failing article is replaced only when a reserve that passes
validation is ready; with no usable reserve it stays where it is (a flawed article beats an empty column),
unless it cannot be shown at all (unparseable JSON, not an object, empty body).

"Usable" means no ERROR. The WARNs that keep a reserve out of the stock (validate.reserve_blocking) do not stop it
here: this is the last line, and a reserve written under the old rules still beats an empty column. Two things are
looked at anyway because nobody reads a filled article before it goes out (LESSONS 25, 29): reserves free of dated
words (今天, 最近, 本季 …) go first and a filled one that carries some is reported, and every source URL of the
article being published is fetched once; an unreachable source is reported too. Both are ⚠ lines for the shift
report and the commit message, never a reason not to fill.

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

# The ⚠ notes of this run (dated words, unreachable sources), repeated at the end so the shift can copy them into
# its commit message and report, and printed as GitHub Actions warnings so fill.yml's run page shows them.
NOTES = []


def note(msg):
    NOTES.append(msg)
    print("  ⚠ " + msg)
    if os.environ.get("GITHUB_ACTIONS"):
        print("::warning::" + msg)


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
    """[(path, dated words)] of the column's reserves in the order they should be tried: the ones free of dated
    words first, then by reserve_written (oldest first) and file name. A reserve with dated words stays a candidate:
    a supplement keeps a single reserve, so skipping it would mean an empty column (RESERVE.md 刊出規則)."""
    out = []
    for _, p in iter_reserve(col):
        try:
            art = load_json(p)
        except Exception:  # noqa: BLE001
            continue
        if not isinstance(art, dict) or art.get("hold"):  # a reserve on hold (review notes not yet applied) never runs
            continue
        w = art.get("reserve_written")
        stale = validate.stale_words(art)
        out.append((bool(stale), w if isinstance(w, str) and w else "9999", os.path.basename(p), p, stale))
    return [(p, stale) for _, _, _, p, stale in sorted(out, key=lambda x: x[:3])]


def ready_reserve(cfg, d, col, target):
    """Write the first usable reserve to a temporary file next to `target`; return (temp path, reserve path, dated words)."""
    tmp = os.path.join(os.path.dirname(target), ".%s.candidate" % col)  # iter_articles only reads *.json
    os.makedirs(os.path.dirname(target), exist_ok=True)
    for src, stale in candidates(col):
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
            return tmp, src, stale
        print("  ✗ 備稿 %s 不能用：%s" % (os.path.relpath(src, CONTENT), errs[0]))
    if os.path.exists(tmp):
        os.remove(tmp)
    return None, None, []


def report_sources(col, path):
    """Fetch each source of the article just published and note the ones that did not answer (validate.check_source_urls).
    A network problem here is a note, never a failure: the article is already on disk and beats an empty column."""
    try:
        bad = validate.check_source_urls(load_json(path))
    except Exception as e:  # noqa: BLE001
        note("%s 的來源無法核對：%s: %s" % (col, type(e).__name__, e))
        return
    for url, why in bad:
        note("%s 的來源連不上（%s），請人工確認它還在、還是原來的網站：%s" % (col, why, url))


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
    tmp, src, stale = ready_reserve(cfg, d, col, target)
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
        if stale:
            note("備稿 %s 含過期字眼：%s" % (os.path.relpath(src, CONTENT), "、".join(stale)))
        return "filled"
    if exists:
        bad_dir = os.path.join(CONTENT, "rejected", str(d))
        os.makedirs(bad_dir, exist_ok=True)
        shutil.move(target, os.path.join(bad_dir, col + ".json"))
    os.replace(tmp, target)
    os.remove(src)
    validate.ledger_rows.cache_clear()
    print("  ✓ 以備稿 %s 補上 %s：%s" % (os.path.relpath(src, CONTENT), col, load_json(target).get("title", "")))
    if stale:
        note("備稿 %s 含過期字眼：%s（已刊出，下一班請改掉）" % (os.path.relpath(src, CONTENT), "、".join(stale)))
    report_sources(col, target)
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
    if NOTES:
        print("\n補位附註（寫進 commit 訊息與班次回報）：" + "；".join(NOTES))
    if problems:
        print("\n仍有問題：" + "、".join(problems))
        return 2
    print("\n%s 全刊齊備。" % d)
    return 0


if __name__ == "__main__":
    sys.exit(main())
