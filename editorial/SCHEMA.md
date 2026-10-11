# 文章檔格式

每篇文章是一個 JSON 檔：`content/issues/<YYYY-MM-DD>/<欄位代號>.json`。欄位代號見 `content/config.json`。
寫完一定要跑 `python3 scripts/validate.py <日期>`，沒有 ERROR 才能提交。

## 文章

```json
{
  "column": "music",
  "date": "2026-10-11",
  "title": "標題（25 字內，具體，不用驚嘆號）",
  "dek": "導言，一到兩句，70 字內，說清楚這篇回答什麼問題",
  "topic_key": "music:brahms-op98",
  "updated_at": "2026-10-11T03:12:00+08:00",
  "spoiler": null,
  "disclaimer": null,
  "hero": { "...": "Figure 或圖解區塊，見下" },
  "body": [ { "type": "p", "text": "..." } ],
  "sources": [
    { "title": "文章或文件名", "publisher": "媒體／機構", "date": "2026-10-10", "url": "https://...", "note": "選填：讀了哪一部分" }
  ]
}
```

- `topic_key`：去重鍵，格式 `<欄位>:<穩定識別>`。牙周用 `perio:doi:<DOI 小寫>`；古典用 `music:<作曲者>-<作品編號>`；畫作用 `art:<收藏館>-<館藏號或題名>`；經文用 `devotion:<書卷>-<章>-<節>`。同一個鍵不得在不同日期重複出現（`scripts/ledger.py` 可查已用過的鍵；比對不分大小寫、不計多餘空白）。
- `spoiler`：有重大劇透時填一句提醒（例如「本文談到《迷霧之子》第一部結局」），App 會在標題下顯示。
- `disclaimer`：牙周欄固定填「醫學教學導讀，非個別診療建議。」
- 觀測站（`fm-watch`、`cosmere-watch`）另有 `"status": "update"` 或 `"status": "undetermined"`（查核失敗時用，見各欄規格）。

## 正文區塊（`body` 陣列）

行內格式只支援：`**粗體**`、`*斜體*`、`[連結文字](https://...)`。網址不可含空白；網址裡的括號只能一層且成對（如維基百科的 `Mistborn_(film)`），其他情況把 `(` `)` 寫成 `%28` `%29`。

| type | 欄位 | 用途 |
|---|---|---|
| `p` | `text`，選填 `tag` | 段落。`tag` 是邊欄小標籤：`史實`、`史料`、`學者解釋`、`推論`、`本文讀法`、`原創假設`、`原創示範`、`官方說法`、`報導`、`傳聞`、`可見` |
| `h` | `text` | 小標題 |
| `quote` | `text`，選填 `cite`、`original` | 引文；外文引文把原文放 `original`，中文放 `text` 並在 `cite` 註明「本文自譯」或出版譯者 |
| `list` | `items`，選填 `ordered` | 條列（只用於真正並列的資訊） |
| `facts` | `items`：`[["欄名","內容"], ...]`，選填 `title` | 資料卡：作品資料、論文資料、比賽資料 |
| `figure` | 見 Figure | 圖片 |
| `detail` | `of`、`region`、`caption`、`position` | 同一張圖的局部放大（見下） |
| `timeline` | `items`：`[{"when","label","note"}]`，選填 `title`、`caption` | 時間線。`when` 欄很窄，可用精簡寫法：只有年寫「1922 年」，有月日寫「1922.2.19」「1950.11」；正文仍依 STYLE 寫「1922 年 2 月 19 日」 |
| `table` | `head`、`rows`，選填 `title`、`caption` | 對照表、概念表 |
| `pitch` | 見戰術圖 | 足球場形示意 |
| `svg` | `svg`、`caption`，選填 `credit`、`title` | 原創示意圖（關係圖、路線示意、結構圖）。見下方 SVG 規則 |
| `news` | `items`：`[{"headline","summary","source","url","when"}]`，選填 `title` | 新聞速覽 |
| `scripture` | `ref`、`book`、`chapter`、`version`、`verses`、`source` | 經文（只用於晨光欄）。用 `scripts/bible.py` 產生；`book` 是 FHL 簡稱（如「詩」），`verses` 為 `[{"n":1,"text":"..."}]`，跨章時個別經節加 `"c": 章`。驗證時會逐節和 FHL 和合本比對 |
| `prayer` | `text` | 禱告全文（只用於晨光欄） |
| `music` | 見音樂區塊 | 錄音與 Spotify |
| `paper` | `citation`、`doi`、`pmid`、`link`，選填 `design`、`sample`、`question` | 論文卡 |
| `exercise` | `title`、`steps`、`criteria`，選填 `note` | 練習：步驟與「怎樣算做到」 |
| `callout` | `label`、`text` 或 `items` | 框起來的提問或提醒，例如「給史詩創作者的制度問題」 |
| `spoiler` | `text` | 劇透分隔線，放在劇透段落之前 |
| `divider` | — | 分節裝飾線 |

## Figure（圖片）

```json
{
  "type": "figure",
  "id": "f1",
  "kind": "artwork",
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/.../1280px-....jpg",
  "width": 1280,
  "height": 960,
  "alt": "給看不到圖的人：畫面裡有什麼（不解釋意義）",
  "caption": "圖說：這張圖在本文中要讓讀者看什麼",
  "credit": "作者／收藏或拍攝者",
  "license": "Public domain",
  "license_url": "",
  "source_url": "https://commons.wikimedia.org/wiki/File:...",
  "made": "製作年代，例如 1907–1908",
  "depicts": "描繪年代（只有和製作年代不同時才填），例如 公元前 52 年"
}
```

