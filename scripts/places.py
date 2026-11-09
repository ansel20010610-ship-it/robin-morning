#!/usr/bin/env python3
"""Which countries a news item names, for the app's 讀過的世界 map (the countries the reader has met in the news column).

COUNTRIES gives every country its ISO 3166-1 alpha-2 code, its display name and the other ways Taiwan's wire copy writes
it; CITIES adds the capitals, big cities and metonyms (白宮, 克里姆林宮, 唐寧街) that stand in for a country. A name that
would misfire is left out on purpose: single characters (美, 英, 中 sit inside other words), 查德 (調查德國), 海地 (沿海地區),
東加 (中東加沙), 獅子山 (the Hong Kong hill), 中油 (其中油價), 龍山 (龍山寺), 伯斯 (賈伯斯), 馬賽 (馬賽克), 里約 (公里約,
里約熱內盧 stays), and regions, seas and organisations that belong to no one country (中東, 南海, 歐盟, 聯合國, 北約). STOP
swallows the frames a name sits in without meaning the country (其中國際, 歐美國家, 今日本土, 抵達卡達). The writer sets
"place" on the item when the automatic match would miss (editorial/columns/news.md).

  places_of("赫爾松停火原訂週日到期 … 俄方不要")  →  ["RU", "UA"]
  python3 scripts/places.py                       runs the self-test
"""
import re

