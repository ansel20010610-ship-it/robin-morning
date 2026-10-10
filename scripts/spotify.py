#!/usr/bin/env python3
"""Find Spotify IDs for a recording (needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars).

Usage:
  python3 scripts/spotify.py search "Brahms Symphony 4 Kleiber"
  python3 scripts/spotify.py album <albumId>
Without credentials, only fill spotify.query / artist_hint / track_filter in the article; never guess IDs.
"""
import base64
import json
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import http_get  # noqa: E402


def token():
    cid, sec = os.environ.get("SPOTIFY_CLIENT_ID"), os.environ.get("SPOTIFY_CLIENT_SECRET")
    if not cid or not sec:
        return None
    auth = base64.b64encode(("%s:%s" % (cid, sec)).encode()).decode()
    _, _, raw = http_get("https://accounts.spotify.com/api/token", data=b"grant_type=client_credentials",
                         headers={"Authorization": "Basic " + auth,
                                  "Content-Type": "application/x-www-form-urlencoded"}, method="POST")
    return json.loads(raw)["access_token"]


API = "https://api.spotify.com/v1"


def get(tok, path, **params):
    url = API + path + ("?" + urllib.parse.urlencode(params) if params else "")
    _, _, raw = http_get(url, headers={"Authorization": "Bearer " + tok})
    return json.loads(raw)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    tok = token()
    if not tok:
        print("未設定 SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET。請在稿件只填 query、artist_hint、track_filter。")
        return 2
    cmd, arg = sys.argv[1], sys.argv[2]
    if cmd == "search":
        d = get(tok, "/search", q=arg, type="album", limit=10, market="TW")
        for al in d.get("albums", {}).get("items", []):
            print("%s  %s ｜ %s ｜ %s ｜ %d 軌" % (al["id"], al["name"], ", ".join(a["name"] for a in al["artists"]),
                                              al.get("release_date", ""), al.get("total_tracks", 0)))
    elif cmd == "album":
        al = get(tok, "/albums/" + arg, market="TW")
        print("%s ｜ %s ｜ %s" % (al["name"], ", ".join(a["name"] for a in al["artists"]), al.get("release_date")))
        # The album object holds only the first 50 tracks; box sets need the following pages too.
        items, nxt = list(al["tracks"]["items"]), al["tracks"].get("next")
        while nxt and nxt.startswith(API):
            page = get(tok, nxt[len(API):])  # next is an absolute URL; get() adds the API base itself
            items += page["items"]
            nxt = page.get("next")
        discs = any(t.get("disc_number", 1) > 1 for t in items)  # box sets restart track numbers per disc
        for t in items:
            no = "%d-%02d" % (t.get("disc_number", 1), t["track_number"]) if discs else "%2d" % t["track_number"]
            print("  %s  %s  %s  (%d:%02d)" % (no, t["id"], t["name"],
                                             t["duration_ms"] // 60000, t["duration_ms"] // 1000 % 60))
        print("共 %d 軌" % len(items))
    else:
        print(__doc__)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
