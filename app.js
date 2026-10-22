'use strict';
const $=id=>document.getElementById(id);
const KEY='bencao-journey-notes-v1';
let records={};
try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))records=value;}catch{}
let active=0,form='old',reading='name',matched=false;
const seen=BOOKS.map(()=>new Set());

const sourceBook='https://commons.wikimedia.org/wiki/File:NLC892-411999026806-2109_本草綱目_第1冊.pdf';
const current=()=>BOOKS[active];
const escapeHtml=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function scrollToSection(id){$(id).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function setPressed(selector,key,value){document.querySelectorAll(selector).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset[key]===value)));}

function renderHerbTabs(){
  $('herbTabs').innerHTML=BOOKS.map((book,i)=>`<button data-herb="${i}" aria-pressed="${i===active}"><small>${String(i+1).padStart(2,"0")}</small>${book.name}</button>`).join('');
  $('herbTabs').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>selectHerb(Number(button.dataset.herb))));
}
function renderHero(){
  const book=current();
  const art=document.querySelector('.hero-art');
  const changed=art.dataset.herb!==undefined&&art.dataset.herb!==book.name;
  art.dataset.herb=book.name;
  art.querySelector('.print-border > img').src=book.image;
  art.querySelector('.print-border > img').alt=book.name+'古籍刻印图';
  art.querySelector('.print-title > span').textContent=book.old;
  art.querySelector('.photo-fragment > img').src=book.plantImage;
  art.querySelector('.photo-fragment > img').alt=book.name+' · '+book.plantCaption;
  $('heroHerbPicker').value=String(active);
  $('heroArtTabs').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.heroHerb)===active)));
  $('heroArtStatus').textContent=book.name+' · 古籍与实物';
  if(changed&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const sheet=art.querySelector('.print-frame'),photo=art.querySelector('.photo-fragment');
    [sheet,photo].forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));
    sheet.animate([{opacity:.3,transform:'perspective(1000px) rotateY(-14deg) rotate(-7deg) translateX(-12px)'},{opacity:1,transform:'perspective(1000px) rotateY(0deg) rotate(-4deg) translateX(0)'}],{duration:580,easing:'cubic-bezier(.2,.7,.2,1)'});
    photo.animate([{opacity:0,transform:'translateY(18px) rotate(12deg)'},{opacity:1,transform:'translateY(0) rotate(7deg)'}],{duration:660,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
}
function renderProgress(){
  $('partProgress').innerHTML=[['root','根'],['leaf','叶'],['stem','茎']].map(([key,label])=>`<span class="${seen[active].has(key)?'seen':''}">${seen[active].has(key)?'✓':'○'} 已看${label.replace(/^/,'：')}</span>`).join('');
  // Unvisited parts should read as invitations, not completed observations.
  [...$('partProgress').children].forEach((element,i)=>{if(!seen[active].has(['root','leaf','stem'][i]))element.textContent='○ 观察'+['根','叶','茎'][i];});
}
function observePart(part){
  const note=current().notes[part];seen[active].add(part);
  $('partTitle').textContent=note[0];$('partText').textContent=note[1];
  document.querySelectorAll('[data-part]').forEach(button=>button.classList.toggle('selected',button.dataset.part===part));
  renderProgress();
}
function renderQuiz(){
  const others=BOOKS.map((_,i)=>i).filter(i=>i!==active);
  for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  const choiceOrder=[active,...others.slice(0,3)];
  for(let i=choiceOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choiceOrder[i],choiceOrder[j]]=[choiceOrder[j],choiceOrder[i]];}
  $('matchName').textContent=current().name;
  $('matchOptions').innerHTML=choiceOrder.map((index,i)=>`<button class="match-option" data-choice="${index}" aria-label="选择候选${['一','二','三','四'][i]}照片"><img src="${BOOKS[index].plantImage}" alt="候选${['一','二','三','四'][i]}，观察植物的花与叶" loading="lazy"><span>候选 ${['一','二','三','四'][i]}<small>选择 ↗</small></span></button>`).join('');
  $('matchOptions').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>chooseMatch(Number(button.dataset.choice),button)));
  $('feedbackTitle').textContent='先看叶片，再看花。';
  $('feedbackText').textContent='选择一张照片，看看你的发现与原文有什么联系。';
  document.querySelector('.feedback-icon').textContent='？';
}
function chooseMatch(index,button){
  document.querySelectorAll('.match-option').forEach(option=>option.classList.remove('wrong','correct'));
  if(index!==active){
    button.classList.add('wrong');$('feedbackTitle').textContent='再看一眼，线索还在书里。';
    $('feedbackText').textContent=`这张来源标注为${BOOKS[index].name}。试着对照${current().name}的古图、叶片与花序，再选一次。`;
    document.querySelector('.feedback-icon').textContent='↺';return;
  }
  matched=true;button.classList.add('correct');
  $('feedbackTitle').textContent=`找到了，这是来源所标注的${current().name}。`;
  $('feedbackText').textContent=current().insight;
  document.querySelector('.feedback-icon').textContent='✓';
  $('matchOptions').querySelectorAll('button').forEach(option=>{
    const book=BOOKS[Number(option.dataset.choice)];option.querySelector('span').textContent=book.name;option.querySelector('img').alt=book.name+'的植物照片';
  });
}

