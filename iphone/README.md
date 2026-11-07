# iPhone：維也納主畫面

和晨報同一套紙色與金色：分離派的方格、月桂、金頂。每一樣都有日間（tag）和夜間（nacht）兩個版本。

手機上可以直接從這裡下載：`https://wiener-morgen-private.duckdns.org/iphone/`，後面接下面的檔名。

## 桌布

| 檔案 | 用途 |
| --- | --- |
| `wallpaper/wien-tag.jpg` | 主畫面，日間 |
| `wallpaper/wien-nacht.jpg` | 主畫面，夜間 |

設定 → 背景圖片 → 加入新背景圖片 → 照片，選這張，設成主畫面。鎖定畫面可以另外選一張或保留原本的。

頂端那行是維也納分離派展覽館門楣上的格言：DER ZEIT IHRE KUNST · DER KUNST IHRE FREIHEIT（給時代它的藝術，給藝術它的自由），剛好落在狀態列和第一排組件之間。

## 會變的組件：維也納日曆

`wiener-kalender.js`，用免費的 Scriptable App。

1. App Store 下載 Scriptable。
2. 把 `wiener-kalender.js` 存到「檔案」App 的 iCloud Drive → Scriptable 資料夾，Scriptable 裡就會出現「wiener-kalender」。也可以在 Scriptable 按右上角＋，把檔案內容整個貼進去，命名 wiener-kalender。
3. 在主畫面長按 → 左上角＋ → Scriptable → 選小、中或大 → 加入。
4. 長按剛加入的組件 → 編輯小工具 → Script 選 wiener-kalender。

小型是當天的星期、日期、月份；中型旁邊多一頁月曆（週一開頭，像維也納的月曆）；大型是整頁月曆。鎖定畫面的三種小組件也可以用。日夜模式會自動換色，每天午夜換一頁。它不連網，不讀任何資料。

## 圖片組件

用 Colorful Widget 或 iScreen 的「照片」組件，選對應尺寸，放進這些圖：

| 檔案 | 尺寸 | 內容 |
| --- | --- | --- |
| `widgets/kuppel-klein-*.jpg` | 小 | 分離派金頂，VER SACRUM |
| `widgets/lebensbaum-klein-*.jpg` | 小 | 生命之樹（Klimt 斯托克雷宮壁畫） |
| `widgets/lebensbaum-gross-*.jpg` | 大 | 生命之樹，整幅 |
| `widgets/motto-mittel-*.jpg` | 中 | 分離派格言與中文譯文 |
| `widgets/weizenkorn-klein-*.jpg` | 小 | 一粒麥子，直排 |
| `widgets/weizenkorn-mittel-*.jpg` | 中 | 《約翰福音》十二章二十四節 |

照片組件不會跟著日夜模式換圖，挑和桌布同一色的那一版。

## 建議的三頁

- **第一頁**：中型日曆在最上面；左邊小型金頂，右邊四個 App；底下中型格言。
- **第二頁**：大型生命之樹佔上面四排，底下兩排 App。
- **第三頁**：中型經文在最上面；左邊小型日曆，右邊小型生命之樹；底下兩排 App。

## 重新產生圖片

`tools/vienna.js` 是畫這些圖的程式（SVG 用 resvg 輸出）。字型用 Cormorant Garamond 與 Noto Serif TC，都是 Google Fonts 的開放授權字型，不放在 repo 裡；用法寫在檔案開頭。
