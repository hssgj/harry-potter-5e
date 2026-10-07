# Engine protocol v0.1

GitHub is authoritative. Markdown owns canon/history; JSON owns current machine
state. A future UI reads JSON but mutates it only through events.

## Current campaign import gate — 2026-10-07

Read root `CURRENT.md` and `engine/import/CURRENT_CAMPAIGN_RECONCILIATION.md` first. The existing revision-0 transaction store has not been reconciled to the current waterfall campaign. Its historical seed resources must not be presented as current. Recover the missing numerical source before applying current-campaign resource/combat changes. This is an operating boundary; the CLI does not automatically enforce this source-status gate.

## Every played turn

1. Load `runtime/world.json`; its campaign field supersedes the legacy snapshot. Record its revision.
2. Load current scene plus relevant registries/rules.
3. Resolve the declared action.
4. Build the smallest event batch.
5. Dry-run reducer and validation.
6. Commit using world-cli.js apply with expected_revision. Export entity histories and persist the complete transaction to GitHub. Never write legacy snapshot/log independently.
7. Narrate only after the write succeeds.

Truth states: `confirmed`, `provisional`, `unknown`, `import_pending`.
UNKNOWN is never auto-filled. A successful experiment never automatically
becomes a learned spell. Never invent recovery or expose GM facts to player UI.

Invariants: unique event IDs; bounded resources/clocks; nonnegative inventory;
explicit known/prepared magic changes; cooldown = used turn + C + 1; every
mutation carries a reason and source.

