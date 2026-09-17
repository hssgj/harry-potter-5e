import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createWorld,transact,entityHistory} from '../src/world.js';
import {commitWorld,readWorld} from '../src/world-store.js';
const campaign=JSON.parse(await readFile(new URL('../runtime/campaign-state.json',import.meta.url)));
const fixture=()=>createWorld(campaign,[{id:'P1',states:['unvisited','cleared'],loot_nodes:[{id:'chest'}]}],[{id:'T1'}],['item']);
const event=(id,type,fields={})=>({id,type,reason:'test',source:'fixture',game_time:'day 1, morning',...fields});
test('loot changes inventory and both histories; cannot collect twice',()=>{
 const e=event('a','loot_collect',{poi_id:'P1',node_id:'chest',items:[{id:'item',quantity:2}]});
 const first=fixture(),next=transact(first,[e],0);
 assert.equal(first.campaign.player.inventory.item,undefined);
 assert.equal(next.campaign.player.inventory.item,2);
 assert.equal(entityHistory(next,'LOC-P1').events.length,1);
 assert.throws(()=>transact(next,[{...e,id:'b'}],1),/already collected/);
});
test('encounters get distinct histories and state changes link back to POI',()=>{
 let db=transact(fixture(),[event('a','encounter_create',{instance_id:'E1',template_id:'T1',poi_id:'P1'})],0);
 db=transact(db,[event('b','entity_state',{entity_id:'E1',from:'active',to:'escaped'})],1);
 assert.equal(entityHistory(db,'P1').events.length,2);
 assert.equal(db.entities.E1.state,'escaped');
 assert.throws(()=>transact(db,[event('c','world_note',{entities:['FAKE']})],2),/unknown referenced/);
});
test('batch rollback, duplicate and stale revision checks',()=>{
 const db=fixture(),e=event('a','poi_visit',{poi_id:'P1'});
 assert.throws(()=>transact(db,[e,{...e}],0),/duplicate/);
 assert.equal(db.entities.P1.visits,0);
 assert.throws(()=>transact(db,[e],1),/stale/);
});
test('late clock creation requires a recorded cause',()=>{
 const db=transact(fixture(),[event('a','world_note',{entities:['P1']})],0);
 const next=transact(db,[event('b','clock_create',{clock_id:'revenge',cause_event_id:'a',segments:4})],1);
 assert.equal(next.campaign.world.clocks.revenge.cause_event_id,'a');
});
test('concurrent writers preserve one complete transaction',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'hp5e-test-'));
 await writeFile(join(dir,'world.json'),JSON.stringify(fixture()));
 const results=await Promise.allSettled(['a','b'].map(id=>commitWorld(dir,[event(id,'poi_visit',{poi_id:'P1'})],0)));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const db=await readWorld(dir);assert.equal(db.revision,1);assert.equal(db.events.length,1);assert.equal(db.entities.P1.log.length,1);
});