function renderComparison(){
  const book=current();
  const states={
    old:{number:'01',title:'古籍所绘',image:book.image,description:'一幅黑白刻印图，保留了根、茎与叶的形态。图像取自《本草纲目》图卷上，同页图题与草木相互对应。',url:sourceBook},
    plant:{number:'02',title:'生长之时',image:book.plantImage,description:book.botanical,url:book.credit.plantUrl},
    herb:{number:'03',title:'成为药材',image:book.herbImage,description:book.dried,url:book.credit.herbUrl},
  };
  const state=states[form];
  $('compareImage').src=state.image;$('compareImage').alt=book.name+' · '+state.title;
  $('formNumber').textContent=state.number;$('formTitle').textContent=book.name+' · '+state.title;
  $('formDescription').textContent=state.description;$('formSource').href=state.url;
  $('plantThumb').src=book.plantImage;$('plantThumb').alt=book.name+'生长照片';
  $('herbThumb').src=book.herbImage;$('herbThumb').alt=book.name+'药材近照';
  setPressed('[data-form]','form',form);
}
function openImage(src,caption){$('dialogImage').src=src;$('dialogImage').alt=caption;$('dialogCaption').textContent=caption;$('photoDialog').showModal();}

function renderReading(){
  const book=current(),start=book.lines.findIndex(line=>line.includes('集解'));
  const raw=reading==='name'?book.lines.slice(0,start):reading==='shape'?book.lines.slice(start):book.use.quotes;
  $('originalHeading').textContent=book.old+' · '+({name:'釋名',shape:'集解',uses:'主治'}[reading]);
  $('originalContent').innerHTML=raw.map(line=>'<p>'+line.replace(/<b>(.*?)<\/b>/g,'<strong>$1</strong>').replace(/\{([^|]+)\|[^}]+\}/g,'<span class="inline-term">$1</span>')+'</p>').join('');
  let paragraphs=[];
  if(reading==='name')paragraphs=[book.modern[1],book.insight];
  else if(reading==='shape')paragraphs=book.modern.slice(3);
  else paragraphs=[book.use.explanation,book.use.term];
  $('plainContent').innerHTML=paragraphs.map(text=>'<p>'+escapeHtml(text)+'</p>').join('');
  $('plainHeading').textContent=reading==='uses'?'古籍怎样记述它的用途？':'读懂这一段。';
  $('textSource').href='https://zh.wikisource.org/zh-hant/本草綱目/草之一#'+book.old;
  $('historyNote').hidden=reading!=='uses';setPressed('[data-reading]','reading',reading);
}

