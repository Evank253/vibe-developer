# ⚡ VibeDev — AI Super-Developer

A web app that removes the barrier to building software. **Connect GitHub, drop in any zip (or type what you want in plain English), and VibeDev reviews & fixes your code, generates anything missing, organizes your files to a perfect score, and deploys it free** — all through a chat copilot.

> Copilot + vibe coder + organizer + vibe developer, in one tool.

![stack](https://img.shields.io/badge/stack-Node%20%2B%20Express%20%2B%20React-7c5cff) ![ai](https://img.shields.io/badge/AI-multi--provider%20%2B%20demo-green)

---

## ✨ What it does

| You ask / drop in | VibeDev does |
|---|---|
| A messy **zip file** (any size) | Extracts it, strips junk (`.DS_Store`, `__MACOSX`), unwraps single-folder zips |
| **"Review my code"** | Scans every file, in every major language, and gives a **quality score (100 = perfect)** with line-level issues |
| **"Fix the issues"** | Auto-fixes style & logic problems and writes them back |
| **"Add missing files"** | Detects & generates missing `README.md`, `.gitignore`, `package.json`, `Dockerfile`, etc. |
| **"Organize my project"** | Moves files into a clean conventional structure (`src/`, `tests/`, `docs/`, `assets/`, config at root) — no matter how you dumped them in |
| **"Build a to-do app"** | Converts plain English → working code in the language you choose |
| **GitHub** | Connect via **OAuth** or a **Personal Access Token**, create repos, commit & push |
| **"Deploy this free"** | Generates configs for free hosts (Render, GitHub Pages, Netlify, Docker) + pushes to GitHub and gives you a live URL + custom domain steps |
| **GitBash Terminal** | Built-in **sandboxed** terminal; an **AI agent** writes the commands for you ("install dependencies", "push my changes") |

---

## 🧠 Master of all languages

`server/services/ai/languages.js` ships with a registry covering 40+ languages (JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, HTML/CSS, shell, and more). Language detection is automatic per file, and every AI prompt is language-aware.

## 🤖 AI providers (multiple, swappable)

- **Demo mode (`mock`)** — works out of the box, **no API key needed**. Does real deterministic checks (indentation, trailing whitespace, long lines, TODO markers, missing semicolons) plus code generation & organization.
- **Anthropic (Claude)** — `ANTHROPIC_API_KEY`
- **OpenAI (GPT)** — `OPENAI_API_KEY`
- **`auto`** — uses the first real key found, else falls back to demo.

## 🔗 GitHub — both ways

1. **OAuth app** (polished): create an app at github.com/settings/developers, set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in `.env`. Callback URL: `http://localhost:4000/api/github/callback`.
2. **Personal Access Token** (simplest): paste a `ghp_…` token in Settings. No server setup needed.

---

## 🚀 Run it locally

**One click — pick whichever fits your system:**

| OS | Command |
|---|---|
| Any (macOS / Linux) | `bash start.sh` — or just `npm run go` |
| Windows | double-click `start.bat` (or `start.bat` in a terminal) |

Each script installs any missing dependencies, builds the frontend the first time, starts the server on **http://localhost:4000**, and opens your browser for you.

**Or run it manually:**
```bash
git clone <your-repo> && cd vibedev
npm install                # backend deps
npm --prefix client install   # frontend deps
cp .env.example .env       # optional: add API keys
npm run dev                # backend on :4000
npm --prefix client run dev  # frontend on :5173 (proxies /api to :4000)
```

Or run the single combined server that also serves the built UI:
```bash
npm run build:client
npm start                 # open http://localhost:4000
```

## ☁️ Deploy VibeDev itself (free)

- **Render (free):** push this repo to GitHub → Render → *New > Blueprint* → pick the repo. `render.yaml` + `Dockerfile` handle everything.
- **Docker (anywhere):** `docker build -t vibedev . && docker run -p 4000:4000 vibedev`
- **Heroku:** `./scripts/deploy-heroku.sh vibedev`

---

## 🛠 Architecture

```
vibedev/
├─ server/                  Express API
│  ├─ index.js              entry (serves API + built client)
│  ├─ config.js             env config
│  ├─ routes/               github · project · ai · deploy
│  └─ services/
│     ├─ ai/                provider factory + languages
│     │   ├─ anthropic.js   Claude
│     │   ├─ openai.js      GPT
│     │   └─ mock.js        demo mode (no key)
│     ├─ githubService.js   OAuth, PAT, repo create, git push
│     ├─ projectService.js  zip extract, file tree, organize
│     ├─ terminalService.js sandboxed GitBash + AI suggest
│     └─ deployService.js   free-host config generation
└─ client/                  React + Vite UI
   └─ src/components/       Sidebar, TopBar, ChatCopilot, Home,
                            CodePanel, OrganizePanel, TerminalPanel,
                            DeployPanel, SettingsPanel
```

## 🔒 Safety notes

- The **terminal is sandboxed**: only whitelisted commands (`git`, `npm`, `python`, `node`, `ls`, …) run, and only inside the project's own folder. Dangerous commands (`rm -rf /`, `mkfs`, etc.) are blocked.
- Zip extraction guards against **path traversal**.
- `.gitignore` files generated by VibeDev keep secrets & build artifacts out of commits.
- Store your AI keys in `.env` (never commit it) and keep tokens server-side for production.

## 🧩 Roadmap ideas

- Multi-file selection + per-file diff viewer before fixes are applied
- Persistent user accounts + encrypted GitHub token storage in a DB
- More deploy targets (Vercel, Railway, Fly.io, AWS)
- Unit-test generator and dependency-version bumping
- Webhook-based auto re-review on GitHub push

---

Made with ⚡ by VibeDev — *you bring the idea, it writes, organizes, and ships the code.*
