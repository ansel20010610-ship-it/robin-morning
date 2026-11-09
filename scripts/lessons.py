#!/usr/bin/env python3
"""Keep the two copies of the newsroom's lessons in step (editorial/LESSONS.md and editorial/LESSONS-short.md).

Since 2026-11-08 the lessons live in two files. The writers' copy, LESSONS-short.md, has one line per lesson (the rule
and how to follow it, about 10 KB) and is what every shift reads before writing; the full file, LESSONS.md, keeps each
lesson with every place it was seen (32 KB and growing) and is read by the weekly audit, which adds to both. Every
run of every shift used to read the full file, a third of its fixed input.

Both files number their lessons "N. **title**：…". `check` says whether the same numbers and titles appear in both,
and lists what one file has that the other lacks; publish.yml runs it as a warning after every push, the audit runs
it before it commits.

Usage: python3 scripts/lessons.py check      exit 1 when the two files disagree
       python3 scripts/lessons.py titles     print number and title of every lesson in the full file
"""
import os
import re
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


def main(argv):
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
