# 牙周經典導讀（perio）｜主欄・每日

## 使用者規格
每日一篇經典牙周論文導讀。2026-10-31 起：只選有明確、有證據力結論的論文，讓社長在臨床有底氣（見「選文」）。

## 選文：證據要硬（2026-10-31 起）
社長：「不要選野雞論文，我要可以有明確且有證據力的結論的那種，讓我可以在臨床有底氣。」過去幾期挑了不少樣本只有十幾人的早期經典（10-31 的 takeaway 還得自己寫「只有 10 人」），讀完反而不敢用。從 11 月 1 日起，主角論文一律照下面的規則挑。

**證據等級，由高往低挑**（同一個觀念，有高階證據就不用低階的）：
1. **臨床指引與共識報告**：EFP S3 臨床指引（第 I–III 期 Sanz 2020；第 IV 期 Herrera 2022；植體周圍疾病 Herrera 2023）、2017 世界研討會共識與病例定義、EFP／AAP 研討會共識報告。
2. **系統性回顧與統合分析**：Cochrane、EFP／AAP 研討會的系統性回顧（多刊在 *J Clin Periodontol* 增刊、*J Periodontol* 增刊）。
3. **大型隨機對照試驗**：每組至少 30 人、追蹤至少 6 個月（再生、維護治療至少 1 年），結果是臨床指標（牙齒喪失、CAL、PD、BOP、HbA1c 等）。
4. **長期前瞻世代研究**：追蹤至少 5 年、上百人（例：Löe 1986 斯里蘭卡、Axelsson 2004 的 30 年）。

**不選**：
- 動物、體外、屍體研究；病例報告、病例系列；橫斷研究；敘述性回顧與專家意見；每組少於 30 人的單一試驗。這些最多在正文用一句帶過歷史，不當主角。
- 結論模糊（「可能有關」「需要更多研究」就是全部結論）、或已被後來高階證據推翻的論文（除非這篇就是推翻它的那篇）。
- **期刊不在白名單的**。白名單（`scripts/validate.py` 的 `PERIO_JOURNALS`，以 citation 裡 `*期刊縮寫*` 比對）：*J Clin Periodontol*、*J Periodontol*、*Periodontol 2000*（只用其中的系統性回顧）、*J Periodontal Res*、*J Dent Res*、*Clin Oral Implants Res*、*Clin Implant Dent Relat Res*、*Int J Oral Maxillofac Implants*、*Int J Periodontics Restorative Dent*、*J Dent*、*J Am Dent Assoc*、*Clin Oral Investig*、*Acta Odontol Scand*、*Scand J Dent Res*、*Cochrane Database Syst Rev*，以及 *N Engl J Med*、*Lancet*、*JAMA*、*BMJ*、*Ann Intern Med*、*Diabetes Care*、*Diabetologia*、*Circulation*、*Eur Heart J*、*J Am Coll Cardiol*、*Am J Prev Med*。MDPI、Frontiers、Hindawi、Cureus 等一律不用。

**經典老論文**（Löe 1965 這類）可以當主角，條件是：它的結論已被現在的系統性回顧或指引確認，而且正文要點出「後來的證據怎麼說」並附書目；否則改用確認它的那篇系統性回顧當主角，老論文當故事。

**必須核對**：PubMed 或期刊官網的書目資料（作者、年份、期刊、卷期頁、DOI、PMID）。系統性回顧與指引優先讀全文（EFP 增刊、Cochrane 多半開放取用）；只讀得到摘要時，摘要裡要有效果量與信賴區間才寫，並在 `access` 寫明。
**怎麼讀到書目與摘要**：pubmed.ncbi.nlm.nih.gov 的網頁用 WebFetch 常只拿到「請啟用 Cookie」的空頁，改用 Bash 呼叫公開 API：`curl -s "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<PMID>&rettype=abstract&retmode=text"`（PubMed 摘要）、`curl -s "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:<DOI>&resultType=core&format=json"`（Europe PMC：PMID、摘要、開放全文連結）、`curl -s "https://api.crossref.org/works/<DOI>"`（卷期頁）。用 DOI 查到的 PMID 要再用 efetch 回查一次標題，確認是同一篇。
- 跑 `python3 scripts/ledger.py --column perio` 查已導讀過的 DOI，不重複。

**證據力要寫出來**：`paper` 論文卡加 `evidence` 欄位，一行 60 字內，寫研究設計、規模與證據確定性，App 會放在標題下方「帶得走的結論」框裡。格式像「Cochrane 系統性回顧：N 篇隨機試驗、N 人；證據確定性中等」「EFP S3 臨床指引：依 N 篇系統性回顧；強建議」「前瞻世代研究：N 人追蹤 N 年」，數字照論文填。確定性或建議強度只寫論文自己報告的（GRADE 等），沒報告就不寫。

## 寫給誰、要達成什麼
讀者是牙醫，早上用手機讀，時間不一定。社長要的是兩樣東西：**一個馬上帶得走的新知**，和**一個基本牙周觀念的複習**。三分鐘內讀完，讀完能用一句話告訴同事。

社長反映過：「看不懂、抓不到重點、常常根本沒讀」，之後又說「希望再簡短」。所以全文 600–1,000 字，寧可少寫，不要寫滿。

