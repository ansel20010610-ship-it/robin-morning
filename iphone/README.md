# iPhone：維也納主畫面

和晨報同一套紙色與金色：分離派的方格、月桂、金頂。每一樣都有日間（tag）和夜間（nacht）兩個版本。

手機上可以直接從這裡下載：`https://wiener-morgen-private.duckdns.org/iphone/`，後面接下面的檔名。

## 桌布

| 檔案 | 用途 |
| --- | --- |
| `wallpaper/wien-tag.jpg` | 主畫面，日間 |
| `wallpaper/wien-nacht.jpg` | 主畫面，夜間 |

設定 → 背景圖片 → 加入新背景圖片 → 照片，選這張，設成主畫面。鎖定畫面可以另外選一張或保留原本的。

紙紋上一層很淡的 Hoffmann 細格，金色雙線框跟著螢幕圓角走。頂端那行是分離派展覽館門楣上的格言 DER ZEIT IHRE KUNST · DER KUNST IHRE FREIHEIT（給時代它的藝術，給藝術它的自由），剛好落在狀態列和第一排組件之間。

## 會變的組件：維也納日曆

`wiener-kalender.js`，用免費的 Scriptable App。

1. App Store 下載 Scriptable。
2. 把 `wiener-kalender.js` 存到「檔案」App 的 iCloud Drive → Scriptable 資料夾，Scriptable 裡就會出現「wiener-kalender」。也可以在 Scriptable 按右上角＋，把檔案內容整個貼進去，命名 wiener-kalender。
3. 在主畫面長按 → 左上角＋ → Scriptable → 選小、中或大 → 加入。
4. 長按剛加入的組件 → 編輯小工具 → Script 選 wiener-kalender。

建議用中型：左邊是當天的星期、日期、月份，右邊一頁月曆（週一開頭，像維也納的月曆）。小型和大型也可以用。鎖定畫面的三種小組件也可以用。日夜模式會自動換色，每天午夜換一頁。它不連網，不讀任何資料。

## 圖片組件

用 Colorful Widget 或 iScreen 的「照片」組件，選對應尺寸放進去。每一個都是不同的維也納題材，不重複：

| 檔案 | 尺寸 | 題材 |
| --- | --- | --- |
| `widgets/kuppel-klein-*.jpg` | 小 | 分離派展覽館的金頂，VER SACRUM |
| `widgets/wien-mittel-*.jpg` | 中 | 維也納天際線：查理教堂、聖斯德望主教座堂、普拉特摩天輪 |
| `widgets/thonet-klein-*.jpg` | 小 | Thonet 14 號曲木椅，咖啡館那張 |
| `widgets/donauwalzer-mittel-*.jpg` | 中 | 《藍色多瑙河》開頭的樂譜，小約翰・史特勞斯 1867 |
| `widgets/sonnenblume-klein-*.jpg` | 小 | Otto Wagner 卡爾廣場地鐵站的金色向日葵 |
| `widgets/lebensbaum-mittel-*.jpg` | 中 | Klimt 斯托克雷宮壁畫的生命之樹 |
| `widgets/kuss-klein-*.jpg` | 小 | Klimt《吻》的金色馬賽克：直條與圓花 |
| `widgets/weizenkorn-klein-*.jpg` | 小 | 一粒麥子，《約翰福音》十二章，直排 |

加上會變的維也納日曆（中型），一共九個。照片組件不會跟著日夜模式換圖，挑和桌布同一色的那一版（tag 日間、nacht 夜間）。

## 三頁怎麼排

每頁 4×6 格剛好填滿，App 分三頁（4、8、8 個），Dock 不變。

- **第一頁**：中型日曆；小型金頂＋4 個 App；中型天際線。
- **第二頁**：4 個 App＋小型曲木椅；中型藍色多瑙河；小型向日葵＋4 個 App。
- **第三頁**：中型生命之樹；4 個 App＋小型《吻》；小型一粒麥子＋4 個 App。

## 重新產生圖片

`tools/build.js` 產生桌布和全部圖片組件：`tools/kit.js` 是共用的紙、金框、方格角與桌布，`tools/motifs/` 是各個題材。SVG 用 resvg 輸出；字型用 Cormorant Garamond 與 Noto Serif TC，都是 Google Fonts 的開放授權字型，不放在 repo 裡，用法寫在 build.js 開頭。
