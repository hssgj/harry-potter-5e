# HP5E engine

The integrated **audit-v1** build is ready for review in [docs/AUDIT_V1.md](docs/AUDIT_V1.md).

```sh
cd engine
npm run audit
npm run play
```

Open `http://127.0.0.1:8787` locally. Requires Node 20+; no package install or API key. The first launch creates a separate persistent playtest save, not a canonical timeskip. See the audit document for implemented behavior, known limitations and verification status.

- [Exact proposed rules](docs/RULES_AUDIT_V1.md)
- [Command contract](docs/COMMANDS.md)
- [Continuity and activation boundary](docs/CONTINUITY_RECONCILIATION.md)
- `npm run game -- status` / `apply request.json` / `export`

Older `src/cli.js`, `src/world-cli.js` and `runtime/` are legacy checkpoint tools. Do not use their write commands to adjudicate the audit game; `game.json` and `game-store.js` are authoritative for audit play. Live campaign files are retained without migration.
