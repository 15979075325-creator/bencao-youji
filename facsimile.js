'use strict';
const facsimile=(()=>{
  const byId=id=>document.getElementById(id);
  const pages=[
    {number:5,image:'assets/new-v12-05.jpg'},
    {number:6,image:'assets/new-v12-06.jpg'},
    {number:11,image:'assets/new-v12-11.jpg'},
    {number:12,image:'assets/new-v12-12.jpg'},
    {number:16,image:'assets/new-v12-16.jpg'},
    {number:17,image:'assets/new-v12-17.jpg'},
    {number:32,image:'assets/added-v12-32.jpg'},
    {number:33,image:'assets/added-v12-33.jpg'},
    {number:36,image:'assets/added-v12-36.jpg'},
    {number:37,image:'assets/added-v12-37.jpg'},
    {number:43,image:'assets/added-v12-43.jpg'},
    {number:44,image:'assets/added-v12-44.jpg'},
    {number:76,image:'assets/original-v12-76.jpg'},
    {number:77,image:'assets/original-v12-77.jpg'},
    {number:78,image:'assets/original-v12-78.jpg'},
    {number:79,image:'assets/original-v12-79.jpg'},
    {number:80,image:'assets/original-v12-80.jpg'},
    {number:81,image:'assets/original-v12-81.jpg'},
    {number:82,image:'assets/original-v12-82.jpg'},
    {number:83,image:'assets/original-v12-83.jpg'},
    {number:84,image:'assets/original-v12-84.jpg'},
    {number:85,image:'assets/original-v12-85.jpg'},
    {number:86,image:'assets/original-v12-86.jpg'},
  ];
  const entries={
    '桔梗':{start:32,end:33,diagram:77,location:'扫描第32页左叶开始“桔梗”，选录第32、33页；后续请阅完整PDF。'},
    '黄精':{start:36,end:37,diagram:77,location:'扫描第36页左叶开始“黃精”，选录第36、37页；长条目后续请阅完整PDF。'},
    '知母':{start:43,end:44,diagram:77,location:'扫描第43页左叶开始“知母”，第44页接续。'},
    '甘草':{start:5,end:6,diagram:76,location:'扫描第5页左叶开始“甘草”。这里选录起始两页，长条目后续请阅完整PDF。'},
    '人参':{start:16,end:17,diagram:76,location:'扫描第16页右叶开始“人參”。这里选录起始两页，长条目后续请阅完整PDF。'},
    '黄芪':{start:11,end:12,diagram:76,location:'扫描第11页左叶开始“黃耆”（黄芪）。这里选录起始两页，长条目后续请阅完整PDF。'},
    '丹参':{start:80,end:82,location:'扫描第80页左叶可见“丹參”条目标题，第81、82页接续。'},
    '玄参':{start:76,end:78,location:'扫描第76页左叶开始“玄參”，第77页接续，第78页右叶仍有相关内容。'},
    '地榆':{start:78,end:80,location:'扫描第78页左叶开始“地榆”，第79页接续，第80页仍有相关内容。'},
    '紫草':{start:84,end:86,location:'扫描第84页左叶开始“紫草”，第85页接续，第86页仍有相关内容。'},
  };
  const originalSource='https://commons.wikimedia.org/wiki/File:NLC892-411999026806-2147_本草綱目_第12冊.pdf';
  let herb='丹参',mode='text',index=4,zoom=1.75,viewMode='read',drag=null;
  try{const saved=JSON.parse(localStorage.getItem('bencao-reader-view-v1')||'null');if(saved&&['read','fit','manual'].includes(saved.mode)){viewMode=saved.mode;zoom=Math.max(1,Math.min(6,Number(saved.zoom)||1));}}catch{}
  function saveView(){try{localStorage.setItem('bencao-reader-view-v1',JSON.stringify({mode:viewMode,zoom}));}catch{}}
  const image=byId('scanImage'),viewport=byId('scanViewport'),canvas=byId('scanCanvas');
  let transitionId=0,turnLayer=null,turnAnimations=[],previousPage=null;
  const motionOff=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clearTurn(){
    turnAnimations.forEach(animation=>animation.cancel());turnAnimations=[];
    if(turnLayer){turnLayer.remove();turnLayer=null;}
    canvas.classList.remove('is-turning');viewport.removeAttribute('aria-busy');
  }
  function presentPage(src,alt,direction){
    const ticket=++transitionId;
    clearTurn();
    if(image.getAttribute('src')===src&&image.complete&&image.naturalWidth){image.alt=alt;fit();return;}
    const oldSrc=image.getAttribute('src'),oldAlt=image.alt;
    const canTurn=oldSrc&&image.complete&&image.naturalWidth&&!motionOff()&&typeof image.animate==='function';
    viewport.setAttribute('aria-busy','true');
    const next=new Image();next.src=src;
    const ready=next.decode?next.decode():new Promise((resolve,reject)=>{if(next.complete&&next.naturalWidth)resolve();else {next.onload=resolve;next.onerror=reject;}});
    ready.then(()=>{
      if(ticket!==transitionId)return;
      if(canTurn){
        const layer=document.createElement('div');layer.className='scan-turn-old '+(direction<0?'turn-back':'turn-forward');layer.setAttribute('aria-hidden','true');
        for(const side of ['left','right']){
          const half=document.createElement('div');half.className='scan-turn-half turn-'+side;
          const copy=document.createElement('img');copy.src=oldSrc;copy.alt='';half.append(copy);
          const curl=document.createElement('span');curl.className='scan-page-curl';half.append(curl);layer.append(half);
        }
        canvas.append(layer);turnLayer=layer;canvas.classList.add('is-turning');
      }
      image.src=src;image.alt=alt;fit();viewport.removeAttribute('aria-busy');
      if(!canTurn)return;
      const layer=turnLayer,leaf=layer.querySelector(direction<0?'.turn-left':'.turn-right'),rest=layer.querySelector(direction<0?'.turn-right':'.turn-left');
      const duration=760,sign=direction<0?1:-1;
      turnAnimations=[
        leaf.animate([{transform:'rotateY(0deg)',opacity:1,filter:'brightness(1)'},{transform:'rotateY('+sign*52+'deg)',opacity:.96,filter:'brightness(.8)',offset:.5},{transform:'rotateY('+sign*126+'deg) translateX('+sign*8+'%)',opacity:0,filter:'brightness(.65)'}],{duration,easing:'cubic-bezier(.22,.65,.25,1)',fill:'both'}),
        rest.animate([{opacity:1},{opacity:.6,offset:.35},{opacity:0}],{duration:duration*.78,easing:'ease-in-out',fill:'both'}),
        image.animate([{opacity:.18,filter:'brightness(.88)'},{opacity:.6,offset:.4},{opacity:1,filter:'brightness(1)'}],{duration,easing:'ease-in-out',fill:'both'}),
        leaf.querySelector('.scan-page-curl').animate([{opacity:0,transform:'scale(.25)'},{opacity:.95,transform:'scale(1.15)',offset:.42},{opacity:0,transform:'scale(.8)'}],{duration,easing:'ease-in-out',fill:'both'})
      ];
      Promise.allSettled(turnAnimations.map(animation=>animation.finished)).then(()=>{if(ticket===transitionId)clearTurn();});
    }).catch(()=>{
      if(ticket!==transitionId)return;
      clearTurn();image.alt=oldAlt;
      byId('scanEntryNote').textContent+=' 本页图片未能加载，请重新选择或查看完整PDF。';
    });
  }
  function fit(){
    if(viewport.clientWidth<=28||viewport.clientHeight<=28)return;
    const ratio=(image.naturalWidth||2800)/(image.naturalHeight||2300);
    const base=Math.min(Math.max(viewport.clientWidth-28,100),Math.max(viewport.clientHeight-28,100)*ratio);
    if(viewMode==='read')zoom=(viewport.clientWidth-28)*1.6/base;
    canvas.style.width=Math.round(base*zoom)+'px';
    byId('scanZoomLabel').textContent=Math.round(zoom*100)+'%';
    byId('scanRead').setAttribute('aria-pressed',String(viewMode==='read'));byId('scanFit').setAttribute('aria-pressed',String(viewMode==='fit'));
    const hint=document.querySelector?.('.scan-reading-hint');if(hint)hint.textContent=(viewMode==='fit'?'当前为完整页':viewMode==='read'?'当前按窗口宽度放大阅读':'当前为手动缩放')+' · 翻页和切换条目保留显示设置，可拖动或滚动查看。';
    byId('scanZoomOut').disabled=zoom<=1;byId('scanZoomIn').disabled=zoom>=6;
  }
  function show(){
    const graph=mode==='figure',page=pages[index];
    const diagram=entries[herb].diagram||79;
    const target=graph?(diagram===76?'assets/original-v01-076.jpg':diagram===77?'assets/original-v01-077.jpg':'assets/original-v01-079.jpg'):page.image;
    const alt=graph?'本草纲目第一册扫描第'+diagram+'页完整图卷原图':'本草纲目第十二册扫描第'+page.number+'页完整原文';
    const direction=previousPage!==null&&page.number<previousPage?-1:1;previousPage=page.number;
    presentPage(target,alt,direction);
    byId('scanVolume').textContent=graph?'第1册 · 图卷上':'第12册 · 草部第十二卷'+(page.number<49?'上':'下');
    byId('scanPageLabel').textContent=graph?'扫描第'+diagram+'页 / 图卷完整原图':'扫描第'+page.number+'页 / 本册共92个扫描页';
    byId('scanEntryNote').textContent=graph?'这一完整原页包含'+(diagram===76?'人参、甘草、黄芪':diagram===77?'桔梗、黄精、知母':'丹参、玄参、地榆、紫草')+'等刻印图，保留两叶与原扫描水印。':entries[herb].location;
    byId('scanSource').href=graph?'https://commons.wikimedia.org/wiki/File:NLC892-411999026806-2109_本草綱目_第1冊.pdf':originalSource;
    byId('scanPrev').disabled=graph||index===0;byId('scanNext').disabled=graph||index===pages.length-1;
    byId('scanPagePicker').disabled=graph;byId('scanPagePicker').value=String(page.number);
    document.querySelectorAll('[data-scan-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scanMode===mode)));
    viewport.scrollTo(0,0);fit();
  }
  function showHerb(name){if(!entries[name])return;herb=name;mode='text';index=pages.findIndex(page=>page.number===entries[name].start);byId('scanHerbName').textContent=name;byId('scanHerbPicker').value=name;show();}
  function changeZoom(amount){clearTurn();viewMode='manual';zoom=Math.max(1,Math.min(6,zoom+amount));fit();saveView();}
  byId('scanHerbPicker').innerHTML=BOOKS.map(book=>'<option>'+book.name+'</option>').join('');
  byId('scanPagePicker').innerHTML=pages.map(page=>'<option value="'+page.number+'">扫描第'+page.number+'页</option>').join('');
  byId('scanHerbPicker').onchange=event=>showHerb(event.target.value);
  byId('scanPagePicker').onchange=event=>{index=pages.findIndex(page=>page.number===Number(event.target.value));mode='text';show();};
  byId('scanPrev').onclick=()=>{if(mode==='text'&&index>0){index--;show();}};
  byId('scanNext').onclick=()=>{if(mode==='text'&&index<pages.length-1){index++;show();}};
  byId('scanZoomIn').onclick=()=>changeZoom(.25);byId('scanZoomOut').onclick=()=>changeZoom(-.25);
  byId('scanRead').onclick=()=>{clearTurn();viewMode='read';fit();saveView();viewport.scrollTo(0,0);};
  byId('scanFit').onclick=()=>{clearTurn();viewMode='fit';zoom=1;fit();saveView();viewport.scrollTo(0,0);};
  byId('scanOpen').onclick=()=>openImage(image.src,image.alt);
  document.querySelectorAll('[data-scan-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.scanMode;show();});
  byId('scanFullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await byId('scanReader').requestFullscreen();fit();}catch{openImage(image.src,image.alt);}};
  if(typeof ResizeObserver==='function'){const sizeObserver=new ResizeObserver(fit);sizeObserver.observe(viewport);}
  window.addEventListener('hashchange',()=>requestAnimationFrame(fit));
  image.onload=fit;window.addEventListener('resize',fit);document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fit));
  viewport.addEventListener('pointerdown',event=>{if(zoom<=1||event.pointerType==='touch'||event.button!==0)return;event.preventDefault();drag={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');});
  viewport.addEventListener('pointermove',event=>{if(!drag)return;viewport.scrollLeft=drag.left+drag.x-event.clientX;viewport.scrollTop=drag.top+drag.y-event.clientY;});
  const endDrag=()=>{drag=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
  viewport.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();byId('scanNext').click();}if(event.key==='ArrowLeft'){event.preventDefault();byId('scanPrev').click();}if(event.key==='+'||event.key==='='){event.preventDefault();changeZoom(.25);}if(event.key==='-'){event.preventDefault();changeZoom(-.25);}});
  return {showHerb};
})();
