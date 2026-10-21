'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {createAIService}=require('./ai-service.cjs');
const publicFiles=new Set(['index.html','本草有迹Demo.html','book-v12.pdf','style.css','facsimile.css','distribution.css','knowledge.css','plant-profiles.css','discovery.css','learning-tools.css','ai-chat.css','data.js','more-herbs.js','expansion.js','facsimile.js','distribution.js','knowledge-data.js','plant-profiles.js','app.js','knowledge.js','herb-search.js','discovery.js','learning-tools.js','ai-chat.js']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
function readBody(req){return new Promise((resolve,reject)=>{let body='',bytes=0,failed=false;req.on('data',chunk=>{bytes+=chunk.length;if(bytes>32768){if(!failed){failed=true;reject({status:413,message:'请求内容过长。',code:'TOO_LARGE'});}return;}if(!failed)body+=chunk;});req.on('end',()=>{if(!failed)resolve(body);});req.on('error',reject);});}
function createServer({root=__dirname,ai=createAIService({root}),production=process.env.NODE_ENV==='production',siteOrigin=process.env.SITE_ORIGIN||process.env.RENDER_EXTERNAL_URL||'',dailyLimit=Number(process.env.AI_DAILY_LIMIT||100),minuteLimit=Number(process.env.AI_MINUTE_LIMIT||10)}={}){
 let day='',dayCount=0,minute=0,minuteCount=0;
 const allowAI=()=>{const now=Date.now(),today=new Date(now).toISOString().slice(0,10),bucket=Math.floor(now/60000);if(day!==today){day=today;dayCount=0;}if(minute!==bucket){minute=bucket;minuteCount=0;}if(dayCount>=dailyLimit||minuteCount>=minuteLimit)return false;dayCount++;minuteCount++;return true;};
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 return http.createServer(async(req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return json(res,400,{error:'地址格式错误'});}
  if(pathname==='/healthz'&&req.method==='GET')return json(res,200,{ok:true});
  if(pathname.startsWith('/api/')){
   const origins=siteOrigin?[siteOrigin.replace(/\/$/,'')]:['http://'+req.headers.host,'https://'+req.headers.host];
   if(req.headers.origin&&!origins.includes(req.headers.origin))return json(res,403,{error:'只接受本页面发起的请求。'});
   if(pathname==='/api/ai/status'&&req.method==='GET')return json(res,200,{...ai.status(),deployment:production});
   if(pathname==='/api/ai/chat'&&req.method==='POST'){
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return json(res,415,{error:'请使用JSON请求。'});
    try{const body=await readBody(req);let parsed;try{parsed=JSON.parse(body);}catch{return json(res,400,{error:'请求格式错误。'});}if(production&&!allowAI())return json(res,429,{error:'本网站本时段的AI体验次数已达上限，请稍后再试；资料检索仍可使用。',code:'SITE_LIMIT'});return json(res,200,await ai.chat(parsed));}catch(e){return json(res,e.status||500,{error:e.status?e.message:'服务暂时不可用。',code:e.code||'SERVER_ERROR'});}
   }
   return json(res,404,{error:'接口不存在。请确认已启动最新版server.js。'});
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  const relativeURL=pathname==='/'?'index.html':pathname.slice(1),file=path.resolve(root,relativeURL),relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)||(!publicFiles.has(relativeURL)&&!/^assets\/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(relativeURL))){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(file,(err,content)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:content);});
 });
}
if(require.main===module){const port=Number(process.env.PORT||3000),host=process.env.HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1'),server=createServer();server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`端口 ${port} 已被占用，请关闭原服务再启动。`:'本地服务启动失败。');process.exitCode=1;});server.listen(port,host,()=>console.log(`本草有迹服务已启动：${host}:${port}`));}
module.exports={createServer};
