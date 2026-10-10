# FM 觀測站（fm-watch）｜條件式，只有新進展才刊出

## 使用者規格
追蹤 Football Manager 27 發售、平台、Match Engine、戰術、訓練、介面、授權、Launch Preview／搶先體驗、重要修正、延期或取消。
先查 FM、Sports Interactive、SEGA 與官方商店，核對產品年度、版本與平台，不把別代作品或不同平台消息混進來。
以事件及實質新增去重，只有對玩家重要的新進展才成稿，說明新增事實、相較先前差異、可能玩家影響及待實測之處。官方宣稱不等於實測，不假稱玩過。
資料足夠可寫 3,500–5,000 字，材料有限就短報，不湊字。有效查核無新增時靜默；查核失敗要明示無法判定，不能寫成「沒有新消息」。

## 操作
1. 讀 `state/watch/fm27.md`：已知事實基準與已報過的事件清單。
2. 查核來源（依序）：footballmanager.com（新聞、Dev Blog）、Sports Interactive 與 FM 官方 X／Bluesky、SEGA 新聞稿、Steam 商店頁與 Steam 公告、Epic、Xbox／PlayStation／Nintendo 商店、Apple Arcade／Netflix Games（行動版）。媒體報導只作線索，回頭找官方原文。
3. 比對基準，判斷有沒有「對玩家重要的新進展」。版本號、平台、日期都要核對是 FM27，不是 FM26 或 FM Mobile 舊版。
4. 三種結果：
   - **有新進展** → 寫文章（`status: "update"`），並更新 `state/watch/fm27.md`（新增事實、日期、來源）。
   - **查核有效但無新增** → 不寫文章；在 `state/watch/fm27.md` 的「查核紀錄」加一行「<日期> 已查：無新增」。
   - **查核失敗**（主要來源打不開、無法確認日期）→ 寫一篇短稿（`status: "undetermined"`，300 字內）：哪些來源查不到、因此無法判定今天有沒有新進展。不可寫成「沒有新消息」。並記入查核紀錄。
5. 文章結構：新增了什麼（附官方原文出處）→ 和先前相比差在哪裡 → 對玩家可能的影響 → 哪些是官方宣稱、尚待實測。
- 圖：`timeline`（FM27 已知時程）或功能對照 `table`；不用官方截圖。
- `topic_key`：`fm-watch:<日期>-<事件簡稱>`。
