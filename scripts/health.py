#!/usr/bin/env python3
"""體檢：流程有沒有又變胖、把關有沒有在起作用。每週印一張表（建議每週稽核收尾時跑一次並加 --save）。

只讀版本庫、不連網、只用標準函式庫；只有 --save 會寫一個檔：state/health/<日期>.json（下次體檢拿它來比）。

用法：python3 scripts/health.py                 印表，結束碼 0
      python3 scripts/health.py --save          印表，並存下這次的數字
      python3 scripts/health.py --check         超出下面的預算線就結束碼 1
      python3 scripts/health.py --root <別的檢出> --as-of 2026-10-18 --health-dir <資料夾>   回頭量舊版本
"""
import argparse
import ast
import datetime as dt
import glob
import json
import os
import re
import statistics
import subprocess
import sys

# ── 預算線：上線當天（2026-11-13）的實測數字當上限。超出時不要調高這裡的數字：要加一條，先刪一條。 ──
BUDGET = {
    "rules_bytes": 305417,     # editorial/ 全部檔案的位元組
    "writer_tokens": 24635,    # 最重的那個寫手角色，動筆前必讀的 tokens
    "validate_lines": 1358,    # scripts/validate.py 行數
    "list_words": 134,         # validate.py 五張詞表的詞數
}
BUDGET_ZH = {"rules_bytes": "規則總量（位元組）", "writer_tokens": "寫手必讀量（tokens）",
             "validate_lines": "validate.py 行數", "list_words": "詞表詞數"}
WORDLISTS = ["AI_PHRASES", "MACHINE", "STALE_WORDS", "BACKSTAGE", "SPEC_HEADS"]
NOT_ARTICLE = {"concerts", "onthisday", "letters", "postcards", "serial"}   # 有規格檔但不是寫手寫的文章
NEWSY = {"football", "news", "fm-watch", "cosmere-watch", "obituary"}        # README 第 2 步：新聞類看 football 範文
DAILY = ["1", "2", "3", "4", "5", "reserve", "concerts", "serial"]           # 每天該回報的班（從它第一次回報那天起算）
GROUP_ZH = {"reserve": "備稿班", "concerts": "演出班", "serial": "連載班", "audit": "每週稽核"}
OLD_DAYS = 14                                                                # 備稿放超過這麼多天，算「寫了沒用過」
AUDIT_WARN = "有更正框"   # validate 的這條 WARN 是稽核事後加更正框才有的，不是帶著出刊的：不算進 WARN 數
TW = dt.timezone(dt.timedelta(hours=8))


def read(root, rel):
    try:
        with open(os.path.join(root, rel), encoding="utf-8") as f:
            return f.read()
    except OSError:
        return ""


def load(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def tok(text):
    """和這次盤點同一個估法：非 ASCII 字一個算 1 token，ASCII 四個算 1。"""
    wide = sum(1 for c in text if ord(c) > 127)
    return wide + (len(text) - wide) / 4


def run(root, *cmd):
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
    try:
        return subprocess.run(cmd, cwd=root, capture_output=True, text=True, env=env, timeout=120)
    except (OSError, subprocess.SubprocessError):
        return None


def git(root, *args):
    r = run(root, "git", "-c", "core.quotepath=false", *args)
    return r.stdout if r and r.returncode == 0 else ""


# ── 一、規則量 ──
def rules(root):
    # HISTORY.md（沿革）沒有人必須讀，不算規則量
    files = [os.path.join(d, f) for d, _, fs in os.walk(os.path.join(root, "editorial")) for f in fs
             if not f.startswith(".") and f != "HISTORY.md"]
    src = read(root, "scripts/validate.py")
    words = {k: 0 for k in WORDLISTS}
    try:
        for node in ast.parse(src).body:
            if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "") in words:
                words[node.targets[0].id] = sum(isinstance(n, ast.Constant) and isinstance(n.value, str)
                                                for n in ast.walk(node.value))
    except SyntaxError:
        pass
    size = lambda name: len(read(root, "editorial/" + name).encode("utf-8"))   # noqa: E731
    return {"files": len(files), "rules_bytes": sum(os.path.getsize(p) for p in files),
            "README": size("README.md"), "STYLE": size("STYLE.md"), "LESSONS": size("LESSONS.md"),
            "LESSONS-short": size("LESSONS-short.md"), "validate_lines": src.count("\n"),
            "list_words": sum(words.values()), "words": words}


