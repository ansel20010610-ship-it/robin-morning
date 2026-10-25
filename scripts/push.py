#!/usr/bin/env python3
"""出刊通知: tell the reader's phone that the day's issue is out (Web Push; no AI, no paid service).

notify.yml runs this at 07:30 Taiwan time; the device's own push service (Apple's, for the iPhone home-screen app)
delivers it. Sending needs the VAPID private key in the VAPID_PRIVATE_KEY secret; its public half is
content/config.json → push.key. The devices are listed in state/push/devices.json: on the phone, 設定 → 出刊通知 →
複製裝置代碼, then `add` that code, commit and push; notify.yml sends the new device a test notification.

  python3 scripts/push.py add <裝置代碼> [--name iPhone]
  python3 scripts/push.py issue [--date YYYY-MM-DD] [--now]   waits for 07:30 and for the live site, unless --now
  python3 scripts/push.py test [--new-since <git rev>]          only devices added since that commit
  python3 scripts/push.py keys <private-key.pem>                a new key pair: every device must subscribe again

`add` needs only the standard library; the others need pywebpush (notify.yml installs it).
"""
import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, UA, load_config, tw_now  # noqa: E402

DEVICES = os.path.join(ROOT, "state", "push", "devices.json")
SITE = "https://wiener-morgen-private.duckdns.org/"
SEND_AT = (7, 30, 20)  # just after 07:30, so an app whose clock runs a little slow already shows the new issue
TOO_LATE = (11, 0)     # a run GitHub starts this late sends nothing: the morning is over
WAIT_SITE = 45 * 60    # seconds to wait for the live site to carry today's issue
WAIT_DEPLOY = 10 * 60  # seconds to wait for a deploy still running at 07:30 (e.g. a late reserve fill)
TTL = 4 * 3600         # a phone that is switched off still gets the notice within this time
SHORT = {"football": "巴薩", "perio": "牙周", "music": "古典", "civilization": "文明", "devotion": "晨光"}


def endpoint_hash(endpoint):
    """What index.json lists (build_index.py), so the app's settings page can tell this device is on the list."""
    return hashlib.sha256(endpoint.encode()).hexdigest()[:16]


def load_devices():
    if not os.path.exists(DEVICES):
        return []
    with open(DEVICES, encoding="utf-8") as f:
        return json.load(f).get("devices") or []


def save_devices(devs):
    os.makedirs(os.path.dirname(DEVICES), exist_ok=True)
    with open(DEVICES, "w", encoding="utf-8") as f:
        json.dump({"devices": devs}, f, ensure_ascii=False, indent=2)
        f.write("\n")


def decode_code(code):
    """裝置代碼 = "RMP1." + base64url(PushSubscription.toJSON()), made by assets/notify.js."""
    code = "".join(code.split())
    if not code.startswith("RMP1."):
        sys.exit("裝置代碼不正確：應以 RMP1. 開頭")
    raw = code[5:]
    try:
        sub = json.loads(base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4)))
    except ValueError as e:
        sys.exit("裝置代碼不正確：%s" % e)
    ep, keys = sub.get("endpoint"), sub.get("keys") or {}
    if not (isinstance(ep, str) and ep.startswith("https://") and keys.get("p256dh") and keys.get("auth")):
        sys.exit("裝置代碼不完整，請在 App 裡重新複製")
    return {"endpoint": ep, "keys": {"p256dh": keys["p256dh"], "auth": keys["auth"]}}


def send(devs, payload):
    """Send to every device. Returns 0 when it reached one, or when nothing is left to retry."""
    from py_vapid import Vapid
    from pywebpush import WebPushException, webpush
    pem = os.environ.get("VAPID_PRIVATE_KEY", "").strip()
    if not pem:
        sys.exit("::error::缺少 VAPID_PRIVATE_KEY（GitHub → Settings → Secrets and variables → Actions）")
    key = Vapid.from_pem(pem.encode())
    data = json.dumps(payload, ensure_ascii=False)
    sent, dead, failed = 0, [], 0
    for d in devs:
        try:
            # a fresh claims dict each time: webpush() writes this endpoint's origin into it as "aud"
            webpush(d["subscription"], data, vapid_private_key=key, vapid_claims={"sub": SITE.rstrip("/")},
                    ttl=TTL, headers={"Urgency": "high"}, timeout=30)
            sent += 1
            print("已送出：%s" % d["name"])
        except WebPushException as e:
            status = getattr(e.response, "status_code", None)
            if status in (404, 410):  # the app was removed, or notifications were turned off on the device
                dead.append(d["subscription"]["endpoint"])
                print("::warning::%s 已失效（%s），從名單移除" % (d["name"], status))
            else:
                failed += 1
                print("::error::%s 送不出去：%s" % (d["name"], str(e).splitlines()[0]))
        except Exception as e:  # noqa: BLE001 — network trouble: count it and try the other devices
            failed += 1
            print("::error::%s 送不出去：%s: %s" % (d["name"], type(e).__name__, e))
    if dead:
        save_devices([d for d in load_devices() if d["subscription"]["endpoint"] not in dead])
    return 0 if sent or not failed else 1