# code: (display name, other spellings …). The first name is what the map shows.
COUNTRIES = {
    # East and Southeast Asia
    "TW": ("台灣", "臺灣", "中華民國"),
    "CN": ("中國", "中國大陸", "中華人民共和國", "中共"),
    "HK": ("香港",),
    "MO": ("澳門",),
    "JP": ("日本",),
    "KR": ("南韓", "韓國", "大韓民國"),
    "KP": ("北韓", "朝鮮民主主義人民共和國"),
    "MN": ("蒙古",),
    "VN": ("越南",),
    "TH": ("泰國",),
    "MY": ("馬來西亞", "大馬"),
    "SG": ("新加坡", "星國"),
    "ID": ("印尼", "印度尼西亞"),
    "PH": ("菲律賓",),
    "MM": ("緬甸",),
    "KH": ("柬埔寨",),
    "LA": ("寮國",),
    "BN": ("汶萊", "汶萊蘇丹"),  # the longer name keeps 蘇丹 from lighting up Sudan
    "TL": ("東帝汶",),
    # South and Central Asia
    "IN": ("印度",),
    "PK": ("巴基斯坦",),
    "BD": ("孟加拉",),
    "LK": ("斯里蘭卡",),
    "NP": ("尼泊爾",),
    "BT": ("不丹",),
    "MV": ("馬爾地夫",),
    "AF": ("阿富汗",),
    "KZ": ("哈薩克",),
    "UZ": ("烏茲別克",),
    "TM": ("土庫曼",),
    "KG": ("吉爾吉斯",),
    "TJ": ("塔吉克",),
    # Middle East and the Caucasus
    "IR": ("伊朗",),
    "IQ": ("伊拉克",),
    "SY": ("敘利亞",),
    "LB": ("黎巴嫩",),
    "JO": ("約旦",),
    "IL": ("以色列",),
    "PS": ("巴勒斯坦",),
    "SA": ("沙烏地阿拉伯", "沙烏地", "沙國"),
    "AE": ("阿聯", "阿拉伯聯合大公國", "阿聯酋"),
    "QA": ("卡達",),
    "KW": ("科威特",),
    "BH": ("巴林",),
    "OM": ("阿曼",),
    "YE": ("葉門",),
    "TR": ("土耳其",),
    "CY": ("賽普勒斯",),
    "GE": ("喬治亞",),
    "AM": ("亞美尼亞",),
    "AZ": ("亞塞拜然",),
    # Europe
    # not 威爾斯: a surname too (Wiles, Welles) and in 新南威爾斯; validate warns on a miss, never on a false hit
    "GB": ("英國", "英格蘭", "蘇格蘭", "北愛爾蘭"),
    "IE": ("愛爾蘭",),
    "FR": ("法國",),
    "DE": ("德國",),
    "IT": ("義大利",),
    "ES": ("西班牙",),
    "PT": ("葡萄牙",),
    "NL": ("荷蘭",),
    "BE": ("比利時",),
    "LU": ("盧森堡",),
    "CH": ("瑞士",),
    "AT": ("奧地利",),
    "PL": ("波蘭",),
    "CZ": ("捷克",),
    "SK": ("斯洛伐克",),
    "HU": ("匈牙利",),
    "SI": ("斯洛維尼亞",),
    "HR": ("克羅埃西亞",),
    "BA": ("波士尼亞", "波士尼亞與赫塞哥維納"),
    "RS": ("塞爾維亞",),
    "ME": ("蒙特內哥羅",),
    "XK": ("科索沃",),
    "MK": ("北馬其頓", "馬其頓"),
    "AL": ("阿爾巴尼亞",),
    "GR": ("希臘",),
    "BG": ("保加利亞",),
    "RO": ("羅馬尼亞",),
    "MD": ("摩爾多瓦",),
    "UA": ("烏克蘭",),
    "BY": ("白俄羅斯",),
    "RU": ("俄羅斯", "俄國", "俄羅斯聯邦"),
    "LT": ("立陶宛",),
    "LV": ("拉脫維亞",),
    "EE": ("愛沙尼亞",),
    "FI": ("芬蘭",),
    "SE": ("瑞典",),
    "NO": ("挪威",),
    "DK": ("丹麥",),
    "IS": ("冰島",),
    "MT": ("馬爾他",),
    "VA": ("梵蒂岡", "教廷"),
    "MC": ("摩納哥",),
    "LI": ("列支敦斯登",),
    "SM": ("聖馬利諾",),
    "AD": ("安道爾",),
    # The Americas
    "US": ("美國", "美利堅"),
    "CA": ("加拿大",),
    "MX": ("墨西哥",),
    "GT": ("瓜地馬拉",),
    "BZ": ("貝里斯",),
    "HN": ("宏都拉斯",),
    "SV": ("薩爾瓦多",),
    "NI": ("尼加拉瓜",),
    "CR": ("哥斯大黎加",),
    "PA": ("巴拿馬",),
    "CU": ("古巴",),
    "HT": ("海地共和國",),
    "DO": ("多明尼加",),
    "JM": ("牙買加",),
    "BS": ("巴哈馬",),
    "BB": ("巴貝多",),
    "TT": ("千里達", "千里達及托巴哥"),
    "DM": ("多米尼克",),
    "GD": ("格瑞那達",),
    "LC": ("聖露西亞",),
    "VC": ("聖文森",),
    "KN": ("聖克里斯多福",),
    "AG": ("安地卡",),
    "CO": ("哥倫比亞",),
    "VE": ("委內瑞拉",),
    "GY": ("蓋亞那",),
    "SR": ("蘇利南",),
    "EC": ("厄瓜多",),
    "PE": ("秘魯",),
    "BO": ("玻利維亞",),
    "BR": ("巴西",),
    "PY": ("巴拉圭",),
    "UY": ("烏拉圭",),
    "AR": ("阿根廷",),
    "CL": ("智利",),
    # Africa
    "EG": ("埃及",),
    "LY": ("利比亞",),
    "TN": ("突尼西亞",),
    "DZ": ("阿爾及利亞",),
    "MA": ("摩洛哥",),
    "EH": ("西撒哈拉",),
    "SD": ("蘇丹",),
    "SS": ("南蘇丹",),
    "ET": ("衣索比亞",),
    "ER": ("厄利垂亞",),
    "DJ": ("吉布地",),
    "SO": ("索馬利亞",),
    "KE": ("肯亞",),
    "UG": ("烏干達",),
    "TZ": ("坦尚尼亞",),
    "RW": ("盧安達",),
    "BI": ("蒲隆地",),
    "CD": ("剛果民主共和國", "民主剛果", "剛果（金）", "剛果"),
    "CG": ("剛果共和國", "剛果（布）"),
    "CF": ("中非共和國",),
    "CM": ("喀麥隆",),
    "GA": ("加彭",),
    "GQ": ("赤道幾內亞",),
    "ST": ("聖多美普林西比", "聖多美"),
    "NG": ("奈及利亞", "尼日利亞"),
    "NE": ("尼日",),
    "TD": ("查德共和國",),
    "ML": ("馬利",),
    "BF": ("布吉納法索",),
    "SN": ("塞內加爾",),
    "GM": ("甘比亞",),
    "GW": ("幾內亞比索",),
    "GN": ("幾內亞",),
    "SL": ("獅子山共和國",),
    "LR": ("賴比瑞亞",),
    "CI": ("象牙海岸", "科特迪瓦"),
    "GH": ("迦納",),
    "TG": ("多哥",),
    "BJ": ("貝南",),
    "MR": ("茅利塔尼亞",),
    "CV": ("維德角",),
    "AO": ("安哥拉",),
    "ZM": ("尚比亞",),
    "ZW": ("辛巴威",),
    "MW": ("馬拉威",),
    "MZ": ("莫三比克",),
    "MG": ("馬達加斯加",),
    "MU": ("模里西斯",),
    "SC": ("塞席爾",),
    "KM": ("葛摩",),
    "NA": ("納米比亞",),
    "BW": ("波札那",),
    "ZA": ("南非",),
    "LS": ("賴索托",),
    "SZ": ("史瓦帝尼", "史瓦濟蘭"),
    # Oceania
    "AU": ("澳洲", "澳大利亞"),
    "NZ": ("紐西蘭",),
    "PG": ("巴布亞紐幾內亞",),
    "FJ": ("斐濟",),
    "SB": ("索羅門群島", "索羅門"),
    "VU": ("萬那杜",),
    "WS": ("薩摩亞",),
    "TO": ("東加王國",),
    "KI": ("吉里巴斯",),
    "TV": ("吐瓦魯",),
    "NR": ("諾魯",),
    "PW": ("帛琉",),
    "MH": ("馬紹爾群島", "馬紹爾"),
    "FM": ("密克羅尼西亞",),
}

