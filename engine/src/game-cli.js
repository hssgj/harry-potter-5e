import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadContent,validateContent} from './game-content.js';
import {readGame,initializeGame,commitCommand,exportGameHistories} from './game-store.js';
import {playerView} from './game.js';
const c=await loadContent(),[operation='status',arg]=process.argv.slice(2),dir=resolve(process.env.HP5E_SAVE_DIR||'playtest-save');
try{
 let result;
 if(operation==='init')result=playerView(await initializeGame(dir,c),c);
 else if(operation==='validate')result={content:validateContent(c),save:(await readGame(dir,c)).revision};
 else if(operation==='content')result=validateContent(c);
 else if(operation==='apply')result=playerView(await commitCommand(dir,JSON.parse(await readFile(arg,'utf8')),c),c);
 else if(operation==='export')result=await exportGameHistories(dir,c);
 else if(operation==='status')result=playerView(await readGame(dir,c),c);
 else throw Error('Use init | content | validate | status | apply REQUEST.json | export');
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
