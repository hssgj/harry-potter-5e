import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {loadContent} from '../src/game-content.js';
import {command,newGame} from '../src/game.js';
import {initializeGame,commitCommand,readGame,exportGameHistories} from '../src/game-store.js';
const c=await loadContent(),dir=await mkdtemp(join(tmpdir(),'hp5e-expedition-'));let s=await initializeGame(dir,c),count=0;
async function go(type,fields={}){s=await commitCommand(dir,{id:'expedition_'+(++count),expected_revision:s.revision,type,dice_mode:'auto',...fields},c);}
try{
 const path=['HSM-003','HSM-006','HSM-007','HSM-002','HSM-005','VAL-001'];
 for(const poi_id of path)await go('travel',{poi_id});
 await go('encounter',{template_id:'VAL-E01',rolls:[20,1,1,1]});
 const encounter=s.combat.id;
 for(let guard=0;s.combat.active&&guard<30;guard++){
  if(s.combat.order[s.combat.index]==='player'){
   const victim=s.combat.actors.find(a=>a.hp>0&&!a.escaped);
   await go('cast',{spell_id:'basic_cast',tier:2,target_id:victim.id,rolls:[20,6,6,6,6]});
   if(s.combat.active)await go('end_turn');
  }else{await go('enemy_prepare');if(s.combat.pending)await go('react',{defence:'none',rolls:[1]});}
 }
 assert.equal(s.world.entities[encounter].state,'cleared');
 await go('access_loot',{node_id:'n1',rolls:[20]});await go('loot',{node_id:'n1'});
 const inventory=structuredClone(s.world.campaign.player.inventory);
 await go('travel',{poi_id:'HSM-005'});await go('travel',{poi_id:'HSM-002'});await go('rest',{kind:'long'});
 await go('travel',{poi_id:'HSM-005'});await go('travel',{poi_id:'VAL-001'});
 s=await readGame(dir,c);assert.deepEqual(s.world.campaign.player.inventory,inventory);assert.ok(s.world.entities['VAL-001'].collected.includes('n1'));
 await assert.rejects(commitCommand(dir,{id:'double_loot',expected_revision:s.revision,type:'loot',node_id:'n1',dice_mode:'auto'},c),/already collected/);
 let replay=newGame(c,s.initial_seed);for(const e of s.world.events.filter(e=>e.request))replay=command(replay,e.request,c);assert.deepEqual(replay,s);
 await exportGameHistories(dir,c);
 console.log(JSON.stringify({status:'PASS',commands:count,events:s.world.events.length,encounter,rounds:s.combat?.round??'stored in encounter history',checks:['travel','cast','enemy turns','victory','loot','rest','revisit','duplicate loot rejection','disk reload','full deterministic replay','history export'],note:'Scripted boundary test; favourable supplied dice, not a balance claim.'},null,2));
}finally{await rm(dir,{recursive:true,force:true});}
