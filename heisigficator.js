// Kanji Heisigficator
//
// A script to list all kanji that should be learn according to Heisig's RTK
// method before learing given kanji.
//
// Based on KanjiVG explorer script by Ahmed Fasih et al.
// (http://fasiha.github.io/kanjivg-explorer/)
//
// Released under the Creative Commons
// Attribution-Share Aline 3.0 licence:
//
// http://creativecommons.org/licenses/by-sa/3.0/

// From http://stackoverflow.com/a/10073788/500207
// General-purpose utility here used to zero-pad four-digit hex codes to five.
function pad(n, width, padder) {
	padder = padder || '0';
	n = n + '';
	if (n.length >= width) {
		return n;
	} else {
		return new Array(width - n.length + 1).join(padder) + n;
	}
}

// Convert the first character of a string to its hex Unicode code point
function c2u(s, len) {
	len = len || 5;
	return pad(s.charCodeAt(0).toString(16), len);
}

// Convert a kanji to its URL in the KanjiVG directory structure
function kanji2url(k) {
	return "kanji/" + c2u(k) + ".svg";
}

// Reads the KanjiVG XML file for a given kanji, walks it to build a
// dependency graph of its elements, and finally calls `graph2svg`
// which renders it via D3. The dependency graph uses a format that's
// tied to the D3 example at http://bl.ocks.org/mbostock/4062045 and
// isn't the most sane.
function kanji2graph(kanji) {
	if (joyo.search(kanji) < 0) {return;}
	
	var nodes_dict = {}; // kvg:element -> index in nodes_arr
	var nodes_arr = [];
	var links_arr = [];
	var ids_dict = {}; // IDs seen
	
	var x; // To store the SVG
	
	d3.xhr(kanji2url(kanji), 'text/plain', function(e,req) {
		var t = req.responseText;
		x = $('svg', $.parseXML(t));
		// Now you can do craaazy things like:
		//$('g[kvg\\:element="蔵"]', x).children('g')
		
		// Recursive function that builds nodes_arr, links_arr
		function walk(parentnode, parentelement) {
			var pid = parentnode.attr('id');
			if (pid in ids_dict) {
				return;
			}
			ids_dict[pid] = pid;
			
			parentelement = parentelement || "root";
			var parelt = parentnode.attr('kvg\:element');
			var parorig = parentnode.attr('kvg\:original');
			parorig = parorig ? parorig : '';
			
			if (parelt) {
				parentelement = parelt;
				if (!(parelt in nodes_dict)) {
					nodes_dict[parelt] = nodes_arr.length;
					nodes_arr.push({"element": parelt, "original": parorig,
						"joyo": joyo.search(parelt) > -1 ? "true" : "false"});
				}
			}
			
			var children = parentnode.children('g');
			if (children.length == 0) {return;}
			
			for (var idx = 0; idx < children.length; idx++) {
				var child = $(children[idx]);
				var kvgelt = child.attr('kvg\:element');
				var kvgorig = child.attr('kvg\:original');
				kvgorig = kvgorig ? kvgorig : '';
				if (kvgelt) {
					// add it to nodes_arr if necessary
					// connect it to parent
					if (!(kvgelt in nodes_dict)) {
						nodes_dict[kvgelt] = nodes_arr.length;
						nodes_arr.push({"element": kvgelt, "original": kvgorig,
							"joyo": joyo.search(kvgelt) > -1 ? "true" : "false"});
					}
					links_arr.push({"source": nodes_dict[parentelement],
						"target": nodes_dict[kvgelt], "value": 1});
				}
				walk(child, parentelement);
			}
			return;
		}
		// Walk the SVG for this kanji
		walk($('g[kvg\\:element="'+kanji+'"]', x));

		var out = document.getElementById("scriptOutput");

		out.innerHTML = "";

		out.innerHTML += "<br/>Heisig dependencies for " + kanji + ":<br/>";

		for (n in nodes_arr) {
			var node = nodes_arr[n];

			if (node.joyo != "true")
				continue;

			out.innerHTML += node.element;
		}

		out.innerHTML += "<br/>";

		for (n in nodes_arr) {
			var node = nodes_arr[n];

			if (node.joyo != "true")
				continue;

			out.innerHTML += (joyo.search(node.element) + 1) + ' ';
		}

		out.innerHTML += "<br/>Heisig primitives for " + kanji + ":<br/>";

		for (n in nodes_arr) {
			var node = nodes_arr[n];

			if (node.joyo != "false")
				continue;

			out.innerHTML += node.element;
		}
	});
}

function checkKanji() {
	var input = document.getElementById("scriptInput");

	kanji2graph(input.value);
}