# Capitals, big cities, seats of government and the other words the wire uses for a country. A disputed place goes to
# the state the UN recognises there (克里米亞 → UA); a Taiwanese county or agency that only Taiwan has goes to TW.
CITIES = {
    "US": ("華府", "華盛頓", "紐約", "白宮", "五角大廈", "國會山莊", "聯準會", "華爾街", "矽谷", "洛杉磯", "舊金山", "芝加哥",
           "休士頓", "邁阿密", "西雅圖", "波士頓", "底特律", "拉斯維加斯", "加州", "德州", "佛州", "喬治亞州", "夏威夷",
           "阿拉斯加", "波多黎各", "美軍"),
    "GB": ("倫敦", "唐寧街", "西敏", "白金漢宮", "曼徹斯特", "利物浦", "伯明罕", "愛丁堡", "貝爾法斯特"),
    "FR": ("巴黎", "愛麗榭宮", "里昂", "史特拉斯堡"),
    "DE": ("柏林", "慕尼黑", "法蘭克福", "科隆", "德勒斯登"),
    "IT": ("羅馬", "米蘭", "威尼斯", "拿坡里", "杜林", "佛羅倫斯"),
    "ES": ("馬德里", "巴塞隆納", "塞維亞", "瓦倫西亞"),
    "PT": ("里斯本",),
    "NL": ("阿姆斯特丹", "海牙", "鹿特丹"),
    "BE": ("布魯塞爾",),
    "LU": ("盧森堡市",),
    "CH": ("日內瓦", "蘇黎世", "伯恩", "達沃斯", "巴塞爾"),
    "AT": ("維也納",),
    "PL": ("華沙",),
    "CZ": ("布拉格",),
    "SK": ("布拉提斯拉瓦",),
    "HU": ("布達佩斯",),
    "SI": ("盧比安納",),
    "HR": ("札格雷布",),
    "BA": ("塞拉耶佛",),
    "RS": ("貝爾格勒",),
    "GR": ("雅典",),
    "BG": ("索菲亞",),
    "RO": ("布加勒斯特",),
    "MD": ("基希涅夫",),
    "SE": ("斯德哥爾摩",),
    "NO": ("奧斯陸",),
    "DK": ("哥本哈根",),
    "FI": ("赫爾辛基",),
    "IE": ("都柏林",),
    "IS": ("雷克雅維克",),
    "LT": ("維爾紐斯",),
    "BY": ("明斯克",),
    "UA": ("基輔", "赫爾松", "哈爾科夫", "敖德薩", "奧列什基", "札波羅熱", "頓巴斯", "頓內次克", "盧甘斯克", "利維夫", "馬力波",
           "克里米亞", "烏軍"),
    "RU": ("莫斯科", "克里姆林宮", "聖彼得堡", "海參崴", "俄軍", "俄方"),
    "GE": ("第比利斯", "提比里斯"),
    "AM": ("葉里溫",),
    "AZ": ("巴庫",),
    "TR": ("安卡拉", "伊斯坦堡"),
    "CY": ("尼古西亞",),
    "IL": ("特拉維夫", "耶路撒冷", "海法", "以色列國防軍"),
    "PS": ("加薩", "加沙", "約旦河西岸", "拉馬拉", "拉法", "汗尤尼斯", "哈瑪斯"),
    "LB": ("貝魯特", "真主黨"),
    "SY": ("大馬士革", "阿勒坡"),
    "JO": ("安曼",),
    "IQ": ("巴格達", "摩蘇爾", "巴斯拉"),
    "IR": ("德黑蘭", "伊斯法罕", "革命衛隊"),
    "SA": ("利雅德", "吉達", "麥加"),
    "AE": ("杜拜", "阿布達比"),
    "QA": ("杜哈",),
    "YE": ("沙那", "荷台達", "亞丁", "胡塞"),
    "AF": ("喀布爾", "塔利班"),
    "PK": ("伊斯蘭馬巴德", "喀拉蚩", "拉合爾"),
    "IN": ("新德里", "德里", "孟買", "加爾各答", "班加羅爾", "清奈"),
    "BD": ("達卡",),
    "LK": ("可倫坡",),
    "NP": ("加德滿都",),
    "KZ": ("阿斯塔納", "阿拉木圖"),
    "UZ": ("塔什干",),
    "MN": ("烏蘭巴托",),
    "CN": ("北京", "上海", "中南海", "深圳", "廣州", "杭州", "武漢", "成都", "重慶", "天津", "南京", "西安", "新疆", "西藏",
           "內蒙古", "福建", "廈門", "浙江", "廣東", "海南", "青島", "大連", "國台辦", "解放軍", "新華社", "人民大會堂"),
    "HK": ("港府", "中聯辦"),
    "JP": ("東京", "永田町", "大阪", "京都", "名古屋", "福岡", "札幌", "沖繩", "廣島", "長崎", "橫濱", "神戶", "北海道"),
    "KR": ("首爾", "青瓦台", "釜山", "仁川"),
    "KP": ("平壤",),
    "VN": ("河內", "胡志明市"),
    "TH": ("曼谷", "清邁", "普吉"),
    "MY": ("吉隆坡", "檳城", "沙巴"),
    "ID": ("雅加達", "峇里島", "巴厘島"),
    "PH": ("馬尼拉", "宿霧"),
    "MM": ("仰光", "奈比多"),
    "KH": ("金邊",),
    "LA": ("永珍",),
    "AU": ("坎培拉", "雪梨", "墨爾本", "布里斯本", "阿得雷德"),
    "NZ": ("威靈頓",),
    "TO": ("努瓜婁發",),
    "CA": ("渥太華", "多倫多", "溫哥華", "蒙特婁", "魁北克"),
    "MX": ("墨西哥城",),
    "BR": ("巴西利亞", "聖保羅", "里約熱內盧"),
    "AR": ("布宜諾斯艾利斯",),
    "CO": ("波哥大",),
    "VE": ("卡拉卡斯",),
    "CU": ("哈瓦那",),
    "HT": ("太子港",),
    "EC": ("基多",),
    "BO": ("拉巴斯",),
    "UY": ("蒙特維多",),
    "PY": ("亞松森",),
    "EG": ("開羅", "亞歷山卓", "蘇伊士"),
    "LY": ("的黎波里", "班加西"),
    "TN": ("突尼斯",),
    "DZ": ("阿爾及爾",),
    "MA": ("拉巴特", "卡薩布蘭加"),
    "SD": ("喀土穆",),
    "ET": ("阿迪斯阿貝巴",),
    "SO": ("摩加迪休",),
    "KE": ("奈洛比",),
    "TZ": ("三蘭港",),
    "CD": ("金夏沙", "戈馬"),
    "NG": ("拉哥斯", "阿布加"),
    "GH": ("阿克拉",),
    "SN": ("達喀爾",),
    "TD": ("恩加美納",),
    "ML": ("巴馬科",),
    "SL": ("自由城",),
    "ZA": ("約翰尼斯堡", "開普敦", "普勒托利亞"),
    "TW": ("台北", "臺北", "新北", "台中", "臺中", "高雄", "台南", "臺南", "桃園", "基隆", "新竹", "苗栗", "彰化", "南投",
           "雲林", "嘉義", "屏東", "宜蘭", "花蓮", "台東", "臺東", "澎湖", "金門", "馬祖", "綠島", "蘭嶼", "台灣海峽",
           "行政院", "立法院", "監察院", "司法院", "考試院", "海巡署", "氣象署", "疾管署", "衛福部", "健保署", "中選會",
           "陸委會", "金管會", "國發會", "國科會", "數發部", "中研院", "台鐵", "台積電"),
}

