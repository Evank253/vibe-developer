import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import config from '../config.js';
import { getWorkspace } from './projectService.js';

const execP = promisify(exec);

// Allowed command roots (git is the core "GitBash" experience + harmless helpers).
const SAFE_BIN = new Set([
  'git', 'npm', 'npx', 'yarn', 'pnpm', 'python', 'python3', 'node', 'ls', 'cat',
  'pwd', 'echo', 'mkdir', 'touch', 'grep', 'find', 'which', 'head', 'tail', 'wc',
  'chmod', 'date', 'env', 'dir', 'tree', 'cp', 'mv'
]);

// Patterns that must never run through the sandbox.
const DANGEROUS_RE = [/rm\s+-rf\s+\//i, /mkfs/i, /dd\s+if=/, /fork\s*\(.*\)\s*\{/i, /--no-preserve-root/i];

function isCommandAllowed(cmd) {
  const first = cmd.trim().split(/\s+/)[0];
  const bin = path.basename(first);
  return SAFE_BIN.has(bin);
}

// Run a command inside a workspace, restricted to that workspace dir.
export async function runCommand({ id, command, cwd }) {
  if (!command || !command.trim()) return { ok: true, output: '' };
  if (typeof command !== 'string') throw new Error('Command must be a string');

  const ws = getWorkspace(id);
  const baseCwd = ws.dir;

  // Resolve target cwd safely
  let target = baseCwd;
  if (cwd && cwd !== '.') {
    const resolved = path.resolve(baseCwd, cwd);
    if (!resolved.startsWith(path.resolve(baseCwd))) throw new Error('Cannot cd outside project');
    target = resolved;
  }

  for (const re of DANGEROUS_RE) {
    if (re.test(command)) throw new Error('Command blocked: this could harm your system.');
  }
  if (!isCommandAllowed(command)) {
    throw new Error(`Command "${command.split(/\s+/)[0]}" is not in the allowed set. VibeDev blocks arbitrary shell access for safety.`);
  }

  // Block anything trying to write outside the workspace
  if (/\.\.\//.test(command) && /\s(rm|mv|cp|sh|bash)\s/.test(command)) {
    throw new Error('Command blocked: directory traversal outside project.');
  }

  try {
    const { stdout, stderr } = await execP(command, {
      cwd: target,
      timeout: 60000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      maxBuffer: 5 * 1024 * 1024
    });
    return { ok: true, output: (stdout + (stderr ? '\n[stderr] ' + stderr : '')).trim() };
  } catch (e) {
    const msg = (e.stdout || '') + '\n' + (e.stderr || '') + (e.message ? '\n' + e.message : '');
    return { ok: false, output: msg.trim() || 'Command failed' };
  }
}

// Build a suggested command from the AI (used by the terminal AI agent).
export function suggestCommand(intent) {
  const t = (intent || '').toLowerCase();
  if (/status|what.*changed/.test(t)) return 'git status';
  if (/log|history/.test(t)) return 'git log --oneline -10';
  if (/branch/.test(t)) return 'git branch -a';
  if (/install|dependencies/.test(t)) return 'npm install';
  if (/build/.test(t)) return 'npm run build';
  if (/test/.test(t)) return 'npm test';
  if (/add|stage/.test(t)) return 'git add -A && git status';
  if (/commit/.test(t)) return 'git commit -m "Update"';
  if (/push/.test(t)) return 'git push';
  if (/clone/.test(t)) return 'git clone <url>';
  return 'git status';
}

export default { runCommand, suggestCommand };
