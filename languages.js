import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './config.js';
import apiRouter from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure workspace + upload dirs exist
fs.mkdirSync(config.workspaceRoot, { recursive: true });
const UPLOAD_DIR = path.resolve(__dirname, '../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads (optional for previewing)
app.use('/uploads', express.static(UPLOAD_DIR));

// API routes
app.use('/api', apiRouter);

// Serve built React client in production
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// Health + info
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'VibeDev', version: '1.0.0', time: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

app.listen(config.port, () => {
  console.log(`\n  ⚡ VibeDev running  →  http://localhost:${config.port}`);
  console.log(`  AI provider: ${config.ai.activeProvider}`);
  console.log(`  Workspace:   ${config.workspaceRoot}\n`);
});