# Words that contain a country's name but are not about it: consumed with no code, so 印度洋 does not light up India.
# The frame words (其中國際, 歐美國家, 今日本土) and the arrival verbs (抵達卡達 would otherwise read 達卡) are the same
# device: an equal-length name starting earlier takes the characters first.
STOP = ("印度洋", "日本海", "墨西哥灣", "日本腦炎", "德國麻疹", "西班牙流感", "法國號", "法國麵包", "中國時報", "中國城",
        "俄羅斯輪盤", "馬利亞", "拉法葉", "美屬薩摩亞", "巴西利亞大學", "蘇丹紅", "金門大橋", "沿海南", "平台中", "舞台中",
        "其中國", "會中國", "歐美國", "今日本", "昨日本", "抵達", "到達", "送達",
        # the other regions before 美國; four characters, so 拉美國下水, 越南美國 and 中美國防 keep their countries
        "拉美國家", "南美國家", "南美國協", "北美國家", "中美國家")

NAMES = {code: names[0] for code, names in COUNTRIES.items()}

TABLE = {}  # name → code (None for a STOP word)
for _code, _names in list(COUNTRIES.items()) + list(CITIES.items()):
    for _n in _names:
        TABLE[_n] = _code
for _n in STOP:
    TABLE[_n] = None

