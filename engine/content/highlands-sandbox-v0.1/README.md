# Highlands Sandbox v0.1

A self-contained, story-light exploration pack for HP5e. Its purpose is simple:
leave the castle, cast spells, fight, experiment, collect useful things, return.

## Contents

- 40 persistent POIs across five regions
- normalized map pins (0..1000, origin north-west)
- 20 reusable encounter templates
- interactive terrain at every POI
- tagged loot tables and four separate item catalogs
- persistent local states without a prescribed main quest

The catalogs are separate for authoring and UI filters. Runtime still stores one
inventory ledger keyed by item ID; multiple ledgers would drift.

## Loading

Read `manifest.json`, then the files it lists. Player-facing clients must hide
`hidden_cue`, undiscovered loot nodes and GM-only encounter information.

POIs begin `unvisited`. Content is provisional until encountered; the result of
play is then persisted through normal engine events.

## Design constraints

- no required quest giver
- no level gate or invisible wall
- danger is telegraphed in fiction
- each POI has a spell-interaction affordance
- loot is useful, combinable or expressive; nothing is campaign-breaking
- fixed locations can draw changing encounter templates
