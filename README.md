# VibeDev

**Ship Without Fear.** AI-assisted fix, organize, and deploy for real projects.

## Architecture

```
/server          Express API (Node ≥18)
/client          React + Vite frontend
/scripts         Deploy helpers
```

## Quick start

```bash
git clone -b Python-3 https://github.com/Evank253/vibe-developer.git
cd vibe-developer
cp .env.example .env   # optional: add AI / GitHub keys
npm run setup
npm run build:client
npm start
```

Or one shot:

```bash
bash start.sh
```

Open http://localhost:4000

## Environment

See `.env.example`. Required for production:

| Variable | Purpose |
|----------|---------|
| `AI_PROVIDER` | `mock` \| `anthropic` \| `openai` \| `auto` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Provider keys |
| `GITHUB_CLIENT_ID` / `SECRET` | OAuth (optional; PAT also works) |
| `CORS_ORIGIN` | Allowed origin(s) in production |
| `RATE_LIMIT_*` | API rate limits |

Startup **validates** env and exits with a clear error if required keys are missing for the chosen provider.

## Security baseline

- `helmet` headers
- Rate limiting on `/api`
- CORS restricted in production when `CORS_ORIGIN` is set
- Upload filter: `.zip` only + size limits
- Request IDs (`X-Request-Id`) for tracing
- Structured JSON request/error logs
- Secrets only via environment variables
- Dependabot + CI audit step

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run API (+ static client if built) |
| `npm run dev` | API with `--watch` |
| `npm run dev:client` | Vite dev server (proxies `/api`) |
| `npm run build:client` | Production client build |
| `npm run lint` | ESLint server |
| `npm test` | Smoke tests (mock AI) |
| `npm run audit` | Dependency vulnerability scan |

## Deploy

See `DEPLOY.md` and `render.yaml` / `scripts/deploy-heroku.sh`.

## Legal

Tools only. You are responsible for what you ship.
