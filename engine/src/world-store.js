import {readFile,writeFile,rename,mkdir,rmdir,unlink,open} from 'node:fs/promises';
import {join} from 'node:path';
import {transact,entityHistory} from './world.js';
export async function readWorld(dir) {return JSON.parse(await readFile(join(dir,'world.json'),'utf8'));}
export async function commitWorld(dir,events,revision) {
  const lock=join(dir,'world.lock');
  await mkdir(lock); // fail closed on concurrent writer or interrupted transaction
  const temp=join(dir,'world.next.json');
  try {
    const next=transact(await readWorld(dir),events,revision);
    const handle=await open(temp,'wx');
    try {await handle.writeFile(JSON.stringify(next,null,2)+'\n');await handle.sync();} finally {await handle.close();}
    await rename(temp,join(dir,'world.json')); // snapshot and all histories move together
    return next;
  } finally {await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});await rmdir(lock);}
}
export async function exportHistories(dir) {
  const db=await readWorld(dir), dest=join(dir,'history');await mkdir(dest,{recursive:true});
  for(const id of Object.keys(db.entities)) {
    await writeFile(join(dest,id+'.json'),JSON.stringify(entityHistory(db,id),null,2)+'\n');
  }
  return db.revision;
}
