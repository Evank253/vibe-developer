# Vibe Developer

Part of the **Vibe Package Deal** (Developer + Coder): pinned environment first, code second, smoke before “ready.”

## Package deal

See **[STORE_PACKAGE_DEAL.md](./STORE_PACKAGE_DEAL.md)** for store/GitHub positioning.

**Order:** Vibe Developer (deps) → Vibe Coder (implementation) → Smoke PASS.

## KCN reliability

- [KCN_BACKEND_RELIABLE.md](./KCN_BACKEND_RELIABLE.md)
- Pins: `fastapi==0.115.0` + `starlette==0.38.6` (do not float)

## Structure

- `server/` — API
- `client/` — UI
- `scripts/` — deploy + KCN smoke helper

## Quick start

```bash
npm install
npm run dev
```

For KCN-OS backend path, run ensure/smoke on the KCN repo before claiming the API works.

## License

See repository license / KCN legal docs for commercial use.
