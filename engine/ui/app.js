let state,busy=false;const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn,disabled=false)=>{const b=el('button',text);b.disabled=disabled;b.onclick=fn;return b;};
async function send(command){if(busy)return;busy=true;$('error').textContent='';try{
 const res=await fetch('/api/command',{method:'POST',headers:{'Content-Type':'application/json','X-HP5E-Token':state.token},body:JSON.stringify({id:crypto.randomUUID(),expected_revision:state.revision,dice_mode:'auto',...command})});
 const data=await res.json();if(!res.ok)throw Error(data.error);state=data;render();
}catch(e){$('error').textContent=e.message;await refresh();}finally{busy=false;}}
async function refresh(){const res=await fetch('/api/state');if(!res.ok)throw Error('Save nelze načíst');state=await res.json();render();}
const card=(title,text)=>{const d=el('div',undefined,'card');d.append(el('strong',title));if(text)d.append(el('p',text));return d;};
function render(){
 const s=state,p=s.player,b=s.combat,own=b?.turn==='player'&&!b.pending;
 $('location').textContent=s.location.name;$('cue').textContent=s.location.cue;
 $('stats').replaceChildren(el('div',`HP ${p.hp} / ${p.max_hp}`));const hp=el('progress');hp.max=p.max_hp;hp.value=p.hp;$('stats').append(hp,el('div',`Námaha ${p.strain}/12 · postup ${s.progress}`),el('small',p.conditions.map(x=>x.id).join(' · ')||'Bez zranění'));
 $('time').textContent=`T+ ${Math.floor(s.time/60)} min · save r${s.revision}`;
 $('short-rest').disabled=$('long-rest').disabled=!s.safe_rest||!!b||!!s.defeat;$('survey').disabled=!!b||!!s.defeat;
 const svg=$('map'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();const nodes=Object.fromEntries(s.discovered.map(x=>[x.id,x]));
 for(const r of s.routes){const a=nodes[r.a],b=nodes[r.b],line=document.createElementNS(ns,'line');for(const [key,v] of Object.entries({x1:a.pin[0],y1:a.pin[1],x2:b.pin[0],y2:b.pin[1]}))line.setAttribute(key,v);svg.append(line);}
 for(const n of s.discovered){const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',n.pin[0]);dot.setAttribute('cy',n.pin[1]);dot.setAttribute('r',12);if(n.id===s.location.id)dot.classList.add('current');dot.onclick=()=>send({type:'travel',poi_id:n.id});const title=document.createElementNS(ns,'title');title.textContent=n.name;dot.append(title);svg.append(dot);const text=document.createElementNS(ns,'text');text.setAttribute('x',n.pin[0]+17);text.setAttribute('y',n.pin[1]+6);text.textContent=n.id;svg.append(text);}
 $('routes').replaceChildren();for(const r of s.routes.filter(r=>[r.a,r.b].includes(s.location.id))){const id=r.a===s.location.id?r.b:r.a;$('routes').append(button(`${nodes[id].name} · ${r.minutes} min`,()=>send({type:'travel',poi_id:id}),!!b||!!s.defeat));}
 $('combat').replaceChildren();if(s.defeat){$('combat').append(el('p','Porážka. Výbava a následky jsou zapsané.'));for(const n of s.discovered.filter(x=>['HOG-001','HSM-002'].includes(x.id)))$('combat').append(button('Zotavení: '+n.name,()=>send({type:'recover',poi_id:n.id})));}
 if(b){$('combat').append(el('p',`Kolo ${b.round} · ${b.turn} · cíl ${b.progress}/${b.required}`));for(const a of b.actors){$('combat').append(card(a.id,`${a.hp}/${a.max_hp} HP · [${a.position}] · ${a.escaped?'uprchl':a.conditions.map(x=>x.id).join(', ')}`));}
 if(b.pending){$('combat').append(el('p',`${b.pending.actor_id}: ${b.pending.kind==='save'?'kontrolní efekt':'útok'} ${b.pending.blockable?'':'· neblokovatelný'}`));for(const defence of ['none','protego','dodge'])$('combat').append(button(defence,()=>send({type:'react',defence})));}
 else if(!own)$('combat').append(button('Další záměr nepřítele',()=>send({type:'enemy_prepare'})));
 else{ $('combat').append(button('Ukončit tah',()=>send({type:'end_turn'})),button('Pokus o útěk',()=>send({type:'escape'}),!b.action),button('Vyprostit se',()=>send({type:'struggle'}),!b.action));
 const approach=el('input');approach.placeholder='Jak řešíš cíl encounteru?';$('combat').append(approach,button('Pracovat na cíli',()=>send({type:'objective',approach:approach.value}),!b.action));
 const pos=el('input');pos.placeholder='Pozice x,y (metry)';$('combat').append(pos,button(`Pohyb (${b.movement.toFixed(1)} m)`,()=>send({type:'move',position:pos.value.split(',').map(Number)})));}}
 $('encounters').replaceChildren();for(const e of s.encounters){const d=card(e.name,`${e.objective} · nebezpečí ${e.danger}/4`);d.append(button('Play encounter',()=>send({type:'encounter',template_id:e.id}),!!s.defeat));$('encounters').append(d);}
 $('loot').replaceChildren();for(const n of s.loot){const d=card(n.id,n.access);d.append(button(n.collected?'Vybráno':n.unlocked?'Sebrat':'Zpřístupnit',()=>send({type:n.unlocked?'loot':'access_loot',node_id:n.id}),n.collected||!!s.defeat));$('loot').append(d);}
 $('spells').replaceChildren();$('loadout').replaceChildren();for(const sp of s.spells){
 const ready=p.cooldowns[sp.id]||0,recovering=ready>s.time,prepared=p.prepared.includes(sp.id)||sp.id==='basic_cast';const d=card(sp.name,`${prepared?'Připravené':'Ve spellbooku'} · ${recovering?`zotavení ${ready-s.time}s`:'dostupné'} · C${sp.cooldown}`);
 const tier=el('select');for(let i=1;i<=p.known[sp.id];i++){const o=el('option',`Stupeň ${i} · námaha +${i-1}`);o.value=i;tier.append(o);}d.append(tier);
 if(sp.action!=='reaction'){
 const target=el('select');for(const a of b?.actors.filter(a=>a.hp>0&&!a.escaped)||[]){const o=el('option',a.id);o.value=a.id;target.append(o);}if(['attack','save'].includes(sp.category))d.append(target);
 d.append(button(recovering?'Vynutit ⚡ (+2 námaha, kontrola, výboj)':'Seslat',()=>send({type:'cast',spell_id:sp.id,tier:Number(tier.value),target_id:target.value||undefined,force:recovering}),!!s.defeat||!!b&&(!own||!b.action||!prepared)||!b&&['attack','save'].includes(sp.category)));}
 if(p.known[sp.id]<3)d.append(button('Trénovat další stupeň',()=>send({type:'learn_tier',spell_id:sp.id}),!!b||!s.safe_rest));$('spells').append(d);
 if(sp.id!=='basic_cast'){const label=el('label'),input=el('input');input.type='checkbox';input.value=sp.id;input.checked=p.prepared.includes(sp.id);label.append(input,document.createTextNode(sp.name));$('loadout').append(label);}}
 $('inventory').replaceChildren();for(const item of s.inventory){const d=card(`${item.name} ×${item.quantity}`,item.effect||item.use);if(item.slot)d.append(button('Vybavit',()=>send({type:'equip',item_id:item.id}),!!b));$('inventory').append(d);}
 $('craft').replaceChildren();for(const r of s.recipes)$('craft').append(button('Vyrobit '+r.id,()=>send({type:'craft',recipe_id:r.id}),!!b));
 $('journal').replaceChildren();for(const e of s.log.slice().reverse()){const d=el('div',undefined,'entry');d.append(el('small',e.time),el('span',e.text));$('journal').append(d);}
 if(s.last_result?.rolls.length){const d=el('div',undefined,'entry');d.append(el('small','POSLEDNÍ HODY'),el('span',s.last_result.rolls.map(r=>`${r.label}: d${r.sides}=${r.value}`).join(' · ')));$('journal').prepend(d);}
}
$('survey').onclick=()=>send({type:'discover'});$('short-rest').onclick=()=>send({type:'rest',kind:'short'});$('long-rest').onclick=()=>send({type:'rest',kind:'long'});
$('prepare').onclick=()=>send({type:'prepare',spells:[...$('loadout').querySelectorAll('input:checked')].map(x=>x.value)});
$('send').onclick=()=>{try{send(JSON.parse($('command').value));}catch(e){$('error').textContent=e.message;}};
$('command').value=JSON.stringify({type:'declare',proposal:{id:'first_experiment',intent:'Levitate a plank into a temporary bridge',dc:13,strain:1,risk:'Plank slips; minor impact',risk_damage:'1d4',effect:'narrative'}},null,2);
$('examples').textContent=[{type:'experiment',proposal_id:'first_experiment'},{type:'declare',proposal:{id:'use_owned_item',item_id:'cur_gravity_shy_coin',intent:'Test the visible slope with the coin',dc:10,strain:0,risk:'No useful clue',effect:'narrative'}},{type:'use_item',proposal_id:'use_owned_item'},{type:'cast',spell_id:'basic_cast',tier:1,target_id:'poacher_duellist_0',rolls:[15,4]},{type:'socket',component_id:'cmp_counterweight_core',item_id:'gear_folded_cauldron'}].map(x=>JSON.stringify(x,null,2)).join('\n\n');
refresh().catch(e=>$('error').textContent=e.message);
