import {applyEvent} from './reducer.js';

const idOK = x => typeof x === 'string' && /^[A-Za-z0-9_-]+$/.test(x);
const check = (ok, message) => { if (!ok) throw new Error(message); };
export function createWorld(campaign, pois, templates, itemIds) {
  return {version:1, revision:0, campaign, events:[], item_ids:itemIds,
    template_ids:templates.map(t=>t.id), entities:Object.fromEntries(pois.flatMap(p=>[
      [p.id,{kind:'poi', state:'unvisited', allowed_states:p.states, location_id:'LOC-'+p.id,
        loot_nodes:p.loot_nodes.map(n=>n.id), collected:[], visits:0, log:[]}],
      ['LOC-'+p.id,{kind:'location', poi_id:p.id, state:'unvisited', log:[]}]
    ]))};
}
export function transact(input, batch, expectedRevision) {
  check(expectedRevision === input.revision, 'stale revision; reload before resolving');
  check(Array.isArray(batch) && batch.length > 0, 'empty transaction');
  const db=structuredClone(input);
  for (const e of batch) {
    check(idOK(e.id) && typeof e.reason==='string' && e.reason.trim() && typeof e.source==='string' && e.source.trim(), 'event identity, reason and source required');
    check(typeof e.game_time==='string' && e.game_time.trim(), 'explicit in-world time required (relative time allowed)');
    check(!db.events.some(x=>x.id===e.id), 'duplicate event');
    const refs=[...new Set(e.entities || [])];
    if(e.type==='encounter_create') {
      check(idOK(e.instance_id) && !db.entities[e.instance_id], 'invalid or duplicate encounter instance');
      check(db.template_ids.includes(e.template_id), 'unknown encounter template');
      check(db.entities[e.poi_id]?.kind==='poi', 'unknown encounter POI');
      db.entities[e.instance_id]={kind:'encounter',template_id:e.template_id,poi_id:e.poi_id,state:'active',log:[]};
      refs.push(e.instance_id,e.poi_id,db.entities[e.poi_id].location_id);
    } else if(e.type==='poi_visit') {
      const p=db.entities[e.poi_id]; check(p?.kind==='poi','unknown POI');
      p.visits++; refs.push(e.poi_id,p.location_id);
    } else if(e.type==='entity_state') {
      const ent=db.entities[e.entity_id]; check(ent,'unknown entity');
      check(ent.state===e.from,'stale entity state');
      const states=ent.allowed_states || (ent.kind==='encounter'?['active','escaped','cleared','withdrawn']:null);
      check(typeof e.to==='string' && e.to.trim() && (!states || states.includes(e.to)),'invalid state');
      ent.state=e.to; if(ent.location_id) db.entities[ent.location_id].state=e.to; refs.push(e.entity_id);
      if(ent.poi_id) refs.push(ent.poi_id);
      if(ent.location_id) refs.push(ent.location_id);
    } else if(e.type==='loot_collect') {
      const p=db.entities[e.poi_id]; check(p?.loot_nodes?.includes(e.node_id),'unknown loot node');
      check(!p.collected.includes(e.node_id),'loot node already collected');
      check(Array.isArray(e.items) && e.items.length>0,'record resolved loot before collection');
      for(const item of e.items) {
        check(db.item_ids.includes(item.id) && Number.isInteger(item.quantity) && item.quantity>0,'invalid loot item');
        db.campaign.player.inventory[item.id]=(db.campaign.player.inventory[item.id]||0)+item.quantity;
      }
      p.collected.push(e.node_id); refs.push(e.poi_id,p.location_id);
    } else if(e.type==='clock_create') {
      check(idOK(e.clock_id) && !db.campaign.world.clocks[e.clock_id],'invalid or existing clock');
      check(db.events.some(x=>x.id===e.cause_event_id),'clock requires recorded cause');
      check(Number.isInteger(e.segments) && e.segments>0,'invalid clock size');
      db.campaign.world.clocks[e.clock_id]={value:0,segments:e.segments,cause_event_id:e.cause_event_id,created_event_id:e.id,visibility:'gm'};
    } else if(e.type==='round_record' || e.type==='world_note') {
      check(refs.length>0,'history note requires entity references');
      if(e.type==='round_record') check(Number.isInteger(e.round) && e.round>0 && typeof e.summary==='string','round and summary required');
    } else if(e.type==='campaign_event') {
      check(e.event && ['resource_delta','clock_delta','condition_add','condition_remove','note'].includes(e.event.type),'unsupported campaign mutation in world store');
      db.campaign=applyEvent(db.campaign,{...e.event,id:e.id,reason:e.reason,source:e.source});
    } else throw new Error('unknown world event type');
    for(const ref of new Set(refs)) check(db.entities[ref],'unknown referenced entity '+ref);
    const record={...structuredClone(e),entities:[...new Set(refs)],sequence:db.events.length+1};
    db.events.push(record);
    for(const ref of record.entities) db.entities[ref].log.push(record.id);
  }
  db.revision++;
  return db;
}
export function entityHistory(db,id) {
  check(db.entities[id],'unknown entity');
  return {revision:db.revision,entity:db.entities[id],events:db.events.filter(e=>db.entities[id].log.includes(e.id))};
}
