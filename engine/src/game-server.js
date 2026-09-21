import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadContent,validateContent} from './game-content.js';
import {readGame,initializeGame,commitCommand} from './game-store.js';
import {playerView} from './game.js';
export async function startServer({dir=resolve('playtest-save'),port=8787}={}){
 const c=await loadContent();validateContent(c);
 try{await readGame(dir,c);}catch(e){if(e.code!=='ENOENT')throw e;await initializeGame(dir,c);}
 const token=randomUUID();
 const server=createServer(async(req,res)=>{
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  try{
   const host=`127.0.0.1:${server.address().port}`;
   if(req.headers.host!==host&&req.headers.host!==`localhost:${server.address().port}`)return json(403,{error:'invalid host'});
   if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`)return json(403,{error:'origin rejected'});
   if(req.method==='GET'&&req.url==='/api/state')return json(200,{...playerView(await readGame(dir,c),c),token});
   if(req.method==='POST'&&req.url==='/api/command'){
    if(req.headers['x-hp5e-token']!==token)return json(403,{error:'missing session token'});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>32768)return json(413,{error:'request too large'});}
    const cmd=JSON.parse(body);const next=await commitCommand(dir,cmd,c);return json(200,{...playerView(next,c),token});
   }
   const assets={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
   if(req.method==='GET'&&assets[req.url]){
    const [file,mime]=assets[req.url];res.writeHead(200,{'Content-Type':mime,'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'"});return res.end(await readFile(new URL('../ui/'+file,import.meta.url)));
   }
   json(404,{error:'not found'});
  }catch(e){json(400,{error:e.message});}
 });
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const server=await startServer({dir:resolve(process.env.HP5E_SAVE_DIR||'playtest-save'),port:Number(process.env.HP5E_PORT||8787)});
 console.log(`HP5E audit playtest: http://127.0.0.1:${server.address().port}`);
}
