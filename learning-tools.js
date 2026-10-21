'use strict';
const learningTools=(()=>{
  const $=id=>document.getElementById(id),esc=escapeHtml;
  const find=id=>LEARNING_PLANTS.find(p=>p.id===id),book=p=>BOOKS.find(b=>b.name===p.name);
  let pair=['danshen','renshen'],form='plant',onlyDifferent=false,termMap={},activePair=null;
  try{const saved=JSON.parse(localStorage.getItem('bencao-compare-v1')||'null');if(Array.isArray(saved)&&saved.length===2&&saved.every(find)&&saved[0]!==saved[1])pair=saved;}catch{}
  const panel=document.createElement('section');panel.id='duet';panel.className='duet-page';panel.hidden=true;
  panel.innerHTML='<header class="discovery-header"><a href="#atlas" class="brand"><span class="brand-mark">草</span><span>本草有迹<small>把两株草木，放在一起看</small></span></a><nav id="duetNav" aria-label="页面导航"></nav></header><div class="discovery-wrap"><div class="discovery-topline"><a href="#atlas">← 返回本草图谱</a><span>BEN CAO / SIDE BY SIDE</span></div><div class="discovery-heading"><div><p class="eyebrow">草药对比台 / 比一比，再认识</p><h1>相似的名字，<em>各自的来处。</em></h1><p>把两株植物的形态、部位、山川与研究并排阅读。相似之处不代表可以互相替代。</p></div><span class="discovery-seal">对照<br>知异</span></div><div class="duet-toolbar"><div id="duetForms" role="group" aria-label="选择对照图像"><button data-duet-form="plant" aria-pressed="true">真实植物</button><button data-duet-form="herb" aria-pressed="false">药材近照</button><button data-duet-form="old" aria-pressed="false">古籍所绘</button></div><label><input id="duetDifferences" type="checkbox">只看文字不同项</label><button id="duetSwap" type="button">交换左右 ⇄</button></div><div class="duet-pickers"><label>左侧草木<select id="duetLeft"></select></label><span>对照</span><label>右侧草木<select id="duetRight"></select></label></div><div id="duetImages" class="duet-images"></div><p id="duetSummary" class="duet-summary" aria-live="polite"></p><div class="duet-table-scroll" tabindex="0" aria-label="草药对比资料表，可横向滚动"><table class="duet-table"><thead><tr><th scope="col">观察维度</th><th id="duetLeftName" scope="col"></th><th id="duetRightName" scope="col"></th></tr></thead><tbody id="duetRows"></tbody></table></div><div class="duet-bottom"><span>按本展来源物种与资料比较；古代药名、现代植物和具体制剂分别理解。</span><a href="#ask">带着新问题，继续查资料 ↗</a></div><p id="duetStorage" class="quiz-small"></p></div>';
  document.body.append(panel);
  document.querySelectorAll('.site-header nav,.page-links,.discovery-header nav').forEach(nav=>{const a=document.createElement('a');a.href='#duet';a.textContent='草药对比';nav.append(a);});
  $('duetNav').innerHTML=document.querySelector('.discovery-header nav').innerHTML;
  const options=LEARNING_PLANTS.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('');$('duetLeft').innerHTML=options;$('duetRight').innerHTML=options;
  const sourceLinks=items=>items.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.title)+' ↗</a>').join('');
  const qinghaoImages={
    herb:{src:'assets/herb-qinghao.jpg',title:'南京中医药大学 · 青蒿药材近照',url:'https://zybb.njucm.edu.cn/yaocai_pic_list.asp?leibie=2&ycid=211',note:'干燥药材近照，保留原图比例尺；来源标注为青蒿药材。'},
    old:{src:'assets/qinghao-ancient-093.jpg',title:'《本草纲目》第1册扫描第93页 · 草蒿图',url:'https://commons.wikimedia.org/wiki/File:NLC892-411999026806-2109_本草綱目_第1冊.pdf',note:'原图题名“草蒿”，仅作古籍形态对读。古代蒿类名称与现代物种不作直接等同；现代照片对应黄花蒿 Artemisia annua。'}
  };
  function comparisonImage(p){
    const b=book(p);
    if(form==='plant')return {src:p.image,title:p.credit,url:p.creditUrl,note:p.id==='qinghao'?'青蒿素来源植物：黄花蒿 Artemisia annua。':''};
    if(p.id==='qinghao')return qinghaoImages[form];
    return {src:b?.[form==='old'?'image':'herbImage'],title:form==='old'?'《本草纲目》图卷原图':b?.credit.herb,url:form==='old'?'https://commons.wikimedia.org/wiki/File:NLC892-411999026806-2109_本草綱目_第1冊.pdf':b?.credit.herbUrl};
  }
  function rowsFor(p){const b=book(p),h=HABITATS[p.name],f=p.profile;return [
    ['来源植物',p.latin+'\n'+f.recognition],['药用或研究部位',f.part],['加工与形态',f.forms],['古籍形态线索',b?b.clue:'图卷第93页收有“草蒿”刻印图，本展用于形态对读；青蒿正文尚未纳入点读，不将古图直接等同现代黄花蒿。'],['生境环境',h?h.habitat:p.habitat||p.observation],['文献分布省区',h?h.regions.join('、'):'本展青蒿专题暂未整理省级分布。'],['代表成分',p.compound],['现代应用与研究',f.applications.map(a=>a.stage+'｜'+a.title+'\n'+a.text).join('\n\n')],['证据边界',f.evidence],['注意事项',f.safety.join('\n')]
  ];}
  function save(){try{localStorage.setItem('bencao-compare-v1',JSON.stringify(pair));$('duetStorage').textContent='当前对比组合已保存在本浏览器。';}catch{$('duetStorage').textContent='本次会话可继续对比；浏览器未能保存组合。';}}
  function render(){
    const ps=pair.map(find);$('duetLeft').value=pair[0];$('duetRight').value=pair[1];$('duetLeftName').textContent=ps[0].name;$('duetRightName').textContent=ps[1].name;
    $('duetImages').innerHTML=ps.map(p=>{const credit=comparisonImage(p),src=credit.src;return '<figure>'+(src?'<button data-duet-image="'+p.id+'" aria-label="放大'+esc(p.name)+'图片"><img src="'+esc(src)+'" alt="'+esc(p.name+' · '+{plant:'真实植物',old:'古籍图',herb:'药材近照'}[form])+'"><span>放大查看 ↗</span></button>':'<div class="duet-missing">该专题尚未收录此类图像<br>可切回真实植物查看</div>')+'<figcaption><strong>'+esc(p.name)+'</strong><em>'+esc(p.latin)+'</em>'+(credit?sourceLinks([credit]):'')+'</figcaption>'+(credit.note?'<p class="duet-image-note">'+esc(credit.note)+'</p>':'')+'<div class="duet-card-actions"><a data-duet-open="'+p.id+'" href="#atlas">去图谱了解 ↗</a><a data-duet-open="'+p.id+'" href="#science">查看研究档案 ↗</a></div></figure>';}).join('');
    const data=ps.map(rowsFor),same=data[0].filter((r,i)=>r[1]===data[1][i][1]).length;
    $('duetSummary').textContent=ps[0].name+' × '+ps[1].name+' · '+(data[0].length-same)+'项文字记录不同，'+same+'项相同。这里比较资料表述，不据此判断疗效强弱。';
    $('duetRows').innerHTML=data[0].map((r,i)=>{const equal=r[1]===data[1][i][1];return onlyDifferent&&equal?'':'<tr class="'+(equal?'is-same':'')+'"><th scope="row">'+r[0]+(equal?'<small>相同记录</small>':'')+'</th>'+data.map(col=>'<td>'+esc(col[i][1]).replace(/\n/g,'<br>')+'</td>').join('')+'</tr>';}).join('')+'<tr><th scope="row">资料来源</th>'+ps.map(p=>'<td class="duet-sources">'+sourceLinks(p.profile.sources)+(HABITATS[p.name]?sourceLinks([{title:HABITATS[p.name].source,url:HABITATS[p.name].url}]):'')+'</td>').join('')+'</tr>';
    $('duetForms').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.duetForm===form)));
    save();
  }
  function choose(slot,id){if(!find(id))return;const other=1-slot;if(pair[other]===id)[pair[0],pair[1]]=[pair[1],pair[0]];else pair[slot]=id;render();}
  function add(id){if(!find(id))return;if(!pair.includes(id))pair=[id,pair[0]];render();location.hash='duet';}
  $('duetLeft').onchange=e=>choose(0,e.target.value);$('duetRight').onchange=e=>choose(1,e.target.value);$('duetSwap').onclick=()=>{pair.reverse();render();};$('duetDifferences').onchange=e=>{onlyDifferent=e.target.checked;render();};
  panel.addEventListener('click',e=>{const toggle=e.target.closest('[data-duet-form]'),image=e.target.closest('[data-duet-image]'),link=e.target.closest('[data-duet-open]');if(toggle){form=toggle.dataset.duetForm;render();}if(link)discovery.select(link.dataset.duetOpen);if(image){const p=find(image.dataset.duetImage),info=comparisonImage(p);if(info.src)openImage(info.src,p.name+' · '+info.title+(info.note?' · '+info.note:''));}});
  document.addEventListener('click',e=>{const addButton=e.target.closest('[data-duet-add]');if(addButton)add(discovery.selected);});
  function route(){const active=location.hash==='#duet';panel.hidden=!active;document.body.classList.toggle('duet-view',active);if(active){render();document.querySelectorAll('.site-header nav a,.page-links a,.discovery-header nav a').forEach(a=>a.setAttribute('aria-current',a.hash==='#duet'?'page':'false'));document.title='草药对比台 · 本草有迹';window.scrollTo({top:0,behavior:'instant'});}}
  window.addEventListener('hashchange',route);

  // Pair paragraphs at the source's actual granularity; no invented line-by-line translations.
  const shapeGroups={'丹参':[[0,1],[2],[3]],'玄参':[[0],[1,2]],'地榆':[[0,1],[2]],'紫草':[[0,1],[2]]};
  const shapePlain={
    '甘草':['叶片像槐树的叶片。','较长的根有三四尺，粗细不一，根皮呈红色。'],
    '人参':['秋后结果，约七八枚，像大豆；未熟时青绿，成熟后变红，会自行落下。','原文描述它背向阳光、朝向阴处的生长特点。'],
    '黄芪':['叶片像槐叶，但略尖、较小。','根长二三尺，古人认为紧实、像箭杆的较好。这是原书的性状评价。'],
    '桔梗':['夏天开紫碧色的小花，形状颇像牵牛花，秋后结果。','根约小指粗，呈黄白色。'],
    '知母':['生长在山上，叶片像韭菜。','形状像菖蒲，质地柔润；需要结合条目上下文理解所描述的部位。'],
    '黄精':['叶片像竹叶，但不尖；有两片、三片、四五片的情形，沿茎节生长。','地下部分横向延伸，形状用古籍中的“葳蕤”作比较。']
  };
  const commonTerms={'宿根':['宿根','留存下来的老根，原文以它说明次年生苗的过程。'],'鋸齒':['锯齿','描述叶片边缘连续的小齿状结构。'],'背陽向陰':['背阳向阴','背向阳光、朝向阴处，属于原书对生长特点的描述。'],'橫行':['横行','在这里描述地下部分沿横向延伸。'],'尺':['尺 · 古代长度单位','本展保留原书的长度说法，不直接换算成固定的现代厘米数。'],'葳蕤':['葳蕤 · 古籍中的比较对象','原文借另一种草木描述形状；古代名称需要结合语境理解，不能仅凭字面等同现代物种。']};
  const glossary={name:['释名','解释药名的由来，并列出古籍记载的别名。'],shape:['集解','汇集前人的形态、生长与产地等记述。'],uses:['主治','古籍记载的治疗用途；历史病证名称不能直接等同于现代诊断，也不代表现代临床疗效。']};
  const readingPicker=document.createElement('div');readingPicker.className='reading-plant-picker';readingPicker.innerHTML='<label for="readingPlantPicker">当前点读草木<select id="readingPlantPicker" aria-label="切换古文点读植物">'+BOOKS.map(b=>'<option value="'+esc(b.name)+'">'+esc(b.name)+'</option>').join('')+'</select></label><div class="reading-plant-actions"><button id="readingPrevPlant" type="button">← 上一株</button><button id="readingNextPlant" type="button">下一株 →</button></div><span id="readingPlantStatus" aria-live="polite"></span><small>收录10株古籍条目；青蒿正文尚未纳入点读。</small>';
  document.querySelector('.reading-tabs').before(readingPicker);
  function changeReadingPlant(name){const p=LEARNING_PLANTS.find(p=>p.name===name);if(!p||!book(p))return;const mode=reading;discovery.select(p.id);reading=mode;renderReading();}
  $('readingPlantPicker').onchange=e=>changeReadingPlant(e.target.value);
  $('readingPrevPlant').onclick=()=>{const i=BOOKS.findIndex(b=>b.name===current().name);if(i>0)changeReadingPlant(BOOKS[i-1].name);};
  $('readingNextPlant').onclick=()=>{const i=BOOKS.findIndex(b=>b.name===current().name);if(i<BOOKS.length-1)changeReadingPlant(BOOKS[i+1].name);};
  const termPanel=document.createElement('aside');termPanel.id='readingTermPanel';termPanel.className='reading-term-panel';termPanel.setAttribute('aria-live','polite');document.querySelector('.reading-board').after(termPanel);
  function markup(raw){return raw.split(/(\{[^}]+\})/g).map(piece=>{const match=piece.match(/^\{([^|}]+)\|([^}]+)\}$/);if(match)return '<button class="reading-term" data-term="'+esc(match[2])+'" aria-controls="readingTermPanel">'+esc(match[1])+'</button>';return piece.replace(/宿根|鋸齒|背陽向陰|橫行|葳蕤|尺/g,key=>'<button class="reading-term" data-term="'+key+'" aria-controls="readingTermPanel">'+key+'</button>').replace(/<b>(.*?)<\/b>/g,(_,t)=>'<button class="reading-term" data-term="'+reading+'" aria-controls="readingTermPanel">'+esc(t)+'</button>');}).join('');}
  function enhanceReading(){const b=current(),start=b.lines.findIndex(l=>l.includes('集解')),raw=reading==='name'?b.lines.slice(0,start):reading==='shape'?b.lines.slice(start):b.use.quotes;
    const plantIndex=BOOKS.findIndex(item=>item.name===b.name);$('readingPlantPicker').value=b.name;$('readingPrevPlant').disabled=plantIndex===0;$('readingNextPlant').disabled=plantIndex===BOOKS.length-1;$('readingPlantStatus').textContent=b.name+' · '+({name:'释名',shape:'集解',uses:'主治'}[reading])+' · '+(plantIndex+1)+' / '+BOOKS.length;
    termMap={...glossary,...commonTerms,...b.notes};activePair=null;
    let orig=[],plain=[],extra='';
    if(reading==='name'){orig=[raw.join('<br>')];plain=[b.modern[1]];extra=b.insight;}
    else if(reading==='uses'){orig=[raw.join('<br>')];plain=[b.use.explanation];extra=b.use.term;}
    else{const groups=shapeGroups[b.name]||raw.map((_,i)=>[i]);orig=groups.map(group=>group.map(i=>raw[i]).filter(Boolean).join('<br>'));plain=shapePlain[b.name]||b.modern.slice(3,3+groups.length);extra=b.modern.slice(3+groups.length).join(' ');}
    $('originalContent').innerHTML=orig.map((line,i)=>'<div class="reading-pair" data-pair="'+i+'" role="button" tabindex="0" aria-label="查看第'+(i+1)+'组白话对应"><small class="pair-number">'+String(i+1).padStart(2,'0')+'</small>'+markup(line)+'</div>').join('');
    $('plainContent').innerHTML=plain.map((line,i)=>'<div class="reading-pair plain-pair" data-pair="'+i+'" role="button" tabindex="0" aria-label="查看第'+(i+1)+'组古文对应"><small class="pair-number">'+String(i+1).padStart(2,'0')+'</small>'+esc(line)+'</div>').join('')+(extra?'<p class="reading-extra">'+esc(extra)+'</p>':'');
    termPanel.innerHTML='<span class="discovery-mini">古文点读 / '+esc(b.name)+'</span><h4>点术语看解释，点段落看对应。</h4><p>带虚线的字词可点读；相同编号是同一组内容，译文按段意对应。</p><div class="reading-glossary">'+Object.entries(glossary).map(([key,item])=>'<button data-term="'+key+'" class="reading-term" aria-controls="readingTermPanel">'+item[0]+'</button>').join('')+'</div>';
  }
  function highlightPair(id){activePair=id;document.querySelectorAll('#originalContent [data-pair],#plainContent [data-pair]').forEach(el=>{el.classList.toggle('is-paired',el.dataset.pair===id);el.setAttribute('aria-pressed',String(el.dataset.pair===id));});}
  function explain(key){const item=termMap[key];if(!item)return;termPanel.innerHTML='<span class="discovery-mini">古文点读 / '+esc(current().name)+'</span><h4>'+esc(item[0])+'</h4><p>'+esc(item[1])+'</p><a class="source-link" href="'+esc($('textSource').href)+'" target="_blank" rel="noopener">核对原文出处 ↗</a><div class="reading-glossary">'+Object.entries(glossary).map(([id,term])=>'<button data-term="'+id+'" class="reading-term" aria-controls="readingTermPanel">'+term[0]+'</button>').join('')+'</div>';}
  function readClick(e){const term=e.target.closest('[data-term]'),pair=e.target.closest('[data-pair]');if(pair)highlightPair(pair.dataset.pair);if(term)explain(term.dataset.term);}
  document.getElementById('read').addEventListener('click',readClick);
  document.getElementById('read').addEventListener('keydown',e=>{if(e.target.matches('[data-pair]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();highlightPair(e.target.dataset.pair);}});
  const originalRenderReading=renderReading;renderReading=function(){originalRenderReading();enhanceReading();};
  enhanceReading();render();route();return {choose,add,rowsFor,enhanceReading,explain,get pair(){return [...pair];}};
})();
