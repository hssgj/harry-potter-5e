import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createWorld,entityHistory} from './world.js';
import {readWorld,commitWorld,exportHistories} from './world-store.js';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=join(root,'runtime');
const pack=join(root,'content/highlands-sandbox-v0.1');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const [cmd,arg]=process.argv.slice(2);
if(cmd==='init') {
  const pois=await json(join(pack,'pois.json')), enc=await json(join(pack,'encounters.json'));
  const items=(await Promise.all(['gear','consumables','ingredients','components-curios'].map(n=>json(join(pack,'loot',n+'.json'))))).flatMap(c=>c.items.map(i=>i.id));
  const campaign=await json(join(dir,'campaign-state.json'));
  items.push(...Object.keys(campaign.player.inventory));
  await writeFile(join(dir,'world.json'),JSON.stringify(createWorld(campaign,pois.pois,enc.templates,items),null,2)+'\n',{flag:'wx'});
  await exportHistories(dir);console.log('Initialized world; old checkpoint retained as migration source.');
} else if(cmd==='history') console.log(JSON.stringify(entityHistory(await readWorld(dir),arg),null,2));
else if(cmd==='export') console.log('Exported revision',await exportHistories(dir));
else if(cmd==='apply') {const request=await json(arg); const db=await commitWorld(dir,request.events,request.expected_revision); await exportHistories(dir);console.log('Committed revision',db.revision);}
else if(cmd==='status') {const db=await readWorld(dir);console.log(JSON.stringify({revision:db.revision,events:db.events.length,entities:Object.keys(db.entities).length},null,2));}
else throw new Error('Use init | status | history ID | apply REQUEST.json | export');
