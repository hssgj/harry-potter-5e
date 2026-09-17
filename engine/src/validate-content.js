import {readFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const pack=resolve(dirname(fileURLToPath(import.meta.url)),"../content/highlands-sandbox-v0.1");
const read=async p=>JSON.parse(await readFile(resolve(pack,p),"utf8"));
const unique=(xs,label)=>{if(new Set(xs).size!==xs.length)throw new Error(`duplicate ${label}`);};
const manifest=await read("manifest.json");
const pois=(await read(manifest.files.pois)).pois;
const map=await read(manifest.files.map);
const encounters=(await read(manifest.files.encounters)).templates;
const tables=(await read(manifest.files.loot_tables)).tables;
const catalogs=await Promise.all(["gear","consumables","ingredients","components_curios"].map(k=>read(manifest.files[k])));
const items=catalogs.flatMap(x=>x.items);

if(pois.length!==manifest.counts.pois)throw new Error("POI count mismatch");
if(encounters.length!==manifest.counts.encounter_templates)throw new Error("encounter count mismatch");
unique(pois.map(x=>x.id),"POI");unique(encounters.map(x=>x.id),"encounter");
unique(tables.map(x=>x.id),"loot table");unique(items.map(x=>x.id),"item");
unique(pois.map(x=>x.pin.join(",")),"map pin");

const poiIds=new Set(pois.map(x=>x.id)),encounterIds=new Set(encounters.map(x=>x.id));
const tableIds=new Set(tables.map(x=>x.id)),itemIds=new Set(items.map(x=>x.id));
for(const p of pois){
  if(!Array.isArray(p.pin)||p.pin.length!==2||p.pin.some(n=>n<0||n>1000))throw new Error(`bad pin ${p.id}`);
  if(!p.spell_affordances?.length||!p.loot_nodes?.length||!p.states?.length)throw new Error(`non-playable POI ${p.id}`);
  for(const id of p.encounter_pool)if(!encounterIds.has(id))throw new Error(`${p.id} unknown encounter ${id}`);
  for(const n of p.loot_nodes)if(!tableIds.has(n.table))throw new Error(`${p.id} unknown table ${n.table}`);
}
for(const [a,b] of map.edges)if(!poiIds.has(a)||!poiIds.has(b)||a===b)throw new Error(`bad edge ${a}-${b}`);
for(const t of tables)for(const [id,w] of t.entries)if(!itemIds.has(id)||w<1)throw new Error(`bad loot ${t.id}:${id}`);
if(new Set(pois.map(x=>x.region)).size!==manifest.counts.regions)throw new Error("region count mismatch");
console.log(`valid content pack: ${pois.length} POIs, ${encounters.length} encounters, ${items.length} items, ${map.edges.length} routes`);
