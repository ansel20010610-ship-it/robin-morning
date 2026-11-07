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

用 Colorful Widget 或 iScreen 的「照片」組件，選對應尺寸放進去。一共九格，每格一個不同的題材：

| 檔案 | 尺寸 | 內容 |
| --- | --- | --- |
| `widgets/kaffeehaus-mittel-*.jpg` | 中 | 中央咖啡館（Café Central）的拱頂，照片 |
| `widgets/karlskirche-mittel-*.jpg` | 中 | 查理教堂夜景，照片 |
| `widgets/mozart40-mittel-*.jpg` | 中 | 莫札特第 40 號交響曲 g 小調開頭的樂譜，手繪 |
| `widgets/secession-klein-*.jpg` | 小 | 分離派展覽館的金頂，照片 |
| `widgets/schiele-klein-*.jpg` | 小 | Egon Schiele〈克魯毛：屋群〉，1915，畫作 |
| `widgets/melange-klein-*.jpg` | 小 | 皇家糕點師 Demel 的一杯咖啡，照片 |
| `widgets/kuss-klein-*.jpg` | 小 | Der Kuss：Klimt《吻》的金色馬賽克，手繪 |
| `widgets/weizenkorn-klein-*.jpg` | 小 | 一粒麥子，《約翰福音》十二章，直排，手繪 |

加上會變的維也納日曆（中型）就是九格。照片和畫作都嵌在同一張米色紙卡裡，外圍一道金線、一道細線，四角各一顆小金方塊。

另有兩張備選，想換的時候用：`attersee-mittel`（Klimt〈阿特湖中的島〉）、`wagner-klein`（Otto Wagner 的卡爾廣場地鐵站）。

照片組件不會跟著日夜模式換圖，挑和桌布同一色的那一版（tag 日間、nacht 夜間）。

## 三頁怎麼排

每頁 4×6 格剛好填滿，App 分三頁（4、8、8 個），Dock 不變。

- **第一頁**：中型日曆；小型分離派金頂＋4 個 App；中型中央咖啡館。
- **第二頁**：4 個 App＋小型 Schiele；中型莫札特；小型咖啡＋4 個 App。
- **第三頁**：中型查理教堂；4 個 App＋小型 Der Kuss；小型一粒麥子＋4 個 App。

## 照片與畫作的來源

都來自 Wikimedia Commons，經裁切並加上紙卡外框。CC BY-SA 的作品，裁切後的版本同樣以 CC BY-SA 釋出。

| 組件 | 原作 | 作者 | 授權 |
| --- | --- | --- | --- |
| 查理教堂 | [Iglesia de San Carlos Borromeo, Viena](https://commons.wikimedia.org/wiki/File:Iglesia_de_San_Carlos_Borromeo,_Viena,_Austria,_2020-01-31,_DD_164-166_HDR.jpg) | Diego Delso | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 中央咖啡館 | [Vault Café Central Vienna Wien](https://commons.wikimedia.org/wiki/File:Vault_Caf%C3%A9_Central_Vienna_Wien.jpg) | Jebulon | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 分離派金頂 | [Wiener Secessionsgebäude Kuppel 20230811](https://commons.wikimedia.org/wiki/File:Wiener_Secessionsgeb%C3%A4ude_Kuppel_20230811.jpg) | Uoaei1 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 咖啡 | [Hofzuckerbäcker Demel Frühstück 07](https://commons.wikimedia.org/wiki/File:Hofzuckerb%C3%A4cker_Demel_Fr%C3%BChst%C3%BCck_07.jpg) | Geolina163 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Wagner 地鐵站 | [Otto-Wagner-Pavillon Wien](https://commons.wikimedia.org/wiki/File:Otto-Wagner-Pavillon_Wien.jpg) | Thomas Wolf, www.foto-tw.de | [CC BY-SA 3.0 de](https://creativecommons.org/licenses/by-sa/3.0/de/deed.en) |
| Schiele | [Krumau – Crescent of Houses (The small City V)](https://commons.wikimedia.org/wiki/File:Egon_Schiele_-_Krumau_-_Crescent_of_Houses_(The_small_City_V)_-_Google_Art_Project.jpg) | Egon Schiele（Google Art Project 掃描） | 公共領域 |
| 阿特湖 | [Insel im Attersee](https://commons.wikimedia.org/wiki/File:Gustav_Klimt_-_Insel_im_Attersee_(c._1901-02).jpg) | Gustav Klimt | 公共領域 |

## 重新產生圖片

`tools/build.js` 產生桌布和全部圖片組件：`tools/kit.js` 是共用的紙、金框、方格角與桌布，`tools/photo.js` 是照片的紙卡外框，`tools/motifs/` 是手繪的樂譜與 Der Kuss，`tools/photos/` 是裁好的照片。SVG 用 resvg 輸出；字型用 Cormorant Garamond 與 Noto Serif TC，都是 Google Fonts 的開放授權字型，不放在 repo 裡，用法寫在 build.js 開頭。
