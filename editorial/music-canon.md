# 今日古典・必聽清單

由上往下介紹，每次挑第一首還沒寫過的（用 `python3 scripts/ledger.py --column music` 比對 topic_key）。一首曲子若有好幾個樂章或段落，文章可以只導聽最有名的那一段，但 `music` 區塊與 Spotify 對應整首或那一段都可以。
已介紹過、不在清單上的：貝多芬《田園》、德弗札克《新世界》、德布西《牧神的午後》、佛漢・威廉斯《雲雀高飛》等（見 ledger）。

## 指定日期（選曲先看這裡）
社長點的特輯。日子到了寫這裡的，不照下面的清單順序；被指定的那一列，清單輪到時跳過，不提前寫。備稿也不寫它。

### 莫札特《第 41 號交響曲》（朱彼特）四天特輯：2027-01-27 起
一天一個樂章，從 1 月 27 日（莫札特生日）開始。從這天起，每天寫**還沒刊出的下一個樂章**（ledger 比對 topic_key），四個都刊出為止；哪天沒刊出（用了備稿、缺稿），順延到隔天，不跳樂章。

| 樂章 | topic_key | motif（已照樂譜核對，照抄） |
|---|---|---|
| 一、Allegro vivace | music:mozart-k551-1 | `C4:1 R:0.5 G3:0.167 A3:0.167 B3:0.167 C4:1 R:0.5 G3:0.167 A3:0.167 B3:0.167 C4:1` |
| 二、Andante cantabile | music:mozart-k551-2 | `F4:0.75 C4:0.25 A4:1.75 G4:0.125 F4:0.125 E4:0.5 R:0.5 Bb4:0.5 R:1.5 G4:0.75 C4:0.25 Bb4:1.75 A4:0.125 G4:0.125 F4:0.5` |
| 三、Menuetto: Allegretto – Trio | music:mozart-k551-3 | `G5:2 F#5:1 F5:1 E5:1 D5:1 C5:0.5 R:0.5 B4:0.5 R:0.5 C5:0.5 R:0.5 E5:2 D5:0.5` |
| 四、Molto allegro | music:mozart-k551-4 | `C5:4 D5:4 F5:4 E5:4 R:1 A5:1 A5:1 A5:1 G5:3 F5:0.25 E5:0.25 D5:0.25 C5:0.25` |

- 每篇單獨讀也看得懂（零背景）；標題或 dek 寫出《朱彼特》，dek 讓讀者知道這是四天特輯的第幾天。
- 第一篇先交代整首：寫於 1788 年夏天、莫札特最後一首交響曲、「朱彼特」這個名字的來歷（查證後再寫），再導聽第一樂章。後三篇各導聽一個樂章，不重講整首的背景。
- 終樂章那四個音（Do Re Fa Mi）在第三樂章的三重奏裡就先出現過，第三篇可以提；第四篇講終樂章最後五個主題同時響起。兩件事都照樂譜或可靠來源核對後再寫。
- `music` 區塊與 Spotify 對應當天那個樂章；四篇用同一張錄音。四篇的圖各不相同（ledger --images）。

## 第一輪：一定聽過的旋律
| # | 作品 | topic_key |
|---|---|---|
| 1 | 貝多芬《第五號交響曲》（命運） | music:beethoven-op67 |
| 2 | 韋瓦第《四季》 | music:vivaldi-four-seasons |
| 3 | 莫札特《弦樂小夜曲》K. 525 | music:mozart-k525 |
| 4 | 貝多芬〈給愛麗絲〉 | music:beethoven-woo59 |
| 5 | 帕海貝爾《D 大調卡農》 | music:pachelbel-canon |
| 6 | 巴哈〈G 弦上的詠嘆調〉（第三號管弦樂組曲 BWV 1068） | music:bach-bwv1068 |
| 7 | 貝多芬《月光奏鳴曲》 | music:beethoven-op27-2 |
| 8 | 德布西〈月光〉（《貝加馬斯克組曲》） | music:debussy-clair-de-lune |
| 9 | 柴可夫斯基《天鵝湖》 | music:tchaikovsky-op20 |
| 10 | 貝多芬《第九號交響曲》〈快樂頌〉 | music:beethoven-op125 |
| 11 | 莫札特《第 40 號交響曲》 | music:mozart-k550 |
| 12 | 小約翰・史特勞斯《藍色多瑙河》 | music:strauss-ii-op314 |
| 13 | 拉威爾《波麗露》 | music:ravel-bolero |
| 14 | 葛利格《皮爾金組曲》〈清晨〉〈山魔王的大廳〉 | music:grieg-op46 |
| 15 | 柴可夫斯基《胡桃鉗》 | music:tchaikovsky-op71 |
| 16 | 韓德爾《彌賽亞》〈哈利路亞〉 | music:handel-hwv56 |
| 17 | 蕭邦《降 E 大調夜曲》Op. 9 No. 2 | music:chopin-op9-2 |
| 18 | 奧福《布蘭詩歌》〈噢，命運女神〉 | music:orff-carmina-burana |
| 19 | 羅西尼《威廉泰爾序曲》 | music:rossini-william-tell |
| 20 | 比才《卡門》 | music:bizet-carmen |
| 21 | 史麥塔納〈莫爾道河〉 | music:smetana-moldau |
| 22 | 華格納〈女武神的騎行〉 | music:wagner-ride-of-the-valkyries |
| 23 | 薩替《吉姆諾佩迪》第一號 | music:satie-gymnopedie-1 |
| 24 | 巴哈《D 小調觸技曲與賦格》BWV 565 | music:bach-bwv565 |
| 25 | 普契尼〈公主徹夜未眠〉（《杜蘭朵》） | music:puccini-nessun-dorma |
| 26 | 舒伯特《鱒魚五重奏》 | music:schubert-d667 |
| 27 | 孟德爾頌《仲夏夜之夢》〈結婚進行曲〉 | music:mendelssohn-op61 |
| 28 | 理查・史特勞斯《查拉圖斯特拉如是說》 | music:strauss-r-op30 |
| 29 | 霍爾斯特《行星組曲》 | music:holst-op32 |
| 30 | 拉赫曼尼諾夫《第二號鋼琴協奏曲》 | music:rachmaninoff-op18 |

