# Vibe Developer ↔ Coder Bridge

**No FastAPI required** for coordination. Agents talk through a shared contract + debugger.

## Flow

```text
Developer  --pins/env-->  contract.json  <--brief--  Coder
                |
             smoke result
                |
            deploy_ready
```

## Services

| Module | Role |
|--------|------|
| `server/services/vibeContract.js` | Pins + stage file |
| `server/services/vibeDebugger.js` | Dual agent debug log |
| `server/services/vibeBridge.js` | Orchestration |
| `server/routes/vibeBridge.js` | HTTP API |

## HTTP

- `GET  /api/vibe/status`
- `GET  /api/vibe/coder/brief` — what Coder must build against
- `GET  /api/vibe/debug`
- `POST /api/vibe/developer` — publish pins
- `POST /api/vibe/coder` — acknowledge + implemented list
- `POST /api/vibe/smoke` — `{ "ok": true }`

## CLI demo

```bash
node scripts/vibe-bridge-demo.mjs
```

## Rule

Coder **cannot** proceed until Developer publishes. Deploy **cannot** proceed until smoke passes.