function selectedTraits(){return [...$('traitOptions').querySelectorAll('input:checked')].map(input=>input.value);}
function noteData(){return {name:$('readerName').value.trim(),traits:selectedTraits(),note:$('readerNote').value.trim(),matched};}
function renderCard(){
  const book=current(),draft=noteData();
  $('cardImage').src=book.plantImage;$('cardImage').alt=book.name+'观察笺照片';
  $('cardPinyin').textContent=book.pinyin;$('cardName').textContent=book.name;$('cardLatin').textContent=book.latin;
  $('cardIndex').textContent=String(active+1).padStart(2,'0');
  $('cardTraits').textContent=draft.traits.length?draft.traits.join(' / '):'等你发现一个细节。';
  $('cardNote').textContent=draft.note||'每一条观察，都是你与草木相遇的痕迹。';
  $('cardAuthor').textContent=(draft.name||'一位本草读者')+'的观察';
}
function renderForm(){
  const book=current(),saved=records[book.name];
  const draft=saved&&Array.isArray(saved.traits)?saved:{name:'',traits:[],note:''};
  $('readerName').value=String(draft.name||'').slice(0,14);$('readerNote').value=String(draft.note||'').slice(0,90);
  $('traitOptions').innerHTML=book.traits.map(trait=>`<label><input type="checkbox" value="${escapeHtml(trait)}" ${draft.traits.includes(trait)?'checked':''}>${trait}</label>`).join('');
  $('traitOptions').querySelectorAll('input').forEach(input=>input.addEventListener('change',renderCard));
  $('saveFeedback').textContent=saved?'这株草木已有一份观察，可以继续补充。':'选择一项观察，给这次寻访留下一个印记。';
  renderCard();
}
function validRecords(){return BOOKS.filter(book=>records[book.name]&&Array.isArray(records[book.name].traits)&&records[book.name].traits.length);}
function updateCount(){$('collectionCount').textContent=String(validRecords().length);}
function saveRecord(event){
  event.preventDefault();const draft=noteData();
  if(!draft.traits.length){$('saveFeedback').textContent='先勾选一项你观察到的细节，再把它收进观察笺。';$('traitOptions').querySelector('input').focus();return;}
  records[current().name]=draft;let persistent=true;
  try{localStorage.setItem(KEY,JSON.stringify(records));}catch{persistent=false;}
  updateCount();$('saveFeedback').textContent=persistent?'已收藏。这份观察会保存在当前浏览器里。':'已收进本次寻访记录，也可以保存为图片带走。';
}
function showCollection(){
  const books=validRecords();
  $('collectionList').innerHTML=books.length?books.map(book=>{const record=records[book.name];return `<div class="saved-item"><img src="${book.plantImage}" alt="${book.name}"><div><h3>${book.name}</h3><p>${escapeHtml(record.traits.join(' / '))}</p></div><button data-return="${BOOKS.indexOf(book)}" class="text-link">继续寻访 ↗</button></div>`;}).join(''):'<p class="empty-collection">观察笺里还没有记录。走近一株草木，在“留迹”中选出你观察到的细节，就能把它收进来。</p><button id="startFromCollection" class="button solid">开始寻访 ↗</button>';
  $('collectionList').querySelectorAll('[data-return]').forEach(button=>button.addEventListener('click',()=>{$('collectionDialog').close();selectHerb(Number(button.dataset.return));scrollToSection('observe');}));
  const start=$('startFromCollection');if(start)start.onclick=()=>{$('collectionDialog').close();scrollToSection('observe');};
  $('collectionDialog').showModal();
}