# A lookahead reports the longest key starting at every position without consuming it, so places_of() can see both
# 多哥 and 哥倫比亞 in 許多哥倫比亞人 and keep the longer one.
_SCAN = re.compile("(?=(%s))" % "|".join(map(re.escape, sorted(TABLE, key=len, reverse=True))))
_CODE = re.compile(r"^[A-Z]{2}$")


def places_of(text):
    """The alpha-2 codes of the countries named in text, sorted and unique. Longest match wins where names overlap
    (約旦河西岸 → PS, not JO; 白俄羅斯 → BY, not RU), and a STOP word (印度洋) yields nothing."""
    if not isinstance(text, str) or not text:
        return []
    spans = sorted(((m.start(1), m.end(1)) for m in _SCAN.finditer(text)), key=lambda s: (s[0] - s[1], s[0]))
    taken, out = [], set()
    for a, b in spans:
        if any(a < y and x < b for x, y in taken):
            continue
        taken.append((a, b))
        code = TABLE[text[a:b]]
        if code:
            out.add(code)
    return sorted(out)


def place_codes(value):
    """A news item's own "place" as a list of codes: one alpha-2 string or a list of one to four; None when it is
    malformed or absent (build_index then falls back to places_of; validate.py reports it)."""
    codes = [value] if isinstance(value, str) else value
    if isinstance(codes, list) and 1 <= len(codes) <= 4 and all(isinstance(c, str) and _CODE.match(c) for c in codes):
        return codes
    return None


