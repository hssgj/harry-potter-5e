import {readFile} from 'node:fs/promises';
const json=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
export async function loadContent() {
  const [spells,encounters,world,items,profile,pack,tables,legacy]=await Promise.all([
    '../data/audit-v1/spells.json','../data/audit-v1/encounters.json','../data/audit-v1/world-rules.json',
    '../data/audit-v1/items.json','../data/audit-v1/profile.json','../content/highlands-sandbox-v0.1/pois.json',
    '../content/highlands-sandbox-v0.1/loot/tables.json','../runtime/world.json'].map(json));
  const index=xs=>Object.fromEntries(xs.map(x=>[x.id,x]));
  return {spells:index(spells.spells),enemies:index(encounters.enemy_archetypes),templates:index(encounters.templates),
    world,poiRules:index(world.pois),items:index(items.items),recipes:index(items.recipes),profile,pois:index(pack.pois),tables:index(tables.tables),legacy};
}
export function validateContent(c) {
  const check=(x,m)=>{if(!x)throw Error(m);};
  for(const s of Object.values(c.spells)) {
    check(s.tiers.length===3,'three tiers required');
    for(const t of s.tiers)check(Number.isInteger(t.strain)&&t.strain>=0&&t.range_m>=0,'invalid spell tier');
  }
  for(const t of Object.values(c.templates)) for(const [id,n] of t.actors)check(c.enemies[id]&&Number.isInteger(n)&&n>0,'invalid encounter actor');
  for(const p of Object.values(c.pois)) {
    check(c.poiRules[p.id]&&p.states.includes(c.poiRules[p.id].resolved_state),'invalid POI resolution');
    for(const id of p.encounter_pool)check(c.templates[id],'invalid encounter reference');
    for(const n of p.loot_nodes)check(c.tables[n.table],'invalid loot reference');
  }
  for(const r of Object.values(c.recipes))for(const [id,n] of Object.entries({...r.inputs,...r.output}))check(c.items[id]&&Number.isInteger(n)&&n>0,'bad recipe');
  for(const t of Object.values(c.tables))for(const [id,w] of t.entries)check(c.items[id]&&Number.isInteger(w)&&w>0,'bad table');
  const seen=new Set([c.profile.start_poi]);
  while(true){const size=seen.size;for(const r of c.world.routes){check(c.pois[r.a]&&c.pois[r.b]&&r.minutes>0,'bad route');if(seen.has(r.a))seen.add(r.b);if(seen.has(r.b))seen.add(r.a);}if(seen.size===size)break;}
  check(seen.size===Object.keys(c.pois).length,'disconnected map');
  return {pois:seen.size,spells:Object.keys(c.spells).length,enemies:Object.keys(c.enemies).length,encounters:Object.keys(c.templates).length,items:Object.keys(c.items).length};
}