def writer_tokens(root):
    """每個寫手動筆前必讀幾個 tokens。有 scripts/brief.py 就量它印出來的量，沒有就照 README 第 2 步列的檔案算。"""
    cols = sorted(f[:-3] for f in os.listdir(os.path.join(root, "editorial", "columns"))
                  if f.endswith(".md") and f[:-3] not in NOT_ARTICLE) if os.path.isdir(os.path.join(root, "editorial", "columns")) else []
    if os.path.exists(os.path.join(root, "scripts", "brief.py")):
        got = {}
        for c in cols:
            r = run(root, sys.executable, "-B", "scripts/brief.py", c)
            if not r or r.returncode or not r.stdout.strip():
                break
            total = tok(r.stdout)
            # 還沒有一頁版的欄位，brief.py 只列出「照舊要讀的檔」：把那些檔也算進去
            for ln in r.stdout.splitlines():
                if ln.startswith("#"):
                    break
                for q in re.findall(r"editorial/[\w\-]+\.md", ln):
                    total += tok(read(root, q))
                if "editorial/examples/" in ln:
                    total += tok(read(root, "editorial/examples/%s.md" % ("football" if c in NEWSY else "perio" if c == "perio" else "philosophy")))
            got[c] = round(total)
        if cols and len(got) == len(cols):
            return got, "scripts/brief.py <欄> 印出來的量（加上它點名要讀的檔）"
    lines = read(root, "editorial/README.md").splitlines()
    start = next((i for i, ln in enumerate(lines) if re.match(r"\s*\d+\.\s*\*\*讀規則", ln)), None)
    step2 = ""
    if start is not None:      # 第 2 步可能拆成好幾行：讀到下一個編號為止
        end = next((j for j in range(start + 1, len(lines)) if re.match(r"\s*\d+\.\s", lines[j])), len(lines))
        step2 = " ".join(lines[start:end])
    paths = re.findall(r"`(editorial/[^`]+)`", step2) or ["editorial/STYLE.md", "editorial/SCHEMA.md", "editorial/IMAGES.md",
                                                           "editorial/LESSONS.md", "editorial/columns/<欄位>.md"]
    got = {}
    for c in cols:
        total = 0
        for p in paths:
            if p.endswith("examples/"):
                p += ("football" if c in NEWSY else "perio" if c == "perio" else "philosophy") + ".md"
            total += tok(read(root, p.replace("<欄位>", c)))
        got[c] = round(total)
    return got, "README 第 2 步列的檔案（%d 個）" % len(paths)


# ── 二、把關成績 ──
def monday(day):
    d = dt.date.fromisoformat(day)
    return str(d - dt.timedelta(days=d.weekday()))


def corrected(art):
    return bool(art.get("corrected_at")) or any(isinstance(b, dict) and b.get("type") == "callout" and "更正" in str(b.get("label", ""))
                                                for b in art.get("body") or [])


def articles(root, asof):
    """已到刊期的稿（連載是譯稿、稽核不抽，不算）：[(日期, 欄, 內容)]。"""
    out = []
    for p in sorted(glob.glob(os.path.join(root, "content", "issues", "20??-??-??", "*.json"))):
        day, col = os.path.basename(os.path.dirname(p)), os.path.basename(p)[:-5]
        art = load(p)
        if day <= asof and col != "serial" and isinstance(art, dict):
            out.append((day, col, art))
    return out


def warn_kind(msg):
    msg = re.sub(r"^(?:[\w.-]+\[\d+\]\s*)+", "", msg)
    msg = re.sub(r"\d[\d,.]*", "N", re.sub(r"「[^」]*」", "「…」", msg))
    return re.split(r"[：:（(；]", msg)[0].strip()[:30]


def warns_of(root, day):
    """用這份版本庫自己的 validate.py 回頭驗一期（不查網址）：{欄: [WARN…]}。出刊當下的 WARN 沒有留紀錄，只能這樣回頭看。"""
    r = run(root, sys.executable, "-B", "scripts/validate.py", day)
    out, col = {}, None
    for ln in (r.stdout if r else "").splitlines():
        m = re.match(r"[✓✗] ([\w-]+)", ln)
        if m:
            col = m.group(1)
            out[col] = []
        elif col and ln.strip().startswith("WARN"):
            out[col].append(ln.strip()[4:].strip())
    out.pop("serial", None)
    return out