## 第二輪：名曲背後的經典大作
| # | 作品 | topic_key |
|---|---|---|
| 31 | 柴可夫斯基《第一號鋼琴協奏曲》 | music:tchaikovsky-op23 |
| 32 | 莫札特《安魂曲》 | music:mozart-k626 |
| 33 | 巴哈《第三號布蘭登堡協奏曲》 | music:bach-bwv1048 |
| 34 | 巴哈《第一號無伴奏大提琴組曲》 | music:bach-bwv1007 |
| 35 | 莫札特《魔笛》〈夜后詠嘆調〉 | music:mozart-k620 |
| 36 | 威爾第《茶花女》〈飲酒歌〉 | music:verdi-la-traviata |
| 37 | 布拉姆斯《匈牙利舞曲》第五號 | music:brahms-hungarian-dance-5 |
| 38 | 德弗札克《幽默曲》 | music:dvorak-op101-7 |
| 39 | 孟德爾頌《E 小調小提琴協奏曲》 | music:mendelssohn-op64 |
| 40 | 貝多芬《第五號鋼琴協奏曲》（皇帝） | music:beethoven-op73 |
| 41 | 舒伯特《未完成交響曲》 | music:schubert-d759 |
| 42 | 聖桑《動物狂歡節》〈天鵝〉 | music:saint-saens-carnival |
| 43 | 穆索斯基《展覽會之畫》（拉威爾配器） | music:mussorgsky-pictures |
| 44 | 林姆斯基－高沙可夫《天方夜譚》 | music:rimsky-korsakov-op35 |
| 45 | 艾爾加《威風凜凜進行曲》第一號 | music:elgar-op39 |
| 46 | 巴伯《弦樂慢板》 | music:barber-op11 |
| 47 | 蓋希文《藍色狂想曲》 | music:gershwin-rhapsody-in-blue |
| 48 | 李斯特《愛之夢》第三號 | music:liszt-s541 |
| 49 | 帕格尼尼《第 24 號隨想曲》 | music:paganini-op1-24 |
| 50 | 柴可夫斯基《第六號交響曲》（悲愴） | music:tchaikovsky-op74 |
| 51 | 馬勒《第五號交響曲》〈小慢板〉 | music:mahler-5 |
| 52 | 莫札特《第 21 號鋼琴協奏曲》 | music:mozart-k467 |
| 53 | 貝多芬《D 大調小提琴協奏曲》 | music:beethoven-op61 |
| 54 | 布拉姆斯《第一號交響曲》 | music:brahms-op68 |
| 55 | 蕭邦《英雄波蘭舞曲》 | music:chopin-op53 |
| 56 | 西貝流士《芬蘭頌》 | music:sibelius-op26 |
| 57 | 葛利格《A 小調鋼琴協奏曲》 | music:grieg-op16 |
| 58 | 德弗札克《B 小調大提琴協奏曲》 | music:dvorak-op104 |
| 59 | 佛瑞《安魂曲》 | music:faure-op48 |
| 60 | 普羅高菲夫《彼得與狼》 | music:prokofiev-op67 |

