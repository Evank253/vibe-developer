# Fleet deploy plan (Evank253)

## What is possible

You have **~80 repositories**. Most are incomplete scaffolds (empty folders, school assignments, or API stubs). Free hosts cannot run “all of them” as live products without working code.

### Free hosting options
| Host | Best for | Limit |
|------|----------|--------|
| **jsDelivr CDN** | Static HTML already in GitHub | Instant, no setup |
| **GitHub Pages** | Static sites | Enable Actions once per repo |
| **Render free** | Node/Python APIs | Sleeps when idle |
| **Vercel free** | Vite/React/Next frontends | Import each project |

### Already live
1. **KCN Singularity** — https://cdn.jsdelivr.net/gh/Evank253/KCN_SINGULARITY_MASTER@main/docs/index.html
2. **Super Cognitive demo** — https://cdn.jsdelivr.net/gh/Evank253/KCN-SUPER-COGNITIVE-HUMAN-GOVERNED-INTELLIGENCE-ECOSYSTEM-@copilot/kcn-super-cognitive-ecosystem/public-demo/index.html
3. **This hub** — `public/index.html` in vibe-developer

### How to process a repo through VibeDev
1. Run VibeDev locally: `bash start.sh` → http://localhost:4000
2. Connect GitHub PAT in Settings
3. Import or paste repo
4. Ask: “Review, fix, add missing files, organize”
5. Ask: “Deploy this free” → generates Pages/Render configs
6. Push and enable host

### Recommended order (do not batch 80 at once)
1. vibe-developer (this tool)
2. KCN_SINGULARITY_MASTER
3. KCN-SUPER-COGNITIVE…
4. Kronos-Vibe-Coder
5. One school HTML site as practice
6. Only then other KCN/Kronos apps that have real UI code

### What Grok cannot do alone
- Create 80 separate free Vercel/Render accounts/projects without your clicks
- Invent working products from empty scaffolds
- Buy or assign custom domains without your DNS

### Your next step
Pick **3 priority repos** to finish and deploy. Say their names and we process those through VibeDev + free hosting first.