if __name__ == "__main__":
    assert all(len(k) > 1 for k in TABLE), [k for k in TABLE if len(k) < 2]
    names = [n for ns in list(COUNTRIES.values()) + list(CITIES.values()) for n in ns] + list(STOP)
    dup = {n for n in names if names.count(n) > 1}
    assert not dup, "同一個名字出現兩次：%s" % dup
    assert set(CITIES) <= set(COUNTRIES), set(CITIES) - set(COUNTRIES)
    cases = [
        ("赫爾松州 10 月 27 日起的局部停火原訂到期。烏克蘭官員對法新社說，基輔提出延長，「俄方不要」。", ["RU", "UA"]),
        ("安理會表決，美國草案被俄羅斯否決，聯合國駐西撒哈拉任務失效；摩洛哥歡迎，阿爾及利亞反對。", ["DZ", "EH", "MA", "RU", "US"]),
        ("剛果民主共和國政府數據顯示伊波拉死亡逾 5,000；奈及利亞成為第四個通報病例的非洲國家。", ["CD", "NG"]),
        ("聯合國生物多樣性大會在亞美尼亞閉幕，通過「葉里溫路徑」；下一屆將在厄瓜多舉行。", ["AM", "EC"]),
        ("中國海警局說編隊在台灣以東海域執法巡查，海巡署稱是認知作戰。", ["CN", "TW"]),
        ("台灣東部海域發生規模 5.6 地震，宜蘭與花蓮最大震度 3 級。", ["TW"]),
        ("中油宣布汽柴油價格不調整，中東衝突推高國際油價。", []),
        ("以色列軍隊進入約旦河西岸的拉馬拉，白宮與唐寧街同日表態。", ["GB", "IL", "PS", "US"]),
        ("白俄羅斯與俄羅斯在明斯克舉行聯合演習；北愛爾蘭與愛爾蘭的邊界談判另案進行。", ["BY", "GB", "IE", "RU"]),
        ("許多哥倫比亞移民經墨西哥灣北上；印度洋上的季風今年來得晚。", ["CO"]),
        ("聖母馬利亞像在羅馬展出；歐盟與北約在布魯塞爾開會。", ["BE", "IT"]),
        ("內蒙古沙塵南下，蒙古首都烏蘭巴托同日降雪；喬治亞州選舉與喬治亞的親歐示威無關。", ["CN", "GE", "MN", "US"]),
        ("南韓總統在青瓦台會見日本首相；北韓自平壤發射飛彈，落入日本海。", ["JP", "KP", "KR"]),
        ("美國特使抵達卡達，與哈瑪斯談判；孟加拉代表到達杜哈。", ["BD", "PS", "QA", "US"]),
        ("其中國際油價走高，歐美國家同聲譴責；今日本土新增病例，會中國防部長表示無關。", []),
        ("龍山寺前的馬賽克拼貼，公里約三小時；沿海南部豪雨，舊金山金門大橋封閉，汶萊蘇丹到訪，蘇丹紅下架。", ["BN", "US"]),
        ("巴西總統呼籲拉美國家團結；南美國家聯盟、南美國協、北美國家與中美國家各自開會。", ["BR"]),
        ("中美國防部長會晤；白宮幕僚長蘇西・威爾斯（Susie Wiles）；新南威爾斯山火。", ["US"]),
        ("", []),
        (None, []),
    ]
    bad = [(t, want, places_of(t)) for t, want in cases if places_of(t) != want]
    for t, want, got in bad:
        print("FAIL %r\n     want %s got %s" % (t, want, got))
    assert place_codes("UA") == ["UA"] and place_codes(["IL", "PS"]) == ["IL", "PS"]
    assert place_codes("ua") is None and place_codes([]) is None and place_codes(["A", "B", "C", "D", "E"]) is None
    assert place_codes(None) is None and place_codes({"x": 1}) is None
    print("places.py：%d 國、%d 個名字，%d 句自測%s" % (len(NAMES), len(TABLE), len(cases), "全部通過" if not bad else "，%d 句失敗" % len(bad)))
    raise SystemExit(1 if bad else 0)
