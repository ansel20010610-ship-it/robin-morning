#!/usr/bin/env python3
"""足球 (Fußball): the football list inside the front page's 外電 strip (the owner, 2026-11-26: opened, the strip's head
reads 外電｜足球 and the title tapped is the list shown). Run at every deploy, after the wires (.github/workflows/publish.yml).

Two feeds, each giving at most its share of its newest items from the last 26 hours (as wire.py): BBC Sport's football
page and Mundo Deportivo's FC Barcelona page. Live-text pages are left out (a title with the word en directo, en vivo,
minuto a minuto or live, or /live/, directo, en-vivo or minuto-a-minuto in the address). Each title, and the first sentence of its description, is put into
Taiwan Traditional Chinese by Claude Sonnet 5.5 (PROMPT below), the newest PER_RUN at a time, and only when may_spend()
finds no reason against it. The previous file is where translations are kept (publish.yml restores it from the Actions
cache, where each deploy leaves it, and only without one fetches the live copy): an item whose address is already in it
keeps that title and lead and is never sent again. An item nobody has translated yet is not shown. A batch whose answer
cannot be used as a whole (a refusal, cut off, not JSON) is sent again item by item in the same run; an item that still
fails, or whose answer does not pass the checks, counts one try, and after GIVE_UP tries it is not sent again. A feed
that cannot be read this time keeps the items it gave last time, as with the wires.

content/football.json:

  {"updated": "...+08:00", "items": [{"src": "BBC", "title": "...", "lead": "...", "url": "...", "time": "...+08:00"}],
   "spend": {"cycle": "2026-11-10T00:00:00+00:00", "usd": 0.41, "calls": 37}, "tried": {"https://...": 1}}

newest first, at most MAX_ITEMS; "updated" is the half hour of the read, as in wire.json. "spend" is what the
translations have cost in the current credit cycle (api_shift.cycle(); the cycle's start names it): a deploy commits
nothing, so the running total rides on this file from one deploy to the next, and starts again at 0 with a new cycle.
It is not in state/api/spend.json; the caps are read from api_shift.py and checked against both. A request that got no
answer (a timeout, no connection) may still have been billed: it is counted at NO_ANSWER_USD. "tried" holds the failed
tries of items not translated yet, for addresses still inside the window.

Environment (publish.yml sets them): FOOTBALL_TRANSLATE=1 on the half-hourly deploys only; ANTHROPIC_API_KEY;
FOOTBALL_PREV = ok | missing | error: ok for a cache copy that reads, else what fetching the live file gave (200, 404,
anything else). A deploy that is not a half-hourly one and has a good previous file does not run this at all. Nothing
here stops a deploy: whatever goes wrong with the translation is a warning, and the items already translated stay.

Usage: python3 scripts/football.py      (translating needs: pip install anthropic)
"""
import datetime as dt
import json
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, TW  # noqa: E402  (UA: wire.fetch sends it)
import api_shift  # noqa: E402
from wire import clean, fetch, items_of, when  # noqa: E402

OUT = os.path.join(CONTENT, "football.json")
# (name shown on the strip, feed, how many of its newest items to take)
SOURCES = [
    ("BBC", "https://feeds.bbci.co.uk/sport/football/rss.xml", 6),
    ("世界體育報", "https://www.mundodeportivo.com/rss/futbol/fc-barcelona.xml", 6),
]
MAX_ITEMS = 12
WINDOW = dt.timedelta(hours=26)  # as wire.py: the night's football is still news at 07:30
LIVE = re.compile(r"\b(?:en directo|en vivo|minuto a minuto|live)\b", re.I)  # whole words: Liverpool is not live
# The address too: a live page keeps its address when its title changes at the whistle (2026-11-26 02:30: the Sabah
# match page, retitled, went through on its title alone).
LIVE_URL = re.compile(r"/live/|[/-](?:directo|en-vivo|minuto-a-minuto)(?=[/.-]|$)", re.I)
PER_RUN = 8         # items sent in one run at most, the newest first; the rest wait for the next half hour
GIVE_UP = 2         # failed tries after which an item is not sent again
T0 = time.monotonic()   # when this run began
ONE_BY_ONE_S = 90       # seconds into the run after which no more items are sent one by one
CYCLE_MAX = 20.0    # USD the football may spend in one credit cycle: a runaway guard only (a normal cycle: 4.5–11, review 2026-11-26)
MODEL = "claude-sonnet-5-5"
MAX_TOKENS = 8000
# USD per million tokens (input, output) — the only place they are written. Cache writes and reads count as input.
SONNET = "claude-sonnet-5"  # any model whose name starts so (Sonnet 5.5, Sonnet 5 as its fallback) is priced PRICE
PRICE = (2.0, 10.0)
PRICE_OTHER = (8.0, 40.0)   # anything else a fallback handed the request to: counted high
NO_ANSWER_USD = 0.04        # a request that got no answer (timeout, no connection), counted at this estimate
TITLE_MAX = 40
LEAD_MAX = 90

