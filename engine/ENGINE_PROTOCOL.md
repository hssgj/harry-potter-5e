# Engine protocol — audit-v1

1. Select the correct save and ruleset. Live checkpoint data is not the audit playtest.
2. Read the authoritative `game.json` through `readGame`. Load content for the pinned rules version.
3. Read current POI/location and active encounter histories. Never regenerate survivors, loot or witnesses from memory.
4. Validate intention against known/prepared spells, action/movement/reaction budget, range, recovery and strain.
5. For improvisation or narrative item use, commit a `declare` request with scope, DC, cost and known risk before the player roll. Unknown capability is not learned by a good roll.
6. Telegraph enemy action. Choose defence before rolling. Give an unavailable-cast warning and nearest usable alternative; only explicitly requested forced casting risks backlash.
7. Resolve one command using exact supplied dice or explicitly selected auto dice. Commit with the revision that was read. Never discard an intervening write.
8. State, inventory, cooldowns, command/dice ledger and linked histories commit atomically. If save fails, do not narrate it as saved. Reload and reconcile; do not silently reroll.
9. Return the player projection and narrative grounded in the committed result. Do not leak hidden clues/clocks through narration.
10. At checkpoints export derived histories and back up the authoritative save. GitHub and Notion sync are explicit external steps, not background guarantees.

Every command carries source/reason/time provenance. A later consequence must reference an actual earlier event and declared evidence; it must not fabricate a retroactive witness. A new world state preserves depleted loot sources and historical encounter identities.
