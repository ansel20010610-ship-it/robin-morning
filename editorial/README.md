# 知更鳥晨間記事・製刊手冊

這份手冊給每天的排程編輯（Claude Code 雲端 routine）。本報每天台灣時間 07:30 出刊，**不允許缺稿**：除觀測站（無新進展時靜默）外，每一欄每天都要刊出。網站從 `main` 自動部署。

## 班表（台灣時間）

| 班 | 時間 | 負責 |
|---|---|---|
| 1 | 00:37 | 晨光裡的一句話（devotion）、今日古典（music）、牙周經典導讀（perio） |
| 2 | 01:37 | 文明如何運作（civilization）、當日第 1 個副刊 |
| 3 | 02:37 | 當日第 2、3 個副刊；巴薩晨報**初稿**（football） |
| 4 | 05:17 | FM 觀測站、迷霧之子與颶光影視化、巴薩晨報**更新**（前一晚比賽仍在進行就最後做）；全刊驗收，補寫缺稿 |
| 5 | 06:27 | 安全網：補寫一切缺稿（平行子代理）、巴薩晨報最後更新；**07:05 停手推送，接著執行備稿補位** |
| 備 | 14:37 | 備稿班：把備稿庫補到每欄至少 2 篇（見 `RESERVE.md`） |

07:05 第 5 班自己執行備稿補位；07:12、07:15、07:18、07:22 再由 GitHub Actions 補位（不經 AI，作為後備）；07:45 再檢查一次，仍有問題就開 GitHub issue 通知社長。副刊依星期輪替（`content/config.json` 的 `rotation_by_weekday`）。

## 每班流程

1. **確認任務**：`python3 scripts/plan_day.py --group <班號>`。會印出刊期日期、期數、本班欄位、全刊狀態。已存在且驗證通過的稿件**不要重寫**（巴薩晨報的更新除外，見下）。
2. **讀規則**（每次都讀，不憑記憶）：`editorial/STYLE.md`、`editorial/SCHEMA.md`、`editorial/IMAGES.md`、`editorial/LESSONS.md`（編輯部教訓，過去反覆出現的錯）、`editorial/columns/<欄位>.md`。
3. **分工**：本班有兩篇以上時，用 Agent 工具為每一欄各派一個子代理**同時**撰寫。給子代理的指示要包含：專案路徑、日期、欄位、要先讀的規則檔、第 4–7 步、只寫自己那一個檔、不要 git commit。你負責第 8–10 步。第 5 班一律平行。
4. **查重**：`python3 scripts/ledger.py --column <欄位>`、`python3 scripts/ledger.py --images`（已含備稿用過的主題與圖片）。
5. **研究與核對**：用 WebSearch、WebFetch 找原始來源。數字、日期、人名、引文都要能在來源找到，找不到就不寫。雲端的 WebSearch 結果常混入內容農場：搜尋時盡量用 `allowed_domains` 限定可信網域，或直接用 WebFetch 打開已知來源。注意：`allowed_domains` 裡只要有一個網站封鎖了我們的抓取程式，整次搜尋就會報錯（400 “not accessible to our user agent”）——遇到這個錯誤就把該網域拿掉重搜，不要放棄搜尋；已知不可用的網站列在 `columns/football.md`。
6. **找圖**：`python3 scripts/commons.py --search "<關鍵字>"`、`python3 scripts/commons.py "File:<檔名>"`。依 `IMAGES.md`。
7. **寫稿並驗證**：寫到 `content/issues/<日期>/<欄位>.json`，跑 `python3 scripts/validate.py <日期> --column <欄位> --check-urls`，修到沒有 ERROR。
8. **審稿（必做）**：每篇另派一個**新的**子代理當審稿編輯，不可由寫稿者自己審。指示它：以懷疑的態度核對至少 8 個關鍵事實與所有直接引文（打開原始來源逐字比對）、用 `commons.py` 核對每張圖的授權與圖說、逐條檢查欄位規格與 `STYLE.md`、找出把推論寫成事實的地方；只回報有證據的問題，不改檔案。
9. **依審稿意見修正**：每一條先自行核實證據，成立才改；修正事實時同步更新 sources。再跑一次 validate。
10. **立刻推送**（每完成一篇就推一次）：
    ```
    git add content/issues/<日期>/<欄位>.json state/
    git commit -m "<日期> <欄位>：<標題>"
    git pull --rebase origin main
    git push origin HEAD:main
    ```
    直接推到 `main`，不要開分支或 PR。push 失敗就 `git pull --rebase` 後重推，最多三次。

11. **班次回報（必做，最後一步）**：不論本班寫了幾篇、是否順利，結束前都要執行
    ```
    python3 scripts/report_run.py --group <班號> --note "<一句話：做了什麼、有什麼問題>"
    git add state/runs && git commit -m "<日期> 第 <班號> 班回報"
    git pull --rebase origin main && git push origin HEAD:main
    ```
    07:45 的監看會檢查第 1–5 班都有回報；沒有回報代表該班沒跑完或推送失敗，會開 issue 通知社長。備稿班用 `--group reserve`。
    **推送被拒（例如 403、沒有寫入權限）時**：不要只把修補檔留在對話裡，要在回報與結尾訊息的第一行寫明「推送失敗：<錯誤訊息>」，讓社長立刻看到。
    **手機通知（PushNotification）只在需要社長動手時才發**：推送被拒、07:05 仍有欄位缺稿且無備稿可補、同一個錯誤反覆出現而本班修不好。一句話寫明問題與要他做什麼。一切正常、或問題已自行解決，就**不要**發——各班都在深夜到清晨執行，例行的完成通知只會吵醒他。