PROMPT = """你是台灣一份私人晨報的外電編譯，把英文、西班牙文的足球新聞譯成台灣繁體中文，放在首頁的足球快訊。讀者是台灣的巴薩球迷，但不一定認識每個球員。輸入是 JSON 陣列，每則有 i、title、desc。每則輸出 i、title、lead。

- title：一行，最多 28 字，直述「誰、怎麼了」。原標題故弄玄虛（只說「下一步」「表態」「預感成真」之類）時，用 desc 裡的事實寫成直述句。不加原文沒有的事實、評語或驚嘆號。
- lead：desc 第一句的意思，最多 60 字；desc 空白就給空字串。desc 若在句中被截斷，只寫確定的部分，不要猜後面。
- 不寫相對時間（今天、今晚、明天、昨天、本週、下週末、今天下午等）：原文的時間是西班牙或英國當地說法，讀者在台灣。原文有明確日期才寫「11 月 29 日」這種寫法，否則省略。
- 用台灣體育媒體的通行寫法：巴薩、皇馬、馬競、曼聯、曼城、利物浦、兵工廠、切爾西、熱刺、拜仁；歐冠、西甲、英超、德甲、義甲、青年歐冠；紅牌說「紅牌罰下」。人名用台灣常見譯法（Flick 弗里克、Fermín López 費爾明、Lamine Yamal 亞馬爾、Lewandowski 萊萬多夫斯基、Pedri 佩德里、Joan Garcia 霍安·加西亞、Bellingham 貝林漢、Raheem Sterling 斯特林）；冷門人名拿不準就保留原文拼法。球隊也一樣：沒有台灣通行中文名的球隊（尤其冷門的外國球隊）保留原文拼法，不要意譯或自己音譯（例如 Sabah 不要寫成「巴庫海洋」）。
- 比分寫成「3:2」。"""
SCHEMA = {
    "type": "object",
    "properties": {"items": {"type": "array", "items": {
        "type": "object",
        "properties": {"i": {"type": "integer"}, "title": {"type": "string"}, "lead": {"type": "string"}},
        "required": ["i", "title", "lead"], "additionalProperties": False}}},
    "required": ["items"], "additionalProperties": False,
}


def utcnow():
    return dt.datetime.now(dt.timezone.utc)


def read(name, url, now):
    """Every item of one feed from the last WINDOW, newest first, live-text pages left out, still in the original."""
    got, seen = [], set()
    for title, link, desc, date in items_of(fetch(url)):
        t, d, link = clean(title), when(date), (link or "").strip()
        if not t or not link.startswith("https://") or not d or now - d > WINDOW or d - now > dt.timedelta(hours=1):
            continue
        if LIVE.search(t) or LIVE_URL.search(link) or link in seen:
            continue
        seen.add(link)
        got.append({"src": name, "title": t, "desc": clean(desc), "url": link,
                    "time": d.astimezone(TW).isoformat(timespec="minutes")})
    got.sort(key=lambda x: x["time"], reverse=True)
    return got


