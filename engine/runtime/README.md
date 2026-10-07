# CURRENT CAMPAIGN IMPORT STATUS — 2026-10-07

The authoritative transaction file is `world.json`, but its campaign currently remains the revision-0 introductory seed. It is not a reconciled save of the sixth-year waterfall encounter. Read `engine/import/CURRENT_CAMPAIGN_RECONCILIATION.md` and root `CURRENT.md` before current-campaign use. Do not interpret historical HP 10/13 or combat inactive as the latest live state.

# Runtime authority after v2 migration

`world.json` is the authoritative transaction document. It contains campaign
snapshot, world entities and the full ordered event journal in one atomic file.
`campaign-state.json` and `events.jsonl` remain legacy migration sources; do not
edit them or use them as the live resume point. Old CLI writes are disabled.

`history/ID.json` is each entity's own readable history and current state. These
are generated views with a revision number, never independent write targets.
POIs and their physical locations have separate IDs and linked event histories.
Every encounter instance is created separately from its reusable template.
No encounter is marked as played merely by authoring its template.

Run `node src/world-cli.js history HOG-001` from engine to read a POI.
Run `node src/world-cli.js apply request.json` to commit a batch shaped as:
`{"expected_revision":0,"events":[...]}`.
Every event requires unique id, type, reason, source and explicit game_time.
Use `poi_visit`, `encounter_create`, `entity_state`, `round_record`, `loot_collect`,
`clock_create`, `world_note`, or a supported `campaign_event` wrapper.
The source field identifies the player turn or rules record supporting a change.
Round records carry a round number and summary; attach encounter, POI and location
IDs in entities when all three histories need that record.

Before revisiting, read histories, elapsed in-world time and supporting events.
Deduction becomes a new dated event; never edit old events or reroll a collected
loot node. Resolve a loot table first, then record actual item IDs and quantities.
New inhabitants do not refill old nodes automatically.

After a successful transaction, export views (`world-cli.js export`). An export
failure does not undo a committed transaction: reload revision and export again,
never resubmit with a new event ID. A stale export is not authoritative.
Interrupted writes can leave world.lock/world.next.json. Stop and inspect before
manual recovery; never auto-delete another writer's lock.

GitHub persistence is a separate action: publish world.json and exported histories
in one non-force commit after verifying the remote parent. These commands alone
do not push or run between chat messages. Private GM data is not a player API.

