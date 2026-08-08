/**
 * Developer ↔ Coder bridge
 * Ensures Coder only codes after Developer publishes pins.
 * Both share debugger + contract for final deployment.
 */
import {
  readContract,
  developerPublish,
  coderAcknowledge,
  setSmokeResult,
  DEFAULT_PINS,
} from './vibeContract.js';
import {
  developerDebug,
  coderDebug,
  bridgeDebug,
  recentDebug,
} from './vibeDebugger.js';

export function status() {
  const contract = readContract();
  return {
    contract,
    recent: recentDebug(20),
    order: ['developer', 'coder', 'smoke', 'deploy'],
    fastapiRequired: false,
  };
}

/** Call from Vibe Developer when deps are locked */
export function runDeveloper({ pins = DEFAULT_PINS, env = 'project-venv', notes = '' } = {}) {
  developerDebug('publishing dependency contract', { pins, env });
  const contract = developerPublish({ pins, env, notes });
  bridgeDebug('developer → coder unlocked', { stage: contract.stage });
  return { ok: true, contract, next: 'coder' };
}

/** Call from Vibe Coder before generating code */
export function runCoder({ implemented = [], blockers = [] } = {}) {
  const existing = readContract();
  if (!existing || existing.stage === undefined) {
    coderDebug('blocked — no developer contract', {}, 'error');
    return {
      ok: false,
      error: 'no_developer_contract',
      message: 'Run Vibe Developer first to publish pins.',
      next: 'developer',
    };
  }
  if (!existing.coderAllowed) {
    coderDebug('blocked — coder not allowed', existing, 'error');
    return { ok: false, error: 'coder_not_allowed', contract: existing, next: 'developer' };
  }
  coderDebug('acknowledging pins and recording work', {
    pins: existing.pins,
    implemented,
    blockers,
  });
  const contract = coderAcknowledge({ implemented, blockers });
  bridgeDebug('coder finished', { stage: contract.stage, deployReady: contract.deployReady });
  return { ok: true, contract, pins: existing.pins, next: blockers.length ? 'fix' : 'smoke' };
}

/** Final deployment readiness (smoke result from CI or local) */
export function runSmoke({ ok, detail = '' }) {
  bridgeDebug('smoke result', { ok, detail });
  const contract = setSmokeResult({ ok, detail });
  return {
    ok,
    contract,
    deploy: ok ? 'allowed' : 'blocked',
    message: ok
      ? 'Deploy allowed — pins + coder + smoke aligned'
      : 'Deploy blocked — fix smoke before release',
  };
}

export function whatShouldCoderBuild() {
  const c = readContract();
  if (!c) {
    return { ready: false, instruction: 'Wait for Developer to publish pins.' };
  }
  return {
    ready: !!c.coderAllowed,
    pins: c.pins || DEFAULT_PINS,
    env: c.env,
    instruction:
      'Implement features using ONLY these dependency versions. Do not upgrade FastAPI/Starlette.',
    deployReady: !!c.deployReady,
    stage: c.stage,
  };
}
