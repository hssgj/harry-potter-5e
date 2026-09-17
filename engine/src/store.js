import {appendFile,readFile,rename,writeFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {applyEvent} from "./reducer.js";
import {validateState} from "./validate.js";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
export const paths={state:resolve(root,"runtime/campaign-state.json"),events:resolve(root,"runtime/events.jsonl")};
export async function loadState(){return validateState(JSON.parse(await readFile(paths.state,"utf8")));}
export async function commitEvent(e){const next=applyEvent(await loadState(),e),tmp=paths.state+".next";await writeFile(tmp,JSON.stringify(next,null,2)+"\n");await rename(tmp,paths.state);await appendFile(paths.events,JSON.stringify(e)+"\n");return next;}
