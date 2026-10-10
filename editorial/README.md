# 知更鳥晨間記事・製刊手冊

這份手冊給每天清晨的排程編輯（Claude Code 雲端 routine）。每天分四班，各自完成指定欄位，直接推到 `main`。App 在台灣時間 07:30 自動把當天刊期翻到首頁。

## 班表（台灣時間）

| 班 | 時間 | 負責 |
|---|---|---|
| 1 | 02:37 | 晨光裡的一句話（devotion）、今日古典（music）、牙周經典導讀（perio） |
| 2 | 03:37 | 文明如何運作（civilization）、當日第 1 個副刊 |
| 3 | 04:37 | 當日第 2、3 個副刊 |
| 4 | 05:47 | 巴薩晨報（football）、FM 觀測站、迷霧之子與颶光影視化；最後做全刊驗收與補稿 |

副刊依星期輪替（`content/config.json` 的 `rotation_by_weekday`）。

## 每班流程

1. **確認任務**
   `python3 scripts/plan_day.py --group <班號>`
   會印出刊期日期、期數、這班要寫的欄位、哪些已經完成。已經存在且驗證通過的稿件**不要重寫**。

2. **讀規則**（每次都讀，不憑記憶）
   `editorial/STYLE.md`、`editorial/SCHEMA.md`、`editorial/IMAGES.md`，以及 `editorial/columns/<欄位>.md`。

3. **查重**
   `python3 scripts/ledger.py --column <欄位>`：看這欄過去寫過的主題。
   `python3 scripts/ledger.py --images`：看全報用過的圖。

4. **研究與核對**
   用 WebSearch、WebFetch 找原始來源。數字、日期、人名、引文都要能在來源找到。找不到就不寫。
   雲端的 WebSearch 結果常混入內容農場與搬運站：搜尋時盡量用 `allowed_domains` 限定可信網域（官方網站、主要媒體、學術資料庫、維基共享資源），或直接用 WebFetch 打開已知來源的頁面。來路不明的網站一律不當來源。

5. **找圖**
   `python3 scripts/commons.py --search "<關鍵字>"` 找候選；`python3 scripts/commons.py "File:<檔名>"` 取得網址、寬高、授權、作者。依 `IMAGES.md`。

6. **寫稿**
   寫到 `content/issues/<日期>/<欄位>.json`。

7. **驗證**
   `python3 scripts/validate.py <日期> --column <欄位> --check-urls`
   有 ERROR 必須修到沒有；WARN 要看過，能改就改。

8. **立刻提交**（每完成一篇就推一次，免得後面出錯前功盡棄）
   ```
   git add content/issues/<日期>/<欄位>.json state/
   git commit -m "<日期> <欄位>：<標題>"
   git pull --rebase origin main
   git push origin HEAD:main
   ```
   直接推到 `main`。不要開 `claude/` 分支，不要開 PR。push 失敗就 `git pull --rebase` 後重推，最多三次。

9. **第 4 班額外工作：全刊驗收**
   - `python3 scripts/plan_day.py --group 4` 會列出全刊缺稿。
   - 先完成第 4 班自己的欄位；若時間與用量允許，依 主欄 → 副刊 的順序補寫缺稿。
   - 最後跑 `python3 scripts/validate.py <日期>`，在回報中列出：已刊出、缺稿、觀測站結果（刊出／靜默／無法判定）。

## 不可以做的事

- 不修改 `index.html`、`assets/`、`scripts/`、`editorial/`、`.github/`。只寫 `content/issues/` 與 `state/`。
- 不刪除或改寫過去日期的稿件。若發現過去稿件有事實錯誤，在當天相關欄位文末以「更正」說明，並在回報中提出。
- 不讀取、不推測讀者的私人生活；不使用使用者自己的小說設定。
- 不使用 AI 生成圖片。
- 不呼叫任何需要付費的 API。

## 發生問題時

- 單篇無法完成（來源不足、圖找不到）：跳過該篇，在回報中說明原因；不要寫低品質稿件湊數。
- 觀測站查核失敗：依欄位規格寫 `undetermined` 短稿。
- 時間不夠：已完成的先推上去。