def load_prev():
    """(the previous file, "ok") — or (None, "none") when there is none, (None, "bad") when it cannot be read."""
    try:
        with open(OUT, encoding="utf-8") as f:
            d = json.load(f)
    except FileNotFoundError:
        return None, "none"
    except (OSError, ValueError):
        return None, "bad"
    if not isinstance(d, dict) or not isinstance(d.get("items", []), list):
        return None, "bad"
    return d, "ok"


def spend_of(prev, start):
    """This cycle's running total from the previous file: 0 when it was another cycle's (or there was none)."""
    s, cycle = (prev or {}).get("spend"), start.isoformat()
    if not isinstance(s, dict) or s.get("cycle") != cycle:
        return {"cycle": cycle, "usd": 0.0, "calls": 0}
    try:
        return {"cycle": cycle, "usd": float(s.get("usd") or 0), "calls": int(s.get("calls") or 0)}
    except (TypeError, ValueError):
        return {"cycle": cycle, "usd": 0.0, "calls": 0}


def in_window(item, now):
    try:
        return now - dt.datetime.fromisoformat(item["time"]) <= WINDOW
    except (KeyError, TypeError, ValueError):
        return False


def may_spend(spent, state, now):
    """None when this run may call the API, else why not. Every condition has to hold."""
    if os.environ.get("FOOTBALL_TRANSLATE") != "1":
        return "只在每半小時那次部署翻（FOOTBALL_TRANSLATE 沒設）"
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return "沒有 ANTHROPIC_API_KEY"
    got = os.environ.get("FOOTBALL_PREV", "")
    if got not in ("ok", "missing"):
        return "線上那份抓不到（FOOTBALL_PREV=%s）：不知道翻過哪些、本期花了多少" % (got or "沒設")
    if state == "bad" or (got == "ok" and state != "ok"):
        return "線上那份抓到了卻讀不懂：不知道翻過哪些、本期花了多少"
    # Not SOFT_CAP and no QUIET_HOURS pause: the owner, 2026-11-26, 我不希望有停的. The football stops only where every
    # shift does (MONTH_CAP); on a cycle's first day, before the new grant shows, it may take a few cents of the balance.
    try:
        month = api_shift.month_total(t=now)
    except Exception as e:  # noqa: BLE001 — a ledger that cannot be read is no reason to guess
        return "讀不到 API 班次的帳（%s）" % type(e).__name__
    if month + spent >= api_shift.MONTH_CAP:
        return "本期 API 班次 %.2f 加足球 %.2f 美元，到了 %.0f 的線" % (month, spent, api_shift.MONTH_CAP)
    if spent >= CYCLE_MAX:
        return "本期足球已花 %.2f 美元，到了 %.0f 的上限" % (spent, CYCLE_MAX)
    return None


