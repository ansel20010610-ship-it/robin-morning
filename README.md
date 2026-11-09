# 知更鳥晨間記事 · Rotkehlchens Morgenblatt

每日台灣時間 07:30 出刊的私人晨報。

## 怎麼運作

```
Claude Code 雲端排程（routines，Opus 5.5，用 Claude 訂閱額度，不另付 API 費、不需開電腦）
  00:37  第 1 班：一段經文，一篇禱告、燈暗下來，聽一首名曲（古典）、診間裡站得住的證據（牙周）
  01:37  第 2 班：當日副刊 ①（週一、三另加副刊 ③）
  02:37  第 3 班：副刊 ②、巴薩晨報（諾坎普散場之後）初稿
  05:17  第 4 班：兩個觀測站、巴薩晨報更新、天亮以前，世界與台灣（快訊）、全刊驗收補稿
  06:27  第 5 班：安全網——平行補寫一切缺稿、巴薩晨報最後更新（07:05 停手，接著備稿補位）
  17:37  備稿班：今天的快訊缺了就先補寫；再把備稿庫補到正刊每欄 2 篇、副刊每欄 1 篇（缺 form／voice、有機器腔的先修）
  週日 19:07  品質稽核：抽查過去 7 期，事實錯誤加「更正」，反覆出現的問題寫進 editorial/LESSONS.md（寫手讀一條一行的 LESSONS-short.md）
        │  每篇：寫稿 → 獨立審稿子代理查核 → 修正 → scripts/validate.py → 直接 push 到 main
        │  每班結束寫一筆班次回報（state/runs/<日期>.json）；只在需要社長處理時才發手機通知
        ▼
GitHub Actions
  publish.yml  每次 push：產生 content/index.json 與搜尋資料 → 替程式檔網址加版本號 → 部署 GitHub Pages
  fill.yml     07:12（必要時 07:22）：仍缺稿的欄位自動以備稿補上（不經 AI）；由 wire.yml 的接力在 07:00 準時啟動，GitHub 的 cron 只是備援
               （GitHub 排程實測常晚 10–15 分鐘，實際約 07:25–07:35；第一道補位是第 5 班自己在 07:05 執行，這裡是獨立平台上的第二道）
  watch.yml    07:45（同樣由接力啟動）：缺稿、驗證失敗、有班次沒回報、或網站不是最新版 → 開 GitHub issue（寄 email 通知）
        ▼
網站（靜態 PWA）：07:30 前顯示上一期，07:30 起自動翻到當天；讀過的文章、圖片與字型存在手機上，離線也能讀
```

routine 所用雲端環境的網路存取必須設為 **Full**（已設定）；若用預設的 Trusted，Wikimedia Commons、信望愛聖經、館藏圖庫與新聞、學術來源都會被擋（403 `host_not_allowed`），找圖、經文與查證都會失敗。

- 製刊規則：`editorial/`（文風、格式、圖像守則、各欄規格、製刊手冊、備稿庫）
- 特供版：設定裡輸入代碼才開的功能（目前是巢）。config.json `sonder.hash` 是代碼的 SHA-256（大寫、只留英數）；換代碼：`python3 -c "import hashlib;print(hashlib.sha256('新代碼大寫去符號'.encode()).hexdigest())"`。代碼本身不進倉庫，由社長口頭給人。
- 巢：`assets/nest.js`（讀者共同養的知更鳥，狀態在手機 rm.nest；共用儲存是 `scripts/nest-worker.js`，Cloudflare Worker 免費方案，部署後把網址填進 config.json `nest.api` 與 index.html 的 connect-src；沒填就只有單機模式）
- 刊史：`content/chronik.json`（App 的刊史館）——只記大事（創刊與里程碑、欄位開停與更名、重要新功能、改變寫法的新規則、讀者看得到的重大出刊異常），由社長的編輯當天補一條；修 bug、小調整、資料更正不記；班次與 routine 不寫
- 稿件：`content/issues/<日期>/<欄位>.json`；備稿：`content/reserve/<欄位>/`
- 欄位設定與副刊輪替：`content/config.json`
- 觀測站基準：`state/watch/`
- 工具：`scripts/`（plan_day、validate、ledger、reserve、fill_from_reserve、report_run、commons、bible、spotify、build_index、version_shell）

## 本機預覽

```
python3 -m http.server 8765
```

開 `http://127.0.0.1:8765/?preview` 可在 07:30 前預覽尚未出刊的稿件。

## Spotify

`content/config.json` 的 `spotify.client_id` 是 Spotify Developer App「Wiener Morgen Private」的 Client ID（公開值，不是 secret）。授權回呼網址沿用該 App 已登記的 `https://wiener-morgen-private.duckdns.org/oauth/spotify/callback`，由 `oauth/spotify/callback.html` 接收後轉回 App。

## 日常維護

| 想做的事 | 怎麼做 |
|---|---|
| 改某一欄的寫法、題材範圍、字數 | 編輯 `editorial/columns/<欄位>.md`，下一班排程就會照新規則寫 |
| 改文風或圖像規則 | 編輯 `editorial/STYLE.md`、`editorial/IMAGES.md` |
| 改副刊的星期輪值 | 編輯 `content/config.json` 的 `rotation_by_weekday`（每天三欄） |
| 暫停或改時間 | 到 https://claude.ai/code/routines 停用或編輯各班排程 |
| 看排程寫了什麼、有沒有出錯 | https://claude.ai/code/routines 點進該班的執行紀錄 |
| 出刊異常 | 07:45 若仍缺稿、驗證失敗或網站不是最新版，GitHub 會開 issue 並寄信；看 repo 的 Issues |
| 看備稿庫存 | `python3 scripts/reserve.py`（正刊每欄 2 篇、副刊每欄 1 篇，傍晚 17:37 自動補） |
| 手動補位 | GitHub → Actions → Fill from reserve → Run workflow |
| 手動重新部署 | GitHub → Actions → Publish → Run workflow |

網站從 GitHub Pages 提供，DuckDNS 網址指向 GitHub（185.199.108.153）。舊的 DigitalOcean 主機已不再使用，確認新版運作正常後可以關機停費。
