/**
 * HTTP surface for Developer ↔ Coder bridge (Express).
 * Optional — agents can also import services directly.
 */
import { Router } from 'express';
import {
  status,
  runDeveloper,
  runCoder,
  runSmoke,
  whatShouldCoderBuild,
} from '../services/vibeBridge.js';
import { recentDebug } from '../services/vibeDebugger.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json(status());
});

router.get('/coder/brief', (_req, res) => {
  res.json(whatShouldCoderBuild());
});

router.get('/debug', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  res.json({ entries: recentDebug(limit) });
});

router.post('/developer', (req, res) => {
  try {
    res.json(runDeveloper(req.body || {}));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/coder', (req, res) => {
  try {
    const out = runCoder(req.body || {});
    res.status(out.ok ? 200 : 409).json(out);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/smoke', (req, res) => {
  try {
    const ok = !!(req.body && req.body.ok);
    res.json(runSmoke({ ok, detail: (req.body && req.body.detail) || '' }));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
