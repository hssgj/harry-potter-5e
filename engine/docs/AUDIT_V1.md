# HP5E — first integrated audit build

Status: **ready for code/rules audit; not a balanced release and not an activated campaign timeskip.**
Base: `cc9984132b52fb501b14f68871dbcdd392359ded`.

## Run

Requires Node 20+; no npm dependencies, API keys or external services.

```sh
cd engine
npm run audit
npm run play
```

Open `http://127.0.0.1:8787` on the machine running Node. The server binds only to loopback. This is not a deployed website and that address is not accessible from another phone/computer. `HP5E_PORT` changes the port; `HP5E_SAVE_DIR` selects a save directory. By default `engine/playtest-save/game.json` is created on first launch and reused thereafter. Keep/back up that entire save; it is intentionally ignored by git. The server never replaces an existing save with a new one. Stop and restart to resume.

CLI alternative:

```sh
npm run game -- init
npm run game -- status
npm run game -- apply request.json
npm run game -- export
```

Use `init` only if the chosen save does not exist. `export` creates revision-stamped, derived POI/location/encounter histories. The canonical save contains those histories already; no export is required for correctness.

## What is implemented

| Layer | Audit build behavior |
|---|---|
| Content | Existing 40 POI, 50 routes, 20 templates, 12 enemy archetypes and 44 items, with a separate numeric audit overlay. |
| Character | Explicit playtest profile: 21-day proposed timeskip, 30 HP, existing WIS/PB attack +4 and DC12, nine learned spells at tier 2, four prepared slots; Basic Cast outside slots. These are proposals, not changes to the live character. |
| Combat | Initiative, one action, movement budget, one reaction refreshed on own turn, attack/save/damage, crits, control conditions, concentration, spell preparation, tiers, overcasting, enemy intent/defence/resolve phases. |
| Enemies | Concrete HP/AC/attack/damage/saves/ranges; chase into range, basic attacks, restraint/prone specials, recover disarmed wand, flee at low HP for humanoids. Other original narrative tools are explicitly GM-adjudicated. |
| Encounters | Distinct instances, objective progress, victory, escape, defeat; wounded survivors resume after leaving and returning. A resolved place needs a recorded world transition before another encounter. |
| Persistence | One atomic save contains game state, world snapshot, commands, dice and event history. Revision check and lock prevent concurrent overwrite. Deterministic replay verified. |
| Loot | Access check, weighted table resolution, inventory addition and permanently depleted node in the same transaction. |
| Progression | First loot at a location and first encounter resolution award progress. Tier training spends progress at a safe rest location. No unlimited repeat reward. |
| Items | Ownership, equipping, consumable use, charge limits, scene/day limits, compatible sockets and three recipes. Narrative effects use a prior GM declaration. |
| World | Travel time, off-road declarations, discovery, safe rests, causally referenced delayed consequences and explicit world transitions; no automatic chest refill. |
| UI | Map of discovered POI, connected travel, local encounters, combat controls, spellbook/loadout, inventory/crafting, command bench and player journal. |

## What remains human judgment

This is a chat/GM-assisted tabletop engine. It does not interpret arbitrary prose, decide whether a witness actually saw you, or invent physical consequences. `declare` fixes the intended effect, DC, cost and risk before `experiment`/`use_item` resolves dice. Supported mechanical outcomes are objective progress, loot access, discovery, damage, conditions and off-road movement. Narrative-only outcomes remain recorded rulings. Socket properties are available for those rulings; they do not silently add unspecified numerical buffs.

A generic objective action is the runnable fallback for all 20 templates; it is not 20 bespoke puzzle solvers. Arena geometry is a clear coordinate plane with distances. Cover, walls, line of sight, destructible terrain, complex enemy tricks and bespoke puzzles need declared rulings. They must not be presented as automatically simulated.

No background process writes to GitHub/Notion. The local running server stores playtest state on disk. Chat-driven sessions must use the command/store boundary and persist their save deliberately. No hosted UI, account system, multiplayer authorization, Notion sync, AI API integration, image assets, shops, or full economic simulation is included.

## Canon and migration boundary

