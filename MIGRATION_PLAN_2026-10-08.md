# HP5E — SAFE MIGRATION PLAN — 2026-10-08

Repository: `hssgj/harry-potter-5e`
Read-only precheck baseline: `1d3ccd4edac43af134238bf4d98cef879e8a431e` (main).
Purpose: preserve the bounded migration plan before possible loss of Work access.
Gate: ALLOW / MAINTENANCE / EXECUTION (impact 3), explicitly authorized by the user on 2026-10-08 as a one-time preservation step. Discipline OS was loaded from hssgj/PAE starting at discipline_os/BOOTSTRAP.md. Current focus remains PAE / prototype_v0; no broader priority change is authorized.

This file is a plan and evidence inventory, not a gameplay save or completed source migration. Only this file is authorized for the present write. No AOT/other projects, new mechanics, encounters, canon, campaign reset, duplicate imports, or architecture rebuild.

## Evidence and status vocabulary

- EXISTING: the named artifact is present and read in the repository.
- PARTIAL: usable evidence exists, but the required original record or current state is incomplete.
- MISSING: required material is absent from the inspected repository; this does not prove it is lost everywhere.
- UNKNOWN: existence, provenance, exact values, or mapping cannot be established from inspected evidence.

Precheck read CURRENT.md, HANDOFF.md, PRESERVATION_MANIFEST.json, engine/import/CURRENT_CAMPAIGN_RECONCILIATION.md, the three relevant quest/checkpoint session files below, world/maps/README.md, world/maps/snapshots/troll_route_4_3_14.json, and characters/matthael/CHARACTER_SHEET.md. The complete repository tree showed no existing MIGRATION_PLAN_2026-10-08.md or separately named Narrative/Downed category. Four HTML maps and their JSON snapshots are present. No duplicate migration plan is created.

## A. MAIN CAMP AGAIN

### Rubber Duck Quest — PARTIAL

Evidence: [sessions/RUBBER_DUCK_QUEST.md](sessions/RUBBER_DUCK_QUEST.md), also documented in CURRENT.md and PRESERVATION_MANIFEST.json.

Partial reconstruction already exists. Preserve recorded mechanical rolls, actual player decisions where evidenced, and their consequences without replacing them with invented choices. The recovered cast records Control d20 13, Execution d20 18, Effect d12 11, Strain d6 2. The separate dice audit is explicitly noncanonical.

The complete original player/gameplay log is MISSING from the inspected repository. Existing narrative summaries and aftermath are not automatically a confirmed main gameplay session. Do not apply narrated inventory, location, resource changes, XP, or quest resolution to the unresolved waterfall save. Full player decisions and final mechanical resolution require the original source.

### Undertow Guardian — PARTIAL

Evidence:
- [sessions/WATERFALL_GUARDIAN_CHECKPOINT.md](sessions/WATERFALL_GUARDIAN_CHECKPOINT.md), 2026-09-24.
- [sessions/WATERFALL_GUARDIAN_RECOVERY_2026-09-25.md](sessions/WATERFALL_GUARDIAN_RECOVERY_2026-09-25.md), partial later continuation.
- [engine/import/CURRENT_CAMPAIGN_RECONCILIATION.md](engine/import/CURRENT_CAMPAIGN_RECONCILIATION.md).

Boss remains ACTIVE. Shield arm damaged; floor cracked; crystal retained/contested. No confirmed defeat or final escape. Preserve original rolls and later consequences; do not replay the recovered continuation.

Current HP, maximum HP, accumulated Strain, guardian HP, exact turn/initiative, position, and other precise resources are UNKNOWN. The later continuation records a +4 Strain delta, not the current total. The original checkpoint's positional frame may be stale.

The revision-0 runtime seed (including old HP 10/13 and inactive combat) is not a current mechanical save. A real mechanical source/save and matching event history are required before deliberate runtime reconciliation. No zero/full-rest/seed defaults may fill unknown values.

### HTML map — EXISTING historical snapshots; newer exports UNKNOWN

Evidence: [world/maps/README.md](world/maps/README.md), PRESERVATION_MANIFEST.json, and repository tree.

Four functional historical versions from 2026-09-23 are already preserved:
- world/maps/base_40_poi.html
- world/maps/poi3_cleared.html
- world/maps/forest_edge_route.html
- world/maps/troll_route_4_3_14.html

Each has a corresponding JSON default snapshot under world/maps/snapshots/. These predate waterfall play. Do not import them again. Browser localStorage edits are not captured by source HTML; possible newer browser JSON exports remain UNKNOWN and must be independently verified.

### Character building — PARTIAL

Older sheet and rules are EXISTING: characters/matthael/CHARACTER_SHEET.md, rules/CORE_v0.1.md, rules/CORE_v0.2.md and rules/BUILD_MATH.md (rules existence verified in the tree; not re-audited here).

The read sheet is an introductory Session 001 L1 profile, not proof of the current sixth-year mechanical build. HANDOFF.md establishes the sixth-year September 1891 frame and explicitly protects later continuity. Current mechanical build documentation is UNKNOWN/incomplete and must be supported by actual sources. Do not overwrite it with the original L1 sheet or infer character level from school year.

## B. FOUR MAP QUEST POINTS

