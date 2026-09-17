import {StateError,validateState} from "./validate.js";
export function applyEvent(input,e) {
  validateState(input);
  for (const k of ["id","type","reason","source"]) if (!e[k]) throw new StateError(`missing ${k}`);
  if (input.applied_event_ids.includes(e.id)) throw new StateError(`duplicate event ${e.id}`);
  const s=structuredClone(input);
  switch(e.type) {
    case "resource_delta": { const r=s.player.resources[e.resource]; if(!r) throw new StateError("unknown resource"); r.current+=e.delta; break; }
    case "inventory_delta": { const n=(s.player.inventory[e.item]??0)+e.delta; if(n===0) delete s.player.inventory[e.item]; else s.player.inventory[e.item]=n; break; }
    case "clock_delta": { const c=s.world.clocks[e.clock]; if(!c) throw new StateError("unknown clock"); c.value+=e.delta; break; }
    case "move": s.scene.region_id=e.region_id; s.scene.location_id=e.location_id??null; break;
    case "scene_set": s.scene={...s.scene,...e.scene}; break;
    case "combat_start": if(s.combat.active) throw new StateError("combat active"); else s.combat={active:true,round:1,turn:1,reaction_available:true,participants:e.participants??[]}; break;
    case "combat_advance_turn": if(!s.combat.active) throw new StateError("no combat"); else {s.combat.turn++;s.combat.reaction_available=true;if(e.new_round)s.combat.round++;} break;
    case "combat_end": s.combat.active=false; break;
    case "spell_used": { const m=s.player.magic[e.magic_id]; if(!m) throw new StateError("unknown magic"); const t=s.combat.active?s.combat.turn:e.turn; if(!Number.isInteger(t))throw new StateError("turn required"); if(t<(s.player.cooldowns[e.magic_id]??0))throw new StateError("on cooldown"); s.player.cooldowns[e.magic_id]=t+m.cooldown+1;s.scene.used_magic.push({magic_id:e.magic_id,turn:t,event_id:e.id});break; }
    case "magic_status_set": { const m=s.player.magic[e.magic_id]; if(!m)throw new StateError("unknown magic");m.status=e.status;m.truth=e.truth;break; }
    case "condition_add": if(!s.player.conditions.some(x=>x.id===e.condition.id))s.player.conditions.push(e.condition);break;
    case "condition_remove": s.player.conditions=s.player.conditions.filter(x=>x.id!==e.condition_id);break;
    case "note": break;
    default: throw new StateError(`unknown event type ${e.type}`);
  }
  s.revision++;s.applied_event_ids.push(e.id);s.last_event={id:e.id,at:e.at??null};
  return validateState(s);
}
export const applyBatch=(s,events)=>events.reduce(applyEvent,s);
