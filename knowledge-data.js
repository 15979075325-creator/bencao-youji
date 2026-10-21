'use strict';
const LEARNING_PLANTS=[
  {id:'danshen',name:'丹参',latin:'Salvia miltiorrhiza',image:BOOKS[0].plantImage,color:'#b26f88',badge:'根里的化学线索',
    compound:'丹参酮ⅡA · 丹酚酸B',kind:'成分分析 / 质量评价',
    intro:'古籍写下“根赤色”，现代研究进一步分析根中的具体成分。丹参酮ⅡA、丹酚酸B是研究者测定的成分例子。',
    facts:['研究使用高效液相色谱（HPLC）等方法测定丹参成分。','定量分析帮助比较药材质量；测出某种成分，不等于已经证明它能治疗某种疾病。'],
    observation:'照片中可见紫色花序；本展古籍原文还记述“叶相对”。',habitat:'山坡、溪边、林下草地；所引植物志记载海拔100—1300米。',
    source:'原始研究 · 丹参成分测定方法',url:'https://pubmed.ncbi.nlm.nih.gov/26552168/',
    credit:BOOKS[0].credit.plant,creditUrl:BOOKS[0].credit.plantUrl,
    questions:[
      {type:'识图',prompt:'这张植物照片，在本展中对应哪一株草木？',picture:true,answer:'丹参',wrong:['玄参','地榆','紫草'],explain:'这张来源标注为丹参的照片展示了紫色花序。识别仍需结合叶、茎、根等特征。'},
      {type:'生境',prompt:'植物志记述的丹参生境，哪一项正确？',answer:'山坡、溪边和林下草地',wrong:['常年漂浮在深水中','只生长在海岸盐滩','仅见于冰川裸地'],explain:'所引植物志记录丹参见于山坡、溪边与林下草地。',reference:'habitat'},
      {type:'现代成分',prompt:'哪一组是卡片中介绍的丹参成分？',answer:'丹参酮ⅡA、丹酚酸B',wrong:['青蒿素、奎宁','紫草素、咖啡因','维生素D、胰岛素'],explain:'原始研究将丹参酮ⅡA与丹酚酸B作为测定指标。'},
      {type:'科学辨析',prompt:'研究测出了丹参中的化学成分，可以直接得出什么结论？',answer:'帮助了解组成和评价药材质量',wrong:['单凭检测就能证明治愈所有心脏病','含量越高就一定越适合每个人','不同提取物与整株植物完全等同'],explain:'成分分析回答“有什么、含量多少”；人体疗效需要相应的临床研究。'}
    ]},
  {id:'xuanshen',name:'玄参',latin:'Scrophularia ningpoensis',image:BOOKS[1].plantImage,color:'#8a9f69',badge:'从草木到质量研究',
    compound:'哈巴俄苷（Harpagoside）',kind:'成分分析 / 品质比较',
    intro:'玄参研究不只观察外形，也比较不同样品中的化学成分。哈巴俄苷是其中一个被测定的成分。',
    facts:['2024年的研究结合代谢组学和HPLC分析不同等级的玄参样品。','样品等级与成分含量的比较属于品质研究，不能直接换成人体疗效排名。'],
    observation:'观察照片中的成对叶片，结合古文“尖长有锯齿”理解叶缘线索。',habitat:'竹林、溪旁、丛林及高草丛；植物志记载海拔1700米以下。',
    source:'原始研究 · 玄参代谢组与等级比较',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11004711/',
    credit:BOOKS[1].credit.plant,creditUrl:BOOKS[1].credit.plantUrl,
    questions:[
      {type:'识图',prompt:'这张来源标注的植物照片对应哪一种？',picture:true,answer:'玄参',wrong:['丹参','紫草','地榆'],explain:'本展将这张照片与玄参对应，观察提示包括成对叶片及叶缘锯齿。'},
      {type:'生境',prompt:'哪一组符合玄参的文献生境？',answer:'竹林、溪旁、丛林及高草丛',wrong:['海底珊瑚礁','常年积雪的冰面','只有沙漠流动沙丘'],explain:'《中国植物志》描述玄参生于海拔1700米以下的竹林、溪旁、丛林与高草丛。',reference:'habitat'},
      {type:'现代成分',prompt:'玄参卡片中被研究者测定的成分是什么？',answer:'哈巴俄苷',wrong:['青蒿素','紫草素','胰岛素'],explain:'研究测定了哈巴俄苷等成分，用来比较玄参样品。'},
      {type:'科学辨析',prompt:'比较玄参样品的成分含量，最直接属于哪类研究？',answer:'药材品质与成分分析',wrong:['已经完成的全部人体疗效验证','所有古籍主治的逐条证明','不同疾病的自行诊断方法'],explain:'成分与品质研究具有自己的问题范围，不等于临床效果已被一并证明。'}
    ]},
  {id:'diyu',name:'地榆',latin:'Sanguisorba officinalis',image:BOOKS[2].plantImage,color:'#ad647b',badge:'看见植物中的成分类群',
    compound:'三萜类 · 酚酸类',kind:'成分分析 / 加工比较',
    intro:'除了古籍中的名字，现代研究还会把地榆提取物中的成分逐一分离、测定，比较加工前后的变化。',
    facts:['2021年的研究同时分析了地榆提取物中的11种酚酸和12种三萜成分。','研究还比较了加工对这些成分的影响，分析结果可用于质量评价。'],
    observation:'照片中的紫红色穗状花序，是本展留意地榆的一条形态线索。',habitat:'草原、草甸、山坡草地、灌丛和疏林下；海拔30—3000米。',
    source:'原始研究 · 地榆三萜与酚酸测定',url:'https://pubmed.ncbi.nlm.nih.gov/34361658/',
    credit:BOOKS[2].credit.plant,creditUrl:BOOKS[2].credit.plantUrl,
    questions:[
      {type:'识图',prompt:'照片中这株草木在本展对应哪个名字？',picture:true,answer:'地榆',wrong:['玄参','丹参','紫草'],explain:'这张地榆照片的紫红色穗状花序，是本展的形态线索。'},
      {type:'生境',prompt:'哪一项符合地榆的文献生境？',answer:'草原、草甸、山坡草地和疏林下',wrong:['只有热带红树林海水中','只附生在珊瑚上','仅生长于冰川顶部'],explain:'地榆有多种草地、灌丛与疏林生境，植物志海拔记录为30—3000米。',reference:'habitat'},
      {type:'现代成分',prompt:'这项地榆研究同时分析的两类成分是？',answer:'酚酸类与三萜类',wrong:['青蒿素与奎宁','胰岛素与青霉素','丹参酮与咖啡因'],explain:'研究测定11种酚酸与12种三萜成分，并比较加工的影响。'},
      {type:'科学辨析',prompt:'研究比较加工前后成分变化，能帮助我们理解什么？',answer:'加工可能影响药材的化学组成',wrong:['加工与成分一定没有关系','所有样品都能直接当成同一种药物','检测成分就等于给出了用药剂量'],explain:'成分测定帮助认识加工变化与质量，不提供自行用药剂量。'}
    ]},
  {id:'zicao',name:'紫草',latin:'Lithospermum erythrorhizon',image:BOOKS[3].plantImage,color:'#a47cc3',badge:'从颜色到植物细胞研究',
    compound:'紫草素（Shikonin）及其衍生物',kind:'植物细胞培养 / 成分研究',
    intro:'紫草的颜色也能变成现代研究的问题。研究者在紫草植物细胞培养体系中研究紫草素类成分的产生。',
    facts:['植物细胞培养研究显示，培养条件可以影响紫草素类物质的产生。','这里的“细胞培养”指植物细胞生产成分，并非对病人的临床治疗试验。'],
    observation:'本展现代照片中的紫草开白色小花。古籍“花紫”的记述与照片差异，也提醒我们核对古今名称。',habitat:'植物志记为山坡草地；甘肃东南部、广西北部等地有记录。',
    source:'原始研究 · 紫草细胞培养与成分产生',url:'https://pubmed.ncbi.nlm.nih.gov/12192141/',
    credit:BOOKS[3].credit.plant,creditUrl:BOOKS[3].credit.plantUrl,
    questions:[
      {type:'识图',prompt:'这张现代照片在本展标注为何种植物？',picture:true,answer:'紫草',wrong:['丹参','玄参','地榆'],explain:'本展照片标注为Lithospermum erythrorhizon，其白色小花与古籍“花紫”并不完全一致。'},
      {type:'生境',prompt:'紫草的这条植物志记录中，典型生境是什么？',answer:'山坡草地',wrong:['深海海床','冰层内部','只在盐湖水下'],explain:'本展采用的紫草属植物志条目记为山坡草地。',reference:'habitat'},
      {type:'现代成分',prompt:'紫草植物细胞培养研究中的代表成分是什么？',answer:'紫草素及其衍生物',wrong:['青蒿素','丹参酮ⅡA','胰岛素'],explain:'紫草素（Shikonin）及其衍生物是这类植物细胞培养研究的成分。'},
      {type:'科学辨析',prompt:'这张卡片里的“细胞培养研究”具体指什么？',answer:'培养植物细胞并研究成分产生',wrong:['已在病人中证明治疗所有癌症','普通人可直接照做的治疗','只凭古籍即可判定临床疗效'],explain:'研究对象是紫草的植物细胞培养体系，不能当成人体临床试验。'}
    ]},
  {id:'qinghao',name:'青蒿专题',displayName:'青蒿',latin:'Artemisia annua',image:'assets/plant-qinghao.jpg',color:'#b6a052',badge:'从一株植物到抗疟药',
    compound:'青蒿素（Artemisinin）',kind:'现代药物应用 / 抗疟研究',
    intro:'青蒿素来自Artemisia annua，植物中文名为黄花蒿。青蒿素及其衍生物推动了现代抗疟治疗的发展。',
    facts:['WHO介绍：青蒿素类联合疗法（ACT）把青蒿素衍生物与另一种伙伴药物配合使用，是恶性疟治疗的重要方案。','屠呦呦因抗疟新疗法的发现获得2015年诺贝尔生理学或医学奖。','WHO不支持用蒿属植物茶饮或其他植物材料替代规范抗疟治疗。'],
    observation:'这张照片为黄花蒿Artemisia annua，展示了细裂的叶和细小花序；专题以此物种对应青蒿素来源。',habitat:'本专题聚焦现代抗疟药物故事，不扩充为本展四种古籍条目的原页或分布记录。',
    source:'WHO · 疟疾治疗',url:'https://www.who.int/teams/global-malaria-programme/case-management/treatment',
    moreSource:'诺贝尔奖 · 2015年医学奖科学背景',moreUrl:'https://www.nobelprize.org/prizes/medicine/2015/advanced-information/',
    credit:'Kristian Peters · CC BY-SA 3.0 · 原图未改动',creditUrl:'https://commons.wikimedia.org/wiki/File:Artemisia_annua.jpeg',
    questions:[
      {type:'药物来源',prompt:'青蒿素来源植物在本专题对应哪个学名？',picture:true,answer:'Artemisia annua（黄花蒿）',wrong:['Salvia miltiorrhiza（丹参）','Sanguisorba officinalis（地榆）','Lithospermum erythrorhizon（紫草）'],explain:'青蒿素来源植物为Artemisia annua，本专题照片也对应这一物种。'},
      {type:'现代应用',prompt:'青蒿素类药物的重要现代用途是什么？',answer:'治疗疟疾',wrong:['替代所有抗生素','治疗所有类型的肿瘤','直接预防一切传染病'],explain:'青蒿素类药物是现代抗疟治疗的重要组成部分。'},
      {type:'科学辨析',prompt:'WHO介绍的ACT（青蒿素类联合疗法）是什么？',answer:'青蒿素衍生物与伙伴药物联合',wrong:['只喝蒿草茶','任意两株草混在一起','所有疾病都用青蒿素单药'],explain:'ACT包含青蒿素衍生物和具有不同作用机制的伙伴药物；植物茶饮不等同于规范药物。'},
      {type:'科学故事',prompt:'哪位科学家因抗疟新疗法的发现获得2015年诺贝尔生理学或医学奖？',answer:'屠呦呦',wrong:['李时珍','葛洪','张仲景'],explain:'2015年诺贝尔生理学或医学奖的一半授予屠呦呦，以表彰她对抗疟新疗法的发现。',reference:'nobel'}
    ]}
];
LEARNING_PLANTS.push(...EXPANSION_LEARNING);
LEARNING_PLANTS.forEach(plant=>plant.questions.forEach((question,index)=>{question.id=plant.id+'-'+index;question.plantId=plant.id;}));