// Heisig-sorted joyo kanji (6th edition)
var joyo = "\
一二三四五六七八九十口日月田目古吾冒朋明唱晶品呂昌早旭世胃旦胆亘凹凸旧自白百中千舌升昇丸寸肘専博占上\
下卓朝嘲只貝唄貞員貼見児元頁頑凡負万句肌旬勺的首乙乱直具真工左右有賄貢項刀刃切召昭則副別丁町可頂子孔\
了女好如母貫兄呪克小少大多夕汐外名石肖硝砕砂妬削光太器臭嗅妙省厚奇川州順水氷永泉腺原願泳沼沖汎江汰汁\
沙潮源活消況河泊湖測土吐圧埼垣填圭封涯寺時均火炎煩淡灯畑災灰点照魚漁里黒墨鯉量厘埋同洞胴向尚字守完宣\
宵安宴寄富貯木林森桂柏枠梢棚杏桐植椅枯朴村相机本札暦案燥未末昧沫味妹朱株若草苦苛寛薄葉模漠墓暮膜苗兆\
桃眺犬状黙然荻狩猫牛特告先洗介界茶脊合塔王玉宝珠現玩狂旺皇呈全栓理主注柱金銑鉢銅釣針銘鎮道導辻迅造迫\
逃辺巡車連軌輸喩前煎各格賂略客額夏処条落冗冥軍輝運冠夢坑高享塾熟亭京涼景鯨舎周週士吉壮荘売学覚栄書津\
牧攻敗枚故敬言警計詮獄訂訃討訓詔詰話詠詩語読調談諾諭式試弐域賊栽載茂戚成城誠威滅減蔑桟銭浅止歩渉頻肯\
企歴武賦正証政定錠走超赴越是題堤建鍵延誕礎婿衣裁装裏壊哀遠猿初巾布帆幅帽幕幌錦市柿姉肺帯滞刺制製転芸\
雨雲曇雷霜冬天妖沃橋嬌立泣章競帝諦童瞳鐘商嫡適滴敵匕叱匂頃北背比昆皆楷諧混渇謁褐喝葛旨脂詣壱毎敏梅海\
乞乾腹複欠吹炊歌軟次茨資姿諮賠培剖音暗韻識鏡境亡盲妄荒望方妨坊芳肪訪放激脱説鋭曽増贈東棟凍妊廷染燃賓\
歳県栃地池虫蛍蛇虹蝶独蚕風己起妃改記包胞砲泡亀電竜滝豚逐遂家嫁豪腸場湯羊美洋詳鮮達羨差着唯堆椎誰焦礁\
集准進雑雌準奮奪確午許歓権観羽習翌曜濯曰困固錮国団因姻咽園回壇店庫庭庁床麻磨心忘恣忍認忌志誌芯忠串患\
思恩応意臆想息憩恵恐惑感憂寡忙悦恒悼悟怖慌悔憎慣愉惰慎憾憶惧憧憬慕添必泌手看摩我義議犠抹拭拉抱搭抄抗\
批招拓拍打拘捨拐摘挑指持拶括揮推揚提損拾担拠描操接掲掛捗研戒弄械鼻刑型才財材存在乃携及吸扱丈史吏更硬\
梗又双桑隻護獲奴怒友抜投没股設撃殻支技枝肢茎怪軽叔督寂淑反坂板返販爪妥乳浮淫将奨采採菜受授愛曖払広勾\
拡鉱弁雄台怠治冶始胎窓去法会至室到致互棄育撤充銃硫流允唆出山拙岩炭岐峠崩密蜜嵐崎崖入込分貧頒公松翁訟\
谷浴容溶欲裕鉛沿賞党堂常裳掌皮波婆披破被残殉殊殖列裂烈死葬瞬耳取趣最撮恥職聖敢聴懐慢漫買置罰寧濁環還\
夫扶渓規替賛潜失鉄迭臣姫蔵臓賢腎堅臨覧巨拒力男労募劣功勧努勃励加賀架脇脅協行律復得従徒待往征径彼役徳\
徹徴懲微街桁衡稿稼程税稚和移秒秋愁私秩秘称利梨穫穂稲香季委秀透誘稽穀菌萎米粉粘粒粧迷粋謎糧菊奥数楼類\
漆膝様求球救竹笑笠笹箋筋箱筆筒等算答策簿築篭人佐侶但住位仲体悠件仕他伏伝仏休仮伎伯俗信佳依例個健側侍\
停値倣傲倒偵僧億儀償仙催仁侮使便倍優伐宿傷保褒傑付符府任賃代袋貸化花貨傾何荷俊傍俺久畝囚内丙柄肉腐座\
挫卒傘匁以似併瓦瓶宮営善膳年夜液塚幣蔽弊喚換融施旋遊旅勿物易賜尿尼尻泥塀履屋握屈掘堀居据裾層局遅漏刷\
尺尽沢訳択昼戸肩房扇炉戻涙雇顧啓示礼祥祝福祉社視奈尉慰款禁襟宗崇祭察擦由抽油袖宙届笛軸甲押岬挿申伸神\
捜果菓課裸斤析所祈近折哲逝誓斬暫漸断質斥訴昨詐作雪録剥尋急穏侵浸寝婦掃当彙争浄事唐糖康逮伊君群耐需儒\
端両満画歯曲曹遭漕槽斗料科図用庸備昔錯借惜措散廿庶遮席度渡奔噴墳憤焼暁半伴畔判拳券巻圏勝藤謄片版之乏\
芝不否杯矢矯族知智挨矛柔務霧班帰弓引弔弘強弥弱溺沸費第弟巧号朽誇顎汚与写身射謝老考孝教拷者煮著箸署暑\
諸猪渚賭峡狭挟頬追阜師帥官棺管父釜交効較校足促捉距路露跳躍践踏踪骨滑髄禍渦鍋過阪阿際障隙随陪陽陳防附\
院陣隊墜降階陛隣隔隠堕陥穴空控突究窒窃窟窪搾窯窮探深丘岳兵浜糸織繕縮繁縦緻線綻締維羅練緒続絵統絞給絡\
結終級紀紅納紡紛紹経紳約細累索総綿絹繰継緑縁網緊紫縛縄幼後幽幾機畿玄畜蓄弦擁滋慈磁系係孫懸遜却脚卸御\
服命令零齢冷領鈴勇湧通踊疑擬凝範犯氾厄危宛腕苑怨柳卵留瑠貿印臼毀興酉酒酌酎酵酷酬酪酢酔配酸猶尊豆頭短\
豊鼓喜樹皿血盆盟盗温蓋監濫鑑藍猛盛塩銀恨根即爵節退限眼良朗浪娘食飯飲飢餓飾餌館餅養飽既概慨平呼坪評刈\
刹希凶胸離璃殺爽純頓鈍辛辞梓宰壁璧避新薪親幸執摯報叫糾収卑碑陸睦勢熱菱陵亥核刻該骸劾述術寒塞醸譲壌嬢\
毒素麦青精請情晴清静責績積債漬表俵潔契喫害轄割憲生星醒姓性牲産隆峰蜂縫拝寿鋳籍春椿泰奏実奉俸棒謹僅勤\
漢嘆難華垂唾睡錘乗剰今含貪吟念捻琴陰予序預野兼嫌鎌謙廉西価要腰票漂標栗慄遷覆煙南楠献門問閲閥間闇簡開\
閉閣閑聞潤欄闘倉創非俳排悲罪輩扉侯喉候決快偉違緯衛韓干肝刊汗軒岸幹芋宇余除徐叙途斜塗束頼瀬勅疎辣速整\
剣険検倹重動腫勲働種衝薫病痴痘症瘍痩疾嫉痢痕疲疫痛癖匿匠医匹区枢殴欧抑仰迎登澄発廃僚瞭寮療彫形影杉彩\
彰彦顔須膨参惨修珍診文対紋蚊斑斉剤済斎粛塁楽薬率渋摂央英映赤赦変跡蛮恋湾黄横把色絶艶肥甘紺某謀媒欺棋\
旗期碁基甚勘堪貴遺遣潰舞無組粗租狙祖阻査助宜畳並普譜湿顕繊霊業撲僕共供異翼戴洪港暴爆恭選殿井丼囲耕亜\
悪円角触解再講購構溝論倫輪偏遍編冊柵典氏紙婚低抵底民眠捕哺浦蒲舗補邸郭郡郊部都郵邦那郷響郎廊盾循派脈\
衆逓段鍛后幻司伺詞飼嗣舟舶航舷般盤搬船艦艇瓜弧孤繭益暇敷来気汽飛沈枕妻凄衰衷面麺革靴覇声眉呉娯誤蒸承\
函極牙芽邪雅釈番審翻藩毛耗尾宅託為偽畏長張帳脹髪展喪巣単戦禅弾桜獣脳悩厳鎖挙誉猟鳥鳴鶴烏蔦鳩鶏島暖媛\
援緩属嘱偶遇愚隅逆塑遡岡鋼綱剛缶陶揺謡鬱就蹴懇墾貌免逸晩勉象像馬駒験騎駐駆駅騒駄驚篤罵騰虎虜膚虚戯虞\
慮劇虐鹿麓薦慶麗熊能態寅演辰辱震振娠唇農濃送関咲鬼醜魂魔魅塊襲嚇朕雰箇錬遵罷屯且藻隷癒璽潟丹丑羞卯巳";