def tokens(u):
    """(input, output) tokens of a usage object; cache writes and reads count as input."""
    n_in = sum(getattr(u, k, 0) or 0 for k in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
    return n_in, getattr(u, "output_tokens", 0) or 0


def bill_of(resp):
    """What one answer cost: {"in", "out", "usd", "model"}."""
    n_in, n_out = tokens(resp.usage)
    # After a fallback the top-level usage covers only the attempt that answered; usage.iterations lists every attempt.
    steps = getattr(resp.usage, "iterations", None) or []
    if steps:
        n_in = max(n_in, sum(tokens(s)[0] for s in steps))
        n_out = max(n_out, sum(tokens(s)[1] for s in steps))
    p_in, p_out = PRICE if str(resp.model or "").startswith(SONNET) else PRICE_OTHER
    return {"in": n_in, "out": n_out, "usd": (n_in * p_in + n_out * p_out) / 1e6, "model": resp.model}


class NoAnswer(Exception):
    """The request timed out or could not connect: no answer, though it may still have been billed."""


def translate(batch):
    """Ask Claude for the batch ([{"title", "desc"}, ...]) in one request. Returns (got, bill, why): got maps a batch
    index to {"title", "lead"} for each answer that passed the checks; bill is what the answer cost; why is "" or what
    was wrong with the answer as a whole. Raises NoAnswer on a timeout or no connection; anything else that goes wrong
    raises as it is (nothing is billed for either here)."""
    import anthropic  # here, not at the top: without the package (Python 3.9 at home) the rest still runs
    client = anthropic.Anthropic(timeout=60.0, max_retries=1)
    ask = json.dumps([{"i": k, "title": b["title"], "desc": b["desc"]} for k, b in enumerate(batch)], ensure_ascii=False)
    args = dict(model=MODEL, max_tokens=MAX_TOKENS, system=PROMPT, messages=[{"role": "user", "content": ask}],
                output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}})
    try:
        try:
            resp = client.beta.messages.create(betas=["server-side-fallback-2026-07-01"], fallbacks="default", **args)
        except (anthropic.BadRequestError, TypeError) as e:  # a 400, or an SDK that does not take these arguments
            print("::warning::足球：帶退路模型的請求被拒（%s），不帶再問一次" % str(getattr(e, "message", e))[:200])
            resp = client.messages.create(**args)
    except (anthropic.APITimeoutError, anthropic.APIConnectionError) as e:
        raise NoAnswer("%s: %s" % (type(e).__name__, str(e)[:200]))
    bill = bill_of(resp)
    if resp.stop_reason in ("refusal", "max_tokens"):
        return {}, bill, "stop_reason=%s" % resp.stop_reason
    try:
        answer = json.loads(next(b.text for b in resp.content if b.type == "text"))
    except (StopIteration, ValueError):
        return {}, bill, "回答不是 JSON"
    got = {}
    for a in answer.get("items", []) if isinstance(answer, dict) else []:
        if not isinstance(a, dict):
            continue
        i, title, lead = a.get("i"), a.get("title"), a.get("lead")
        if type(i) is not int or not 0 <= i < len(batch) or i in got or not isinstance(title, str) or not isinstance(lead, str):
            continue
        title, lead = title.strip(), lead.strip()
        if title and len(title) <= TITLE_MAX and len(lead) <= LEAD_MAX:
            got[i] = {"title": title, "lead": lead}
    return got, bill, ""


def tries_of(prev):
    """The previous file's failed tries, {address: count}; anything unreadable counts as none."""
    t = (prev or {}).get("tried")
    if not isinstance(t, dict):
        return {}
    return {u: n for u, n in t.items() if isinstance(u, str) and type(n) is int and n > 0}


