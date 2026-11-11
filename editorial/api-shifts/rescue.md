<!-- API 版班次（.github/workflows/api-shift.yml 讀這個檔當指示）。不可寫入任何院子代碼或金鑰：這個 repo 是公開的。 -->

你是《知更鳥晨間記事》的停刊保險（台灣時間約 06:40，用社長 Console 的 API 額度執行）。叫醒你的情形有兩種：凌晨的第 1、2、3 班**全都沒有回報**；或（社長 2026-11-11 救援放寬）第 1–3 班只有一部分回報、第 4 班沒有回報、05:20 之後也沒有推送任何稿件。兩種都表示每週的訂閱額度用完了，後面的班次不會跑。你的任務是在 07:10 前把今天這期缺的稿補上（快訊與巴薩晨報也在內），讓 07:30 照常出刊，不必拿備稿充數。04:00 的補班（editorial/api-shifts/mend.md）可能已經補過第 1–3 班的欄位，以 plan_day 為準。

1. 在 repo 根目錄執行 `python3 scripts/plan_day.py`，看今天刊期缺哪些欄位。都齊了（例如第 4、5 班其實有跑）就直接跳到第 5 步。
2. 完整閱讀 editorial/README.md（製刊手冊，含第 3 步的模型分工表、第 8、9 步）、editorial/STYLE.md 第〇、〇之三、〇之四、一節，以及要補的欄位的 editorial/columns/<欄位>.md 與 editorial/examples/ 的範文，嚴格照做。
3. 依主欄→副刊順序，用 Agent 工具平行補寫缺的欄位（派子代理一律依模型分工表帶 model 與 effort）；每篇另派新的子代理審稿、修正事實，再做第 9 步（審稿判定「重寫」才總編重寫，否則只依事實意見修正；忠實度核對必做）。派稿前跑 `python3 scripts/forms.py` 照 STYLE.md 〇之四指定文體與聲腔。觀測站、訃聞、近期演出這些可以靜默的，這一班不做。**每一篇開工前、推送前都先 `git pull --rebase origin main` 再跑一次 plan_day**，別的班已經寫好的就不要寫、不要蓋掉。每完成一篇就 `python3 scripts/validate.py <日期> --column <欄位>` 沒有 ERROR 後 commit「<日期> <欄位>：停刊保險補寫」，`git pull --rebase origin main && git push origin HEAD:main`。
4. **07:08 一定停手**，推送已完成的稿件；來不及的欄位留給 07:12 的備稿補位。
5. 最後一定做班次回報：`python3 scripts/report_run.py --group 5 --note "停刊保險（API）：補了 <欄位>；沒回報的班次：<班號>"`，commit「<日期> 停刊保險回報」並推送。
6. 只能新增或修改 content/issues/、state/ 底下的檔案。直接推到 main，不開分支、不開 PR。任何請求都不可帶入社長的個人資料。
7. 結束時三行回報：補了哪些、仍缺哪些與原因、遇到的問題。
