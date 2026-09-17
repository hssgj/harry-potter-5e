# Engine protocol v0.1

GitHub is authoritative. Markdown owns canon/history; JSON owns current machine
state. A future UI reads JSON but mutates it only through events.

## Every played turn

1. Load and validate `runtime/campaign-state.json`.
2. Load current scene plus relevant registries/rules.
3. Resolve the declared action.
4. Build the smallest event batch.
5. Dry-run reducer and validation.
6. Write snapshot and append-only log.
7. Narrate only after the write succeeds.

Truth states: `confirmed`, `provisional`, `unknown`, `import_pending`.
UNKNOWN is never auto-filled. A successful experiment never automatically
becomes a learned spell. Never invent recovery or expose GM facts to player UI.

Invariants: unique event IDs; bounded resources/clocks; nonnegative inventory;
explicit known/prepared magic changes; cooldown = used turn + C + 1; every
mutation carries a reason and source.
