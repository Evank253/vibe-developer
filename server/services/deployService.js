import path from 'path';
import { detectLanguageKey } from './ai/languages.js';

// Generate everything needed to deploy a project to a FREE host + domain.
// Returns config files to write and a step-by-step plan the UI can run.

export function detectProjectType(files) {
  const names = files.map(f => f.path.toLowerCase());
  const pkg = files.find(f => f.path.toLowerCase() === 'package.json')?.content || '';
  const isStaticFramework = /"react"|"next"|"gatsby"|"nuxt"|"vite"|"webpack"|"svelte"|"vue"/.test(pkg);

  if (names.includes('render.yaml')) return 'render';
  if (names.includes('netlify.toml') || (names.includes('package.json') && isStaticFramework)) return 'netlify';
  if (names.includes('package.json')) return 'node';
  if (names.some(f => f.path.toLowerCase().endsWith('.py'))) return 'python';
  if (names.some(f => /\.(html|htm)$/.test(f.path.toLowerCase()))) return 'static';
  if (names.some(f => f.path.toLowerCase().endsWith('.java'))) return 'java';
  if (names.some(f => f.path.toLowerCase().endsWith('.go'))) return 'go';
  if (names.includes('dockerfile') || names.includes('docker-compose.yml') || names.includes('docker-compose.yaml')) return 'docker';
  return 'unknown';
}

export function buildDeployPlan(project, { owner } = {}) {
  const type = detectProjectType(project.files);
  const name = project.name;
  const files = [];

  const plan = {
    type,
    options: [],
    generatedFiles: []
  };

  // --- Option 1: Render (free web service, free domain on render.app)
  if (type === 'node' || type === 'python' || type === 'docker' || type === 'static') {
    const renderConfig = {
      services: [{
        type: 'web',
        name: (name || 'app').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        runtime: type === 'python' ? 'python' : type === 'node' ? 'node' : 'docker',
        buildCommand: type === 'node' ? 'npm install' : type === 'python' ? 'pip install -r requirements.txt' : '',
        startCommand: type === 'node' ? 'npm start' : type === 'python' ? 'python app.py' : '',
        envVars: [],
        plan: 'free',
        autoDeploy: true
      }]
    };
    if (type === 'static') renderConfig.services[0].staticPublishPath = './';
    files.push({ path: 'render.yaml', content: JSON.stringify(renderConfig, null, 2) });
    plan.options.push({
      id: 'render', label: 'Render — Free', url: 'https://render.com',
      note: 'Push to GitHub, then "New > Web Service" in Render, pick your repo. Render auto-deploys and gives you a free `*.onrender.com` domain. Connect a custom domain in Dashboard > Settings > Custom Domain (free via a registrar or Namecheap free DNS).'
    });
  }

  // --- Option 2: GitHub Pages (free static hosting + username.github.io domain)
  if (type === 'static' || type === 'netlify' || type === 'node') {
    files.push({
      path: '.github/workflows/deploy.yml',
      content: `name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
`
    });
    plan.options.push({
      id: 'ghpages', label: 'GitHub Pages — Free', url: 'https://pages.github.com',
      note: `Repo Settings > Pages > Source: GitHub Actions. Your live site: https://${owner || '<your-username>'}.github.io/${name}/ — free forever, includes a free custom domain option (add a CNAME file).`
    });
  }

  // --- Option 3: Netlify Drop (free, drag-and-drop, no repo needed)
  if (type === 'static' || type === 'netlify' || type === 'node') {
    files.push({
      path: 'netlify.toml',
      content: `[build]
  command = "npm run build || true"
  publish = "public"

[build.environment]
  NODE_VERSION = "20"
`
    });
    plan.options.push({
      id: 'netlify', label: 'Netlify — Free', url: 'https://netlify.com',
      note: 'Connect your GitHub repo in Netlify → "Add new site". It auto-deploys and gives a free `*.netlify.app` domain. Custom domains are free to connect.'
    });
  }

  // --- Dockerfile (so any project can run anywhere with Docker)
  if (type === 'node' || type === 'python' || type === 'unknown' || type === 'static') {
    let docker;
    if (type === 'python') {
      docker = `FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt 2>/dev/null || true\nCMD ["python","app.py"]\n`;
    } else {
      docker = `FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install 2>/dev/null || true\nCMD ["npm","start"]\n`;
    }
    files.push({ path: 'Dockerfile', content: docker });
    plan.options.push({
      id: 'docker', label: 'Docker — Anywhere', url: 'https://docker.com',
      note: 'A Dockerfile is generated so you can deploy to any Docker host (Render, Railway, Fly.io, a VPS) — all free tiers available. `docker build -t myapp . && docker run -p 3000:3000 myapp`.'
    });
  }

  return { ...plan, generatedFiles: files };
}

// Return human-friendly next steps the copilot can narrate.
export function summarizeDeploy(plan) {
  const lines = plan.options.map(o => `- **${o.label}**: ${o.note}`).join('\n');
  return `I can deploy this free. Here's how:\n\n${lines}\n\nI've generated the config files for you. Want me to push to GitHub and kick off a free deploy?`;
}

export default { buildDeployPlan, detectProjectType, summarizeDeploy };
