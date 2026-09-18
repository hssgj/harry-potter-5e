# Audit rules v1 — proposed overlay, not live canon

The old `CORE_v0.2.md` remains the historical base. This isolated playtest uses the following explicit changes. Figures are authored balancing proposals, not official D&D/Legacy rules.

## Player and turns

Profile: 30 HP, AC12, initiative +2, movement 9m, spell attack +4, spell DC12, saves STR−1 / DEX+2 / CON+1 / WIS+2. Four prepared spells; Basic Cast is a learned at-will exception outside these slots. One action and 9m movement on own turn, one reaction until next own turn. Swapping one spell during combat consumes the action; outside combat a new loadout takes a minute. Swaps never reset recovery. No free additional spell from a combo description.

All seeded and supplied dice are recorded. A manual `rolls` array must exactly match the sequence requested by a command, including target saves and any concentration/control rolls; a missing/invalid/extra die rejects the whole command. `dice_mode: auto` expressly chooses deterministic generated dice for the audit client. Seeded dice are reproducible, not cryptographically random.

Attacks: natural 1 misses; 20 hits and doubles only damage dice. Other attacks use d20+attack versus AC. Saves meet or exceed DC to succeed. Save damage is half rounded down on success; attack misses deal 0. Advantage rolls twice, keeps high; no stacked advantage.

Combat advances six world seconds per completed initiative round. Recovery deadlines use that monotonic time, not encounter-local round counters: use at t => ready at t + 6 × (C+1). C1 skips the next own turn, C2 skips two. Travel and rest also advance the clock. No reset at encounter boundaries. Noncombat spell/action resolution takes six seconds.

## Spell cards

All target spells affect one target. Clear arena paths only; GM rules on obstacles before forcing movement.

| Spell | Tier 1 | Tier 2 | Tier 3 | Recovery |
|---|---|---|---|---|
| Basic Cast | 1d6, 18m | 2d6, 18m | 3d6, 24m | C0 |
| Levioso | CON; 9m; 1 subsequent caster turn | 12m; 2 subsequent turns | 18m; 3 subsequent turns | C2 |
| Accio | STR; range 9m, pull up to 6m | 12m / 7.5m pull | 18m / 9m pull | C1 |
| Incendio | DEX; 2d6, 3m | 3d6, 4.5m | 4d6, 6m | C1 |
| Confringo | attack; 2d8, 18m | 3d8, 24m | 4d8, 30m | C2 |
| Expelliarmus | STR; disarm, 12m; 1 subsequent caster turn | 18m; 2 turns | 24m; 3 turns | C2 |
| Protego | reaction; +3 AC | +4 AC | +5 AC | reaction budget |
| Lumos | light, 6m | 9m | 12m | C0 |
| Revelio | inspection envelope 6m | 9m | 12m | C1 |

Levioso stops target movement, not its action; first following attack has advantage. Effect ends at the end of the indicated subsequent player turn or when concentration breaks. One concentration effect; damage prompts CON save DC max(10, floor(damage/2)); zero HP breaks it automatically. A disarmed enemy spends its next action retrieving the wand. Lumos/Revelio require GM interpretation for environmental discoveries; they do not expose every hidden POI automatically.

Protego works only against a telegraphed blockable attack, chosen before dice. It must be known and prepared. Dodge gives +3 AC against an attack or advantage on one DEX save, requires ability to move, and may move up to 1.5m on the clear arena floor. The two do not stack. Perfect Protego/Stupefy are not part of this nine-card roster. Tiered Protego uses strain but does not require a separate control check in this first proposal.

## Exertion and pushing

Strain 0–12 is a proposed bookkeeping measure, not a canon mana pool. Tier 1 costs 0, tier 2 costs 1, tier 3 costs 2. Forcing an action spell before recovery adds 2 and requires explicit `force:true`. The normal card, Basic Cast and overcast option remain separate choices.

After adding strain, if forced or strain >=6, make control d20+WIS vs 10+strain+(2 if forced). Failure costs the action and recovery, fizzles, and deals 1 backlash HP. At strain >=6, attack rolls and general objective/experiment/access checks suffer −2. Successful strain-heavy magic can still work; no invisible stamina total is invented. A short safe rest removes 3 strain; long safe rest removes all. Audit whether ordinary magic should accumulate more exertion before adopting this model.

## Exploration, objectives, rewards and equipment

Same-region edge: 5 minutes. Cross-region edge: 30 minutes. These are provisional game times; map pins are not measured geography. Off-road movement uses a prior declaration with destination, minutes, DC and risk. Survey spends one minute to expose adjacent map destinations. Encounter entry is explicit, not a random automatic ambush generator.

Each template has DC 10+danger and 2 objective steps at danger <=2, otherwise 3. An objective action uses WIS, with fatigue/injury adjustments. Failure deals 1d4 or 1d6 hazard damage according to the template. Successful required steps can bypass/resolve opposition. Meaningfulness of the stated approach remains GM judgment. Generic objective actions do not automatically spend spells or imitate arbitrary spell damage.

Loot access: DC 10+POI danger, WIS check and one minute; failure 1 HP scrape. Success opens the specific node. Collection rolls its existing weighted table and atomically consumes that node. One inventory ledger, catalogue categories only. Loot rarity is not proof of uniqueness; this pack currently does not declare globally unique items.

First encounter resolution and first collected loot per POI each award 1 progress. Tier 1->2 training costs 3; tier 2->3 costs 6, plus one hour at a designated safe place. Playtest spells start at tier 2 to exercise upcasting immediately. Loot/progress claims never reset on world transition.

Three recipes are concrete component-to-consumable conversions, without an additional crafting failure roll. All ingredients are removed and outputs added in one command. One component per host; compatible host tags required. Consumables are spent even when their declared check fails; charged items spend a charge; scene/day limits are persisted. Item text is a bounded property for GM rulings, not an unrestricted wish. Prices are audit trade units for comparison; no shop system is implemented.

## Defeat and consequences

At zero HP, encounter is withdrawn, one actually carried non-wand item may be lost, and the defeat event records which. Permanent death is not implemented. Recover at a previously known designated safe location: one hour, 1 HP, at least 6 strain and injured (−1 general checks). Recovery transport/capture details are GM narration and require review for campaign use. Long safe rest restores full HP and removes injury; short safe rest gives 4 HP. Only HOG-001 and HSM-002 are designated safe in the initial overlay; these are proposals for audit.

Low-HP living humanoids may flee, leaving an actual event with witness/faction data. Delayed consequences require a recorded cause, local POI reference, explicit GM evidence and delay. Once due, the clock is flagged and a later `world_transition` applies a permitted POI state. This is an evidence-backed scheduling mechanism, not omniscient retaliation AI. A transition never replenishes old loot nodes; new supplies need distinct future nodes/events.
