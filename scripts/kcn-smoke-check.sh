#!/usr/bin/env bash
# Vibe Developer helper: verify KCN backend is healthy
set -euo pipefail
KCN_ROOT="${KCN_ROOT:-../KCN-OS}"
if [ ! -d "$KCN_ROOT/backend" ]; then
  echo "Set KCN_ROOT to KCN-OS path (got $KCN_ROOT)"
  exit 1
fi
cd "$KCN_ROOT"
if [ -x scripts/ensure_backend.sh ]; then
  exec scripts/ensure_backend.sh
fi
cd backend
pip install -q -r requirements.txt 'fastapi==0.115.0' 'starlette==0.38.6'
PYTHONPATH=. python -c "from main import app; assert len(app.routes)>=50; print('OK', len(app.routes))"