- `kind`：`artwork`（繪畫雕塑）、`photo`（照片）、`still`（電影畫面）、`map`、`portrait`、`document`（手稿、版本、文件）、`illustration`（版畫插圖等）。
- `width`、`height` 必填，App 依此保留原比例，不裁切。用 `scripts/commons.py` 取得。
- `hero` 用同樣格式（不必寫 `type`），也可以改用 `timeline`、`pitch`、`svg` 區塊當頭圖。
- 圖片規則與來源見 `IMAGES.md`。

## detail（局部）

```json
{ "type": "detail", "of": "hero", "region": [0.55, 0.30, 0.25, 0.25],
  "position": "畫面右側中段，約佔寬度四分之一", "caption": "..." }
```

`region` 是 `[左, 上, 寬, 高]`，以原圖寬高的比例（0–1）表示。App 會把局部放大，並在旁邊的縮圖上框出位置。局部不算新的圖片素材。

`of` 只能指向 figure 圖片：頭圖（figure 型）一律寫 `"hero"`（即使頭圖另有 `id`），正文圖寫它的 `id`。圖解（pitch、table、svg 等）不能做局部。

要做局部放大的圖，請在該圖另填 `src_large`（用 `python3 scripts/commons.py --width 2560 "File:..."` 取得的網址），局部才會清楚；`src` 仍放 1280 寬的版本。DjVu／PDF／TIFF 掃描檔（書頁、手稿）要用哪一頁就加 `--page N`，`src` 與 `src_large` 必須是同一頁；`src`、`src_large` 都不可直接指向 `.djvu`、`.pdf`、`.tif` 原檔（瀏覽器顯示不出來），一律用 commons.py 給的 JPEG／PNG 縮圖網址。

## 戰術圖 `pitch`

```json
{
  "type": "pitch",
  "title": "右路三人換位",
  "view": "half",
  "caption": "原創假設場景，方向：藍隊由下往上進攻",
  "steps": [
    {
      "label": "1. 起始站位",
      "note": "這一步發生什麼",
      "players": [ { "id": "b8", "team": "blue", "x": 62, "y": 58, "label": "8" },
                   { "id": "r3", "team": "red",  "x": 70, "y": 72, "label": "3" } ],
      "ball": "b8",
      "arrows": [ { "from": "b8", "to": [80, 70], "kind": "pass" },
                  { "from": "b7", "to": [86, 82], "kind": "run" } ]
    }
  ]
}
```

- 座標：`x` 0（左邊線）到 100（右邊線）；`y` 0（藍隊自家球門）到 100（對方球門）。藍隊永遠往上攻。
- `view`：`full` 全場、`half` 進攻半場（y 50–100）。`half` 時所有球員、球與箭頭終點的 `y` 都要 ≥ 50，否則會被裁掉。
- `kind`：`pass` 傳球（實線）、`run` 無球跑動（虛線）、`dribble` 帶球（波浪）、`press` 逼搶（紅色短線）。
- 每一步都要寫 `note`；球的位置、箭頭順序要和文字一致。

## 音樂區塊 `music`

```json
{
  "type": "music",
  "composer": "布拉姆斯（Johannes Brahms）",
  "work": "E 小調第四號交響曲，作品 98",
  "work_original": "Symphony No. 4 in E minor, Op. 98",
  "composed": "1884–1885",
  "performers": "卡洛斯・克萊伯 指揮 維也納愛樂",
  "recording": "Deutsche Grammophon，1980 年 3 月錄音於維也納金色大廳",
  "duration": "約 40 分鐘",
  "movements": [ "I. Allegro non troppo", "II. Andante moderato", "III. Allegro giocoso", "IV. Allegro energico e passionato" ],
  "spotify": {
    "album": "",
    "tracks": [],
    "query": "Brahms Symphony No. 4 Kleiber Wiener Philharmoniker",
    "artist_hint": "Kleiber",
    "track_filter": ["Symphony No. 4"]
  }
}
```

- 若能用 `scripts/spotify.py` 查到並核對 Spotify ID，填 `album` 與 `tracks`（依樂章順序）。
- 查不到就只填 `query`、`artist_hint`、`track_filter`，App 會用讀者自己的 Spotify 登入去找，並讓讀者確認版本。**不可猜 ID。**

## SVG 規則

- 一律有 `viewBox`，不寫固定 `width`/`height`。
- 只用這些 class 上色，App 會依日夜模式換色：`ink`（主線條與文字）、`muted`（次要）、`accent`（重點，酒紅）、`gold`（金）、`soft`（淺色填底）、`paper`（底色）。例：`<rect class="soft" .../>`、`<text class="ink">`。
- 不用 `<script>`、`<foreignObject>`、外部連結、`on*` 屬性。
- 也不用 `<style>`（會套到整頁）、`<base>`、`<meta>`、`<link>`、`http-equiv`，以及 SVG 以外的命名空間（`xmlns:` 只可用 xlink）。`href`／`xlink:href` 只能指向本圖內的 `#id`，`url()` 只能寫 `url(#id)`。
- 地圖或路線示意要在圖上或 `caption` 寫「示意，不按比例」，並寫出依據的資料來源。
