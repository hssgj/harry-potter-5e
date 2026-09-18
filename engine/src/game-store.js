import {readFile,open,mkdir,rename,unlink,rmdir} from 'node:fs/promises';
import {join} from 'node:path';
import {command,newGame,validateGame} from './game.js';
export async function readGame(dir,c){const s=JSON.parse(await readFile(join(dir,'game.json'),'utf8'));return validateGame(s,c);}
async function locked(dir,fn){
  await mkdir(dir,{recursive:true});const lock=join(dir,'game.lock');await mkdir(lock);
  const temp=join(dir,'game.next.json');
  try{
    const next=await fn();const f=await open(temp,'wx');
    try{await f.writeFile(JSON.stringify(next,null,2)+'\n');await f.sync();}finally{await f.close();}
    await rename(temp,join(dir,'game.json'));
    const d=await open(dir,'r');try{await d.sync();}finally{await d.close();}
    return next;
  }finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});await rmdir(lock);}
}
export async function initializeGame(dir,c,seed=1742){return locked(dir,async()=>{
  try{await readFile(join(dir,'game.json'));throw Error('save already exists; use a new directory');}catch(e){if(e.code!=='ENOENT')throw e;}
  return newGame(c,seed);
});}
export async function commitCommand(dir,cmd,c){return locked(dir,async()=>command(await readGame(dir,c),cmd,c));}
export async function exportGameHistories(dir,c){
  const s=await readGame(dir,c),dest=join(dir,`history-r${s.revision}`);await mkdir(dest,{recursive:true});
  for(const [id,entity] of Object.entries(s.world.entities)){
    const f=await open(join(dest,id+'.json'),'w');try{await f.writeFile(JSON.stringify({revision:s.revision,entity,events:s.world.events.filter(e=>entity.log.includes(e.id))},null,2)+'\n');}finally{await f.close();}
  }
  return {revision:s.revision,path:dest};
}
