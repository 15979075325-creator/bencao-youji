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
  let herb='丹参',mode='text',index=4,zoom=1.75,viewMode='read',readerAction='turn',drag=null;
  try{const saved=JSON.parse(localStorage.getItem('bencao-reader-view-v1')||'null');if(saved&&['read','fit','manual'].includes(saved.mode)){viewMode=saved.mode;if(['turn','pan'].includes(saved.action))readerAction=saved.action;zoom=Math.max(1,Math.min(6,Number(saved.zoom)||1));}}catch{}
  function saveView(){try{localStorage.setItem('bencao-reader-view-v1',JSON.stringify({mode:viewMode,zoom,action:readerAction}));}catch{}}
  const image=byId('scanImage'),viewport=byId('scanViewport'),canvas=byId('scanCanvas');
  const decodeCache=new Map();let fullSource='';
  const readingSource=src=>src.startsWith('data:')?src:src.replace('assets/','assets/scan-fast-').replace(/\.jpg$/,'.webp')+'?v=2';
  function loadReading(src){
    if(decodeCache.has(src)){const cached=decodeCache.get(src);decodeCache.delete(src);decodeCache.set(src,cached);return cached;}
    const next=new Image();next.decoding='async';next.src=src;
    const ready=next.decode?next.decode():new Promise((resolve,reject)=>{if(next.complete&&next.naturalWidth)resolve();else{next.onload=resolve;next.onerror=reject;}});
    const promise=ready.then(()=>next).catch(error=>{if(decodeCache.get(src)===promise)decodeCache.delete(src);throw error;});decodeCache.set(src,promise);
    while(decodeCache.size>4)decodeCache.delete(decodeCache.keys().next().value);
    return promise;
  }
  function warmNeighbors(){if(mode!=='text'||viewport.clientWidth<=28)return;for(const offset of [1,-1]){const page=pages[index+offset];if(page)loadReading(readingSource(page.image)).catch(()=>{});}}
  function updateMouseControls(){for(const [id,disabled]of [['scanMousePrev',mode!=='text'||index===0],['scanMouseNext',mode!=='text'||index===pages.length-1]]){const b=byId(id);b.disabled=disabled;b.hidden=mode!=='text';}}
  let transitionId=0,turnLayer=null,turnAnimations=[],previousPage=null;
  const motionOff=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clearTurn(){
    turnAnimations.forEach(animation=>animation.cancel());turnAnimations=[];
    if(turnLayer){turnLayer.remove();turnLayer=null;}
    canvas.classList.remove('is-turning');viewport.removeAttribute('aria-busy');byId('scanLoading').hidden=true;
  }
  function presentPage(src,alt,direction){
    const ticket=++transitionId;
    clearTurn();
    if(image.getAttribute('src')===src&&image.complete&&image.naturalWidth){image.alt=alt;fit();warmNeighbors();return;}
    const oldSrc=image.getAttribute('src'),oldAlt=image.alt;
    const canTurn=oldSrc&&image.complete&&image.naturalWidth&&!motionOff()&&typeof image.animate==='function';
    viewport.setAttribute('aria-busy','true');byId('scanLoading').textContent='正在载入书页…';byId('scanLoading').hidden=false;
    loadReading(src).then(()=>{
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
      image.src=src;image.alt=alt;fit();viewport.removeAttribute('aria-busy');byId('scanLoading').hidden=true;warmNeighbors();
      if(!canTurn)return;
      const layer=turnLayer,leaf=layer.querySelector(direction<0?'.turn-left':'.turn-right'),rest=layer.querySelector(direction<0?'.turn-right':'.turn-left');
      const duration=260,sign=direction<0?1:-1;
      turnAnimations=[
        leaf.animate([{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY('+sign*52+'deg)',opacity:.96,offset:.5},{transform:'rotateY('+sign*126+'deg) translateX('+sign*8+'%)',opacity:0}],{duration,easing:'cubic-bezier(.22,.65,.25,1)',fill:'both'}),
        rest.animate([{opacity:1},{opacity:.6,offset:.35},{opacity:0}],{duration:duration*.78,easing:'ease-in-out',fill:'both'}),
        image.animate([{opacity:.18},{opacity:.6,offset:.4},{opacity:1}],{duration,easing:'ease-in-out',fill:'both'}),
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
    viewport.style.touchAction=readerAction==='turn'&&mode==='text'?'pan-y':'auto';
    byId('scanDragTurn').setAttribute('aria-pressed',String(readerAction==='turn'));byId('scanDragPan').setAttribute('aria-pressed',String(readerAction==='pan'));image.draggable=false;
    const hint=document.querySelector?.('.scan-reading-hint');if(hint)hint.textContent=(viewMode==='fit'?'当前为完整页':viewMode==='read'?'当前按窗口宽度放大阅读':'当前为手动缩放')+(mode==='figure'?' · 图卷可放大查看':readerAction==='turn'?' · 按住书页左右拖动即可翻页；切到“拖动移图”可移动放大画面':' · 当前拖动用于移图；点“拖动翻页”恢复整页翻页')+' · 保留显示设置。';
    byId('scanZoomOut').disabled=zoom<=1;byId('scanZoomIn').disabled=zoom>=6;
  }
  function show(){
    const graph=mode==='figure',page=pages[index];
    const diagram=entries[herb].diagram||79;
    const target=graph?(diagram===76?'assets/original-v01-076.jpg':diagram===77?'assets/original-v01-077.jpg':'assets/original-v01-079.jpg'):page.image;
    const alt=graph?'本草纲目第一册扫描第'+diagram+'页完整图卷原图':'本草纲目第十二册扫描第'+page.number+'页完整原文';
    const direction=previousPage!==null&&page.number<previousPage?-1:1;previousPage=page.number;
    fullSource=target;presentPage(readingSource(target),alt,direction);
    byId('scanVolume').textContent=graph?'第1册 · 图卷上':'第12册 · 草部第十二卷'+(page.number<49?'上':'下');
    byId('scanPageLabel').textContent=graph?'扫描第'+diagram+'页 / 图卷完整原图':'扫描第'+page.number+'页 / 本册共92个扫描页';
    byId('scanEntryNote').textContent=graph?'这一完整原页包含'+(diagram===76?'人参、甘草、黄芪':diagram===77?'桔梗、黄精、知母':'丹参、玄参、地榆、紫草')+'等刻印图，保留两叶与原扫描水印。':entries[herb].location;
    byId('scanSource').href=graph?'https://commons.wikimedia.org/wiki/File:NLC892-411999026806-2109_本草綱目_第1冊.pdf':originalSource;
    byId('scanPrev').disabled=graph||index===0;byId('scanNext').disabled=graph||index===pages.length-1;
    byId('scanPagePicker').disabled=graph;byId('scanPagePicker').value=String(page.number);
    document.querySelectorAll('[data-scan-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scanMode===mode)));
    viewport.scrollTo(0,0);fit();updateMouseControls();
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
  byId('scanOpen').onclick=()=>openImage(fullSource||image.src,image.alt);
  document.querySelectorAll('[data-scan-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.scanMode;show();});
  byId('scanFullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await byId('scanReader').requestFullscreen();fit();}catch{openImage(image.src,image.alt);}};
  if(typeof ResizeObserver==='function'){const sizeObserver=new ResizeObserver(fit);sizeObserver.observe(viewport);}
  window.addEventListener('hashchange',()=>requestAnimationFrame(()=>{fit();warmNeighbors();}));
  image.onload=fit;window.addEventListener('resize',fit);document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fit));
  byId('scanDragTurn').onclick=()=>{readerAction='turn';fit();saveView();};byId('scanDragPan').onclick=()=>{readerAction='pan';fit();saveView();};
  image.addEventListener('dragstart',e=>e.preventDefault());
  byId('scanMousePrev').onclick=()=>byId('scanPrev').onclick();byId('scanMouseNext').onclick=()=>byId('scanNext').onclick();
  function flip(direction){if(mode!=='text')return;const next=index+direction;if(next<0||next>=pages.length)return;index=next;show();}
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false)return;
    const rect=viewport.getBoundingClientRect(),x=event.clientX-rect.left;
    const turn=mode==='text'&&readerAction==='turn';
    if(event.pointerType==='touch'&&!turn)return;
    if(event.pointerType!=='touch')event.preventDefault();
    drag={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,turn,width:rect.width,start:x,id:event.pointerId};
    try{viewport.setPointerCapture(event.pointerId);}catch{}viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(drag.turn){if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy))canvas.style.transform='translateX('+Math.max(-65,Math.min(65,dx*.35))+'px)';}
    else{viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;}
  });
  function endDrag(event,cancel=false){
    if(!drag||drag.id!==event.pointerId)return;
    const gesture=drag;drag=null;canvas.style.transform='';viewport.classList.remove('dragging');
    if(!cancel&&gesture.turn){const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
      if(Math.abs(dx)>=28&&Math.abs(dx)>Math.abs(dy)*1.2)flip(dx<0?1:-1);
      else if(viewMode==='fit'&&Math.abs(dx)<8&&Math.abs(dy)<8)flip(gesture.start>gesture.width/2?1:-1);
    }
  }
  viewport.addEventListener('pointerup',event=>endDrag(event));viewport.addEventListener('pointercancel',event=>endDrag(event,true));
  window.addEventListener('pointerup',event=>endDrag(event));window.addEventListener('pointercancel',event=>endDrag(event,true));
  viewport.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();byId('scanNext').click();}if(event.key==='ArrowLeft'){event.preventDefault();byId('scanPrev').click();}if(event.key==='+'||event.key==='='){event.preventDefault();changeZoom(.25);}if(event.key==='-'){event.preventDefault();changeZoom(-.25);}});
  return {showHerb};
})();
