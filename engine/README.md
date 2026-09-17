# HP5e state engine v0.1

Zero-dependency event-driven campaign core beneath any future UI.
It owns deterministic live state: resources, turns, cooldowns, conditions,
inventory, magic lifecycle, location references and world clocks.

No POIs are authored in v0.1. Region IDs are stable empty containers.

```bash
cd engine
npm test
npm run validate
npm run status
node src/cli.js apply ./event.json
```

Invalid events write nothing. Read `ENGINE_PROTOCOL.md` before play.