| Quest point | Evidence/status | Verified boundary |
|---|---|---|
| Duck Quest | PARTIAL quest record; exact pin UNKNOWN | Existing record mentions a map-pinned duck, but no verified exact pin was recovered. |
| Mushroom Quest / Guardian | EXISTING historical POI #3, Cliffside Gallery | troll_route_4_3_14 JSON records the mushroom/guardian encounter and historical CLEARED state. This is distinct from Undertow Guardian. |
| Troll Quest / Troll Boogers | EXISTING historical POI #14, Forest Edge | Historical planned search destination; route #4 → #3 → #14 does not prove a troll den or completed search. The later waterfall checkpoint separately records Fuzzy Eye friendship/sample as completed earlier events; do not silently rewrite the historical snapshot. |
| Undertow Guardian | EXISTING discovered ID HOG-WF-01; numeric HTML mapping UNKNOWN | No verified relation to an HTML numeric POI or normalized pin. Do not merge with #2 or #3 by guessing. |

No coordinates or connections between these points are invented. Historical map defaults and later played outcomes retain their own dates and authority.

## C. NARRATIVE QUEST ARCHIVE

Separate planned category: **Narrative Quest Archive / Downed**.
Status: MISSING as a dedicated category in the inspected repository; original source availability UNKNOWN.

Keep story sections and Downed materials separate from mechanical gameplay logs. This manifest defines the category only; no archive directory or substitute content is created in this write.

Before a later import:
1. Locate the original conversations/materials.
2. Record source identity, date/range, provenance and completeness.
3. Determine the exact destination after inspecting existing archives and comparing content.
4. Preserve source content and uncertainty without converting narration into mechanical outcomes or new canon.

Do not treat the Duck Quest narrative summary as the complete original archive or fabricate missing Downed material.

## D. OPEN MIGRATION ITEMS

| Item | Status | Evidence / remaining requirement |
|---|---|---|
| Duck Quest partial recovery | PARTIAL | sessions/RUBBER_DUCK_QUEST.md exists; complete original gameplay/player log missing. |
| Complete Duck Quest gameplay log | MISSING | Not recovered according to the existing quest record and preservation manifest; locate original rolls, choices and consequences. |
| Undertow checkpoint and September continuation | PARTIAL | Both session files exist; newest recovered combat evidence remains incomplete. |
| Possible newer Undertow combat/mechanical records | UNKNOWN | No verified later source or numerical live save identified; establish provenance and chronology. |
| Four historical HTML map versions | EXISTING | Already preserved; no duplicate import. |
| Possible newer browser map JSON exports | UNKNOWN | Verify actual export/source/date and browser edits before considering import. |
| Older character sheet and rules | EXISTING | Historical references; introductory L1 profile is stale for current campaign. |
| Current sixth-year character-building sources | UNKNOWN | Obtain real current sheet/build decisions and resource evidence; no numerical reset. |
| Dedicated Narrative Quest Archive / Downed category | MISSING | Planned in section C only; no new archive files created. |
| Original Narrative/Downed conversations and materials | UNKNOWN | Sources must be located and checked for identity, completeness and duplicates. |

## Safe continuation and interruption protocol

Priority: data integrity > one verified commit > migration scope > speed.

For this execution: write only MIGRATION_PLAN_2026-10-08.md, await GitHub's result, reread it, verify exact content and commit SHA, and verify the commit/tree changes only this path. A started call is not proof of success. If the write fails or its outcome is uncertain, inspect the file and commit before any retry.

After verification, only bounded read-only source discovery is permitted. No additional write until provenance, completeness and destination are reliably established. No speculative reconstructions. Stop after the report; do not start AOT.

Next concrete action: locate the complete original Rubber Duck Quest player/gameplay log and record its provenance in a read-only review.

## SOURCE RESOLUTION UPDATE — 2026-10-08

This update supersedes earlier open-item wording where it conflicts.

- Rubber Duck Quest is now verified as an EXISTING quest design and activation record, not a partially recovered played session. The user requested the later sequence as bedtime fiction and distinguished it from future gameplay. Therefore a historical complete gameplay log is NOT APPLICABLE: no player-driven playthrough had occurred.
- The canonical activation values remain Control 13 vs DC 16, Execution 18 vs DC 17, Effect 11, Strain roll 2. The mechanical record is `sessions/RUBBER_DUCK_QUEST.md`; the recovered bedtime-fiction summary is separated at `narrative_archive/RUBBER_DUCK_BEDTIME_FICTION_SUMMARY.md`.
- The available Library inventory contains no HTML or JSON map export newer than `hp5e_free_roam_troll_route_4_3_14.html` from 2026-09-23T13:40:44.874072Z. The four historical maps already in Git remain the newest located files and must not be duplicated.
- `world/maps/QUEST_POINT_CROSSWALK.md` records the verified four-point relationship. Duck numeric pin and the HOG-WF-01-to-HTML mapping remain intentionally UNKNOWN.
- Exact last-combat HP, total Strain, resources and post-action position were confirmed not to exist as a recoverable save. Their UNKNOWN status is not an outstanding migration artifact and must not be filled with seed values.
- Narrative Quest Archive is PARTIAL: the recovered Duck bedtime-fiction summary now has a dedicated category. Other Narrative/Downed originals remain pending source discovery.
