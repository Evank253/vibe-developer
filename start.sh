#!/usr/bin/env bash
# =====================================================================
#  VibeDev — one-click start
#  Usage:  bash start.sh        (or)   ./start.sh
#
#  - Installs dependencies the first time / when needed
#  - Builds the frontend if it's missing or out of date
#  - Starts the server and opens your browser
# =====================================================================

set -e
cd "$(dirname "$0")"          # always run from the vibedev folder, no matter where you call it from

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo ""
echo -e "${CYAN}⚡ VibeDev — starting…${NC}"

# --- 1. Backend dependencies ---
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}→ Installing backend dependencies…${NC}"
  npm install
else
  echo -e "${GREEN}✓ Backend dependencies present${NC}"
fi

# --- 2. Frontend dependencies ---
if [ ! -d "client/node_modules" ]; then
  echo -e "${YELLOW}→ Installing frontend dependencies…${NC}"
  npm --prefix client install
else
  echo -e "${GREEN}✓ Frontend dependencies present${NC}"
fi

# --- 3. Build the frontend (only if it hasn't been built yet) ---
if [ ! -f "client/dist/index.html" ]; then
  echo -e "${YELLOW}→ Building frontend…${NC}"
  npm run build:client
else
  echo -e "${GREEN}✓ Frontend already built${NC}"
fi

# --- 4. Start the server ---
echo -e "${GREEN}→ Starting server…${NC}"
echo -e "${CYAN}  Open http://localhost:4000 in your browser${NC}"
echo ""

# Open the browser a moment after the server boots (works on macOS / most Linux).
# Skipped automatically if no browser opener is available (e.g. headless servers).
( sleep 2; { command -v open >/dev/null 2>&1 && open http://localhost:4000 >/dev/null 2>&1; } || { command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:4000 >/dev/null 2>&1; } || true ) &

exec npm start
