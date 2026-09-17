import {appendFile,readFile,rename,writeFile,access} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {applyEvent} from "./reducer.js";
import {validateState} from "./validate.js";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
export const paths={state:resolve(root,"runtime/campaign-state.json"),events:resolve(root,"runtime/events.jsonl")};
async function migrated(){try{await access(resolve(root,'runtime/world.json'));return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export async function loadState(){if(await migrated())return validateState(JSON.parse(await readFile(resolve(root,'runtime/world.json'),'utf8')).campaign);return validateState(JSON.parse(await readFile(paths.state,"utf8")));}
export async function commitEvent(e){throw new Error('Legacy writes disabled. Use world-cli.js apply with expected_revision and events.');}
