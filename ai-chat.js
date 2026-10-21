'use strict';
(()=>{
  const $=id=>document.getElementById(id),esc=escapeHtml;
  let active=false,busy=false,ticket=0,controller=null,status=null,context=null,pending='',notice='',statusError='',probeTicket=0,verified=false;
  const conversations=new Map();
  const host=document.createElement('div');host.className='ai-controls';
  host.innerHTML='<div class="ai-mode-switch" role="group" aria-label="选择问答方式"><button id="askLocalMode" aria-pressed="true">资料检索</button><button id="askModelMode" aria-pressed="false">DeepSeek对话</button></div><div class="ai-connection"><span id="aiConnectionStatus" role="status">正在检查本地服务…</span><button id="aiCheckConfig" type="button">检查配置</button></div><details class="ai-setup"><summary>DeepSeek连接配置</summary><p>在项目文件夹中用VS Code打开 <strong>deepseek.local.json</strong>，将自己的密钥填到 apiKey，保存后点击“检查配置”。密钥由本地服务读取，不要填在聊天框里。</p><p>如果没有这个文件，可复制 deepseek.example.json 并改名。需要运行项目内新版 server.js；直接双击HTML时仅支持资料检索。</p><p>DeepSeek对话会发送本轮问题、最近几轮对话和相关展内文字资料到DeepSeek，按你的API账户计费。不会发送浏览器成就、笔记或植物图片。</p></details><div class="ai-chat-top"><span id="aiConversationName"></span><button id="aiClearChat" type="button">新对话</button></div>';
  $('askForm').before(host);
  function items(){return conversations.get(context)||[];}
  function sync(){const id=discovery.selected;if(context!==id){if(controller)controller.abort();ticket++;busy=false;pending='';notice='';context=id;}}
  function refsHTML(refs){return refs.map(r=>'<div class="ai-reference"><span>['+r.number+'] '+esc(r.name)+' · '+esc(r.title)+'</span>'+r.sources.filter(s=>/^https:\/\//.test(s.url)).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.title)+' ↗</a>').join('')+'<a href="#'+esc(r.jump)+'" data-ai-plant="'+esc(r.id)+'">打开对应展览资料 ↗</a></div>').join('');}
  function render(){sync();$('askLocalMode').setAttribute('aria-pressed',String(!active));$('askModelMode').setAttribute('aria-pressed',String(active));$('aiClearChat').hidden=!active;$('aiConversationName').textContent=active?'当前植物：'+$('askPlant').selectedOptions[0].textContent+' · 可连续追问':'本地全文检索 · 不调用模型';
    const label=verified?'DeepSeek已就绪 · 已成功返回回答':statusError|| (status?.configured?'DeepSeek已配置 · 发送问题后验证接口':status?.configError?'配置文件格式有误，请检查JSON':status?'DeepSeek尚未配置密钥':'正在确认本地AI服务');$('aiConnectionStatus').textContent=label;
    $('askForm').querySelector('button[type="submit"]').disabled=busy;
    if(!active)return;
    document.querySelector('.ask-mode').innerHTML='<span>● DeepSeek · 展内资料辅助</span><small>'+esc(status?.model||'等待本地配置')+'</small>';
    $('askAnswer').innerHTML=items().map(turn=>'<article class="ai-turn"><div class="ai-user-question"><small>你</small><p>'+esc(turn.question)+'</p></div><div class="ai-assistant"><span class="ai-answer-label">'+(turn.calledModel?'DeepSeek回答':'展内资料提示')+'</span><div class="ai-answer-text">'+esc(turn.answer).replace(/\n/g,'<br>')+'</div>'+(turn.truncated?'<p class="ai-notice">本次回答达到长度上限，可继续追问。</p>':'')+(turn.references.length?'<details class="ai-evidence"><summary>核对回答引用 · '+turn.references.length+'条展内资料</summary>'+refsHTML(turn.references)+'</details>':'<p class="ai-notice">此条未附有效资料编号，不能据此视为已完成来源核对。</p>')+'<div class="ai-followups">'+turn.followUps.map(q=>'<button data-ai-follow="'+esc(q)+'">'+esc(q)+'</button>').join('')+'</div></div></article>').join('')+(busy?'<div class="ai-pending" role="status"><strong>'+esc(pending)+'</strong><p>正在检索资料，等待DeepSeek归纳回答…</p></div>':'')+(notice?'<p class="ai-notice" role="status">'+esc(notice)+'</p>':'')+(!items().length&&!busy?'<div class="ask-welcome"><span>问</span><h2>围绕一株草木，接着问下去。</h2><p>例如先问“人参有哪些成分”，再问“它们现在有哪些应用”。每次回答都会尝试给出展内资料依据。</p></div>':'');
  }
  async function check(){const probe=++probeTicket;try{const r=await fetch('/api/ai/status?check='+Date.now(),{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error();const next=await r.json();if(typeof next.configured!=='boolean'||next.provider!=='DeepSeek')throw Error();if(probe!==probeTicket)return;status=next;if(!next.configured)verified=false;statusError='';const setup=document.querySelector('.ai-setup');if(setup)setup.hidden=Boolean(next.deployment);if(status.configured&&notice.includes('还没有配置DeepSeek'))notice='';}catch{if(probe!==probeTicket)return;status=null;statusError='暂时无法读取本地AI服务状态；发送问题时会直接连接后端确认。';}render();}
  async function ask(question){const q=String(question||'').trim();if(!q)return;const named=LEARNING_PLANTS.filter(p=>q.includes(p.name)||q.includes(p.name.replace('专题','')));if(named.length===1&&named[0].id!==discovery.selected)discovery.select(named[0].id);sync();if(busy)return;if(q.length>1200){notice='问题请控制在1200字以内。';render();return;}
    // The backend is authoritative: a stale or failed status probe must not block a chat.
    check();
    controller=new AbortController();const request=++ticket;busy=true;pending=q;notice='';const id=context,history=items().slice(-3).flatMap(t=>[{role:'user',content:t.question},{role:'assistant',content:t.answer}]);render();
    try{const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({message:q,context:id,history})});let data;try{data=await r.json();}catch{throw Error('当前页面没有连接到AI后端，请用项目本地服务打开问答页。');}if(!r.ok){if(data.code==='NOT_CONFIGURED'){status={...status,configured:false};verified=false;statusError='';}throw Error(data.error||'模型暂时未能完成请求。');}if(typeof data.answer!=='string')throw Error('AI服务返回不完整，请重试。');if(request!==ticket)return;if(data.calledModel)verified=true;status={provider:'DeepSeek',configured:true,model:data.model||status?.model};statusError='';const turns=conversations.get(id)||[];turns.push({question:q,answer:data.answer,references:data.references||[],followUps:data.followUps||[],calledModel:data.calledModel,truncated:data.truncated});conversations.set(id,turns.slice(-10));notice='';}
    catch(e){if(request!==ticket)return;notice=e.name==='AbortError'?'本次请求已取消。':e instanceof TypeError?'无法连接本地AI服务。请刷新当前网站，并确认网页服务仍在运行。':e.message||'本地服务连接失败，请检查运行状态。';}
    finally{if(request===ticket){busy=false;pending='';render();}}
  }
  $('askLocalMode').onclick=()=>{if(controller)controller.abort();ticket++;busy=false;active=false;document.querySelector('.ask-mode').innerHTML='<span>● 展内资料检索</span><small>全文检索 · 展内11株植物</small>';render();$('askAnswer').innerHTML='<div class="ask-welcome"><h2>已切回本地资料检索。</h2><p>输入问题或点击推荐问题，查找原始段落。</p></div>';};
  $('askModelMode').onclick=()=>{active=true;render();check();};$('aiCheckConfig').onclick=check;
  $('aiClearChat').onclick=()=>{if(controller)controller.abort();ticket++;busy=false;conversations.delete(context);notice='';render();};
  $('askAnswer').addEventListener('click',e=>{const follow=e.target.closest('[data-ai-follow]'),plant=e.target.closest('[data-ai-plant]');if(follow){$('askInput').value=follow.dataset.aiFollow;ask(follow.dataset.aiFollow);}if(plant)discovery.select(plant.dataset.aiPlant);});
  window.bencaoAI={get active(){return active;},ask,render};
  window.addEventListener('focus',check);
  window.addEventListener('hashchange',()=>{if(location.hash==='#ask')check();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
  render();check();
})();