function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight){
  let line='';for(const char of text){if(ctx.measureText(line+char).width>maxWidth&&line){ctx.fillText(line,x,y);y+=lineHeight;line=char;}else line+=char;}if(line)ctx.fillText(line,x,y);return y+lineHeight;
}
async function downloadCard(){
  const book=current(),draft=noteData();
  if(!draft.traits.length){$('saveFeedback').textContent='先选择一项观察，再保存你的本草观察笺。';return;}
  const button=$('downloadCard');button.disabled=true;button.textContent='正在生成观察笺…';
  try{
    const image=new Image();image.src=book.plantImage;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1420;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#efe8d6';ctx.fillRect(0,0,1000,1420);ctx.strokeStyle='#aab398';ctx.strokeRect(35,35,930,1350);
    ctx.fillStyle='#263e32';ctx.font='42px SimSun,serif';ctx.fillText('本草有迹 · 我的观察笺',75,112);
    ctx.strokeStyle='#bbc3ab';ctx.beginPath();ctx.moveTo(75,145);ctx.lineTo(925,145);ctx.stroke();
    const scale=Math.max(850/image.width,400/image.height),sw=850/scale,sh=400/scale;
    ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,75,180,850,400);
    ctx.fillStyle='#aa503a';ctx.font='20px sans-serif';ctx.fillText(book.pinyin,75,635);
    ctx.fillStyle='#263e32';ctx.font='64px SimSun,serif';ctx.fillText(book.name,75,720);
    ctx.fillStyle='#7b8073';ctx.font='italic 23px Georgia,serif';ctx.fillText(book.latin,75,766);
    ctx.fillStyle='#aa503a';ctx.font='23px sans-serif';ctx.fillText('我观察到',75,835);
    ctx.fillStyle='#263e32';ctx.font='30px SimSun,serif';let y=wrapCanvasText(ctx,draft.traits.join(' / '),75,888,840,48);
    ctx.fillStyle='#6c7565';ctx.font='25px sans-serif';wrapCanvasText(ctx,draft.note||'每一条观察，都是我与草木相遇的痕迹。',75,y+35,840,42);
    ctx.strokeStyle='#bbc3ab';ctx.beginPath();ctx.moveTo(75,1255);ctx.lineTo(925,1255);ctx.stroke();
    ctx.fillStyle='#263e32';ctx.font='24px sans-serif';ctx.fillText((draft.name||'一位本草读者')+'的观察',75,1315);
    ctx.fillStyle='#7b8073';ctx.font='18px sans-serif';ctx.fillText('植物照片来源：'+book.credit.plant,75,1355);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('image export failed');
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='本草观察笺-'+book.name+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),15000);
    $('saveFeedback').textContent='观察笺已生成，请查看浏览器下载。';
  }catch{$('saveFeedback').textContent='当前浏览器未能导出图片，可以先收藏观察笺，或更换浏览器后重试。';}
  finally{button.disabled=false;button.textContent='保存为图片 ↓';}
}

function selectHerb(index){
  if(!BOOKS[index])return;active=index;form='old';reading='name';matched=Boolean(records[current().name]?.matched);
  renderHerbTabs();renderHero();const book=current();facsimile.showHerb(book.name);distribution.render(book.name);$('oldImage').src=book.image;$('oldImage').alt=book.name+'古籍刻印图';
  $('plantPinyin').textContent=book.pinyin;$('plantTitle').textContent=book.name;$('latinName').textContent=book.latin;$('plantClue').textContent='“'+book.clue+'”';
  $('partTitle').textContent='先观察，再读名。';$('partText').textContent=book.insight;
  document.querySelectorAll('[data-part]').forEach(button=>button.classList.remove('selected'));
  renderProgress();renderQuiz();renderComparison();renderReading();renderForm();
  document.dispatchEvent(new CustomEvent('herbchange',{detail:book.name}));
}

