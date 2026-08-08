/**
 * Shared deployment contract — Developer writes, Coder reads.
 * No FastAPI required. File-based so both agents stay in sync.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = process.env.VIBE_CONTRACT_PATH ||
  path.join(__dirname, '../../.vibe/contract.json');

export const DEFAULT_PINS = {
  'fastapi': '0.115.0',
  'starlette': '0.38.6',
  'uvicorn': '0.30.6',
  'pydantic': '2.9.2',
};

export function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export function readContract(filePath = DEFAULT_PATH) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

export function writeContract(partial, filePath = DEFAULT_PATH) {
  ensureDir(filePath);
  const prev = readContract(filePath) || {};
  const next = {
    ...prev,
    ...partial,
    updatedAt: new Date().toISOString(),
    schema: 'vibe.contract.v1',
  };
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2));
  return next;
}

/** Developer stage: lock pins + env target */
export function developerPublish({ pins = DEFAULT_PINS, env = 'project-venv', notes = '' } = {}) {
  return writeContract({
    stage: 'developer_done',
    pins,
    env,
    notes,
    coderAllowed: true,
    deployReady: false,
    smoke: { status: 'pending' },
  });
}

/** Coder stage: acknowledge pins and declare what was implemented */
export function coderAcknowledge({ implemented = [], blockers = [] } = {}) {
  const c = readContract();
  if (!c || !c.coderAllowed) {
    throw new Error('Coder blocked: wait for Developer contract (stage developer_done)');
  }
  return writeContract({
    stage: 'coder_done',
    implemented,
    blockers,
    deployReady: blockers.length === 0,
  });
}

/** Mark smoke result for final deployment */
export function setSmokeResult({ ok, detail = '' }) {
  return writeContract({
    smoke: { status: ok ? 'pass' : 'fail', detail, at: new Date().toISOString() },
    deployReady: !!ok,
    stage: ok ? 'deploy_ready' : 'smoke_failed',
  });
}
