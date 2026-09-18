# Audit command contract

Every request: unique safe `id`, current `expected_revision`, `type`. For randomness choose exact `rolls:[...]` or explicitly `dice_mode:"auto"`. Failed requests leave state, dice seed, inventory and history unchanged. Reload on stale revision; never blindly resend with a new revision.

```json
{"id":"turn_001","expected_revision":0,"type":"discover"}
```

## Commands

| Type | Fields / prerequisites |
|---|---|
| `discover` | Outside combat; survey connected POI. |
| `travel` | `poi_id`, open adjacent route; outside combat. |
| `prepare` | `spells` array, <=4 learned distinct IDs; at most one replacement during combat. |
| `encounter` | `template_id` in current POI pool; unresolved site. Initiative dice player first, then template actor order. |
| `cast` | `spell_id`, `tier` (default 1), `target_id` for attack/save, optional `force:true`; your available action. |
| `move` | `position:[x,y]`, your turn, available movement; arena metres. |
| `dash` | Spend action to add 9m movement. |
| `end_turn` | End player's turn; next participant. |
| `enemy_prepare` | Enemy's turn; move, flee, retrieve wand or telegraph a threat. Does not roll its attack. |
| `react` | Pending threat: `defence:"none"/"protego"/"dodge"`, optional Protego `tier`, optional dodge `position`. Rolls resolve after this choice. |
| `struggle` | Spend action, STR DC12 to remove restraint/prone. |
| `escape` | Spend action, DEX vs template DC. |
| `objective` | `approach` text, action/WIS check vs known template DC. |
| `access_loot` | `node_id`; outside combat, access check. |
| `loot` | Accessible `node_id`; resolved weighted draws cannot be client-selected. |
| `rest` | `kind:"short"/"long"`, designated safe site, no combat. |
| `recover` | Defeated; `poi_id` of discovered safe site. |
| `craft` | `recipe_id`, outside combat, owned ingredients. |
| `equip` | Owned `item_id` with slot, outside combat. |
| `socket` | Owned `item_id` + `component_id`, compatible tags, empty host socket. |
| `learn_tier` | `spell_id`; safe training place, enough progress, max tier3. |
| `declare` | Unique `proposal` object fixing intent, DC, risk and bounded effect before dice. GM/operator only by convention. |
| `experiment` | `proposal_id`; resolves a non-item declaration once. |
| `use_item` | `proposal_id` naming owned item; charge/consumption/limit checks. |
| `clock` | `clock_id`, actual `cause_event_id`, `poi_id`, explicit `evidence`, `hours` (1–720). |
| `world_transition` | Due `clock_id` and allowed POI `state`; does not reset loot. |

## Declaration examples

These are examples, not pending canon. Use IDs and targets that exist in your save.

```json
{"id":"rule_bridge","expected_revision":8,"type":"declare","proposal":{"id":"bridge","intent":"Levitate boards into a temporary crossing","risk":"A slipping board causes an impact","dc":13,"strain":1,"risk_damage":"1d4","effect":"objective"}}
```

```json
{"id":"try_bridge","expected_revision":9,"type":"experiment","proposal_id":"bridge","rolls":[16]}
```

The first request is saved before the roll. Declarations expire when location/active encounter changes and cannot be reused. Effect choices: `narrative`, `objective`, `unlock_loot` (`node_id`), `discover` (`poi_id`), `damage` (`target_id`, one of 1d4/1d6/2d6), `condition` (`target_id`, restrained/prone/disarmed), `offroad` (`poi_id`, `minutes`). Item declarations additionally name `item_id`. DM must enforce actual item/spell affordances before submitting: this local engine does not semantically validate prose.

## Logs and replay

One accepted command commits all changes and linked world events. A final ledger record includes the complete request and dice; reducers can replay the sequence from `newGame(content,initial_seed)` with the same content revision. All POI/location/encounter references point into this same log. Round entries contain player HP, strain, cooldown deadlines and enemy snapshots. Histories exported with `game export` are derived views and must not be edited as separate authorities.

Server API: GET `/api/state` returns player projection and local session token. POST `/api/command` requires that token in `X-HP5E-Token`. A player response excludes unseen map nodes, hidden cues, loot tables and clocks. This is single-user localhost software, not an adversarial multi-user permission system.
