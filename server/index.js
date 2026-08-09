import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import config, { validateEnv } from './config.js';
import apiRouter from './routes/index.js';
import { developerPublish } from './services/vibeContract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Environment validation (fail fast) ---
const { errors, warnings } = validateEnv();
for (const w of warnings) console.warn(`[config] ⚠ ${w}`);
if (errors.length) {
  console.error('[config] Invalid environment:');
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

// Ensure workspace + upload dirs exist
fs.mkdirSync(config.workspaceRoot, { recursive: true });
const UPLOAD_DIR = path.resolve(__dirname, '../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();

// Trust proxy when behind Render/Heroku/etc.
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS — open in dev, restricted in production when CORS_ORIGIN is set
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true
  })
);

// Request ID for tracing
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
});

// Structured request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (req.path === '/api/health') return;
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'request',
        id: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms
      })
    );
  });
  next();
});

// Rate limiting (API only)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(UPLOAD_DIR));

// API routes
app.use('/api', apiRouter);

// Health
app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    app: 'VibeDev',
    version: '1.0.0',
    time: new Date().toISOString(),
    requestId: req.requestId
  })
);

// Serve built React client in production
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// Centralized error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(
    JSON.stringify({
      level: 'error',
      msg: err.message,
      id: req.requestId,
      stack: config.env === 'development' ? err.stack : undefined
    })
  );
  res.status(status).json({
    error: err.message || 'Internal error',
    requestId: req.requestId
  });
});

app.listen(config.port, () => {
  console.log(`\n  ⚡ VibeDev running  →  http://localhost:${config.port}`);
  console.log(`  AI provider: ${config.ai.activeProvider}`);
  console.log(`  Workspace:   ${config.workspaceRoot}`);
  console.log(`  Env:         ${config.env}\n`);

  // "Developer runs first": publish the dependency contract as soon as this
  // server is up, so any Coder (e.g. Kronos-Vibe-Coder) polling
  // /api/vibe/coder/brief can proceed without a manual API call. Opt out
  // with VIBE_AUTO_PUBLISH=false if you want to publish pins manually via
  // POST /api/vibe/developer instead (e.g. with custom pins).
  if (process.env.VIBE_AUTO_PUBLISH !== 'false') {
    const contract = developerPublish({ notes: 'auto-published on Vibe Developer startup' });
    console.log(`  📦 Dependency contract published: ${JSON.stringify(contract.pins)}\n`);
  }
});