def fetch(path):
    req = urllib.request.Request("%s%s?t=%d" % (SITE, path, time.time()), headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8")


def main_head():
    """The newest commit on main right now (the checkout is from when the run started)."""
    out = subprocess.run(["git", "ls-remote", "origin", "refs/heads/main"], cwd=ROOT, capture_output=True, text=True, timeout=60)
    return out.stdout.split()[0] if out.returncode == 0 and out.stdout else None


def issue_payload(cfg, issue):
    """Title: the issue number. Body: the lead headline, what else is in, and how long the three-sentence briefs take
    (the same estimate as the front page's 今日摘要)."""
    cols = cfg["columns"]
    group = lambda a: cols.get(a["column"], {}).get("group", "supplement")  # noqa: E731
    mains = sorted((a for a in issue["articles"] if group(a) == "main"), key=lambda a: cols[a["column"]].get("order", 9))
    supps = [a for a in issue["articles"] if group(a) == "supplement"]
    if not mains and not supps:
        return None
    lead = (mains or supps)[0]
    rest = "、".join(SHORT.get(a["column"], cols[a["column"]]["name"]) for a in mains[1:])
    n_supp = len(supps) - (0 if mains else 1)
    if n_supp:
        rest += ("，" if rest else "") + "副刊 %d 篇" % n_supp
    chars = sum(len(a.get("brief") or "") for a in issue["articles"])
    lines = [lead["title"], ("還有" + rest) if rest else ""]
    lines.append("每篇三句話，約 %d 分鐘讀完" % max(1, int(chars / 330 + 0.5)) if chars else "今天共 %d 篇" % len(issue["articles"]))
    return {"title": "今天的晨報到了・第 %d 期" % issue["no"], "body": "\n".join(x for x in lines if x),
            "url": "./#/", "tag": "issue-" + issue["date"], "badge": 1}


def cmd_issue(a):
    devs = load_devices()
    if not devs:
        print("沒有登記的裝置，不發通知。")
        return 0
    cfg = load_config()
    now = tw_now()
    date = a.date or now.date().isoformat()
    if not a.now:
        if (now.hour, now.minute) >= TOO_LATE:
            print("已過 %02d:%02d，今天不再發出刊通知。" % TOO_LATE)
            return 0
        at = now.replace(hour=SEND_AT[0], minute=SEND_AT[1], second=SEND_AT[2], microsecond=0)
        if now < at:
            print("等到 %s 再發……" % at.strftime("%H:%M:%S"), flush=True)
            time.sleep((at - now).total_seconds())
    # Send what the reader will see: today's issue on the live site, after the newest deploy if one is still running.
    start, payload = time.time(), None
    while True:
        try:
            issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
            payload = issue and issue_payload(cfg, issue)
            current = payload and fetch("content/version.txt").strip() == main_head()
        except Exception as e:  # noqa: BLE001
            print("讀不到網站：%s" % e, flush=True)
            current = False
        waited = time.time() - start
        if current or (payload and waited >= WAIT_DEPLOY) or a.now and payload:
            break
        if waited >= WAIT_SITE or a.now:
            print("::error::網站上還沒有 %s 的刊期，沒有發通知" % date)
            return 1
        time.sleep(30)
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_test(a):
    devs = load_devices()
    if a.new_since:
        old = subprocess.run(["git", "show", "%s:state/push/devices.json" % a.new_since], cwd=ROOT, capture_output=True, text=True)
        try:
            seen = {d["subscription"]["endpoint"] for d in json.loads(old.stdout).get("devices") or []} if old.returncode == 0 else set()
        except ValueError:
            seen = set()
        devs = [d for d in devs if d["subscription"]["endpoint"] not in seen]
    if not devs:
        print("沒有新加入的裝置。")
        return 0
    return send(devs, {"title": "出刊通知已開啟", "body": "之後每天台灣時間 07:30，新的一期一到就會通知你。", "url": "./#/", "tag": "test"})


def cmd_add(a):
    sub = decode_code(a.code)
    devs = load_devices()
    again = any(d["subscription"]["endpoint"] == sub["endpoint"] for d in devs)
    devs = [d for d in devs if d["subscription"]["endpoint"] != sub["endpoint"]]
    devs.append({"name": a.name, "added": tw_now().date().isoformat(), "subscription": sub})
    save_devices(devs)
    print("%s %s（%s），共 %d 台裝置。" % ("已更新" if again else "已加入", a.name, endpoint_hash(sub["endpoint"]), len(devs)))
    if not again:
        print("commit 並推送 state/push/devices.json 後，notify.yml 會送它一則測試通知。")
    return 0


def cmd_keys(a):
    from cryptography.hazmat.primitives import serialization
    from py_vapid import Vapid
    v = Vapid()
    v.generate_keys()
    v.save_key(a.out)
    os.chmod(a.out, 0o600)
    raw = v.public_key.public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    print("私鑰寫在 %s（放進 VAPID_PRIVATE_KEY secret，不要 commit）" % a.out)
    print("config.json → push.key：%s" % base64.urlsafe_b64encode(raw).decode().rstrip("="))
    return 0


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("add")
    s.add_argument("code")
    s.add_argument("--name", default="iPhone")
    s = sub.add_parser("issue")
    s.add_argument("--date")
    s.add_argument("--now", action="store_true", help="send at once (manual run)")
    s = sub.add_parser("test")
    s.add_argument("--new-since")
    s = sub.add_parser("keys")
    s.add_argument("out")
    a = p.parse_args()
    return {"add": cmd_add, "issue": cmd_issue, "test": cmd_test, "keys": cmd_keys}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