def gate(root, asof, weeks, full_day):
    arts = articles(root, asof)
    end = dt.date.fromisoformat(asof)
    sunday = end - dt.timedelta(days=(end.weekday() + 1) % 7)            # 最近一個已過完的週日
    mondays = [str(sunday - dt.timedelta(days=6 + 7 * i)) for i in reversed(range(weeks))]
    if end > sunday:
        mondays.append(str(sunday + dt.timedelta(days=1)))               # 還沒過完的這一週（還沒稽核）
    rows, by_col, kinds = [], {}, {}
    for mon in mondays:
        mine = [(d, c, a) for d, c, a in arts if monday(d) == mon]
        row = {"week": mon, "n": len(mine), "corrected": sum(corrected(a) for _, _, a in mine), "warn_articles": 0, "warns": 0,
               "partial": mon > str(sunday), "audit_warns": 0}
        for day in sorted({d for d, _, _ in mine}):
            for col, ws in warns_of(root, day).items():
                row["audit_warns"] += sum(w.startswith(AUDIT_WARN) for w in ws)
                ws = [w for w in ws if not w.startswith(AUDIT_WARN)]
                row["warn_articles"] += bool(ws)
                row["warns"] += len(ws)
                for w in ws:
                    kinds[warn_kind(w)] = kinds.get(warn_kind(w), 0) + 1
        for _, c, a in mine:
            per = by_col.setdefault(c, {})
            n, k = per.get(mon, (0, 0))
            per[mon] = (n + 1, k + corrected(a))
        if row["n"] or rows:                                              # 創刊前的空週不列
            rows.append(row)
    fills, fills_all = {}, 0
    for d, _, a in arts:
        if a.get("from_reserve"):
            fills_all += 1
            if d >= mondays[0]:
                fills[d] = fills.get(d, 0) + 1
    # 缺報：夜班記在刊期那天；其他班記在它跑的那天（finished_at）
    ran = {}
    for p in sorted(glob.glob(os.path.join(root, "state", "runs", "20??-??-??.json"))):
        for g, rec in (load(p) or {}).items():
            day = os.path.basename(p)[:-5]
            if not g.isdigit() and isinstance(rec, dict) and rec.get("finished_at"):
                day = rec["finished_at"][:10]
            ran.setdefault(g, set()).add(day)
    missing = {}
    day = dt.date.fromisoformat(mondays[0])
    while day <= end and (full_day or day < end):
        for g in DAILY + (["audit"] if day.weekday() == 6 else []):
            if ran.get(g) and min(ran[g]) <= str(day) and str(day) not in ran[g]:
                missing.setdefault(g, []).append(str(day)[5:])
        day += dt.timedelta(days=1)
    # 備稿庫
    stock = []
    for p in sorted(glob.glob(os.path.join(root, "content", "reserve", "*", "*.json"))):
        w = (load(p) or {}).get("reserve_written")
        age = (end - dt.date.fromisoformat(w)).days if isinstance(w, str) and re.match(r"\d{4}-\d{2}-\d{2}$", w) else None
        stock.append([os.path.basename(os.path.dirname(p)) + "/" + os.path.basename(p)[:-5], age])
    shallow = git(root, "rev-parse", "--is-shallow-repository").strip() != "false"   # 歷史不完整就不算「創刊以來」
    ever = None if shallow else len(set(git(root, "log", "--diff-filter=A", "-M", "--name-only", "--format=", "--", "content/reserve").split()))
    return {"weeks": rows, "by_col": by_col, "warn_kinds": kinds, "fills": fills, "fills_all": fills_all,
            "missing": missing, "stock": stock, "reserve_ever": ever}


# ── 輸出 ──
def pct(k, n):
    return "%d%%" % round(100 * k / n) if n else "—"


def delta(now, before):
    if before is None:
        return ""
    return "（＝）" if now == before else "（%s）" % format(now - before, "+,")


def audited(snap):
    """最近一個稽核過的完整週：(被更正, 稿數)。"""
    done = [w for w in snap["gate"]["weeks"] if not w.get("partial") and w["n"]]
    return (done[-1]["corrected"], done[-1]["n"]) if done else (0, 0)


