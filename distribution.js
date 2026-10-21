'use strict';
// Province lists describe the modern species shown in the photographs.
// They are literature records, not abundance, cultivation acreage, or suitability.
const HABITATS={
  '丹参':{
    regions:['安徽','河北','河南','湖南','江苏','陕西','山东','山西','浙江'],
    summary:'从华北到华东、华中的部分省份，都能在植物志中找到丹参的分布记录。',
    tags:['山坡','溪边','林下草地'],
    habitat:'多见于山坡、溪流岸边及林下的草地。观察时可以留意坡面和溪边草本植物间伸出的紫色花序。',
    rangeLabel:'文献海拔',range:'100—1300 米',
    detail:'植物志在这一条目中列出上述九省。这里按省级记录展示，不表示这些省份的每一处都适合丹参生长。',
    extraTitle:'分布与栽培，分开理解',
    extra:'另有四川、江苏、安徽、河北、山西等地的生产栽培记录。地图按所引植物志条目着色，栽培记录不直接并入野生分布。',
    source:'Flora of China · 丹参原变种',url:'https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=210002026',
    extraSource:'农业知识入口网 · 认识丹参植物',extraUrl:'https://kmweb.moa.gov.tw/subject/subject.php?id=33312',
    notes:{}
  },
  '玄参':{
    regions:['河北','河南','山西','陕西','湖北','安徽','江苏','浙江','福建','江西','湖南','广东','贵州','四川'],
    summary:'以我国中东部至西南部分省份为主，河北、山西、陕西等地也有植物志记录。',
    tags:['竹林','溪旁','丛林','高草丛'],
    habitat:'常在竹林、溪旁、丛林和高草丛中生长。可以把“林间、近水、草丛较高”作为理解生境的线索。',
    rangeLabel:'文献海拔',range:'1700 米以下',
    detail:'按《中国植物志》玄参条目展示，其中河北限定为南部、陕西限定为南部；省级着色保留这些局部范围说明。',
    extraTitle:'药材还来自人工栽培',
    extra:'研究报道的主要栽培区域包括浙江中部，以及湖北、湖南、贵州、重庆交界地区。栽培产区与野生分布采用不同资料口径。',
    source:'《中国植物志》67(2)卷 · 第55页',url:'https://www.iplant.cn/frps/pdf/67%282%29/053.pdf',
    extraSource:'玄参种质与栽培研究 · 2024',extraUrl:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10831622/',
    notes:{'河北':'植物志具体记为河北南部。','陕西':'植物志具体记为陕西南部。'}
  },
  '地榆':{
    regions:['黑龙江','吉林','辽宁','内蒙古','河北','山西','陕西','甘肃','青海','新疆','山东','河南','江西','江苏','浙江','安徽','湖南','湖北','广西','四川','贵州','云南','西藏'],
    summary:'分布范围较广，从东北、华北、西北到华中、华东和西南，都有文献记录。',
    tags:['草原','草甸','山坡草地','灌丛','疏林'],
    habitat:'可生于草原、草甸、山坡草地，也见于灌丛和疏林下。地形与植被类型多样，不能用单一的“高山”或“湿地”概括。',
    rangeLabel:'文献海拔',range:'30—3000 米',
    detail:'地图依据《中国植物志》地榆原变种条目列出的23个省区着色。较宽的海拔跨度描述的是整种植物的记录范围。',
    extraTitle:'从分布读懂环境',
    extra:'草原、草甸和疏林下都可能出现地榆。地点、海拔和植被需要一起看；省区颜色不代表当地的数量或药材产量。',
    source:'《中国植物志》37卷 · 第466页',url:'https://www.iplant.cn/frps/pdf/37/466.pdf',
    notes:{}
  },
  '紫草':{
    regions:['辽宁','河北','山东','山西','河南','江西','湖南','湖北','广西','贵州','四川','陕西','甘肃'],
    summary:'从辽宁、河北一带向华中、西南延伸；甘肃东南部和广西北部也有记录。',
    tags:['山坡','草地'],
    habitat:'植物志记为山坡草地生境。留意坡面草本群落中的植株，结合叶片、白色小花等细节观察。',
    rangeLabel:'典型地形',range:'山坡草地',
    detail:'甘肃的记录限于东南部，广西限于北部。这里展示的紫草为 Lithospermum erythrorhizon。',
    extraTitle:'同叫紫草，也要辨清植物',
    extra:'本图对应照片中的紫草，不合并新疆紫草、滇紫草等其他植物的分布。古籍名称与现代物种之间的对应仍需结合文献考证。',
    source:'Flora of China · 紫草属',url:'https://www.iplant.cn/foc/pdf/Lithospermum.pdf',
    notes:{'甘肃':'植物志具体记为甘肃东南部。','广西':'植物志具体记为广西北部。'}
  }
};

