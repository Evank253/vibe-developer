#!/usr/bin/env bash
# Deploy VibeDev to Heroku (free tier) with a single command.
set -e

APP_NAME="${1:-vibedev}"
echo "→ Building client & deploying to Heroku as '$APP_NAME'"
echo "  (skip if you don't use Heroku — Docker/Render work too)"

cd "$(dirname "$0")/.."
npm run build:client

if ! command -v heroku >/dev/null 2>&1; then
  echo "Heroku CLI not found. Install: https://devcenter.heroku.com/articles/heroku-cli"
  echo "Then run:  ./scripts/deploy-heroku.sh"
  exit 1
fi

heroku create "$APP_NAME" --no-remote || true
heroku config:set NODE_ENV=production AI_PROVIDER=mock -a "$APP_NAME"
git add -A && git commit -m "deploy vibedev" --allow-empty 2>/dev/null || true
git push heroku HEAD:main
heroku open
