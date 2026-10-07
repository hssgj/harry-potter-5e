# Current campaign reconciliation — 2026-10-07

Status: SOURCE RECOVERY COMPLETE FOR AVAILABLE MATERIAL; NUMERICAL RUNTIME IMPORT STILL INCOMPLETE.

Read root `CURRENT.md`, `sessions/WATERFALL_GUARDIAN_CHECKPOINT.md`, `sessions/WATERFALL_GUARDIAN_RECOVERY_2026-09-25.md`, and `world/FREE_ROAM_STATE.json` before using machine state.

The transaction store `engine/runtime/world.json` currently has revision 0 and no events. Its campaign field still contains the introductory Weasley-assessment seed (HP 10/13, old attributes/inventory, combat inactive). Those values do not establish current sixth-year resources or current waterfall combat state. `campaign-state.json` is a legacy migration source, not the authoritative live transaction store.

The recovered later campaign is at the unresolved Undertow Guardian encounter, crystal held/contested, shield arm damaged and floor cracked. Current HP, maximum HP, accumulated Strain, exact turn/position, and guardian HP are UNKNOWN. Do not set them to seed values, null unsupported by the existing resource validator, zero, full rest, or invented defaults. Do not run resource-changing current-campaign turns against the old seed while presenting their output as the latest campaign.

Original seed and engine code remain preserved. Reconciliation requires an actual mechanical source/save and a deliberate import into world.json with matching event histories. The schema's numeric resource requirements cannot be satisfied honestly from the recovered prose alone. This preservation pass does not claim the current campaign has been numerically migrated or FreePM-tested.

The Rubber Duck Quest has its own recovered narrative/cast record. Its classification and relation to the unresolved waterfall encounter remain separate; do not apply its narrated inventory or location automatically to the transaction store.