## 第三輪：音樂廳的常客（2026-11-02 社長定調）
前兩輪寫完後接著往下。社長的話：「主流名作講完可以慢慢拓寬，像馬勒《復活》之類的，但不要太冷門。」這一輪的標準是**常去音樂廳的人都認得、唱片行一定有好幾個版本、每年都有大樂團排進節目**的作品；不是每個人都哼得出旋律，但一聽就知道為什麼它是經典。馬勒《復活》正是這一輪的樣板。

| # | 作品 | topic_key |
|---|---|---|
| 61 | 馬勒《第二號交響曲》（復活） | music:mahler-2 |
| 62 | 布拉姆斯《德意志安魂曲》 | music:brahms-op45 |
| 63 | 貝多芬《第七號交響曲》 | music:beethoven-op92 |
| 64 | 蕭士塔高維契《第五號交響曲》 | music:shostakovich-op47 |
| 65 | 巴哈《郭德堡變奏曲》 | music:bach-bwv988 |
| 66 | 拉赫曼尼諾夫《帕格尼尼主題狂想曲》 | music:rachmaninoff-op43 |
| 67 | 西貝流士《小提琴協奏曲》 | music:sibelius-op47 |
| 68 | 德布西《海》 | music:debussy-la-mer |
| 69 | 柴可夫斯基《小提琴協奏曲》 | music:tchaikovsky-op35 |
| 70 | 布魯克納《第七號交響曲》 | music:bruckner-7 |
| 71 | 莫札特《費加洛婚禮》序曲與〈你們可知道〉 | music:mozart-k492 |
| 72 | 舒伯特《冬之旅》〈菩提樹〉 | music:schubert-d911 |
| 73 | 史特拉汶斯基《春之祭》 | music:stravinsky-rite-of-spring |
| 74 | 布拉姆斯《小提琴協奏曲》 | music:brahms-op77 |
| 75 | 馬勒《第一號交響曲》（巨人） | music:mahler-1 |
| 76 | 理查・史特勞斯《最後四首歌》 | music:strauss-vier-letzte-lieder |
| 77 | 威爾第《安魂曲》〈震怒之日〉 | music:verdi-requiem |
| 78 | 巴哈《馬太受難曲》〈憐憫我吧，我的神〉 | music:bach-bwv244 |
| 79 | 貝多芬《第三號交響曲》（英雄） | music:beethoven-op55 |
| 80 | 拉威爾《G 大調鋼琴協奏曲》 | music:ravel-piano-concerto-g |
| 81 | 德弗札克《第八號交響曲》 | music:dvorak-op88 |
| 82 | 蕭邦《第二號鋼琴協奏曲》 | music:chopin-op21 |
| 83 | 巴爾托克《管弦樂協奏曲》 | music:bartok-sz116 |
| 84 | 貝多芬《第三號鋼琴協奏曲》 | music:beethoven-op37 |
| 85 | 舒曼《鋼琴協奏曲》 | music:schumann-op54 |
| 86 | 普契尼《波希米亞人》〈你那好冷的小手〉 | music:puccini-la-boheme |
| 87 | 海頓《創世紀》〈諸天述說〉 | music:haydn-creation |
| 88 | 布拉姆斯《第四號交響曲》 | music:brahms-op98 |
| 89 | 孟德爾頌《義大利交響曲》 | music:mendelssohn-op90 |
| 90 | 莫札特《第 41 號交響曲》（朱彼特）：已排進上面的「指定日期」，輪到時跳過 | music:mozart-k551 |
| 91 | 柴可夫斯基《第五號交響曲》 | music:tchaikovsky-op64 |
| 92 | 普羅高菲夫《羅密歐與茱麗葉》〈騎士之舞〉 | music:prokofiev-op64 |
| 93 | 理查・史特勞斯《唐璜》 | music:strauss-op20 |
| 94 | 貝多芬《第 14 號弦樂四重奏》Op. 131 | music:beethoven-op131 |
| 95 | 馬勒《大地之歌》〈告別〉 | music:mahler-das-lied |
| 96 | 蕭士塔高維契《第八號弦樂四重奏》 | music:shostakovich-op110 |
| 97 | 舒伯特《第九號交響曲》（偉大） | music:schubert-d944 |
| 98 | 艾爾加《謎語變奏曲》〈寧祿〉 | music:elgar-op36 |
| 99 | 華格納《崔斯坦與伊索德》前奏曲與〈愛之死〉 | music:wagner-tristan |
| 100 | 拉赫曼尼諾夫《第二號交響曲》 | music:rachmaninoff-op27 |

第三輪寫完後，由每週稽核在這份檔案補上第四輪（同樣由主流到進階，不要太冷門），並在回報中告知社長。
