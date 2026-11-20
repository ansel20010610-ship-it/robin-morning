#!/usr/bin/env python3
"""Keep the two copies of the newsroom's lessons in step (editorial/LESSONS.md and editorial/LESSONS-short.md).

Since 2026-11-08 the lessons live in two files. The writers' copy, LESSONS-short.md, has one line per lesson (the rule
and how to follow it, about 10 KB) and is what every shift reads before writing; the full file, LESSONS.md, keeps each
lesson with its examples (older lessons also with places they were seen; from 2026-11-22 new places go to
state/audit/<date>.md instead) and is read by the weekly audit, which adds to both. Every run of every shift used to
read the full file, a third of its fixed input.

Both files number their lessons "N. **title**：…". `check` says whether the same numbers and titles appear in both,
and lists what one file has that the other lacks; publish.yml runs it as a warning after every push.
`check --no-growth` (the audit, before it saves) also fails when LESSONS-short.md has more bytes than in the baseline,
or when either file has more "body[" (a place it was seen) than in the baseline; it also names, without failing, the
lesson numbers the baseline has and the files lack now. The baseline is the last commit before today 00:00 Taiwan
time, else the earliest commit in the checkout (a shallow clone's starting point); with neither, it says so and passes.

Usage: python3 scripts/lessons.py check      exit 1 when the two files disagree
       python3 scripts/lessons.py check --no-growth   also exit 1 when the writers' copy grew or a place was added
       python3 scripts/lessons.py titles     print number and title of every lesson in the full file
"""
import datetime as dt
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT  # noqa: E402

FULL = os.path.join(ROOT, "editorial", "LESSONS.md")
SHORT = os.path.join(ROOT, "editorial", "LESSONS-short.md")
ITEM = re.compile(r"^(\d+)\. \*\*(.+?)\*\*", re.M)


def items(path):
    """{number: title} of the numbered, bold-titled lessons in a file."""
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return None
    return {int(n): t.strip() for n, t in ITEM.findall(text)}


def repeated(path):
    """The numbers more than one lesson in a file carries: items() keeps only the last of them, so check counts here."""
    try:
        with open(path, encoding="utf-8") as f:
            nums = [int(n) for n, _ in ITEM.findall(f.read())]
    except OSError:
        return []
    return sorted({n for n in nums if nums.count(n) > 1})


def check():
    full, short = items(FULL), items(SHORT)
    if full is None or short is None:
        print("讀不到 %s" % (FULL if full is None else SHORT))
        return 1
    bad = 0
    for n in sorted(set(full) | set(short)):
        a, b = full.get(n), short.get(n)
        if a is None:
            print("第 %d 條只在 LESSONS-short.md：%s" % (n, b)); bad += 1
        elif b is None:
            print("第 %d 條只在 LESSONS.md（寫手的一行版還沒加）：%s" % (n, a)); bad += 1
        elif a != b:
            print("第 %d 條標題不同：LESSONS.md「%s」／LESSONS-short.md「%s」" % (n, a, b)); bad += 1
    for path in (FULL, SHORT):
        dup = repeated(path)
        if dup:
            print("%s 編號重複：%s" % (os.path.basename(path), dup)); bad += 1
    if bad:
        return 1
    print("✓ 教訓清單兩份一致：%d 條" % len(full))
    return 0


TW = dt.timezone(dt.timedelta(hours=8))


def git_show(rev, path):
    """Bytes of path in commit rev, or None (not a checkout, no such commit, file not in it, no git)."""
    rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
    try:
        r = subprocess.run(["git", "-C", ROOT, "show", "%s:%s" % (rev, rel)], capture_output=True)
    except OSError:
        return None
    return r.stdout if r.returncode == 0 else None


def rev_list(*args):
    """Commit ids git rev-list prints for args, newest first; [] when git cannot say."""
    try:
        r = subprocess.run(["git", "-C", ROOT, "rev-list"] + list(args) + ["HEAD"], capture_output=True, text=True)
    except OSError:
        return []
    return r.stdout.split() if r.returncode == 0 else []


def baseline():
    """(label, {path: bytes or None}) of the last commit before today 00:00 Taiwan time, else of the earliest commit in
    this checkout (in a shallow clone, the commit it was cloned at); None if neither has LESSONS-short.md. HEAD is never
    the fallback: a run that commits first would compare the file with itself."""
    midnight = dt.datetime.now(TW).strftime("%Y-%m-%d 00:00:00 +0800")
    revs = rev_list("-1", "--before=" + midnight)[:1] + rev_list()[-1:]
    for rev in revs:
        short = git_show(rev, SHORT)
        if short is not None:
            return rev[:7], {SHORT: short, FULL: git_show(rev, FULL)}
    return None


def numbers(data):
    """The lesson numbers in a file's bytes."""
    return {int(n) for n, _ in ITEM.findall(data.decode("utf-8", "replace"))}


def no_growth():
    """0 when the writers' copy is no longer than the baseline and neither file has more body[ than in it, else 1."""
    base = baseline()
    if base is None:
        print("找不到今天以前或最早的提交裡的 LESSONS-short.md，不比長度（當作通過）")
        return 0
    label, old = base
    now = {}
    for path in (SHORT, FULL):
        try:
            with open(path, "rb") as f:
                now[path] = f.read()
        except OSError:
            now[path] = None
    rc = 0
    if now[SHORT] is not None and len(now[SHORT]) > len(old[SHORT]):
        a, b = len(old[SHORT]), len(now[SHORT])
        print("寫手版比基準多 %d 位元組（基準 %s 是 %d，現在 %d）：加一條就要併掉或縮短舊的" % (b - a, label, a, b))
        rc = 1
    hits, gone = [], set()
    for path in (FULL, SHORT):
        if now[path] is not None and old[path] is not None:
            n = now[path].count(b"body[") - old[path].count(b"body[")
            if n > 0:
                hits.append("%s 多 %d 處" % (os.path.basename(path), n))
            gone |= numbers(old[path]) - numbers(now[path])
    if hits:
        print("教訓檔的 body[ 比基準多（出現位置要寫進 state/audit/<稽核日期>.md）：%s" % "、".join(hits))
        rc = 1
    if gone:
        print("基準裡有、現在不見的教訓編號：%s（併掉可以，整條移除不行）" % "、".join(str(n) for n in sorted(gone)))
    if now[SHORT] is None:
        rc = 1
    return rc


def main(argv):
    flags = [a for a in argv[1:] if a.startswith("-")]
    if flags:
        rest = [a for a in argv[1:] if not a.startswith("-")]
        cmd = rest[0] if rest else "check"
        if cmd != "check" or any(a != "--no-growth" for a in flags):
            print(__doc__)
            return 2
        rc = check()
        return no_growth() or rc
    cmd = argv[1] if len(argv) > 1 else "check"
    if cmd == "check":
        return check()
    if cmd == "titles":
        full = items(FULL) or {}
        for n in sorted(full):
            print("%d. %s" % (n, full[n]))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