def report(snap, prev, history, src):
    P = print
    r, g, wt = snap["rules"], snap["gate"], snap["writer_tokens"]
    pr = (prev or {}).get("rules", {})
    P("知更鳥體檢　截至 %s（提交 %s）　%s" % (snap["date"], snap["commit"] or "?", "和上次 %s 比" % prev["date"] if prev else "沒有上一次可比"))
    P("\n一、規則量（越少越好）")
    for key, label in (("files", "editorial/ 檔數"), ("rules_bytes", "editorial/ 位元組"), ("README", "　README.md"), ("STYLE", "　STYLE.md"),
                       ("LESSONS", "　LESSONS.md"), ("LESSONS-short", "　LESSONS-short.md"), ("validate_lines", "validate.py 行數"),
                       ("list_words", "validate.py 詞表詞數")):
        P("  %-22s %9s %s" % (label, format(r[key], ","), delta(r[key], pr.get(key))))
    P("  　詞表：" + "、".join("%s %d" % (k, v) for k, v in r["words"].items()))
    if wt:
        top = sorted(wt.items(), key=lambda x: -x[1])
        P("  寫手動筆前必讀（tokens；%s）" % src)
        P("  　最重 %s %s %s、中位數 %s、最輕 %s %s" % (top[0][0], format(top[0][1], ","), delta(top[0][1], (prev or {}).get("writer_max")),
                                                  format(round(statistics.median(wt.values())), ","), top[-1][0], format(top[-1][1], ",")))
        P("  　每欄：" + "、".join("%s %.1fk" % (c, n / 1000) for c, n in top))
    P("\n二、把關成績（最近 %d 個完整週%s；連載不算）" % (sum(not w["partial"] for w in g["weeks"]), "＋本週" if any(w["partial"] for w in g["weeks"]) else ""))
    P("  週一起算   稿數  刊後更正  比例   帶 WARN 的稿  WARN 數")
    for w in g["weeks"]:
        P("  %s  %4d  %6d  %5s  %9d  %7d%s" % (w["week"][5:], w["n"], w["corrected"], pct(w["corrected"], w["n"]), w["warn_articles"], w["warns"],
                                              "  ← 本週還沒稽核" if w["partial"] else ""))
    P("  （WARN 是用現在的 validate.py 回頭驗的；出刊當下帶著幾個，沒有留紀錄。稽核事後加更正框才有的「有更正框…沒有 corrected_at」不算在內，另有 %d 條。）"
      % sum(w.get("audit_warns", 0) for w in g["weeks"]))
    cols = sorted(g["by_col"].items(), key=lambda kv: -sum(k for _, k in kv[1].values()) / max(1, sum(n for n, _ in kv[1].values())))
    P("  每欄刊後更正（" + "｜".join(w["week"][5:] for w in g["weeks"]) + "｜合計）：")
    for c, per in cols:
        n, k = sum(x[0] for x in per.values()), sum(x[1] for x in per.values())
        if k:
            P("  　%-14s %s｜%d/%d %s" % (c, "｜".join("%d/%d" % (per.get(w["week"], (0, 0))[1], per.get(w["week"], (0, 0))[0]) for w in g["weeks"]), k, n, pct(k, n)))
    P("  　其餘 %d 欄沒有被更正。" % sum(1 for _, per in cols if not sum(x[1] for x in per.values())))
    P("  最常帶著出刊的 WARN：" + ("；".join("%s ×%d" % kv for kv in sorted(g["warn_kinds"].items(), key=lambda kv: -kv[1])[:6]) or "沒有"))
    P("  備稿補位：這段期間 %d 天、%d 篇%s；創刊以來 %d 篇。" % (len(g["fills"]), sum(g["fills"].values()),
                                                 "（" + "、".join("%s %d 篇" % (d[5:], n) for d, n in sorted(g["fills"].items())) + "）" if g["fills"] else "", g["fills_all"]))
    P("  缺報（該回報而沒回報的日子）：" + ("" if g["missing"] else "沒有"))
    for grp in DAILY + ["audit"]:
        if grp in g["missing"]:
            P("  　%-6s %d 天：%s" % (GROUP_ZH.get(grp, "第 %s 班" % grp), len(g["missing"][grp]), "、".join(g["missing"][grp])))
    ages = sorted((a for _, a in g["stock"] if a is not None), reverse=True)
    old = [(n, a) for n, a in g["stock"] if a is not None and a >= OLD_DAYS]
    P("  備稿庫：在庫 %d 篇（在庫＝寫了還沒用過）%s；放了 %d 天以上的 %d 篇。" % (
        len(g["stock"]), "，年齡中位數 %d 天、最老 %d 天" % (statistics.median(ages), ages[0]) if ages else "", OLD_DAYS, len(old)))
    if g["reserve_ever"]:
        P("  　創刊以來寫過 %d 篇備稿：補位用掉 %d、還在庫 %d、沒用就刪掉或重寫 %d。" % (
            g["reserve_ever"], g["fills_all"], len(g["stock"]), max(0, g["reserve_ever"] - g["fills_all"] - len(g["stock"]))))
    elif g["reserve_ever"] is None:
        P("  　創刊以來寫過幾篇備稿：算不出（這份版本庫的歷史不完整：淺層 clone 或沒有 git）。")
    P("  　每篇年齡（天）：" + "、".join("%s %s" % (n, "?" if a is None else a) for n, a in sorted(g["stock"], key=lambda x: -(x[1] or 0))))
    P("\n三、預算線（上限寫在 scripts/health.py 檔頭）")
    over = []
    for key, cap in BUDGET.items():
        now = snap["writer_max"] if key == "writer_tokens" else r[key]
        over += [key] if now > cap else []
        P("  %-20s %9s ／ %9s  %s" % (BUDGET_ZH[key], format(now, ","), format(cap, ","), "超出 %s" % format(now - cap, ",") if now > cap else "在線內"))
    if over:
        P("  ✗ 超出預算：%s。要加一條，先刪一條。" % "、".join(BUDGET_ZH[k] for k in over))
    line = history + [snap]
    if len(line) > 1:
        P("\n四、趨勢（state/health/ 裡的歷次體檢＋這一次）")
        P("  日期        規則位元組  檔數  validate行  詞表  寫手最重  剛稽核那週的更正")
        for s in line[-8:]:
            k, n = audited(s)
            P("  %s  %9s  %4d  %9s  %4d  %8s  %d/%d %s" % (s["date"], format(s["rules"]["rules_bytes"], ","), s["rules"]["files"],
                                                         format(s["rules"]["validate_lines"], ","), s["rules"]["list_words"], format(s["writer_max"], ","), k, n, pct(k, n)))
        a, b = line[0], line[-1]
        (k0, n0), (k1, n1) = audited(a), audited(b)
        grew = b["rules"]["rules_bytes"] - a["rules"]["rules_bytes"]
        if n0 and n1:
            r0, r1 = k0 / n0, k1 / n1
            verdict = "規則一直長、更正率沒降：多出來的規則沒有換到更少的更正。" if grew > 0 and r1 >= r0 else \
                      "規則變多，更正率有降。" if grew > 0 else "規則沒有變多。" if r1 >= r0 else "規則沒有變多，更正率也降了。"
            P("  從 %s 到 %s：規則 %+d%%（%s 位元組），更正率 %s → %s。%s" % (
                a["date"], b["date"], round(100 * grew / max(1, a["rules"]["rules_bytes"])), format(grew, "+,"), pct(k0, n0), pct(k1, n1), verdict))
    return over


