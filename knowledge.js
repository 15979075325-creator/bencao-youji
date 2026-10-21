'use strict';
const knowledge=(()=>{
  const byId=id=>document.getElementById(id);
  const KEY='bencao-knowledge-garden-v1';
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const plantById=id=>LEARNING_PLANTS.find(plant=>plant.id===id);
  const label=plant=>plant.displayName||plant.name;
  function profileContent(plant){
    const p=plant.profile;if(!p)return '';
    const sourceLink=index=>{const source=p.sources[index];return source?'<a class="profile-source" target="_blank" rel="noopener" href="'+escape(source.url)+'">'+escape(source.title)+' ↗</a>':'';};
    const list=items=>'<ul>'+items.map(text=>'<li>'+escape(text)+'</li>').join('')+'</ul>';
    return '<div class="profile-heading"><div><p class="eyebrow">草木档案 / 从原植物到现代应用</p><h3>再多认识一点'+escape(label(plant))+'。</h3></div><span class="profile-index">'+escape(plant.latin)+'</span></div>'+
      '<div class="profile-layout"><aside class="profile-passport"><span class="profile-kicker">先认清材料</span><h4>植物与药材小档案</h4><dl><div><dt>药用或研究部位</dt><dd>'+escape(p.part)+'</dd></div><div><dt>看哪里</dt><dd>'+escape(p.recognition)+'</dd></div><div><dt>加工与形态</dt><dd>'+escape(p.forms)+'</dd></div><div><dt>生境线索</dt><dd>'+escape(plant.id==='qinghao'?plant.observation:(HABITATS[plant.name]?.habitat||plant.habitat))+'</dd></div></dl><a class="text-link" data-profile-plant="'+escape(plant.id)+'" href="'+(plant.id==='qinghao'?'#science':'#distribution')+'">'+(plant.id==='qinghao'?'回看来源植物':'去看这一株的分布图')+' ↗</a></aside>'+
      '<div class="profile-applications"><p class="profile-kicker">今天怎样使用，又在研究什么</p>'+p.applications.map(item=>'<article class="profile-application"><span class="profile-stage">'+escape(item.stage)+'</span><h4>'+escape(item.title)+'</h4><p>'+escape(item.text)+'</p>'+sourceLink(item.ref)+'</article>').join('')+'</div></div>'+
      '<div class="profile-deep"><details open><summary>成分与研究 · 再往里看一步</summary><div class="profile-detail-body">'+list(p.chemistry)+'</div></details><details><summary>证据与注意 · 哪些结论还不能推出</summary><div class="profile-detail-body"><h4>证据到哪一步</h4><p>'+escape(p.evidence)+'</p><h4>了解应用时，也要了解这些</h4>'+list(p.safety)+'</div></details></div>'+
      '<p class="profile-takeaway"><span>记住这一点</span>'+escape(p.takeaway)+'</p><details class="profile-references"><summary>本档案的资料来源 · '+p.sources.length+'项</summary><div>'+p.sources.map((_,i)=>sourceLink(i)).join('')+'</div></details>';
  }
  const shuffle=items=>{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
  let learned={},study='danshen',round=null,storageWorks=true,lastReadingHash='#science';
  function readRecords(raw){
    try{
      const parsed=JSON.parse(raw||'{}'),clean={};
      if(parsed.version!==1||!parsed.plants||typeof parsed.plants!=='object')return clean;
      for(const plant of LEARNING_PLANTS){const item=parsed.plants[plant.id];if(!item||!Array.isArray(item.questions)||item.questions.length<2||item.score!==item.total||item.total!==item.questions.length||!Number.isFinite(Date.parse(item.at)))continue;if(item.questions.every(id=>plant.questions.some(question=>question.id===id)))clean[plant.id]=item;}
      return clean;
    }catch{return {};}
  }
  try{learned=readRecords(localStorage.getItem(KEY));}catch{storageWorks=false;}
  function evidenceLink(plant,question){
    if(question?.reference==='habitat'){const entry=HABITATS[plant.name];return {text:entry.source,url:entry.url};}
    if(question?.reference==='nobel')return {text:plant.moreSource,url:plant.moreUrl};
    if(question?.type==='识图')return {text:plant.credit,url:plant.creditUrl};
    return {text:plant.source,url:plant.url};
  }
  function renderStudy(){
    const plant=plantById(study);
    const syncNote=byId('scienceSyncNote');
    syncNote.hidden=BOOKS.some(book=>book.name===plant.name);
    syncNote.textContent=syncNote.hidden?'':'青蒿为现代知识拓展，尚未收录对应古籍扫描页；原书、形态与分布分区保留上一株药材。';
    byId('scienceTabs').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.study===study)));
    byId('studyImage').src=plant.image;byId('studyImage').alt=label(plant)+' · 真实植物照片';
    byId('studyName').textContent=label(plant);byId('studyLatin').textContent=plant.latin;
    byId('studyKind').textContent=plant.kind;byId('studyCompound').textContent=plant.compound;
    byId('studyIntro').textContent=plant.intro;
    byId('studyFacts').innerHTML=plant.facts.map(text=>'<li>'+escape(text)+'</li>').join('');
    byId('studyObservation').textContent=plant.observation;
    byId('studySource').textContent=plant.source+' ↗';byId('studySource').href=plant.url;
    byId('studyMoreSource').hidden=!plant.moreUrl;
    if(plant.moreUrl){byId('studyMoreSource').textContent=plant.moreSource+' ↗';byId('studyMoreSource').href=plant.moreUrl;}
    byId('studyCredit').textContent=plant.credit+' ↗';byId('studyCredit').href=plant.creditUrl;
    byId('singleChallenge').textContent='挑战'+label(plant)+' · 4题 ↗';
    byId('singleChallenge').disabled=Boolean(round);
    byId('quizPlantPicker').value=study;
    byId('quizPlantPicker').disabled=Boolean(round);
    byId('studyProfile').innerHTML=profileContent(plant);
  }
  function selectStudy(id){
    const plant=plantById(id);if(!plant)return;
    study=id;
    const index=BOOKS.findIndex(book=>book.name===plant.name);
    if(index>=0&&current().name!==plant.name)selectHerb(index);
    else renderStudy();
  }
  function updateCounts(){
    const count=Object.keys(learned).length;
    document.querySelectorAll('[data-knowledge-count]').forEach(element=>element.textContent=String(count));
    byId('gardenProgress').max=LEARNING_PLANTS.length;
    byId('gardenProgress').value=count;
    byId('gardenProgress').setAttribute('aria-label','已点亮'+count+'株，共'+LEARNING_PLANTS.length+'株');
    byId('gardenTitle').textContent=count?'你已点亮 '+count+' 株草木。':'让知识，点亮一株草木。';
    byId('gardenStorage').textContent=storageWorks?'知识库保存在当前浏览器，刷新或重新打开后可继续查看。':'本次会话可查看知识库；当前浏览器未能保存，关闭后进度可能丢失。';
  }
  function renderGarden(){
    updateCounts();
    const ordered=[...LEARNING_PLANTS].sort((a,b)=>Number(Boolean(learned[b.id]))-Number(Boolean(learned[a.id])));
    byId('gardenCards').innerHTML=ordered.map((plant,index)=>{
      const record=learned[plant.id],lit=Boolean(record);
      return '<article class="garden-card '+(lit?'is-lit':'is-locked')+'" style="--plant-glow:'+plant.color+'"><button type="button" data-garden-plant="'+plant.id+'" aria-label="'+label(plant)+'，'+(lit?'已点亮，查看知识卡':'未点亮，开始学习')+'"><div class="garden-photo"><img src="'+plant.image+'" alt="'+label(plant)+'植物照片"><span class="garden-state">'+(lit?'✦ 已点亮':'○ 等待点亮')+'</span><span class="garden-number">'+String(index+1).padStart(2,'0')+'</span></div><div class="garden-card-copy"><span class="garden-badge">'+plant.badge+'</span><h3>'+label(plant)+'</h3><small class="latin">'+plant.latin+'</small><p>'+(lit?plant.compound:'完成全对挑战，收进自己的知识库。')+'</p><span class="garden-card-action">'+(lit?'查看我的知识卡 ↗':'去认识这株草木 ↗')+'</span></div></button></article>';
    }).join('');
    byId('gardenCards').querySelectorAll('button').forEach(button=>button.onclick=()=>{
      const id=button.dataset.gardenPlant;if(learned[id])openKnowledge(id);else {selectStudy(id);location.hash='learn/'+id;}
    });
  }
  function openKnowledge(id){
    const plant=plantById(id),record=learned[id];if(!record)return;
    const date=new Date(record.at).toLocaleDateString('zh-CN');
    byId('knowledgeDetailContent').innerHTML='<p class="eyebrow">我的知识库 / 已点亮</p><h2>'+label(plant)+' · '+plant.badge+'</h2><div class="knowledge-detail-picture"><img src="'+plant.image+'" alt="'+label(plant)+'"><div><span class="latin">'+plant.latin+'</span><h3>'+plant.compound+'</h3><p>'+plant.intro+'</p></div></div><ul>'+plant.facts.map(text=>'<li>'+text+'</li>').join('')+'</ul><p class="knowledge-date">'+date+' · 全对挑战通过 · '+record.score+'/'+record.total+'题</p><a class="source-link" href="'+plant.url+'" target="_blank" rel="noopener">'+plant.source+' ↗</a>';
    byId('knowledgeDetailContent').insertAdjacentHTML('beforeend','<section class="plant-profile">'+profileContent(plant)+'</section>');
    byId('knowledgeDetailDialog').showModal();
  }
  function renderQuestion(){
    const item=round.items[round.index],plant=plantById(item.plantId);
    byId('quizPosition').textContent=String(round.index+1).padStart(2,'0')+' / '+String(round.items.length).padStart(2,'0');
    byId('quizType').textContent=item.type;
    byId('quizProgress').value=round.index;byId('quizProgress').max=round.items.length;
    byId('quizQuestion').textContent=item.prompt;
    byId('quizImage').hidden=!item.picture;
    if(item.picture){byId('quizImage').src=plant.image;byId('quizImage').alt='本题待辨认的植物照片';}
    byId('quizOptions').innerHTML=shuffle([item.answer,...item.wrong]).map((option,index)=>'<button type="button" data-answer="'+escape(option)+'"><span>'+String.fromCharCode(65+index)+'</span>'+escape(option)+'</button>').join('');
    byId('quizOptions').querySelectorAll('button').forEach(button=>button.onclick=()=>answer(button.dataset.answer));
    byId('quizFeedback').hidden=true;byId('quizNext').hidden=true;
    byId('quizQuestion').focus({preventScroll:true});
  }
  function start(mode){
    if(round)return;
    const plants=mode==='mixed'?shuffle(LEARNING_PLANTS).slice(0,5):[plantById(study)];
    const items=shuffle(plants.flatMap(plant=>mode==='mixed'?shuffle(plant.questions).slice(0,2):plant.questions));
    round={mode,plants:plants.map(plant=>plant.id),items,index:0,answers:[]};
    byId('quizSetup').hidden=true;byId('quizResult').hidden=true;byId('quizActive').hidden=false;
    byId('quizMode').textContent=mode==='mixed'?'混搭挑战 · 5株10题':'单株挑战 · '+label(plants[0])+' · 4题';
    renderStudy();renderQuestion();byId('quizActive').scrollIntoView({behavior:'auto',block:'start'});
  }
  function answer(value){
    if(!round||round.answers.length>round.index)return;
    const item=round.items[round.index],correct=value===item.answer,plant=plantById(item.plantId),source=evidenceLink(plant,item);
    round.answers.push({id:item.id,plantId:item.plantId,correct,value});
    byId('quizOptions').querySelectorAll('button').forEach(button=>{button.disabled=true;if(button.dataset.answer===item.answer)button.classList.add('answer-correct');else if(button.dataset.answer===value)button.classList.add('answer-wrong');});
    byId('quizFeedback').hidden=false;
    byId('quizFeedback').classList.toggle('wrong-feedback',!correct);
    byId('quizFeedback').innerHTML='<strong>'+(correct?'答对了。':'这题先记住，再试一次。')+'</strong><p>'+item.explain+'</p><a class="source-link" href="'+source.url+'" target="_blank" rel="noopener">'+escape(source.text)+' ↗</a>';
    byId('quizNext').hidden=false;
    byId('quizNext').textContent=round.index===round.items.length-1?'查看本轮结果 ↗':'下一题 →';
    byId('quizProgress').value=round.index+1;
  }
  function finish(){
    const completed=round,score=completed.answers.filter(item=>item.correct).length,perfect=score===completed.items.length;
    let newly=[];
    if(perfect){
      for(const id of completed.plants){if(learned[id])continue;const questions=completed.items.filter(item=>item.plantId===id).map(item=>item.id);learned[id]={at:new Date().toISOString(),questions,score:questions.length,total:questions.length};newly.push(label(plantById(id)));}
      try{localStorage.setItem(KEY,JSON.stringify({version:1,plants:learned}));storageWorks=true;}catch{storageWorks=false;}
    }
    byId('quizActive').hidden=true;byId('quizResult').hidden=false;
    byId('resultScore').textContent=score+' / '+completed.items.length;
    byId('resultTitle').textContent=perfect?'全对！知识已收进你的草木园。':'这轮还有线索，值得再看一眼。';
    byId('resultDescription').textContent=perfect?(newly.length?'新点亮：'+newly.join('、')+'。':'这些草木已在你的知识库，本次复习也全部答对。'):'这轮暂不解锁。看看解析，再来一轮全对挑战；已经点亮的植物不会受影响。';
    byId('resultReview').innerHTML=completed.items.map((item,index)=>{const correct=completed.answers[index].correct;return '<div class="quiz-review-item"><span>'+(correct?'✓':'↺')+' '+item.type+' · '+label(plantById(item.plantId))+'</span><p>'+item.prompt+'</p><strong>'+item.answer+'</strong>'+(!correct?'<small>'+item.explain+'</small>':'')+'</div>';}).join('');
    byId('retryQuiz').onclick=()=>{round=null;start(completed.mode);};
    document.dispatchEvent(new CustomEvent('knowledgecomplete',{detail:{perfect,plants:completed.plants}}));
    round=null;renderStudy();renderGarden();
    byId('resultSaveNote').textContent=perfect&&!storageWorks?'已在本次会话收录；浏览器保存失败，关闭后进度可能丢失。':'';
    byId('quizResult').scrollIntoView({behavior:'auto',block:'start'});
  }
  function showSetup(){round=null;byId('quizSetup').hidden=false;byId('quizActive').hidden=true;byId('quizResult').hidden=true;renderStudy();}
  function route(){
    const hash=location.hash.slice(1),garden=hash==='garden',quiz=hash==='learn'||hash.startsWith('learn/');
    const wasDedicated=document.body.classList.contains('garden-view')||document.body.classList.contains('quiz-view');
    if(!quiz&&!garden&&document.getElementById(hash))lastReadingHash='#'+hash;
    document.querySelectorAll('[data-reading-back]').forEach(link=>link.setAttribute('href',lastReadingHash));
    document.querySelectorAll('.page-links a').forEach(link=>{if(link.getAttribute('href')===(garden?'#garden':quiz?'#learn':'#'+hash)&&!link.hasAttribute('data-reading-back'))link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    document.body.classList.toggle('garden-view',garden);byId('garden').hidden=!garden;
    document.body.classList.toggle('quiz-view',quiz);byId('learn').hidden=!quiz;
    if(garden){renderGarden();window.scrollTo({top:0,behavior:'instant'});document.title='我的草木知识库 · 本草有迹';}
    else if(quiz){document.title='答题区 · 本草有迹';if(hash.startsWith('learn/')){const id=hash.split('/')[1];if(plantById(id)){selectStudy(id);showSetup();}}window.scrollTo({top:0,behavior:'instant'});}
    else {document.title='本草有迹 · 从一页古籍到一株草木';if(wasDedicated){const target=document.getElementById(hash||'home');if(target)target.scrollIntoView({behavior:'instant'});}}
  }
  byId('scienceTabs').innerHTML=LEARNING_PLANTS.map(plant=>'<button type="button" data-study="'+plant.id+'" aria-pressed="false">'+label(plant)+'</button>').join('');
  const syncNote=document.createElement('p');syncNote.id='scienceSyncNote';syncNote.className='quiz-small';syncNote.hidden=true;syncNote.setAttribute('role','status');byId('scienceTabs').after(syncNote);
  const profile=document.createElement('section');profile.id='studyProfile';profile.className='plant-profile';profile.setAttribute('aria-label','当前植物的应用与知识档案');document.querySelector('.science-board').after(profile);
  byId('scienceTabs').querySelectorAll('button').forEach(button=>button.onclick=()=>selectStudy(button.dataset.study));
  byId('quizPlantPicker').innerHTML=LEARNING_PLANTS.map(plant=>'<option value="'+plant.id+'">'+label(plant)+'</option>').join('');
  byId('quizPlantPicker').onchange=event=>selectStudy(event.target.value);
  byId('singleChallenge').onclick=()=>start('single');byId('mixedChallenge').onclick=()=>start('mixed');
  byId('quizNext').onclick=()=>{if(!round||round.answers.length!==round.index+1)return;if(round.index===round.items.length-1)finish();else {round.index++;renderQuestion();}};
  byId('quitQuiz').onclick=showSetup;byId('backToStudy').onclick=showSetup;
  byId('closeKnowledgeDetail').onclick=()=>byId('knowledgeDetailDialog').close();
  byId('knowledgeDetailDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
  document.addEventListener('herbchange',event=>{const plant=LEARNING_PLANTS.find(plant=>plant.name===event.detail);if(plant){study=plant.id;renderStudy();}});
  window.addEventListener('hashchange',route);
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link)return;
    if(link.dataset.profilePlant){selectStudy(link.dataset.profilePlant);if(byId('knowledgeDetailDialog').open)byId('knowledgeDetailDialog').close();}
    const hash=link.getAttribute('href').slice(1);
    if(hash!=='garden'&&hash!=='learn'&&!hash.startsWith('learn/')&&document.getElementById(hash))lastReadingHash='#'+hash;
  });
  window.addEventListener('storage',event=>{if(event.key===KEY){learned=readRecords(event.newValue);renderGarden();}});
  renderStudy();renderGarden();route();
  return {readRecords,selectStudy};
})();
