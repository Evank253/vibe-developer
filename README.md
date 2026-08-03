# KCN Vibe Developer

**Ship Without Fear.**  
**We End Broken Deployments.**

## Live (no install)

| Page | URL |
|------|-----|
| **Fleet Hub** | https://cdn.jsdelivr.net/gh/Evank253/vibe-developer@Python-3/public/index.html |
| **Fix & Ship app** | https://cdn.jsdelivr.net/gh/Evank253/vibe-developer@Python-3/public/app.html |
| **Create API** | https://cdn.jsdelivr.net/gh/Evank253/vibe-developer@Python-3/public/create-api.html |
| **GitHub App setup** | https://cdn.jsdelivr.net/gh/Evank253/vibe-developer@Python-3/public/github-app.html |

## What it does

1. **Import** — zip / files  
2. **Fix** — clean, secrets shield, stack defaults  
3. **Ship** — GitHub Pages or Render-ready push  
4. **Verify** — live health check  
5. **Heal** — one-click repair + re-ship  
6. **Ship card** — shareable summary  

Not an idea-to-app builder.

## Pre-deploy checks run

- Inline JS syntax (`node --check`) — pass  
- Required control IDs present — pass  
- Secrets-shield unit (blocks `.env`) — pass  

## Local

```bash
git clone -b Python-3 https://github.com/Evank253/vibe-developer.git
cd vibe-developer
npx --yes serve public -p 4000
```

Open http://localhost:4000/app.html

## GitHub Marketplace

Marketplace listing requires a published **GitHub App** under your account (permissions review by GitHub). Use `public/github-app.html` to register Client ID first. We cannot submit Marketplace for you without your GitHub App ownership.

## Legal

Tools only. You are responsible for what you ship.
