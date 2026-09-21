// Command boundary for audit-v1. Pure: failed commands never mutate their input.
// Narrative judgments must be submitted as declarations BEFORE their resolution.
import {createWorld,transact} from './world.js';
const clone=structuredClone;
const check=(ok,m)=>{if(!ok)throw Error(m);};
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const has=(a,id)=>a.conditions.some(x=>x.id===id);
export function newGame(c,seed=1742) {
  check(integer(seed,1,4294967295),'invalid seed');
  const p=c.profile,campaign=clone(c.legacy.campaign);
  campaign.player.resources.hp={current:p.hp,max:p.hp,truth:'audit_proposal'};
  campaign.player.inventory=clone(p.inventory);campaign.player.cooldowns={};campaign.world.clocks={};
  const world=createWorld(campaign,Object.values(c.pois),Object.values(c.templates),[...Object.keys(c.items),...Object.keys(p.inventory)]);
  return {schema:3,mode:'audit_playtest',ruleset:'audit-v1',revision:0,seed,initial_seed:seed,time:0,turn:0,scene:0,
    world,location:p.start_poi,discovered:[p.start_poi],cleared:[],defeat:null,
    player:{id:'player',name:p.name,hp:p.hp,max_hp:p.hp,ac:p.ac,attack:p.attack,dc:p.dc,saves:clone(p.saves),movement_m:p.movement_m,
      position:[0,0],known:clone(p.known),prepared:clone(p.prepared),conditions:[],cooldowns:{},strain:0,reaction:true,concentration:null,has_wand:true},
    combat:null,encounter_states:{},proposals:{},item_uses:{},item_charges:{},equipment:{},sockets:{},progress:0,progress_claims:[],unlocks:[],
    clocks:{},rolls:[],last_result:null};
}
export function validateGame(s,c) {
  check(s?.schema===3&&s.mode==='audit_playtest'&&s.ruleset==='audit-v1','unsupported game');
  check(integer(s.revision,0,1e9)&&integer(s.time,0,1e12)&&integer(s.turn,0,1e9),'invalid timeline');
  check(c.pois[s.location]&&s.discovered.every(x=>c.pois[x]),'unknown location');
  for(const a of [s.player,...(s.combat?.actors||[])]) {
    check(integer(a.hp,0,a.max_hp)&&integer(a.max_hp,1,10000),'invalid HP');
    check(a.position.length===2&&a.position.every(Number.isFinite),'invalid position');
  }
  check(integer(s.player.strain,0,12),'invalid strain');
  check(s.player.prepared.length<=4&&new Set(s.player.prepared).size===s.player.prepared.length,'invalid prepared slots');
  for(const id of s.player.prepared)check(c.spells[id]&&s.player.known[id],'unknown prepared spell');
  for(const [id,t] of Object.entries(s.player.known))check(c.spells[id]&&integer(t,1,3),'invalid spell mastery');
  for(const [id,n] of Object.entries(s.world.campaign.player.inventory))check((c.items[id]||c.profile.inventory[id])&&integer(n,0,100000),'invalid inventory');
  check(new Set(s.world.events.map(e=>e.id)).size===s.world.events.length,'duplicate history');
  check(s.world.campaign.player.resources.hp.current===s.player.hp,'HP projection mismatch');
  return s;
}
export function command(input,cmd,c) {
  validateGame(input,c);
  check(cmd&&cmd.expected_revision===input.revision,'stale revision; reload');
  check(typeof cmd.id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(cmd.id),'command id required');
  check(!input.world.events.some(e=>e.command_id===cmd.id),'duplicate command');
  const s=clone(input),events=[],details=[],dice=cmd.rolls?[...cmd.rolls]:null;
  let usedDice=0;
  const roll=(sides,label)=>{
    let value;
    if(dice){check(dice.length>0,`missing d${sides}: ${label}`);value=dice.shift();check(integer(value,1,sides),`invalid d${sides}: ${label}`);usedDice++;}
    else {check(cmd.dice_mode==='auto','provide rolls or explicitly choose dice_mode auto');s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;value=1+Math.floor(s.seed/4294967296*sides);}
    s.rolls.push({command_id:cmd.id,label,sides,value,source:dice?'supplied':'seeded'});return value;
  };
  const d20=(label,adv=0)=>{const a=roll(20,label);if(!adv)return a;const b=roll(20,label);return adv>0?Math.max(a,b):Math.min(a,b);};
  const damageDice=(text,crit=false)=>{const m=/^(\d+)d(\d+)$/.exec(text);check(m,'invalid damage dice');let n=0;for(let i=0;i<Number(m[1])*(crit?2:1);i++)n+=roll(Number(m[2]),'damage');return n;};
  const event=(type,fields={},refs=[])=>events.push({id:`${cmd.id}_${events.length}`,command_id:cmd.id,type,reason:cmd.reason||cmd.type,source:'audit-v1 command',game_time:`T+${s.time}s`,...fields,entities:refs});
  const refs=()=>[s.location,'LOC-'+s.location,...(s.combat?[s.combat.id]:[])];
  const note=(summary,extra={})=>{details.push(summary);event('world_note',{summary,...extra},refs());};
  const inventory=()=>s.world.campaign.player.inventory;
  const ownTurn=()=>check(s.combat?.active&&s.combat.order[s.combat.index]==='player'&&!s.combat.pending,'not your turn');
  const action=()=>{if(s.combat?.active){ownTurn();check(s.combat.action,'action already spent');s.combat.action=false;}else advance(6);};
  const distance=(a,b)=>Math.hypot(a.position[0]-b.position[0],a.position[1]-b.position[1]);
  const target=id=>{const a=id==='player'?s.player:s.combat?.actors.find(x=>x.id===id);check(a&&a.hp>0&&!a.escaped,'invalid target');return a;};
  const breakConcentration=()=>{if(s.player.concentration){const spell=s.player.concentration;for(const a of s.combat?.actors||[])a.conditions=a.conditions.filter(x=>x.source!==spell);s.player.concentration=null;}};
  const hurt=(a,n)=>{
    a.hp=Math.max(0,a.hp-n);
    if(a.id==='player'&&n>0&&s.player.concentration){if(a.hp===0||d20('concentration')+a.saves.con<Math.max(10,Math.floor(n/2)))breakConcentration();}
    if(a.hp===0)a.conditions=[];
  };
  const sync=()=>{s.world.campaign.player.resources.hp.current=s.player.hp;s.world.campaign.player.conditions=clone(s.player.conditions);s.world.campaign.player.cooldowns=clone(s.player.cooldowns);};
  const advance=seconds=>{
    s.time+=seconds;
    s.player.conditions=s.player.conditions.filter(x=>x.expires_time==null||x.expires_time>s.time);
    for(const clock of Object.values(s.clocks))if(!clock.triggered&&s.time>=clock.due){clock.triggered=true;event('campaign_event',{event:{type:'clock_delta',clock:clock.id,delta:4}});note('An evidence-backed consequence is due.',{clock_id:clock.id});}
  };
  const reward=key=>{if(!s.progress_claims.includes(key)){s.progress_claims.push(key);s.progress++;note('Exploration progress +1.');}};
  const closeEncounter=(outcome)=>{
    const b=s.combat;check(b?.active,'no active encounter');
    event('entity_state',{entity_id:b.id,from:'active',to:outcome});b.active=false;b.pending=null;
    breakConcentration();s.player.conditions=s.player.conditions.filter(x=>!x.combat_only);
    if(outcome==='cleared'){
      if(!s.cleared.includes(s.location))s.cleared.push(s.location);
      const p=s.world.entities[s.location];event('entity_state',{entity_id:s.location,from:p.state,to:c.poiRules[s.location].resolved_state});
      reward('encounter:'+s.location);
    }
    note('Encounter '+outcome+'.');s.encounter_states[b.id]=clone(b);
  };
  const finishIfNeeded=()=>{
    if(s.player.hp===0&&!s.defeat){
      s.defeat={location:s.location,encounter_id:s.combat?.id||null,injury:'Shaken: -1 to checks until safe long rest.',lost:{},status:'awaiting_recovery'};
      // One actual carried non-wand item may be lost; never fabricate possessions.
      const id=Object.keys(inventory()).find(id=>id!=='ebony_wand_dragon_essence'&&inventory()[id]>0);
      if(id){inventory()[id]--;s.defeat.lost[id]=1;}
      if(s.combat?.active)closeEncounter('withdrawn');note('Defeated; recover with an injury and a recorded equipment loss.');
    }else if(s.combat?.active&&s.combat.actors.every(a=>a.hp===0||a.escaped))closeEncounter('cleared');
  };
  const nextActor=()=>{
    const b=s.combat;if(!b?.active)return;
    for(let n=0;n<=b.order.length;n++){
      b.index=(b.index+1)%b.order.length;
      if(b.index===0){b.round++;advance(6);event('round_record',{round:b.round,summary:'Round begins',hp:s.player.hp,cooldowns:clone(s.player.cooldowns),strain:s.player.strain,actors:clone(b.actors)},refs());}
      const id=b.order[b.index];if(id==='player'){
        s.turn++;s.player.reaction=true;b.action=true;b.movement=s.player.movement_m;
        s.player.conditions=s.player.conditions.filter(x=>x.expires_turn==null||x.expires_turn>s.turn);
        return;
      }
      const a=b.actors.find(x=>x.id===id);if(a.hp>0&&!a.escaped)return;
    }
  };
  const skillBonus=()=>s.player.saves.wis-(s.player.strain>=6?2:0)-(has(s.player,'injured')?1:0);
  const applyDeclaration=(p,success)=>{
    if(success){
      if(p.effect==='objective'){check(s.combat?.active,'objective requires encounter');s.combat.progress++;if(s.combat.progress>=s.combat.required)closeEncounter('cleared');}
      else if(p.effect==='unlock_loot'){check(p.node_id&&c.pois[s.location].loot_nodes.some(n=>n.id===p.node_id),'invalid loot node');s.unlocks.push(`${s.location}:${p.node_id}`);}
      else if(p.effect==='discover'){check(c.pois[p.poi_id],'unknown destination');if(!s.discovered.includes(p.poi_id))s.discovered.push(p.poi_id);}
      else if(p.effect==='damage')hurt(target(p.target_id),damageDice(p.damage));
      else if(p.effect==='condition')target(p.target_id).conditions.push({id:p.condition,expires_turn:s.turn+2,combat_only:true});
      else check(p.effect==='narrative','unknown declared effect');
    }else if(p.risk_damage)hurt(s.player,damageDice(p.risk_damage));
    note(`${p.intent}: ${success?'success':'failure'}.`,{declaration_id:p.id,effect:p.effect});
  };
  check(!s.defeat||cmd.type==='recover'||cmd.type==='declare','recover before taking further actions');
  switch(cmd.type){
    case 'travel': {
      check(!s.combat?.active,'escape combat before travel');const p=c.pois[cmd.poi_id];check(p,'unknown destination');
      const r=c.world.routes.find(r=>[r.a,r.b].includes(s.location)&&[r.a,r.b].includes(p.id)&&p.id!==s.location);
      check(r&&!r.blocked,'no open route; declare an off-road route first');advance(r.minutes*60);s.location=p.id;s.scene++;
      if(!s.discovered.includes(p.id))s.discovered.push(p.id);s.player.position=[0,0];s.combat=null;
      event('poi_visit',{poi_id:p.id});note('Arrived: '+p.name);break;
    }
    case 'discover': {
      check(!s.combat?.active,'survey outside combat');advance(60);
      for(const r of c.world.routes)if([r.a,r.b].includes(s.location))for(const id of [r.a,r.b])if(!s.discovered.includes(id))s.discovered.push(id);
      note('Surveyed visible connections.');break;
    }
    case 'prepare': {
      check(Array.isArray(cmd.spells)&&cmd.spells.length<=4&&new Set(cmd.spells).size===cmd.spells.length,'at most four distinct spells');
      for(const id of cmd.spells)check(c.spells[id]&&s.player.known[id]&&id!=='basic_cast','unknown preparation');
      if(s.combat?.active){check(cmd.spells.filter(x=>!s.player.prepared.includes(x)).length<=1,'swap one spell per action');action();}else advance(60);
      s.player.prepared=[...cmd.spells];note('Prepared spells changed; recovery retained.');break;
    }
    case 'encounter': {
      check(!s.combat?.active,'encounter already active');check(!s.cleared.includes(s.location),'site resolved; use a recorded world transition for new occupants');
      const poi=c.pois[s.location],t=c.templates[cmd.template_id];check(t&&poi.encounter_pool.includes(t.id),'template not available here');s.scene++;
      const prior=Object.values(s.encounter_states).find(b=>b.poi_id===s.location&&!b.retired&&['escaped','withdrawn'].includes(s.world.entities[b.id]?.state));
      check(!prior||prior.template_id===t.id,'resume the unresolved local encounter before choosing another template');
      const id=prior?.id||'ENC_'+cmd.id;
      if(prior)event('entity_state',{entity_id:id,from:s.world.entities[id].state,to:'active'});
      else event('encounter_create',{instance_id:id,template_id:t.id,poi_id:s.location});
      const actors=prior?clone(prior.actors):t.actors.flatMap(([kind,n])=>Array.from({length:n},(_,i)=>{const a=c.enemies[kind];return {...clone(a),archetype:kind,id:`${kind}_${i}`,max_hp:a.hp,position:[6+i*1.5,kind.length%3*3],conditions:[],escaped:false,special_ready:1};}));
      const initiatives=[{id:'player',value:d20('player initiative')+2},...actors.map(a=>({id:a.id,value:d20(a.id+' initiative')+a.saves.dex}))];
      initiatives.sort((a,b)=>b.value-a.value||a.id.localeCompare(b.id));
      s.combat={id,poi_id:s.location,template_id:t.id,active:true,actors,order:initiatives.map(x=>x.id).filter(id=>id==='player'||actors.some(a=>a.id===id&&a.hp>0&&!a.escaped)),initiatives,index:0,round:1,action:true,movement:s.player.movement_m,pending:null,progress:0,required:t.objective_steps};
      s.player.reaction=true;s.player.position=[0,0];if(s.combat.order[0]==='player')s.turn++;
      note('Encounter started: '+t.name,{initiatives});break;
    }
    case 'cast': {
      const sp=c.spells[cmd.spell_id];check(sp&&s.player.known[sp.id],'spell not learned');
      const tier=cmd.tier??1;check(integer(tier,1,s.player.known[sp.id]),'tier not learned');check(sp.action==='action','use reaction for this spell');
      check(s.player.has_wand&&!has(s.player,'disarmed')&&!has(s.player,'silenced'),'cannot perform spell');
      if(s.combat?.active){ownTurn();check(s.combat.action,'action already spent');check(sp.id==='basic_cast'||s.player.prepared.includes(sp.id),'spell not prepared');}
      const card=sp.tiers[tier-1],recover=s.player.cooldowns[sp.id]||0,forced=s.time<recover;
      check(!forced||cmd.force===true,'spell recovering: use Basic Cast or explicitly force with backlash risk');
      let a=null;if(['attack','save'].includes(sp.category)){check(s.combat?.active,'combat target required');a=target(cmd.target_id);check(a.id!=='player'&&distance(s.player,a)<=card.range_m,'target out of range');}
      action();
      // Recovery deadline uses monotonic world time, never encounter-local round numbers.
      s.player.cooldowns[sp.id]=s.time+sp.cooldown*6+6;
      s.player.strain=clamp(s.player.strain+card.strain+(forced?2:0),0,12);
      if(forced||s.player.strain>=6){const dc=10+(forced?2:0)+s.player.strain;const n=d20('overcast control')+s.player.saves.wis;note(`Control ${n} vs ${dc}.`);if(n<dc){hurt(s.player,1);note('Backlash: wand flicks into your fingers; spell fizzles.');break;}}
      if(sp.category==='utility'){note(`${sp.name} tier ${tier}: ${card.range_m} m utility effect; discoveries require a declared ruling.`);break;}
      let hit=true,crit=false;
      if(sp.category==='attack'){
        const adv=has(a,'airborne_advantage')?1:0;const n=d20('spell attack',adv);crit=n===20;hit=n!==1&&(crit||n+s.player.attack-(s.player.strain>=6?2:0)>=a.ac);
        if(adv)a.conditions=a.conditions.filter(x=>x.id!=='airborne_advantage');
        note(`Attack ${n}+${s.player.attack}: ${hit?'hit':'miss'}.`);
      }else {const save=d20('target '+card.save+' save')+(a.saves[card.save]||0);hit=save<s.player.dc;note(`Target save ${save} vs ${s.player.dc}.`);}
      if(card.damage){let n=damageDice(card.damage,crit);if(!hit)n=sp.category==='save'?Math.floor(n/2):0;hurt(a,n);note(`Damage ${n}.`);}
      if(hit&&card.condition){if(sp.id==='levioso'){breakConcentration();s.player.concentration=sp.id;}
        a.conditions.push({id:card.condition,source:sp.id,expires_turn:s.turn+card.duration_turns,combat_only:true});
        if(sp.id==='levioso')a.conditions.push({id:'airborne_advantage',source:sp.id,expires_turn:s.turn+card.duration_turns,combat_only:true});
      }
      if(hit&&sp.id==='accio'){
        const d=distance(a,s.player),move=Math.min(6+(tier-1)*1.5,Math.max(0,d-1.5));
        if(d) a.position=a.position.map((v,i)=>v+(s.player.position[i]-v)*move/d);
        note(`Pulled ${move.toFixed(1)} m on the clear arena floor.`);
      }
      note('Spell resolved.',{spell_id:sp.id,tier,ready_at:s.player.cooldowns[sp.id],strain:s.player.strain});break;
    }
    case 'move': {
      ownTurn();check(!has(s.player,'restrained')&&!has(s.player,'airborne'),'movement blocked');
      check(Array.isArray(cmd.position)&&cmd.position.length===2&&cmd.position.every(v=>Number.isFinite(v)&&Math.abs(v)<=60),'invalid arena position');
      const d=Math.hypot(...cmd.position.map((v,i)=>v-s.player.position[i]));check(d<=s.combat.movement,'movement budget exceeded');
      s.combat.movement-=d;s.player.position=clone(cmd.position);note('Moved on the clear arena floor.');break;
    }
    case 'dash': ownTurn();action();check(!has(s.player,'restrained'),'movement blocked');s.combat.movement+=s.player.movement_m;note('Dashed.');break;
    case 'end_turn': {
      ownTurn();for(const a of s.combat.actors)a.conditions=a.conditions.filter(x=>x.expires_turn==null||x.expires_turn>s.turn);
      if(s.player.concentration&&!s.combat.actors.some(a=>a.conditions.some(x=>x.source===s.player.concentration)))s.player.concentration=null;
      note('Player turn ended.',{hp:s.player.hp,cooldowns:clone(s.player.cooldowns),strain:s.player.strain});nextActor();break;
    }
    case 'enemy_prepare': {
      const b=s.combat;check(b?.active&&!b.pending&&b.order[b.index]!=='player','no enemy turn');
      const a=target(b.order[b.index]);
      if(a.hp<=a.max_hp/4&&['poachers','village_thief'].includes(a.faction)){a.escaped=true;note(a.id+' fled and remains a possible witness.',{witness:a.id,faction:a.faction});nextActor();break;}
      if(has(a,'disarmed')){a.conditions=a.conditions.filter(x=>x.id!=='disarmed');note(a.id+' retrieves its wand; action spent.');nextActor();break;}
      if(!has(a,'airborne')&&!has(a,'restrained')){
        const d=distance(a,s.player),move=Math.min(a.movement_m,Math.max(0,d-a.range_m));if(d)a.position=a.position.map((v,i)=>v+(s.player.position[i]-v)*move/d);
      }
      if(distance(a,s.player)>a.range_m){note(a.id+' cannot reach attack range.');nextActor();break;}
      const special=a.special.condition&&b.round>=a.special_ready;
      b.pending={actor_id:a.id,kind:special?'save':'attack',blockable:a.blockable,dc:a.special.dc,save:a.special.save,condition:a.special.condition};
      note(`${a.id} telegraphs ${special?'control effect':a.blockable?'blockable attack':'unblockable attack'}. Choose defence before dice.`);break;
    }
    case 'react': {
      const b=s.combat,th=b?.pending;check(b?.active&&th,'no pending threat');const a=target(th.actor_id),def=cmd.defence||'none';
      check(['none','protego','dodge'].includes(def),'invalid defence');
      if(def!=='none')check(s.player.reaction,'reaction already spent');
      if(def==='protego')check(th.kind==='attack'&&th.blockable&&s.player.known.protego&&s.player.prepared.includes('protego')&&s.player.has_wand&&!has(s.player,'disarmed')&&!has(s.player,'silenced'),'Protego unavailable');
      if(def==='dodge')check(!has(s.player,'restrained')&&!has(s.player,'airborne'),'cannot dodge while immobilized');
      if(def!=='none')s.player.reaction=false;
      let defenceBonus=3;
      if(def==='protego'){
        const tier=cmd.tier??1;check(integer(tier,1,s.player.known.protego),'defence tier not learned');
        s.player.strain=clamp(s.player.strain+tier-1,0,12);defenceBonus+=tier-1;
      }
      if(def==='dodge'&&cmd.position){
        check(Array.isArray(cmd.position)&&cmd.position.length===2&&cmd.position.every(Number.isFinite),'invalid dodge position');
        check(Math.hypot(...cmd.position.map((x,i)=>x-s.player.position[i]))<=1.5,'dodge beyond 1.5m');s.player.position=clone(cmd.position);
      }
      if(th.kind==='save'){
        const n=d20('player '+th.save+' save',def==='dodge'&&th.save==='dex'?1:0)+(s.player.saves[th.save]||0);
        if(n<th.dc)s.player.conditions.push({id:th.condition,expires_turn:s.turn+2,combat_only:true});
        a.special_ready=b.round+a.special.cooldown+1;note(`Save ${n} vs ${th.dc}.`);
      }else {
        const n=d20('enemy attack'),ac=s.player.ac+(def==='none'?0:defenceBonus);const hit=n!==1&&(n===20||n+a.attack>=ac);
        const dmg=hit?damageDice(a.damage,n===20):0;hurt(s.player,dmg);note(`${a.id}: ${hit?'hit':'miss'}, ${dmg} damage; ${def}.`);
      }
      b.pending=null;nextActor();break;
    }
    case 'escape': {
      ownTurn();action();const n=d20('escape')+s.player.saves.dex,dc=c.templates[s.combat.template_id].dc;
      note(`Escape ${n} vs ${dc}.`);if(n>=dc)closeEncounter('escaped');break;
    }
    case 'struggle': {
      ownTurn();action();const n=d20('break restraint')+s.player.saves.str;if(n>=12)s.player.conditions=s.player.conditions.filter(x=>!['restrained','prone'].includes(x.id));note(`Break free ${n} vs 12.`);break;
    }
    case 'objective': {
      ownTurn();check(typeof cmd.approach==='string'&&cmd.approach.trim(),'describe your approach');action();
      const t=c.templates[s.combat.template_id],n=d20('objective')+skillBonus();
      if(n>=t.dc){s.combat.progress++;note(`Objective ${s.combat.progress}/${s.combat.required}: ${cmd.approach}`);if(s.combat.progress>=s.combat.required)closeEncounter('cleared');}
      else {hurt(s.player,damageDice(t.hazard_damage));note('Objective failed; exposed to terrain hazard.');}break;
    }
    case 'access_loot': {
      check(!s.combat?.active,'secure or bypass the encounter before looting');
      const node=c.pois[s.location].loot_nodes.find(n=>n.id===cmd.node_id);check(node,'unknown loot node');
      const key=s.location+':'+node.id;check(!s.unlocks.includes(key),'node already accessible');
      const n=d20('loot access')+skillBonus();advance(60);
      if(n>=c.poiRules[s.location].access_dc)s.unlocks.push(key);else {hurt(s.player,1);note('Access failed: minor scrape, one minute spent.');}
      note(`Access ${n} vs ${c.poiRules[s.location].access_dc}: ${node.access}`);break;
    }
    case 'loot': {
      check(!s.combat?.active,'cannot collect during combat');const node=c.pois[s.location].loot_nodes.find(n=>n.id===cmd.node_id);check(node,'unknown node');
      check(s.unlocks.includes(s.location+':'+node.id),'node not accessible');check(!s.world.entities[s.location].collected.includes(node.id),'loot already collected');
      const table=c.tables[node.table],count=table.rolls==='1'?1:roll(2,'loot count'),items=[];
      for(let i=0;i<count;i++){let pick=roll(table.entries.reduce((n,e)=>n+e[1],0),'loot table');for(const [id,w] of table.entries){pick-=w;if(pick<=0){items.push({id,quantity:1});break;}}}
      event('loot_collect',{poi_id:s.location,node_id:node.id,items});reward('loot:'+s.location);note('Collected loot.',{items});break;
    }
    case 'rest': {
      check(!s.combat?.active,'cannot rest in combat');check(c.poiRules[s.location].safe_rest,'not a designated safe rest location');
      check(['short','long'].includes(cmd.kind),'rest kind required');advance(cmd.kind==='long'?28800:600);
      s.player.strain=Math.max(0,s.player.strain-(cmd.kind==='long'?12:3));s.player.hp=Math.min(s.player.max_hp,s.player.hp+(cmd.kind==='long'?s.player.max_hp:4));
      if(cmd.kind==='long')s.player.conditions=s.player.conditions.filter(x=>x.id!=='injured');note(cmd.kind+' rest completed.');break;
    }
    case 'recover': {
      check(s.defeat,'not defeated');const destination=cmd.poi_id;check(c.poiRules[destination]?.safe_rest&&s.discovered.includes(destination),'recovery requires a known safe location');
      const loss=clone(s.defeat);advance(3600);s.location=destination;s.combat=null;s.player.hp=1;s.player.conditions=[{id:'injured'}];s.player.strain=Math.max(6,s.player.strain);s.defeat=null;
      event('poi_visit',{poi_id:destination});note('Recovered at a known safe place. Injury and lost equipment remain recorded.',{loss});break;
    }
    case 'craft': {
      check(!s.combat?.active,'craft outside combat');const r=c.recipes[cmd.recipe_id];check(r,'unknown recipe');
      for(const [id,n] of Object.entries(r.inputs))check((inventory()[id]||0)>=n,'missing ingredient '+id);
      for(const [id,n] of Object.entries(r.inputs))inventory()[id]-=n;for(const [id,n] of Object.entries(r.output))inventory()[id]=(inventory()[id]||0)+n;
      advance(r.minutes*60);note('Crafted '+r.id);break;
    }
    case 'equip': {
      check(!s.combat?.active,'equip outside combat');const item=c.items[cmd.item_id];check(item?.slot&&(inventory()[item.id]||0)>0,'item not equippable or not owned');s.equipment[item.slot]=item.id;advance(60);note('Equipped '+item.name);break;
    }
    case 'socket': {
      check(!s.combat?.active,'fit outside combat');const component=c.items[cmd.component_id],item=c.items[cmd.item_id];
      check(component?.socket_tags&&item?.slot&&(inventory()[component.id]||0)>0&&(inventory()[item.id]||0)>0,'missing component or host');
      const tags=new Set([item.slot,...item.tags,'gear',...(item.slot==='tool'?['tool']:[])]);check(component.socket_tags.some(x=>tags.has(x)),'incompatible component');
      check(!s.sockets[item.id],'host already fitted');inventory()[component.id]--;s.sockets[item.id]=component.id;advance(600);note('Fitted component; its declared property is now available.');break;
    }
    case 'declare': {
      const p=clone(cmd.proposal);check(p&&typeof p.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(p.id)&&!s.proposals[p.id],'unique declaration required');
      check(typeof p.intent==='string'&&p.intent.trim()&&typeof p.risk==='string'&&p.risk.trim(),'intent and risk required before rolling');
      check(integer(p.dc,0,30)&&integer(p.strain??0,0,4),'invalid declaration cost/DC');
      check(['narrative','objective','unlock_loot','discover','damage','condition','offroad'].includes(p.effect),'unsupported declaration effect');
      if(p.effect==='damage')check(['1d4','1d6','2d6'].includes(p.damage),'damage outside audit envelope');
      if(p.effect==='condition')check(['restrained','prone','disarmed'].includes(p.condition),'unsupported condition');
      if(p.risk_damage)check(['1d4','1d6','2d6'].includes(p.risk_damage),'invalid risk damage');
      if(p.item_id)check(c.items[p.item_id],'unknown item');
      s.proposals[p.id]={...p,location:s.location,encounter:s.combat?.active?s.combat.id:null,used:false};note('Ruling declared before resolution.',{declaration:p});break;
    }
    case 'experiment': case 'use_item': {
      const p=s.proposals[cmd.proposal_id];check(p&&!p.used&&p.location===s.location&&p.encounter===(s.combat?.active?s.combat.id:null),'missing, used, or stale declaration');
      if(cmd.type==='experiment')check(!p.item_id,'item declaration requires use_item');
      if(cmd.type==='use_item'){
        const item=c.items[p.item_id];check(item&&(inventory()[item.id]||0)>0&&item.resolution!=='ingredient','item unavailable');
        const bucket=item.limit==='day'?Math.floor(s.time/86400):item.limit==='scene'?s.scene:null,key=item.id+':'+bucket;
        check(bucket===null||!s.item_uses[key],'item use exhausted');
        if(item.charges){s.item_charges[item.id]??=item.charges;check(s.item_charges[item.id]>0,'no charges');s.item_charges[item.id]--;}
        if(item.consume)inventory()[item.id]--;if(bucket!==null)s.item_uses[key]=true;
      }
      action();s.player.strain=clamp(s.player.strain+(p.strain||0),0,12);const success=d20('declared check')+skillBonus()>=p.dc;p.used=true;
      if(p.effect==='offroad'){
        check(!s.combat?.active&&c.pois[p.poi_id]&&integer(p.minutes,1,1440),'invalid offroad ruling');
        if(success){advance(p.minutes*60);s.location=p.poi_id;s.scene++;if(!s.discovered.includes(p.poi_id))s.discovered.push(p.poi_id);event('poi_visit',{poi_id:p.poi_id});}else if(p.risk_damage)hurt(s.player,damageDice(p.risk_damage));
        note('Off-road check '+(success?'succeeded':'failed'));
      }else applyDeclaration(p,success);break;
    }
    case 'clock': {
      check(typeof cmd.clock_id==='string'&&/^[A-Za-z0-9_-]+$/.test(cmd.clock_id)&&!s.clocks[cmd.clock_id],'unique clock required');
      const cause=s.world.events.find(e=>e.id===cmd.cause_event_id);
      check(cause&&cause.entities.includes(cmd.poi_id)&&typeof cmd.evidence==='string'&&cmd.evidence.trim(),'recorded local cause and explicit evidence required');
      check(integer(cmd.hours,1,720),'invalid delay');s.clocks[cmd.clock_id]={id:cmd.clock_id,cause_event_id:cause.id,evidence:cmd.evidence,poi_id:cmd.poi_id,due:s.time+cmd.hours*3600,triggered:false,resolved:false};
      event('clock_create',{clock_id:cmd.clock_id,cause_event_id:cause.id,segments:4},[cmd.poi_id,'LOC-'+cmd.poi_id]);note('Consequence scheduled from a recorded cause.');break;
    }
    case 'world_transition': {
      const clock=s.clocks[cmd.clock_id];check(clock?.triggered&&!clock.resolved,'consequence not due');const p=s.world.entities[clock.poi_id];
      check(c.pois[clock.poi_id].states.includes(cmd.state),'invalid world state');
      check(!s.combat?.active||s.location!==clock.poi_id,'cannot replace occupants during an active encounter');
      event('entity_state',{entity_id:clock.poi_id,from:p.state,to:cmd.state});clock.resolved=true;
      for(const b of Object.values(s.encounter_states))if(b.poi_id===clock.poi_id)b.retired=true;s.cleared=s.cleared.filter(x=>x!==clock.poi_id);
      note('World transition recorded; old loot stays depleted.',{clock_id:clock.id});break;
    }
    case 'learn_tier': {
      check(!s.combat?.active&&c.poiRules[s.location].safe_rest,'train at a safe place');const id=cmd.spell_id,old=s.player.known[id];check(old&&old<3,'spell cannot advance');
      const cost=old===1?3:6;check(s.progress>=cost,'not enough progress');s.progress-=cost;s.player.known[id]++;advance(3600);note('Tier training completed: '+id);break;
    }
    default: throw Error('unknown command '+cmd.type);
  }
  finishIfNeeded();sync();
  if(dice)check(dice.length===0,`unused supplied dice (${dice.length}); submit exactly the required rolls`);
  if(events.length===0)note('Command completed.');
  event('world_note',{request:clone(cmd),result:clone(details),dice:clone(s.rolls.filter(x=>x.command_id===cmd.id))},refs());
  s.world=transact(s.world,events,s.world.revision);
  s.revision++;s.last_result={command_id:cmd.id,type:cmd.type,details,rolls:s.rolls.filter(x=>x.command_id===cmd.id),supplied_dice:usedDice};
  return validateGame(s,c);
}
export function playerView(s,c) {
  const current=c.pois[s.location],active=s.combat?.active;
  const discovered=s.discovered.map(id=>({id,name:c.pois[id].name,pin:c.pois[id].pin,region:c.pois[id].region,visited:s.world.entities[id].visits>0}));
  return {revision:s.revision,mode:s.mode,ruleset:s.ruleset,time:s.time,player:clone(s.player),location:{id:current.id,name:current.name,cue:current.visible_cue,terrain:current.terrain},
    discovered,routes:c.world.routes.filter(r=>s.discovered.includes(r.a)&&s.discovered.includes(r.b)),
    combat:active?{id:s.combat.id,round:s.combat.round,turn:s.combat.order[s.combat.index],action:s.combat.action,movement:s.combat.movement,pending:s.combat.pending,progress:s.combat.progress,required:s.combat.required,
      actors:s.combat.actors.map(a=>({id:a.id,hp:a.hp,max_hp:a.max_hp,position:a.position,conditions:a.conditions,escaped:a.escaped}))}:null,
    encounters:active||s.cleared.includes(s.location)?[]:current.encounter_pool.map(id=>({id,name:c.templates[id].name,objective:c.templates[id].objective,danger:c.templates[id].danger})),
    loot:active?[]:current.loot_nodes.map(n=>({id:n.id,access:n.access,collected:s.world.entities[s.location].collected.includes(n.id),unlocked:s.unlocks.includes(s.location+':'+n.id)})),
    inventory:Object.entries(s.world.campaign.player.inventory).filter(([,n])=>n>0).map(([id,quantity])=>({id,quantity,...(c.items[id]||{name:id})})),
    spells:Object.keys(s.player.known).map(id=>c.spells[id]),defeat:s.defeat,progress:s.progress,
    safe_rest:c.poiRules[s.location].safe_rest,last_result:s.last_result,recipes:Object.values(c.recipes),
    log:s.world.events.filter(e=>e.type==='world_note'&&e.summary&&!e.clock_id&&!e.declaration).slice(-20).map(e=>({id:e.id,time:e.game_time,text:e.summary}))};
}
