import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import config from '../config.js';

const exec = promisify(execFile);
const GITHUB_API = 'https://api.github.com';

// --- Token management (in-memory + optional persisted). In a production deployment,
// store tokens encrypted in a DB. For this version we keep a per-request token.

function headers(token) {
  return {
    authorization: `token ${token}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'vibedev',
    'content-type': 'application/json'
  };
}

// Exchange OAuth code for a token
export async function oauthToken(code) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  return data.access_token;
}

export async function getUser(token) {
  const res = await fetch(`${GITHUB_API}/user`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res.json();
}

// Validate a PAT by hitting the user endpoint
export async function validatePat(token) {
  const user = await getUser(token);
  return { ok: true, login: user.login, avatar_url: user.avatar_url };
}

export async function listRepos(token) {
  const res = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

export async function createRepo(token, { name, description = '', private: isPrivate = false }) {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: false })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Create repo failed: ${err.message || res.status}`);
  }
  return res.json();
}

// Push an entire folder to a GitHub repo using the git CLI.
export async function pushProject({
  token, owner, repo, sourceDir, message = 'Built with VibeDev', branch = 'main',
  gitUser, gitEmail
}) {
  const remote = `https://${token}@github.com/${owner}/${repo}.git`;
  let worktree;
  try {
    worktree = fs.mkdtempSync(path.join(os.tmpdir(), 'vibedev-'));
    // copy source into a fresh git worktree so we don't touch the user's folder
    fs.cpSync(sourceDir, worktree, { recursive: true });

    const run = async (args, opts = {}) => {
      await exec('git', args, { cwd: worktree, ...opts });
    };

    await run(['init', '-b', branch]);
    await run(['config', 'user.name', gitUser || config.gitDefaultUser]);
    await run(['config', 'user.email', gitEmail || config.gitDefaultEmail]);
    await run(['add', '-A']);
    await run(['commit', '-m', message], { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
    await run(['remote', 'add', 'origin', remote]);
    await run(['push', '-u', 'origin', branch], { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });

    return { ok: true, pushedTo: `https://github.com/${owner}/${repo}`, branch };
  } finally {
    if (worktree) fs.rmSync(worktree, { recursive: true, force: true });
  }
}

export default {
  oauthToken, getUser, validatePat, listRepos, createRepo, pushProject
};