def main():
    ap = argparse.ArgumentParser(description="知更鳥體檢：規則量、把關成績、預算線")
    ap.add_argument("--root", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))), help="要量的版本庫（預設：這支腳本所在的那一份）")
    ap.add_argument("--as-of", help="量到哪一天為止 YYYY-MM-DD（預設今天，台灣時間；有給就當那天已過完）")
    ap.add_argument("--weeks", type=int, default=4, help="把關成績看幾個完整週（預設 4）")
    ap.add_argument("--health-dir", help="歷次體檢存在哪（預設 <root>/state/health）")
    ap.add_argument("--save", action="store_true", help="把這次的數字存成 <health-dir>/<日期>.json")
    ap.add_argument("--check", action="store_true", help="超出預算線就結束碼 1")
    a = ap.parse_args()
    asof = a.as_of or str(dt.datetime.now(TW).date())
    hdir = a.health_dir or os.path.join(a.root, "state", "health")
    wt, src = writer_tokens(a.root)
    snap = {"date": asof, "commit": git(a.root, "rev-parse", "--short", "HEAD").strip(), "rules": rules(a.root), "writer_tokens": wt,
            "writer_max": max(wt.values()) if wt else 0, "gate": gate(a.root, asof, max(1, a.weeks), bool(a.as_of))}
    history = [s for s in (load(p) for p in sorted(glob.glob(os.path.join(hdir, "20??-??-??.json")))) if s and s.get("date", "") < asof]
    over = report(snap, history[-1] if history else None, history, src)
    if a.save:
        os.makedirs(hdir, exist_ok=True)
        with open(os.path.join(hdir, asof + ".json"), "w", encoding="utf-8") as f:
            json.dump(snap, f, ensure_ascii=False, indent=1, sort_keys=True)
            f.write("\n")
        print("\n已存：%s" % os.path.join(hdir, asof + ".json"))
    return 1 if a.check and over else 0


if __name__ == "__main__":
    sys.exit(main())