$('heroHerbPicker').innerHTML=BOOKS.map((book,index)=>`<option value="${index}">${book.name}</option>`).join('');
$('heroHerbPicker').onchange=event=>selectHerb(Number(event.target.value));
$('heroArtTabs').innerHTML=BOOKS.map((book,index)=>`<button type="button" data-hero-herb="${index}" aria-pressed="${index===active}">${book.name}</button>`).join('');
$('heroArtTabs').querySelectorAll('button').forEach(button=>button.onclick=()=>selectHerb(Number(button.dataset.heroHerb)));
$('scanHerbPicker').onchange=event=>selectHerb(BOOKS.findIndex(book=>book.name===event.target.value));
document.querySelector('.photo-fragment').onclick=()=>openImage(current().plantImage,current().name+' · '+current().plantCaption);
document.querySelector('.photo-fragment').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openImage(current().plantImage,current().name+' · '+current().plantCaption);}};
document.querySelectorAll('[data-part]').forEach(button=>button.addEventListener('click',()=>observePart(button.dataset.part)));
document.querySelectorAll('[data-form]').forEach(button=>button.addEventListener('click',()=>{form=button.dataset.form;renderComparison();}));
document.querySelectorAll('[data-reading]').forEach(button=>button.addEventListener('click',()=>{reading=button.dataset.reading;renderReading();}));
$('openCompare').onclick=()=>openImage($('compareImage').src,$('compareImage').alt);
$('plantThumbnail').onclick=()=>openImage(current().plantImage,current().name+' · 生长中的植物');
$('herbThumbnail').onclick=()=>openImage(current().herbImage,current().name+' · 药材近照');
$('readerName').addEventListener('input',renderCard);$('readerNote').addEventListener('input',renderCard);$('noteForm').addEventListener('submit',saveRecord);$('downloadCard').onclick=downloadCard;
$('collectionButton').onclick=showCollection;
$('sourcesButton').onclick=()=>{$('sourcesDialog').showModal();};
$('sourceList').innerHTML=BOOKS.map(book=>`<div class="source-item"><strong>${book.name}</strong><a class="source-link" target="_blank" rel="noopener" href="${book.credit.plantUrl}">植物：${book.credit.plant} ↗</a><a class="source-link" target="_blank" rel="noopener" href="${book.credit.herbUrl}">药材：${book.credit.herb} ↗</a><a class="source-link" target="_blank" rel="noopener" href="https://zh.wikisource.org/zh-hant/本草綱目/草之一#${book.old}">古籍文字 ↗</a></div>`).join('');
document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>$(button.dataset.close).close());
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;document.querySelectorAll('.site-header nav a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));}},{rootMargin:'-20% 0px -55% 0px'});['facsimile','observe','match','compare','read','science','distribution','learn','keep'].forEach(id=>observer.observe($(id)));}
selectHerb(0);updateCount();

// Keep motion short, cancellable, and separate from the reading state.
(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function animate(element,frames,options={}){
    if(!element||reduced.matches)return;
    element.animate(frames,{duration:520,easing:'cubic-bezier(.2,.7,.2,1)',...options});
  }
  const dialog=$('openingDialog'),book=$('openingBook');
  let timers=[],lastFocus=null;
  function clearTimers(){timers.forEach(clearTimeout);timers=[];}
  function finish(){
    clearTimers();dialog.classList.remove('departing');
    if(dialog.open)dialog.close();
    document.body.classList.remove('opening-active');
    if(lastFocus&&lastFocus!==document.body)lastFocus.focus({preventScroll:true});
  }
  function start(){
    clearTimers();lastFocus=document.activeElement;
    book.classList.remove('unfold');dialog.classList.remove('departing');
    $('openingHint').textContent='一卷墨香，走近草木。';
    document.body.classList.add('opening-active');dialog.showModal();
    if(reduced.matches){finish();return;}
    timers.push(setTimeout(()=>{book.classList.add('unfold');$('openingHint').textContent='古籍里的草木，也在今天生长。';},650));
    timers.push(setTimeout(()=>dialog.classList.add('departing'),2700));
    timers.push(setTimeout(()=>{finish();animate(document.querySelector('.hero-copy'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}]);},3200));
  }
  $('skipOpening').onclick=finish;
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
  $('replayOpening').onclick=start;
  reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
  if(!reduced.matches)start();
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      animate(entry.target,[{opacity:.15,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:700});
      reveal.unobserve(entry.target);
    }),{threshold:.12});
    document.querySelectorAll('.chapter-heading,.observation-board,.compare-board,.reading-board,.keep-board').forEach(element=>reveal.observe(element));
  }
  document.querySelectorAll('[data-part]').forEach(button=>button.addEventListener('click',()=>animate($('partNote'),[{opacity:.25,transform:'translateX(9px)'},{opacity:1,transform:'translateX(0)'}])));
  document.querySelectorAll('[data-form]').forEach(button=>button.addEventListener('click',()=>animate($('compareImage'),[{opacity:.3,transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}])));
  document.querySelectorAll('[data-reading]').forEach(button=>button.addEventListener('click',()=>animate(document.querySelector('.reading-board'),[{opacity:.35},{opacity:1}],{duration:350})));
  $('noteForm').addEventListener('submit',()=>{if(selectedTraits().length)animate($('observationCard'),[{transform:'rotate(.6deg) scale(1)'},{transform:'rotate(-1deg) scale(1.025)',offset:.5},{transform:'rotate(.6deg) scale(1)'}],{duration:650});});
})();
