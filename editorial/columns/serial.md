# 翻到昨天摺角的那一頁（serial，編輯部簡稱「連載」）｜每天一回，由連載班提前譯好

## 這一欄是什麼

一本公版長篇小說，每天刊一回，像 19 世紀的報紙連載。現在連載的是杜斯妥也夫斯基《罪與罰》（1866），從俄文原文譯出，約 300 回，2026-11-06 起。當天那一回算當期的一篇：讀者沒讀完它，當天的郵票不蓋；在循序閱讀裡它排在副刊之後、觀測站之前。它**不進刮開頭圖**（社長 2026-11-05 的規定）。

全部機器都在 `scripts/serial.py`：
- 原文已切好：`state/serial/<slug>/src/<回>.json`（每回的俄文段落、在書中的位置、字數），計畫在 `state/serial/<slug>.json`（每回的日期）。
- `python3 scripts/serial.py status`：哪些回已譯、譯到哪一天、還缺哪些（目標是提前 21 天）。
- `python3 scripts/serial.py src <slug> <n>`：印出第 n 回的原文。
- `python3 scripts/serial.py check <slug> [<n>]`：連載專用的檢查（回數、位置、字數、有沒有漏譯的俄文、章名）。另外照常跑 `python3 scripts/validate.py <日期> --column serial`。
- 譯名表：`state/serial/<slug>.md`，**全書譯名的唯一依據，每回譯者都要先讀**。表裡沒有的新人物、新地名，譯者決定後要加進表裡（同一次 commit）。

## 譯文的格式（`content/issues/<日期>/serial.json`）

```json
{
  "column": "serial", "date": "2026-11-06",
  "title": "第 1 回・七月初的傍晚，他走出那間小房間",
  "dek": "前情提要：上一回發生了什麼，一到兩句，70 字內（第 1 回改為一句作品介紹）",
  "brief": "60–140 字：這一回在哪裡、誰出場、讀起來是什麼氣氛，不說這一回的結果",
  "topic_key": "serial:crime-and-punishment-001",
  "updated_at": "2026-11-05T01:00:00+08:00",
  "spoiler": null, "disclaimer": null, "hero": null,
  "serial": { "slug": "crime-and-punishment", "book": "罪與罰", "author": "杜斯妥也夫斯基", "n": 1, "of": 296,
              "part": "第一部", "chapter": "第一章", "piece": 1, "pieces": 4 },
  "body": [
    { "type": "h", "text": "第一部　第一章" },
    { "type": "p", "text": "……" }
  ],
  "sources": [
    { "title": "Преступление и наказание (Достоевский)", "publisher": "Викитека（俄文維基文庫）", "url": "<state/serial/<slug>.json 的 source.url>", "note": "第一部第一章，第 1 段到第 12 段；對照 Constance Garnett 1914 年英譯（Project Gutenberg #2554）" }
  ]
}
```

- `title`：「第 n 回・」加上這一回裡的一個畫面或一句話（12 字內），像報紙連載的小標；不劇透這一回的結尾。
- `dek`：前情提要。從上一回（原文 `src/<n-1>.json`）的事件寫，一到兩句，讓隔了一天的讀者接得上；不要重述整回。第 1 回寫一句作品介紹（哪一年、誰寫的、故事在哪裡）。
- `body`：一章的第一回要有 `h` 區塊寫章名（「第一部　第一章」；尾聲寫「尾聲　一」）。原文的段落一段一個 `p`；原文被切在段落中間的（`opens_mid_paragraph`），這一回從該段的中途開始，前一回的結尾也是，不加任何說明。第 1 回正文開頭放一個 `callout`（`label`「人物」，`items` 五六個：這一回會出現的人物各一句）；之後有新主要人物第一次出場的那一回，也可以放一個，一回最多一個。
- 不加譯註，除非讀者不可能懂，用括號一句說明，一回最多一次。
- `brief`：首頁卡片不顯示它，但往期與搜尋會用，照上面寫，不劇透。
- `hero` 一律 null。`sources` 照上面，note 寫這一回對應的章與段落範圍。

## 翻譯的要求

- 讀 `state/serial/<slug>.md` 的譯名表與譯例，一字不差地用。
- 直譯原文，不省略、不摘要、不加寫：原文每一句都要有對應的中文；長句可以斷開，順序可以為了中文調整，但不丟內容。
- 今天台灣人讀得順的中文：主詞清楚，不仿舊譯腔，不堆成語，不用大陸用語（「視頻」「信息」「質量」）。人物說話要像人在說話；原文的語氣（嘲弄、猶疑、激動）要譯出來。
- 對白用「」，引號內用『』；原文的破折號對白一律改成引號；內心獨白（原文 «»）也用「」。
- 數字與中文之間留半形空格（「30 戈比」「5 樓」）；全形標點。
- 一回譯完要讀出聲一遍，改掉讀不順的句子。

## 連載班的流程（每週一 16:07，台灣時間）

1. `python3 scripts/serial.py status`：看缺哪些回。都齊就回報結束。
2. 每一回派一個**譯者子代理**（`opus`／`high`）：給它 slug、回數、譯名表路徑、本手冊；它讀 `src/<n>.json` 與 `src/<n-1>.json`（寫前情），譯成上面的 JSON 寫到 `content/issues/<日期>/serial.json`（日期在 src 檔裡；資料夾不存在就建立），跑 `serial.py check <slug> <n>` 與 `validate.py <日期> --column serial`，修到沒有 ERROR。可以平行，一次最多 10 回。
3. 每一回再派一個**雙語核對子代理**（`sonnet`／`high`）：逐段對照原文（必要時再看 Garnett 英譯），列出漏譯、誤譯、譯名不合表、語氣不對的地方，直接改正譯文，再跑一次兩個檢查。
4. 每完成一回就 `git add content/issues/<日期>/serial.json state/serial`，commit「連載 第 n 回：<小標>」，`git pull --rebase origin main && git push origin HEAD:main`。
5. 結束時回報：譯了哪幾回、核對改了什麼、現在譯到哪一天。