- `runtime/world.json`, old character sheets and played session files remain untouched.
- `data/audit-v1/profile.json` is an isolated, reproducible playtest proposal.
- `docs/CONTINUITY_RECONCILIATION.md` records what is evidenced and what remains unknown.
- The original reducers/CLIs remain legacy interfaces for the old v1/v2 formats. They do **not** adjudicate this game. Never run them against a v3 save.
- `game.json` is the sole source of truth for a running audit session. Its nested campaign HP/condition/cooldown fields are compatibility projections, updated by the command boundary. Legacy magic/scene metadata inherited in the nested checkpoint is not a v3 gameplay authority; use top-level player/location/combat.
- A deliberate migration/activation event after audit is still required to make this profile the actual campaign. No chronology, HP restoration, mastered spell or hidden revelation was silently promoted.

## Verification performed

`npm run audit` runs the retained legacy tests, new behavior/integration tests, content validation and a disk-backed expedition.

- 35 automated tests pass in the initial audit run.
- Content validation: 40 POI, 50 existing routes, 9 spell cards with 3 tiers, 12 concrete archetypes, 20 encounter templates, 44 items.
- Expedition: 25 commands / 75 events; travel, poacher combat, victory, loot, rest, return, duplicate-loot rejection, disk reload, exact replay, history export. Favorable supplied dice make this a boundary test, **not evidence of balance**.
- HTTP tests: UI asset delivery, state/command roundtrip, session token, cross-origin rejection, no arbitrary repository file serving.
- JS syntax checked. **Browser visual/interaction QA not completed**: no installed Chromium, attempted browser download timed out. Mobile overflow, rendered layout and click-through still need browser verification. `scripts/browser-audit.cjs` provides a repeatable check when Playwright/Chromium is available.

## Audit checklist and known limits

1. **Balance:** play honest dice against a two/three-person group, then a danger-4 encounter. Review 30 HP, low-tier unlimited casting, higher-tier strain, tier 3 costs and the pace of loot/progress.
2. **Canon:** settle exact timeskip/start location and learned roster. Determine post-lesson HP from play or explicitly recover; do not reuse the old 10/13 checkpoint as present-day fact. Resolve Snaek/Snejk naming only with evidence.
3. **Rules:** review manual judgments, generic objective DCs, tiered Protego, control expiry, overcast risk, injuries and recovery travel. Permanent death remains unspecified and is not implemented.
4. **World content:** coordinates/travel times are schematic proposals. One legacy POI uses “Shrieking Shack,” potentially inconsistent with this historical era. Do not silently retcon; rename or explain during canon review. Content was inherited, not fact-checked against a verified map.
5. **UI:** run the browser check, test portrait mobile widths, manual supplied dice in the command bench and resumed sessions. UI defaults to reproducible engine-generated dice and labels rolls in the journal; chat play can supply exact dice arrays.
6. **Adjudication trust:** local single-user GM/operator tool. The command bench can make powerful rulings. This is intentional, not a secure player/GM privilege separation. Do not expose this server publicly as-is.
7. **Storage:** interrupted saves fail closed if a lock/temp file survives. Stop all writers, back up the directory, validate `game.json`, inspect any `game.next.json`, then remove only the stale lock/temp before restarting. Never auto-remove a live writer's lock. Atomic rename/fsync behavior assumes a local filesystem.
8. **Replay:** replay requires this exact content/rules revision and original seed. Future rule migrations need their own versioned replay path. The ledger is append-only through this interface; direct manual file editing is not tamper-proof.
9. **Performance:** full snapshot and ledger are rewritten per command. Fine for this prototype; long campaigns need measured compaction/checkpoints, not premature database duplication.

## File map

- `src/game.js`: pure rules and command validation, projection for player UI.
- `src/game-store.js`: lock, revision check, atomic save and derived history exports.
- `src/game-content.js`: content loader and reference validation.
- `src/game-cli.js` / `src/game-server.js`: CLI and localhost transport.
- `data/audit-v1/`: spell, enemy, item, route and character proposals.
- `ui/`: dependency-free interface.
- `test/game.test.js`: mechanical and persistence regressions.
- `scripts/audit-scenario.js`: full expedition and deterministic replay.
- `docs/RULES_AUDIT_V1.md`: exact playable math and deviations from CORE v0.2.
- `docs/COMMANDS.md`: request contract and operator examples.
