# Preserved standalone HP5E maps

These are the original functional map scripts, CSS and 40-POI defaults from 2026-09-23. Their identical embedded JPEG is stored once at `assets/map-background.jpg`; every original source HTML is reconstructable by reversing that one URI substitution. Three byte-identical base copies share one preserved map and retain all source IDs in the manifest.

| Map snapshot | Data | Status |
|---|---|---|
| [TROLL_ROUTE_4_3_14](troll_route_4_3_14.html) | [40 POI defaults](snapshots/troll_route_4_3_14.json) | Historical 2026-09-23 |
| [BASE_40_POI](base_40_poi.html) | [40 POI defaults](snapshots/base_40_poi.json) | Historical 2026-09-23 |
| [POI3_CLEARED](poi3_cleared.html) | [40 POI defaults](snapshots/poi3_cleared.json) | Historical 2026-09-23 |
| [FOREST_EDGE_ROUTE](forest_edge_route.html) | [40 POI defaults](snapshots/forest_edge_route.json) | Historical 2026-09-23 |

Open any HTML with its sibling `assets/` folder intact. The map retains localStorage, JSON import/export and reset behavior. Export browser edits to JSON; browser localStorage is not captured by copying the source file.

The troll route 4 → 3 → 14 is an itinerary, not a confirmed troll den or completed search. Later waterfall play outranks these map defaults. `HOG-WF-01` has no verified normalized map pin; never merge it with numeric POI 2 or 3 by guessing.

## Quest-point crosswalk

[Verified four-point quest crosswalk](QUEST_POINT_CROSSWALK.md) records the source-backed relationship between Duck Quest, Cliffside Gallery #3, Forest Edge #14 and HOG-WF-01. Duck and Undertow numeric pins remain unknown. No map export newer than 2026-09-23 was found during the 2026-10-08 source search.
