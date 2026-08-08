/**
 * Shared debugger for Vibe Developer + Vibe Coder.
 * In-memory ring buffer + optional file log. No FastAPI.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = process.env.VIBE_DEBUG_LOG ||
  path.join(__dirname, '../../.vibe/debug.log');
const MAX = 500;

const buffer = [];

function stamp(agent, level, message, data) {
  return {
    ts: new Date().toISOString(),
    agent, // 'developer' | 'coder' | 'bridge'
    level,
    message,
    data: data ?? null,
  };
}

export function debugLog(agent, message, data, level = 'info') {
  const entry = stamp(agent, level, message, data);
  buffer.push(entry);
  if (buffer.length > MAX) buffer.shift();
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  } catch {
    /* ignore log IO */
  }
  if (process.env.VIBE_DEBUG === '1') {
    console.error(`[vibe:${agent}] ${level}: ${message}`, data ?? '');
  }
  return entry;
}

export function developerDebug(message, data, level = 'info') {
  return debugLog('developer', message, data, level);
}

export function coderDebug(message, data, level = 'info') {
  return debugLog('coder', message, data, level);
}

export function bridgeDebug(message, data, level = 'info') {
  return debugLog('bridge', message, data, level);
}

export function recentDebug(limit = 50) {
  return buffer.slice(-limit);
}

export function clearDebug() {
  buffer.length = 0;
}