## 巴薩晨報的三個版本

- 第 3 班寫**初稿**：以當時已有的新聞完成一篇完整、可刊出的稿件。
- 第 4、5 班**更新**：從現有稿件的 `updated_at` 起，查有沒有新的重要消息（尤其前一晚剛結束的比賽）。有就更新內容、`updated_at` 與來源；沒有就不動。仍在進行中的比賽，先做其他工作，回頭再寫；07:05 仍未終場就寫當下比分並標明「比賽進行中」，最終結果由下一期補報（細節見 `columns/football.md`）。
- 若當天的巴薩晨報是備稿（`from_reserve: true`），當天不再覆蓋；漏掉的新聞由下一期補報（時間窗會從上一篇真正的新聞稿起算）。

## 第 4、5 班：全刊驗收與補稿

- `python3 scripts/plan_day.py --group 4`（或 5）會列出全刊缺稿與驗證失敗的稿件。
- 先完成本班欄位，再依「主欄 → 副刊」的順序補寫缺稿；第 5 班用平行子代理同時補。
- 第 5 班 **07:05** 一定要停手：確認所有子代理都已結束、不再寫檔，推送已完成的稿件。接著執行備稿補位：
  ```
  git pull --rebase origin main
  python3 scripts/fill_from_reserve.py <日期> || true
  git add -A content/issues/<日期> content/reserve content/rejected
  git commit -m "<日期>：以備稿補上缺稿"      # 沒有變更就略過
  git pull --rebase origin main && git push origin HEAD:main
  ```
  補位會從備稿庫刪除用掉的備稿，並把驗證失敗、已被替換的稿件移到 `content/rejected/`，所以這一步要 `git add -A` 這三個資料夾。
- 最後跑 `python3 scripts/validate.py <日期>`，在回報中列出：已刊出、補了哪些、觀測站結果（刊出／靜默／無法判定）、仍缺哪些與原因。

## 備稿班

依 `RESERVE.md`。先跑 `python3 scripts/reserve.py` 看各欄庫存；從庫存最少的欄位開始，每次最多寫 3 篇，流程同上（含審稿子代理），驗證改用 `python3 scripts/validate.py --reserve --check-urls`，推送訊息用「備稿 <欄位>：<標題>」。

## 每週品質稽核（週日 15:37）

1. 讀過去 7 期（`content/issues/` 最近 7 個日期）的全部稿件；每篇派一個審稿子代理（可平行），以懷疑的態度抽查關鍵事實、引文、圖片授權與規格。
2. **事實錯誤**：不改寫原文，在該篇 `body` 末尾加一個 `callout` 區塊，`label` 為「更正（<稽核日期>）」，寫明哪裡錯、正確內容與來源，並在 `sources` 補上來源、把 `updated_at` 改成稽核時間。跑 `python3 scripts/validate.py <該日期> --column <欄位>` 確認沒有 ERROR。
3. **反覆出現的問題**（兩篇以上、或同一欄連續出現）：寫進 `editorial/LESSONS.md`，一條一個問題，附出現位置與正確做法。
4. 推送，訊息用「品質稽核 <日期>：更正 N 篇、新增教訓 M 條」，最後做班次回報（`--group audit`）。

## 不可以做的事

- 不修改 `index.html`、`assets/`、`scripts/`、`editorial/`（每週品質稽核可以寫 `editorial/LESSONS.md`）、`.github/`、`oauth/`。只寫 `content/issues/`、`content/reserve/`、`content/rejected/`（只有備稿補位會寫）與 `state/`。
- 不刪除或改寫過去日期的稿件。若發現過去稿件有事實錯誤，在該篇文末加「更正」區塊（見「每週品質稽核」第 2 步），並在回報中提出。
- 不讀取、不推測讀者的私人生活；不使用讀者自己的小說設定。
- 不使用 AI 生成圖片。不呼叫任何需要付費的 API。
- **不把社長的任何個人資料送出去**：email、姓名、帳號、git 設定裡的資料，都不可以放進請求的標頭、網址或內容。有些館藏 API 要求在標頭附聯絡方式（例如芝加哥藝術博物館的 `AIC-User-Agent`），一律只寫 `robin-morning (https://github.com/ansel20010610-ship-it/robin-morning)`，也就是 `scripts/common.py` 的 `UA`。派子代理時把這一條寫進指示。

## 發生問題時

- 單篇卡住（來源不足、圖找不到）：換一個題目重寫，不要放棄這一欄；真的來不及，交給下一班或備稿補位，並在回報中說明。
- 觀測站查核失敗：依欄位規格寫 `undetermined` 短稿。
- 時間不夠：已完成的先推上去。