Object.assign(HABITATS,EXPANSION_HABITATS);
const distribution=(()=>{
  const el=id=>document.getElementById(id);
  const groups=[...document.querySelectorAll('#chinaDistributionMap .geo-province')];
  let name='丹参',selected='';
  function selectRegion(region){
    const entry=HABITATS[name],recorded=entry.regions.includes(region);
    selected=region;
    groups.forEach(group=>group.setAttribute('aria-pressed',String(group.dataset.province===region)));
    el('distributionRegions').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.region===region)));
    el('provinceHeading').textContent=region+' · '+(recorded?'文献有记录':'本次文献未列出');
    el('provinceDescription').textContent=recorded?(entry.notes[region]||'所引植物志列出'+region+'的'+name+'分布记录。省级着色不表示全省都有分布。'):'所引条目未列出'+region+'。这不等于当地不存在该植物，也不用于判断是否适合栽培。';
  }
  function render(herb){
    if(!HABITATS[herb])return;
    name=herb;selected='';const entry=HABITATS[name];
    el('distributionName').textContent=name;
    el('distributionLatin').textContent=BOOKS.find(book=>book.name===name).latin;
    el('distributionSummary').textContent=entry.summary;
    el('distributionCount').textContent=String(entry.regions.length).padStart(2,'0');
    el('habitatRangeLabel').textContent=entry.rangeLabel;
    el('habitatRange').textContent=entry.range;
    el('habitatDescription').textContent=entry.habitat;
    el('habitatTags').innerHTML=entry.tags.map(tag=>'<span>'+tag+'</span>').join('');
    el('distributionDetail').textContent=entry.detail;
    el('distributionExtraTitle').textContent=entry.extraTitle;
    el('distributionExtra').textContent=entry.extra;
    el('distributionSource').textContent=entry.source+' ↗';el('distributionSource').href=entry.url;
    el('distributionExtraSource').hidden=!entry.extraUrl;
    if(entry.extraUrl){el('distributionExtraSource').textContent=entry.extraSource+' ↗';el('distributionExtraSource').href=entry.extraUrl;}
    el('distributionTabs').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.distributionHerb===name)));
    groups.forEach(group=>{
      const region=group.dataset.province,recorded=entry.regions.includes(region);
      group.classList.toggle('recorded',recorded);
      group.setAttribute('aria-label',region+'，'+name+'，'+(recorded?'文献有分布记录':'本次文献未列出'));
      group.setAttribute('aria-pressed','false');
      group.querySelector('title').textContent=region+' · '+(recorded?(entry.notes[region]||'文献有分布记录'):'本次文献未列出');
    });
    document.querySelectorAll('#chinaDistributionMap .geo-inset-region').forEach(path=>path.classList.toggle('recorded',entry.regions.includes(path.dataset.province)));
    el('distributionRegions').innerHTML=entry.regions.map(region=>'<button type="button" data-region="'+region+'" aria-pressed="false">'+region+(entry.notes[region]?' · 部分':'')+'</button>').join('');
    el('distributionRegions').querySelectorAll('button').forEach(button=>button.onclick=()=>selectRegion(button.dataset.region));
    el('provinceHeading').textContent='点击省区，看看草木的来处';
    el('provinceDescription').textContent='点选地图或下方省区名，查看记录范围；同一省份内部仍有地形与环境差异。';
  }
  groups.forEach(group=>{
    group.addEventListener('click',()=>selectRegion(group.dataset.province));
    group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectRegion(group.dataset.province);}});
  });
  el('distributionTabs').innerHTML=BOOKS.map(book=>'<button type="button" data-distribution-herb="'+book.name+'" aria-pressed="false">'+book.name+'</button>').join('');
  el('distributionTabs').querySelectorAll('button').forEach(button=>button.onclick=()=>selectHerb(BOOKS.findIndex(book=>book.name===button.dataset.distributionHerb)));
  return {render};
})();
