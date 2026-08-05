import { Router } from 'express';
import config from '../config.js';
import {
  oauthToken, getUser, validatePat, listRepos, createRepo, pushProject
} from '../services/githubService.js';

const router = Router();

// Get the OAuth authorization URL (for the frontend "Connect GitHub" button)
router.get('/auth-url', (req, res) => {
  if (!config.githubClientId) {
    return res.json({ configured: false, message: 'GitHub OAuth not configured on server. Use a Personal Access Token instead, or set GITHUB_CLIENT_ID/SECRET.' });
  }
  const redirect = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/github/callback`);
  const url = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&redirect_uri=${redirect}&scope=repo,user`;
  res.json({ configured: true, url });
});

// OAuth callback — exchange code for token, hand back to the frontend
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('Missing code');
    const token = await oauthToken(code);
    const user = await getUser(token);
    res.redirect(`/github-connected?token=${encodeURIComponent(token)}&login=${user.login}&avatar=${encodeURIComponent(user.avatar_url || '')}`);
  } catch (e) {
    res.redirect(`/github-connected?error=${encodeURIComponent(e.message)}`);
  }
});

// Validate a Personal Access Token
router.post('/validate-pat', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });
    const info = await validatePat(token);
    res.json({ ok: true, ...info });
  } catch (e) {
    res.status(401).json({ ok: false, error: e.message });
  }
});

router.get('/user', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try { res.json(await getUser(token)); } catch (e) { res.status(401).json({ error: e.message }); }
});

router.get('/repos', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try { res.json(await listRepos(token)); } catch (e) { res.status(401).json({ error: e.message }); }
});

router.post('/repo', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const repo = await createRepo(token, req.body);
    res.json({ ok: true, repo });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Push an organized project to GitHub
router.post('/push', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { projectId, repoName, owner, message, branch, gitUser, gitEmail } = req.body;
    if (!projectId || !repoName || !owner) return res.status(400).json({ error: 'projectId, repoName and owner required' });

    const { getWorkspace } = await import('../services/projectService.js');
    const ws = getWorkspace(projectId);

    let repo;
    try {
      repo = await createRepo(token, { name: repoName, description: message || 'Built with VibeDev' });
    } catch (e) {
      // repo may already exist — treat as fine, push will update it
      repo = { name: repoName };
    }

    const result = await pushProject({
      token, owner, repo: repoName,
      sourceDir: ws.dir,
      message: message || 'Built with VibeDev',
      branch: branch || 'main',
      gitUser, gitEmail
    });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
