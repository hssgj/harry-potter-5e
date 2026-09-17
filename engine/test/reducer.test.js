import test from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {applyEvent} from "../src/reducer.js";
const fixture=async()=>JSON.parse(await readFile(new URL("../runtime/campaign-state.json",import.meta.url)));const base={reason:"test",source:"test"};
test("immutable resource delta",async()=>{const s=await fixture(),n=applyEvent(s,{...base,id:"T1",type:"resource_delta",resource:"hp",delta:-2});assert.equal(n.player.resources.hp.current,8);assert.equal(s.player.resources.hp.current,10);});
test("reject underflow",async()=>{const s=await fixture();assert.throws(()=>applyEvent(s,{...base,id:"T2",type:"resource_delta",resource:"hp",delta:-99}),/outside/);});
test("reject duplicate",async()=>{const s=await fixture(),e={...base,id:"T3",type:"note"},n=applyEvent(s,e);assert.throws(()=>applyEvent(n,e),/duplicate/);});
test("cooldown formula",async()=>{const s=await fixture();s.combat={active:true,round:1,turn:4,reaction_available:true,participants:[]};const n=applyEvent(s,{...base,id:"T4",type:"spell_used",magic_id:"innate_burst"});assert.equal(n.player.cooldowns.innate_burst,6);});
