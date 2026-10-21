'use strict';
// Added entries retain the same book, habitat, lesson and achievement structure.
const EXTRA_HERBS=[
  {id:'gancao',name:'甘草',old:'甘草',pinyin:'GĀN CǍO',latin:'Glycyrrhiza uralensis',aliases:'密甘、密草、美草、蕗草、靈通、國老。',quote:'葉如槐葉。',root:'根長者，三、四尺，粗細不定，皮赤色。',clue:'叶如槐叶，留意一片片小叶。',traits:['羽状复叶','多枚小叶排列','药用部位为根及根茎'],botanical:'乌拉尔甘草的实拍，可近看复叶上排列的小叶。',dried:'甘草根及根茎切片，观察外皮与浅色断面。',plantCaption:'乌拉尔甘草 · 复叶与小叶',herbCaption:'甘草 · 干燥根及根茎切片',plantCredit:'Stickpen · 公共领域',plantUrl:'https://commons.wikimedia.org/wiki/File:Glycyrrhizauralensis.jpg',herbCredit:'A+ Medical Encyclopedia / Commons · CC BY-SA 3.0',herbUrl:'https://commons.wikimedia.org/wiki/File:Gancao,_rhizome_de_Glycyrrhiza_uralensis.jpg',useQuote:'溫中，下氣，煩滿，短氣，傷臟，咳嗽，止渴（《別錄》）。',useTags:['温中（古称）','咳嗽（古记）'],useText:'书中“主治”汇集前人对温中、咳嗽等用途的记述。这里展示医药知识的历史记录，古代记述不能直接当作现代疗效结论。',regions:['甘肃','河北','黑龙江','辽宁','内蒙古','宁夏','青海','陕西','山东','山西','新疆'],habitat:'沙地、干旱河岸、山坡草地',altitude:'400—2700 米',habitatUrl:'https://efloras.org/florataxon.aspx?flora_id=2&taxon_id=200012145',compound:'甘草酸（甘草甜素）',kind:'成分与安全性',intro:'甘草酸是甘草中的成分之一。认识有效物质，也要认识证据的边界与不良作用。',facts:['NCCIH指出，许多甘草用途仍缺少足够的高质量人体研究。','长期或大量摄入含甘草酸的甘草可能产生严重不良作用，包括心律异常。天然来源也需要重视安全性。'],source:'NCCIH · Licorice Root',url:'https://www.nccih.nih.gov/health/licorice-root',badge:'甜味背后的成分',color:'#b4a665'},
  {id:'renshen',name:'人参',old:'人參',pinyin:'RÉN SHĒN',latin:'Panax ginseng',aliases:'神草、土精、地精、人銜。',quote:'秋後結子，或七、八枚，如大豆，生青熟紅，自落。',root:'其草背陽向陰。',clue:'留意掌状排列的叶片与红色果实。',traits:['掌状复叶','成熟果实红色','根部是观察重点'],botanical:'人参实拍：叶片向外展开，中央可见红色果实。',dried:'红参切片近照。红参与白参是人参的不同加工形式，这里明确展示红参。',plantCaption:'人参 · 叶片与红色果实',herbCaption:'人参加工品 · 红参切片近照',plantCredit:'FloraFarm GmbH / Katharina Lohrie · CC BY 3.0',plantUrl:'https://commons.wikimedia.org/wiki/File:Ginsengpflanze.jpg',herbCredit:'François Nguyen · CC BY 2.0',herbUrl:'https://commons.wikimedia.org/wiki/File:Red_ginseng_slices.jpg',useQuote:'補五臟，安精神，定魂魄，止驚悸（《本經》）。',useTags:['补五脏（古称）','安精神（古称）'],useText:'“补五脏”“安精神”是书中引用的传统医药表述，需要放在古代知识体系里理解，不能直接对应某一种现代疾病。',regions:['黑龙江','吉林','辽宁'],habitat:'混交林与落叶阔叶林',altitude:'混交林与阔叶林',habitatUrl:'https://www.efloras.org/florataxon.aspx?flora_id=3&taxon_id=200015246',compound:'人参皂苷',kind:'加工差异 / 人体研究',intro:'人参皂苷是一类受到研究关注的成分。红参与白参的区别，也可以从加工过程理解。',facts:['红参与白参来自同一种植物人参，采用不同加工方式。','NCCIH指出，许多人参临床试验规模较小、持续时间较短；发现成分不等于证实所有宣传的疗效。'],source:'NCCIH · Asian Ginseng',url:'https://www.nccih.nih.gov/health/asian-ginseng',badge:'从白参到红参',color:'#a66e58'},
  {id:'huangqi',name:'黄芪',old:'黃耆',pinyin:'HUÁNG QÍ',latin:'Astragalus mongholicus',aliases:'黃耆、戴糝、百本。',quote:'葉似槐葉而微尖小。',root:'根長二、三尺，以緊實如箭竿者為良。',clue:'叶似槐叶而微尖小。',traits:['复叶上的小叶','黄色花朵','细长根部'],botanical:'蒙古黄芪的黄色花朵近照，照片以这一现代物种为对象。',dried:'黄芪干燥根切片近照，可留意淡黄色断面与纤维纹理。',plantCaption:'蒙古黄芪 · 黄色花朵近照',herbCaption:'黄芪 · 干燥根切片近照',plantCredit:'Averater · CC BY-SA 3.0',plantUrl:'https://commons.wikimedia.org/wiki/File:Astragalus_mongolicus_flowers.jpg',herbCredit:'SZE XAIMMOOA HONGMIN · CC0',herbUrl:'https://commons.wikimedia.org/wiki/File:HK_herbal_黃芪_dried_Astragalus_mongholicus_slices_October_2025_N13P_01.jpg',useQuote:'排膿止痛……補虛（《本經》）。',useTags:['补虚（古称）','排脓止痛（古记）'],useText:'书中收录“补虚”等传统用途。本展保留古籍用语供阅读比较，不把“虚”等古代概念直接解释成现代疾病名称。',regions:['甘肃','河北','黑龙江','吉林','内蒙古','陕西','山东','山西','四川','新疆','西藏'],habitat:'草原、草甸、旱生灌丛、针叶林及山地',altitude:'800—2000 米',habitatUrl:'https://efloras.org/florataxon.aspx?flora_id=2&taxon_id=200011902',compound:'黄芪甲苷（Astragaloside IV）',kind:'成分分析 / 生态研究',intro:'研究者测定黄芪甲苷等成分，并研究生态环境与药材成分之间的关系。',facts:['一项2020年原始研究结合成分测定与生态位模型，研究蒙古黄芪。','预测适生区域不等于已经发现野生分布；成分含量研究也不能单独证明临床疗效。'],source:'Scientific Reports · 蒙古黄芪生态与成分研究',url:'https://www.nature.com/articles/s41598-020-69391-3',badge:'环境与成分的联系',color:'#cfaf54'}
];
EXTRA_HERBS.push(...MORE_HERBS);
const EXTRA_MEDIA={
  jiegeng:{image:"assets/jiegeng-077.jpg",plant:"assets/plant-jiegeng.jpg",herb:"assets/herb-jiegeng.jpg"},
  zhimu:{image:"assets/zhimu-077.jpg",plant:"assets/plant-zhimu.jpg",herb:"assets/herb-zhimu.jpg"},
  huangjing:{image:"assets/huangjing-077.jpg",plant:"assets/plant-huangjing.jpg",herb:"assets/herb-huangjing.jpg"},
  gancao:{image:'assets/gancao-076.jpg',plant:'assets/plant-gancao.jpg',herb:'assets/herb-gancao.jpg'},
  renshen:{image:'assets/renshen-076.jpg',plant:'assets/plant-renshen.jpg',herb:'assets/herb-renshen.jpg'},
  huangqi:{image:'assets/huangqi-076.jpg',plant:'assets/plant-huangqi.jpg',herb:'assets/herb-huangqi.jpg'}
};
BOOKS.push(...EXTRA_HERBS.map(h=>({
  name:h.name,old:h.old,pinyin:h.pinyin,latin:h.latin,image:EXTRA_MEDIA[h.id].image,plantImage:EXTRA_MEDIA[h.id].plant,herbImage:EXTRA_MEDIA[h.id].herb,plantCaption:h.plantCaption,herbCaption:h.herbCaption,
  lines:['<b>釋名</b><br>'+h.aliases,'<b>集解</b><br>'+h.quote,h.root],
  modern:['释名 · 名称','古籍中的别名：'+h.aliases,'集解 · 形态与生长','古籍记述：'+h.quote,h.root,'结合古图与现代物种照片阅读；古今分类与名称不能只凭一幅图等同。'],
  notes:{root:['根部 · 古图与药材',h.dried],leaf:['叶片 · 对照原文',h.quote+' '+h.botanical],stem:['茎与花果 · 实物观察',h.botanical]},
  clue:h.clue,traits:h.traits,insight:'把古图、原文与标注物种的实拍一起对读，能得到比单张图片更多的线索。',botanical:h.botanical,dried:h.dried,
  use:{old:h.old,tags:h.useTags,quotes:[h.useQuote],explanation:h.useText,term:'“主治”是原书汇集的传统用途；此处作为古籍文化知识呈现。'},
  credit:{plant:h.plantCredit,plantUrl:h.plantUrl,herb:h.herbCredit,herbUrl:h.herbUrl}
})));
const EXPANSION_HABITATS=Object.fromEntries(EXTRA_HERBS.map(h=>[h.name,{
  regions:h.regions,summary:h.name+'：所引植物志列出'+h.regions.length+'个省级地区的分布记录。',tags:h.habitat.split('、'),habitat:'所引植物志记述的生境：'+h.habitat+'。',rangeLabel:h.id==='renshen'?'典型生境':'文献海拔',range:h.altitude,
  detail:'地图对应现代物种 '+h.latin+'，按文献记录着色，不表示全省均有分布。',extraTitle:'现代物种与古代名称',extra:h.id==='renshen'?'植物志的天然分布记录限于黑龙江、吉林、辽宁的东部；河北、山西另有栽培记载，未作为天然分布涂色。':'以照片标注的现代物种展示，不合并其他药材基原，也不把模型预测适生区当作已知分布。',source:'Flora of China · '+h.latin,url:h.habitatUrl,notes:{}
}]));
const EXPANSION_LEARNING=EXTRA_HERBS.map(h=>({
  id:h.id,name:h.name,latin:h.latin,image:EXTRA_MEDIA[h.id].plant,color:h.color,badge:h.badge,compound:h.compound,kind:h.kind,intro:h.intro,facts:h.facts,observation:h.botanical,habitat:h.habitat,source:h.source,url:h.url,credit:h.plantCredit,creditUrl:h.plantUrl,
  questions:[
    {type:'识图',prompt:'这张标注物种的植物实拍，在本展对应哪一株？',picture:true,answer:h.name,wrong:EXTRA_HERBS.filter(x=>x.id!==h.id).map(x=>x.name).concat('丹参').slice(0,3),explain:h.botanical},
    {type:'生境',prompt:'植物志记述的'+h.name+'生境，哪一项正确？',answer:h.habitat,wrong:['常年漂浮在深海','只生长在冰川裸地','仅见于海岸红树林'],explain:'本展按所引植物志记录：'+h.habitat+'。',reference:'habitat'},
    {type:'成分',prompt:'本展'+h.name+'知识卡提到的研究成分是？',answer:h.compound,wrong:['青蒿素','胰岛素','青霉素'],explain:h.intro},
    h.id==='renshen'?{type:'加工',prompt:'红参与白参的关系，哪一项正确？',answer:'同一种植物的不同加工形式',wrong:['两种完全无关的植物','只按花朵颜色分类','分别是人参的叶和果实'],explain:h.facts[0]}:
    {type:'科学理解',prompt:h.id==='gancao'?'关于甘草酸，哪一项理解正确？':'关于黄芪生态模型与成分研究，哪一项正确？',answer:h.id==='gancao'?'天然来源也要重视不良作用':'预测适生区不等于已发现的野生分布',wrong:h.id==='gancao'?['天然成分可以无限量摄入','越甜说明越能治疗所有疾病','发现成分就等于证实全部疗效']:['模型涂色处一定已经采到标本','测出成分就能证明所有临床疗效','所有同名药材一定来自同一物种'],explain:h.facts[1]}
  ]
}));
EXPANSION_HABITATS['桔梗'].notes={广西:'植物志限定为广西北部。',四川:'植物志限定为四川东部，向西至平武、凉山一带。',云南:'植物志限定为云南东南部的蒙自、文山、砚山。'};
EXPANSION_HABITATS['知母'].extra='植物志另记台湾有栽培；本图将栽培记录与所列分布记录分开，不直接并入地图着色。';

// Match the last question to the new research cards.
for(const h of MORE_HERBS){const p=EXPANSION_LEARNING.find(p=>p.id===h.id);p.questions[3]={type:"科学理解",prompt:"关于"+h.name+"的现代研究，哪一项理解正确？",answer:"实验中的成分或活性结果不能直接证明人体疗效",wrong:["找到成分就说明能治所有疾病","体外实验等同于人体临床试验","古籍记述不需要进一步研究"],explain:h.facts[1]};}
