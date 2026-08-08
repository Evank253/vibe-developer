# KCN backend — works every time (Vibe Developer fine-tune)

## Problem we fixed

Repeated `ModuleNotFoundError: fastapi` and empty route tables when **Starlette 1.x** was paired with **FastAPI 0.115**.

## Pins (do not float)

```
fastapi==0.115.0
starlette==0.38.6
uvicorn==0.30.6
pydantic==2.9.2
```

## Gate (run before claim “works”)

From KCN-OS repo:

```bash
./scripts/ensure_backend.sh
# or
cd backend && pip install -r requirements.txt \
  && pip install fastapi==0.115.0 starlette==0.38.6 \
  && PYTHONPATH=. python scripts/smoke_test.py
```

Expect: `SMOKE PASS` and `routes >= 50` with many `/api/*` paths.

## Vibe Developer checklist

1. Install **pinned** deps (never bare `pip install fastapi` latest).
2. Run smoke import of `main:app`.
3. Assert critical routes: `/api/sclass/status`, `/api/sclass/twin/status`, `/api/resilience/status`.
4. Only then start uvicorn / Docker.

## Start API

```bash
cd backend
export PYTHONPATH=.
export DATABASE_URL=sqlite:////tmp/kcn.db
python -m uvicorn main:app --reload --port 8000
```

Docs: http://localhost:8000/docs
