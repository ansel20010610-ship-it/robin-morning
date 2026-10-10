# 知更鳥晨間記事 · Rotkehlchens Morgenblatt

每日台灣時間 07:30 出刊的私人晨報。

## 怎麼運作

```
Claude Code 雲端排程（routines，用 Claude 訂閱額度，不另付 API 費、不需開電腦）
  02:37  第 1 班：晨光裡的一句話、今日古典、牙周經典導讀
  03:37  第 2 班：文明如何運作、副刊 ①
  04:37  第 3 班：副刊 ②③
  05:47  第 4 班：FM 觀測站、迷霧之子與颶光影視化、巴薩晨報、全刊驗收補稿
        │  每篇寫完 → scripts/validate.py 核對 → 直接 push 到 main
        ▼
GitHub Actions（.github/workflows/publish.yml）
        │  產生 content/index.json → 部署 GitHub Pages
        ▼
網站（靜態 PWA）：07:30 前顯示上一期，07:30 起自動翻到當天
```

routine 所用雲端環境的網路存取必須設為 **Full**（已設定）；若用預設的 Trusted，Wikimedia Commons、信望愛聖經、館藏圖庫與新聞、學術來源都會被擋（403 `host_not_allowed`），找圖、經文與查證都會失敗。

- 製刊規則：`editorial/`（文風、格式、圖像守則、各欄規格、製刊手冊）
- 稿件：`content/issues/<日期>/<欄位>.json`
- 欄位設定與副刊輪替：`content/config.json`
- 觀測站基準：`state/watch/`
- 工具：`scripts/`（plan_day、validate、ledger、commons、bible、spotify、build_index）

## 本機預覽

```
python3 -m http.server 8765
```

開 `http://127.0.0.1:8765/?preview` 可在 07:30 前預覽尚未出刊的稿件。

## Spotify

`content/config.json` 的 `spotify.client_id` 是 Spotify Developer App「Wiener Morgen Private」的 Client ID（公開值，不是 secret）。授權回呼網址沿用該 App 已登記的 `https://wiener-morgen-private.duckdns.org/oauth/spotify/callback`，由 `oauth/spotify/callback.html` 接收後轉回 App。
