# Vibe Package Deal — Developer + Coder

**One offer for GitHub / subscribers:** not a broken demo — a gated, repeatable tool.

## Bundle

| Stage | Name | Delivers |
|-------|------|----------|
| 1 | **Vibe Developer** | Pins, install into persisted env, dependency contract |
| 2 | **Vibe Coder** | Features coded *to* that contract |
| 3 | **Smoke gate** | Import + routes + basics must PASS |

**Order is mandatory:** Developer → Coder → Smoke.

## Why buyers care

- No more “works on my machine” after a floating `pip install fastapi`
- Starlette/FastAPI pins stop empty route tables
- Clear pass/fail before you open product docs

## Pins (backend / KCN path)

```
fastapi==0.115.0
starlette==0.38.6
uvicorn==0.30.6
pydantic==2.9.2
```

## Buyer flow

```bash
# From KCN-OS (linked ecosystem)
./scripts/ensure_backend.sh    # Developer gate
# SMOKE PASS required
cd backend && PYTHONPATH=.deps:. python -m uvicorn main:app --port 8000
```

## Store badge

Ship only with:

```text
[ Vibe Package ] Developer pins ✓ · Coder matches ✓ · Smoke PASS ✓
```

## Related

- `KCN_BACKEND_RELIABLE.md` — technical reliability notes
- `scripts/kcn-smoke-check.sh` — helper gate
- KCN-OS `docs/STORE_VIBE_PACKAGE.md` — full listing copy
