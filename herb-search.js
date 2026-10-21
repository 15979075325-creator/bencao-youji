'use strict';
// Shared, offline full-text index. No remote model or invented answers.
function createHerbSearch(plants,bookOf,record){
  const variants={'參':'参','黃':'黄','耆':'芪','葉':'叶','藥':'药','莖':'茎','綱':'纲','圖':'图','紅':'红','長':'长','處':'处','體':'体','皂甙':'皂苷'};
  function norm(s){let t=String(s||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');Object.entries(variants).forEach(([a,b])=>t=t.split(a).join(b));return t.replace(/<[^>]*>/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
  const hints={identity:['形态','植物','叶片','花','识别','长什么样','是什么','介绍'],book:['古籍','原文','古名','别名','释名','主治','记载'],part:['部位','药材','加工','炮制','饮片','根茎','红参','白参'],habitat:['分布','生境','环境','生长','哪里','省份','产地'],compound:['成分','皂苷','皂甙','提取','青蒿素','分子'],research:['应用','运用','用途','作用','治疗','功效','使用','研究','证据','有效','安全','注意','禁忌','相互作用']};
  const aliases=plants.map(p=>{const b=bookOf(p);const names=[p.name,p.latin,b?.old];if(b){const line=b.lines.find(l=>/釋名|释名/.test(l));if(line)names.push(...line.replace(/<[^>]*>/g,' ').replace(/釋名|释名/g,'').split(/[、，。\s]+/).filter(v=>v.length>1&&v.length<10));}return {id:p.id,names:names.filter(Boolean).map(norm)};});
  const docs=plants.flatMap(p=>Object.keys(hints).map(key=>{const r=record(p,key),b=bookOf(p),f=p.profile;let supplement='';if(key==='book'&&b)supplement=(b.modern||[]).join('\n')+'\n'+(b.use?.quotes||[]).join('\n')+'\n'+(b.use?.explanation||'');if(key==='compound')supplement=p.facts.join('\n');if(key==='research')supplement=f.safety.join('\n')+'\n'+f.takeaway;return {id:p.id,key,name:p.name,latin:p.latin,title:r.title,text:r.text+'\n'+r.extra+'\n'+supplement,jump:r.jump,sources:r.sources,normalized:norm(r.title+' '+r.text+' '+r.extra+' '+supplement)};}));
  function search(raw,{context=null,limit=12}={}){
    const q=norm(raw);if(!q)return [];
    const named=aliases.filter(a=>a.names.some(n=>n.length>1&&q.includes(n))).map(a=>a.id);
    let stripped=q;aliases.filter(a=>named.includes(a.id)).forEach(a=>a.names.forEach(n=>stripped=stripped.split(n).join(' ')));
    stripped=stripped.replace(/请问|一下|告诉我|能不能|可以|为什么|什么|怎么|如何|有哪些|有什么|多少|现在|目前|具体|关于|想了解|了解|介绍一下|的|了|吗|呢|呀|是|和|与|及|在/g,' ').trim();
    const terms=[...new Set(stripped.split(/\s+/).filter(Boolean))];
    const grams=[...new Set(terms.flatMap(t=>/^[a-z0-9]+$/.test(t)||/^[根叶花茎果种皮]$/.test(t)?[t]:t.length<2?[]:Array.from({length:t.length-1},(_,i)=>t.slice(i,i+2))))];
    const intent=Object.entries(hints).filter(([,words])=>words.some(w=>q.includes(norm(w)))).map(([k])=>k);
    let core=stripped;Object.values(hints).flat().sort((a,b)=>b.length-a.length).forEach(w=>core=core.split(norm(w)).join(' '));core=core.replace(/代表|主要|哪些|还有|相关|目前|情况|知识|怎样|有关/g,' ').replace(/\s+/g,'');
    const comparison=/区别|不同|比较|一种|一样/.test(q)&&named.length>1;
    return docs.map(d=>{let score=0,matched=[];if(named.length&&!named.includes(d.id))return null;
      for(const t of terms){if(t.length>1&&d.normalized.includes(t)){score+=18+t.length;matched.push(t);}}
      const literal=d.normalized.includes(q);if(literal){score+=40;matched.unshift(q);}
      const hits=grams.filter(g=>d.normalized.includes(g));score+=hits.length*3;
      if(!comparison&&core.length>=2&&!literal&&!d.normalized.includes(core)&&!Array.from({length:core.length-1},(_,i)=>core.slice(i,i+2)).some(g=>d.normalized.includes(g)))return null;
      const semantic=intent.includes(d.key);if(semantic)score+=9;if(/根茎|红参|白参|皂苷|青蒿素/.test(q)&&!literal&&!hits.length&&!comparison)return null;
      const coverage=grams.length?hits.length/grams.length:0;
      if(!named.length&&!semantic&&coverage<.55)return null;
      if(!named.length&&!semantic&&!matched.length&&hits.length<2)return null;
      if(named.length){score+=6;if(!terms.length||comparison){score+=d.key==='identity'?35:0;}else if(!semantic&&!matched.length&&coverage<.3)return null;}
      if(!named.length&&context===d.id&&semantic)score+=4;
      if(comparison&&d.key!=='identity')return null;
      if(score<=0)return null;
      const anchor=matched[0]||hits[0],plain=d.text;let at=anchor?norm(plain).indexOf(anchor):-1;
      // Snippet offsets are found in the original text to preserve punctuation.
      at=anchor?plain.toLowerCase().indexOf(anchor):0;if(at<0)at=0;
      const start=Math.max(0,at-35),snippet=(start?'…':'')+plain.slice(start,start+190).replace(/\n/g,' ')+(plain.length>start+190?'…':'');
      return {...d,score,matched:[...new Set([...matched,...hits])],snippet};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)).slice(0,limit);
  }
  return {search,docs,norm};
}
if(typeof module!=='undefined'&&module.exports)module.exports={createHerbSearch};
