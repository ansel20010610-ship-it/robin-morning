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

用 Colorful Widget 或 iScreen 的「照片」組件，選對應尺寸放進去。五張是維也納名畫的局部，三張是手繪：

| 檔案 | 尺寸 | 內容 |
| --- | --- | --- |
| `widgets/naschmarkt-mittel-*.jpg` | 中 | Carl Moll〈維也納納許市集〉，1894 |
| `widgets/moser-mittel-*.jpg` | 中 | Koloman Moser〈從托爾博萊眺望加爾達湖西岸〉，1912 |
| `widgets/mozart40-mittel-*.jpg` | 中 | 莫札特第 40 號交響曲 g 小調開頭的樂譜，手繪 |
| `widgets/vierbaeume-klein-*.jpg` | 小 | Egon Schiele〈四棵樹〉，1917 |
| `widgets/sonnenblumen-klein-*.jpg` | 小 | Gustav Klimt〈有向日葵的農家花園〉，約 1907 |
| `widgets/floege-klein-*.jpg` | 小 | Gustav Klimt〈艾蜜莉・芙洛格肖像〉，1902 |
| `widgets/kuss-klein-*.jpg` | 小 | Der Kuss：Klimt《吻》的金色馬賽克，手繪 |
| `widgets/weizenkorn-klein-*.jpg` | 小 | 一粒麥子，《約翰福音》十二章，直排，手繪 |

加上會變的維也納日曆（中型）就是九格。畫作嵌在同一張米色紙卡裡，外圍一道金線、一道細線，四角各一顆小金方塊。

照片組件不會跟著日夜模式換圖，挑和桌布同一色的那一版（tag 日間、nacht 夜間）。

## 三頁怎麼排

每頁 4×6 格剛好填滿，App 分三頁（4、8、8 個），Dock 不變。

- **第一頁**：中型日曆；小型〈四棵樹〉＋4 個 App；中型〈納許市集〉。
- **第二頁**：4 個 App＋小型〈芙洛格〉；中型莫札特；小型〈向日葵〉＋4 個 App。
- **第三頁**：中型〈加爾達湖〉；4 個 App＋小型 Der Kuss；小型一粒麥子＋4 個 App。

## 畫作的來源

都是 Wikimedia Commons 上的館方掃描，畫家都在 1945 年前過世，畫作已是公共領域。組件用的是裁切後的局部。

| 組件 | 原作 | 收藏 |
| --- | --- | --- |
| 納許市集 | [Carl Moll, Der Naschmarkt in Wien](https://commons.wikimedia.org/wiki/File:Carl_Moll_-_Der_Naschmarkt_in_Wien_-_252_-_%C3%96sterreichische_Galerie_Belvedere.jpg) | Belvedere, Wien |
| 加爾達湖 | [Koloman Moser, Blick von Torbole auf das Westufer des Gardasees](https://commons.wikimedia.org/wiki/File:Koloman_Moser_-_Blick_von_Torbole_auf_das_Westufer_des_Gardasees_-_2153_-_Belvedere.jpg) | Belvedere, Wien |
| 四棵樹 | [Egon Schiele, Vier Bäume](https://commons.wikimedia.org/wiki/File:Egon_Schiele_-_Vier_B%C3%A4ume_-_3917_-_%C3%96sterreichische_Galerie_Belvedere.jpg) | Belvedere, Wien |
| 向日葵 | [Gustav Klimt, Bauerngarten mit Sonnenblumen](https://commons.wikimedia.org/wiki/File:Gustav_Klimt,_1907,_Farm_Garden_with_Sunflowers,_%C3%96sterreichische_Galerie_Belvedere.jpg) | Belvedere, Wien |
| 芙洛格 | [Gustav Klimt, Bildnis Emilie Flöge](https://commons.wikimedia.org/wiki/File:Gustav_Klimt_-_Bildnis_Emilie_Fl%C3%B6ge.jpg) | Wien Museum |

## 重新產生圖片

`tools/build.js` 產生桌布和全部圖片組件：`tools/kit.js` 是共用的紙、金框、方格角與桌布，`tools/photo.js` 是畫作的紙卡外框，`tools/motifs/` 是手繪的樂譜與 Der Kuss，`tools/photos/` 是裁好的畫作局部。SVG 用 resvg 輸出；字型用 Cormorant Garamond 與 Noto Serif TC，都是 Google Fonts 的開放授權字型，不放在 repo 裡，用法寫在 build.js 開頭。
