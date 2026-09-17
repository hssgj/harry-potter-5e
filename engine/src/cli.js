#!/usr/bin/env node
import {readFile} from "node:fs/promises";
import {commitEvent,loadState} from "./store.js";
const [cmd,arg]=process.argv.slice(2);
if(cmd==="validate") console.log(`valid revision ${(await loadState()).revision}`);
else if(cmd==="status"){const s=await loadState();console.log(JSON.stringify({revision:s.revision,scene:s.scene,resources:s.player.resources,combat:s.combat,clocks:s.world.clocks},null,2));}
else if(cmd==="apply"&&arg){const e=JSON.parse(await readFile(arg,"utf8")),s=await commitEvent(e);console.log(`applied ${e.id}; revision ${s.revision}`);}
else {console.error("usage: cli.js validate|status|apply <event.json>");process.exitCode=2;}