def main():
    now = utcnow()
    prev, state = load_prev()
    spend = spend_of(prev, api_shift.cycle(now)[0])
    tried = tries_of(prev)
    known = {i["url"]: i for i in (prev or {}).get("items", []) if isinstance(i, dict) and i.get("url") and i.get("title")}
    fresh, failed, window = [], [], set()
    for name, url, take in SOURCES:
        try:
            got = read(name, url, now)
        except Exception as e:  # noqa: BLE001 — one feed down must not stop the other
            failed.append(name)
            print("%s: %s" % (name, e), file=sys.stderr)
            # keep what it gave last time, while still within the window
            fresh += [dict(i, desc="") for i in known.values() if i.get("src") == name and in_window(i, now)]
            continue
        window |= {i["url"] for i in got}
        fresh += got[:take]
    kept, todo, dropped = [], [], 0
    for i in sorted(fresh, key=lambda x: x["time"], reverse=True):
        k = known.get(i["url"])
        if k:
            kept.append({"src": i["src"], "title": k["title"], "lead": k.get("lead") or "", "url": i["url"], "time": i["time"]})
        elif tried.get(i["url"], 0) >= GIVE_UP:
            dropped += 1  # tried GIVE_UP times already: not sent again
        else:
            todo.append(i)
    batch, got, misses, bills, notes = todo[:PER_RUN], {}, [], [], []
    why = (may_spend(spend["usd"], state, now) or "") if todo else "沒有新稿"
    asked = bool(todo) and not why

    def ask(items):
        """One request, its cost booked: (got, what was wrong with the answer as a whole or "")."""
        g, bill, w = translate(items)
        spend["usd"] = round(spend["usd"] + bill["usd"], 6)
        spend["calls"] += 1
        bills.append(bill)
        return g, w

    if asked:
        try:
            g, w = ask(batch)
            if not w or len(batch) == 1:  # (a batch of one was that item's own try)
                got = g
                misses = [k for k in range(len(batch)) if k not in g]
                if w:
                    notes.append("沒用上（%s）" % w)
            else:  # the batch as a whole could not be used: each item once on its own, so one item cannot hold the rest
                notes.append("整批沒用上（%s），逐則再送" % w)
                for k, b in enumerate(batch):
                    if time.monotonic() - T0 > ONE_BY_ONE_S:  # publish.yml stops the run at 150 s, and then nothing is kept
                        notes.append("時間到，其餘下次再送")
                        break
                    g1, _ = ask([b])
                    if 0 in g1:
                        got[k] = g1[0]
                    else:
                        misses.append(k)
        except NoAnswer as e:  # no answer, but perhaps billed: counted at the estimate; nothing more is sent this run
            spend["usd"] = round(spend["usd"] + NO_ANSWER_USD, 6)
            spend["calls"] += 1
            notes.append("沒有回應（%s），按估計記 %.2f 美元" % (e, NO_ANSWER_USD))
            print("::warning::足球：%s" % notes[-1])
        except Exception as e:  # noqa: BLE001 — the items already translated stay, nothing else changes
            notes.append("翻譯失敗（%s: %s）" % (type(e).__name__, str(e)[:200]))
            print("::warning::足球：%s，沿用上一版" % notes[-1])
        for k in misses:  # an answer came for it and did not pass: one try
            tried[batch[k]["url"]] = tried.get(batch[k]["url"], 0) + 1
        if misses:
            notes.append("%d 則沒譯成，記一次" % len(misses))
    new = [{"src": b["src"], "title": got[k]["title"], "lead": got[k]["lead"], "url": b["url"], "time": b["time"]}
           for k, b in enumerate(batch) if k in got]
    # tries are kept only for what is still in the feeds' window and not translated (all of them when a feed was not read)
    done = {n["url"] for n in new}
    tried = {u: n for u, n in tried.items() if u not in done and (u in window or failed)}
    out = sorted(kept + new, key=lambda x: x["time"], reverse=True)[:MAX_ITEMS]
    line = "足球：沿用 %d 則、新翻 %d 則" % (len([i for i in out if i not in new]), len(new))
    if bills:
        line += "；%d 次請求，輸入 %d／輸出 %d token（%s），這次 %.4f 美元" % (
            len(bills), sum(b["in"] for b in bills), sum(b["out"] for b in bills),
            "、".join(sorted({str(b["model"]) for b in bills})), sum(b["usd"] for b in bills))
    if notes:
        line += "；" + "；".join(notes)
    if why:
        line += "；%s%s" % ("沒翻：" if todo else "", why)
    if asked and len(todo) > PER_RUN:
        line += "；另有 %d 則等下次" % (len(todo) - PER_RUN)
    if dropped:
        line += "；%d 則試過 %d 次，不再送" % (dropped, GIVE_UP)
    line += "；本期足球累計 %.4f 美元（%d 次）" % (spend["usd"], spend["calls"])
    if failed:
        line += "；讀不到：%s" % "、".join(failed)
    print(line)
    # Nothing to show and nothing to keep: no file. One that is there but unreadable is written over, or every later
    # run would find it unreadable again and never translate.
    if not out and state == "none" and not spend["calls"] and not tried:
        print("足球：沒有可放的稿，content/football.json 不寫")
        return 1 if len(failed) == len(SOURCES) else 0
    # "updated" is the half hour of this read, whichever deploy ran it, as in wire.json
    t = now.astimezone(TW)
    data = {"updated": t.replace(minute=t.minute // 30 * 30).isoformat(timespec="minutes"), "items": out, "spend": spend,
            "tried": tried}
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, OUT)
    return 1 if len(failed) == len(SOURCES) else 0

if __name__ == "__main__":
    sys.exit(main())
