import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';
import projectService from '../services/projectService.js';
import terminalService from '../services/terminalService.js';
import aiService from '../services/ai/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
  }),
  limits: { fileSize: config.upload.maxFileSize, files: config.upload.maxFiles }
});

const router = Router();

// Create a fresh project workspace (returns id)
router.post('/new', (req, res) => {
  const { name } = req.body || {};
  const ws = projectService.createWorkspace();
  res.json({ id: ws.id, name: name || 'Untitled project' });
});

// Upload a zip into a workspace
router.post('/:id/upload', upload.single('zip'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No zip file uploaded. Use field name "zip".' });
    const buffer = fs.readFileSync(req.file.path);
    const result = projectService.extractZip(req.params.id, buffer);
    fs.unlink(req.file.path, () => {});
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get project info + file tree
router.get('/:id', (req, res) => {
  try {
    const ws = projectService.getWorkspace(req.params.id);
    const files = projectService.listFiles(ws.dir);
    res.json({ id: req.params.id, fileCount: files.length, totalBytes: files.reduce((a, f) => a + f.size, 0), files });
  } catch (e) { res.status(404).json({ error: e.message }); }
});

// Read a single file's full content
router.get('/:id/file', (req, res) => {
  try {
    const content = projectService.readFileText(req.params.id, req.query.path);
    res.json({ content });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Write / create a file
router.post('/:id/file', (req, res) => {
  try {
    projectService.writeFileText(req.params.id, req.body.path, req.body.content);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// --- AI organization ---
router.post('/:id/organize', async (req, res) => {
  try {
    const ws = projectService.getWorkspace(req.params.id);
    const files = projectService.listFiles(ws.dir);
    const provider = aiService.getProvider(req.body.provider);
    const plan = await provider.organizeFiles(files);
    res.json(plan);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/:id/organize/apply', (req, res) => {
  try {
    const result = projectService.applyOrganization(req.params.id, req.body.plan);
    res.json({ ok: true, ...result });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// --- Terminal / GitBash ---
router.post('/:id/terminal', async (req, res) => {
  try {
    const result = await terminalService.runCommand({ id: req.params.id, command: req.body.command, cwd: req.body.cwd });
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/:id/terminal/suggest', (req, res) => {
  res.json({ command: terminalService.suggestCommand(req.body.intent) });
});

// Delete workspace
router.delete('/:id', (req, res) => {
  try {
    fs.rmSync(path.join(config.workspaceRoot, req.params.id), { recursive: true, force: true });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