## 選題：每天一個基本觀念，配一篇證據最硬的論文
照下面的觀念清單由上往下輪，挑第一個近 30 天內沒寫過的觀念，再照上面的證據等級選論文（ledger 查 DOI 不重複）。括號裡是建議的主文獻，寫之前照「必須核對」查書目；找到更新、更高階的同主題證據就用新的。
1. 菌斑與牙齦炎：可逆、怎麼預防（EFP 研討會共識 Chapple 2015；故事可用 Löe 1965）
2. 牙周炎進展速度因人而異（Löe 1986 斯里蘭卡世代研究）
3. 探診出血的意義：陰性預測值（Lang 1990；寫明它是診斷準確度研究）
4. 刷牙與牙間清潔：電動牙刷、牙線、牙間刷誰有證據（Cochrane：Yaacob 2014、Worthington 2019）
5. 非手術治療（齦下清創）能做到多少（Suvan 2020 系統性回顧）
6. 什麼時候該翻瓣：手術與非手術的比較（Heitz-Mayfield 2002；Sanz-Sánchez 2020）
7. 輔助性全身抗生素：誰值得用（Teughels 2020 統合分析）
8. 支持性牙周治療與長期留牙（Lee 2015 統合分析；Trombelli 2015；Axelsson 2004 的 30 年世代）
9. 骨內缺損的再生手術（Nibali 2020 系統性回顧）
10. 根分岔病變：預後與再生（Nibali 2016 牙齒喪失統合分析；Jepsen 2020 網絡統合分析）
11. 牙齦退縮的根面覆蓋（Cairo 2014；Chambrone & Tatakis 2015）
12. 角化組織寬度到底要不要補（Kim & Neiva 2015 系統性回顧）
13. 吸菸與牙周炎、戒菸的效果（Leite 2018 統合分析）
14. 糖尿病：治療牙周能降多少 HbA1c（Cochrane Simpson 2022；共識 Sanz 2018）
15. 牙周炎與心血管疾病：證據到哪裡（共識 Sanz 2020）
16. 懷孕期的牙周治療與早產（Michalowicz 2006 NEJM 隨機試驗）
17. 2017 新分類：分期與分級（Papapanou 2018；Tonetti 2018）
18. 第 I–III 期牙周炎的治療指引（EFP S3，Sanz 2020）
19. 第 IV 期牙周炎的治療指引（EFP S3，Herrera 2022）
20. 植體周圍疾病的定義與治療（Berglundh 2018；EFP S3，Herrera 2023）

## 結構
0. **`takeaway`（帶得走的結論）**：頂層欄位，App 放在標題下方的醒目框（`paper.evidence` 會接在它下面）。一到兩句、40–90 字，具體到明天看診就用得上：證據顯示了什麼（效果量或數字）、所以臨床上怎麼做。只寫論文確實證明的；要靠「只有 10 人」這類但書撐著的結論，代表選錯論文了，回頭換一篇。
   **`quiz`（複習小卡的問題）**：頂層欄位，一句 15–40 字的問題，答案就是 takeaway。App 每天拿舊文章出三張小卡給讀者自我測驗，所以問題要像學長在診間考你，問題本身不洩漏答案。例：「病人說不痛也沒流血，可以當作牙齦沒發炎嗎？」
1. **正文要涵蓋下面三件事，順序與小標自由**，照你覺得最好看的方式排（範文 `editorial/examples/perio.md`）：
   - **一個基本觀念**：定義、為什麼重要、臨床上常見的誤解。讀者是牙醫，他背過的東西一句帶過，篇幅留給他不知道或常想錯的地方。
   - **這篇論文怎麼證明的**：系統性回顧就說納入多少研究、多少人、合併後的效果量；試驗或世代研究就說受試者、做法、追蹤多久。只留一到兩個關鍵數字，換成直覺的說法（「每 100 個不出血的部位，有 98 個沒有惡化」）。不自行推算論文沒有報告的統計量。
   - **臨床上怎麼用、要小心什麼**：合計三到五點，可以是一個 `list`。小標寫具體內容，不用「明天看診怎麼用」「要小心的地方」這種每期一樣的字樣。
   - 開頭不要用「病人問：」「病人回診：」（10-26、10-27 都這樣開，已成套路）。正文不重複 takeaway 的句子，結尾不重講開頭。
2. `paper` 論文卡放在最後：`citation`（期刊縮寫用 `*...*` 標出）、`doi`、`pmid`、`link`、`evidence`（證據力，見上）、`design`、`sample`、`access`（資料範圍：依全文，或依摘要與後續文獻整理）。資料範圍只在這裡交代，正文不討論取得全文的過程。

## 寫法
- 600–1,000 字。小標題直接寫內容。
- 專業術語照用，第一次出現附英文；段落短，一段一件事。
- 事實、作者的詮釋、本報的推論用句子分清楚（「作者認為」「我猜」），不貼出處類 `tag`。
- 不寫「後來的研究」長段；真的重要，在臨床清單裡用一句帶過並附書目。
- `brief`：第一句是這篇最好的那件事（一個反直覺的發現或數字），後面補臨床意義；見 STYLE.md 第六節。

## 圖
頭圖：與主題相關、授權清楚（PD／CC0／CC BY／CC BY-SA）的臨床照片或公版解剖、組織學插圖，作者照片（Commons 有授權者），或原創的研究設計圖。臨床照片的圖說要寫明與論文受試者無關。論文原圖除非是 CC BY 開放取用，否則不轉載，改畫原創圖解並註明「依原文數據重繪」。

## 固定欄位
`disclaimer`: "醫學教學導讀，非個別診療建議。"
`topic_key`: `perio:doi:<DOI 小寫>`
