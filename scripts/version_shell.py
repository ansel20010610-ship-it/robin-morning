#!/usr/bin/env python3
"""Version the assembled site's app shell (publish.yml runs this on _site/ before uploading).

1. The shell hash (index.html, manifest, assets/*) names the service worker's cache, so sw.js changes only when
   the shell does.
2. Every module import and the app.js / style.css links get `?v=<hash>`. GitHub Pages lets browsers reuse each file
   for ten minutes; without versioned URLs a browser not yet under the service worker could pair a new app.js with a
   cached old spotify.js, and a missing export stops the whole app on its loading line.

Usage: python3 scripts/version_shell.py _site
"""
import glob
import hashlib
import os
import re
import sys

IMPORT = re.compile(r'(\bfrom\s+"\./[\w-]+\.js)(")')
LINKS = [(re.compile(r'(src="assets/app\.js)(")'), "app.js"), (re.compile(r'(href="assets/style\.css)(")'), "style.css")]


def main(site):
    shell = [os.path.join(site, "index.html"), os.path.join(site, "manifest.webmanifest")]
    shell += sorted(p for p in glob.glob(os.path.join(site, "assets", "*")) if os.path.isfile(p))
    h = hashlib.sha256()
    for p in shell:
        with open(p, "rb") as f:
            h.update(f.read())
    v = h.hexdigest()[:12]

    sw = os.path.join(site, "sw.js")
    text = open(sw, encoding="utf-8").read()
    if "__SHELL_HASH__" not in text:
        sys.exit("sw.js has no __SHELL_HASH__ placeholder")
    open(sw, "w", encoding="utf-8").write(text.replace("__SHELL_HASH__", v))

    for p in glob.glob(os.path.join(site, "assets", "*.js")):
        text = open(p, encoding="utf-8").read()
        new, n = IMPORT.subn(r"\1?v=%s\2" % v, text)
        if re.search(r'\bimport\b[^;]*?from\s+"\./[\w-]+\.js"', new):
            sys.exit("%s: an import was left unversioned" % p)
        open(p, "w", encoding="utf-8").write(new)

    index = os.path.join(site, "index.html")
    text = open(index, encoding="utf-8").read()
    for rx, name in LINKS:
        text, n = rx.subn(r"\1?v=%s\2" % v, text)
        if n != 1:
            sys.exit("index.html: expected one link to %s, found %d" % (name, n))
    open(index, "w", encoding="utf-8").write(text)
    print("shell version", v)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "_site")
