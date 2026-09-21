# V2 — accepted direction, 2026-09-17

Source: player's nine answers and explicit request to implement persistent logs.

- Timeskip basic tuition; record duration and learned repertoire before activating it. No retroactive rewrite of played scenes. Neither duration nor repertoire is yet selected.
- Competent young wizard, meaningful opposition, no mandatory dummy tutorial.
- Stable spell effects plus declared experiments: announce difficulty, scope and known risk before player rolls.
- Record spell recovery each round. Forcing repeated magic may cause telegraphed strain and backlash. Exact recovery/overcast numbers remain unbalanced design work, not active rules.
- Track exertion through situational logic and dice; no invented mana/stamina totals. The named four-stage fatigue track is a proposal, not an independently approved numeric system.
- Spell strength tiers increase power and exertion/consequences; mastery and chosen casting strength are distinct.
- Defeat can mean injury, capture, equipment loss and mechanical consequences. Permanent death remains unspecified.
- Useful unusual loot can change solutions and subsequent events. No automatic plot overrides.
- Enemies can remember, reinforce and retaliate when evidence and opportunity support it. Never invent a past witness. Late-created clocks record their actual creation and the earlier source event separately.
- Each POI/location/encounter instance has one current state and an append-only history. Revisit from history plus elapsed in-world time; do not respawn collected loot automatically.

Implementation in this revision: persistent entity histories, encounter instances, guarded loot collection, atomic local state+history transactions, clock evidence, versioned export views.
Not implemented by this revision: complete combat adjudication, balanced spell tiers, fatigue rules, enemy statistics, timeskip activation, UI, automatic background GitHub synchronization.

## First integrated audit proposal

`docs/AUDIT_V1.md` and `data/audit-v1/` now implement a separate runnable proposal for combat, numeric spell tiers, exertion, enemy stats, travel, item use/crafting, persistent play and a localhost UI. These proposals are ready for audit, not promoted to played canon. The historical implementation/not-implemented paragraph above describes cc99841 only.
