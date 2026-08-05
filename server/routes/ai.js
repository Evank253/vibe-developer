import { Router } from 'express';
import aiService from '../services/ai/index.js';
import projectService from '../services/projectService.js';
import { detectLanguage } from '../services/ai/languages.js';

const router = Router();

// Copilot chat
router.post('/chat', async (req, res) => {
  try {
    const { messages, provider } = req.body;
    const prov = aiService.getProvider(provider);
    const result = await prov.chat(messages || []);
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Review all code in a project
router.post('/review', async (req, res) => {
  try {
    const { projectId, provider } = req.body;
    const ws = projectService.getWorkspace(projectId);
    const files = projectService.listFiles(ws.dir)
      .filter(f => f.isText && f.contentPreview)
      .map(f => ({ path: f.path, content: f.contentPreview, language: f.language }));

    const prov = aiService.getProvider(provider);
    const result = await prov.reviewCode(files);
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Fix code in a project (writes fixes back)
router.post('/fix', async (req, res) => {
  try {
    const { projectId, provider } = req.body;
    const ws = projectService.getWorkspace(projectId);
    const files = projectService.listFiles(ws.dir)
      .filter(f => f.isText && f.contentPreview && f.size < 300000)
      .map(f => ({ path: f.path, content: f.contentPreview, language: f.language }));

    const prov = aiService.getProvider(provider);
    const result = await prov.fixCode(files);
    for (const fixed of result.fixed || []) {
      projectService.writeFileText(projectId, fixed.path, fixed.content);
    }
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Generate code from natural language
router.post('/generate', async (req, res) => {
  try {
    const { description, language, provider } = req.body;
    const prov = aiService.getProvider(provider);
    const result = await prov.generateCode(description || 'a simple program', { language });
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Generate + write into a project
router.post('/generate/add', async (req, res) => {
  try {
    const { projectId, description, language, provider } = req.body;
    const prov = aiService.getProvider(provider);
    const result = await prov.generateCode(description || 'a simple program', { language });
    projectService.writeFileText(projectId, result.fileName, result.code);
    res.json({ ...result, written: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Detect & add missing standard files
router.post('/add-missing', async (req, res) => {
  try {
    const { projectId, provider, name } = req.body;
    const ws = projectService.getWorkspace(projectId);
    const files = projectService.listFiles(ws.dir)
      .map(f => ({ path: f.path, content: f.isText ? f.contentPreview : '' }));

    const prov = aiService.getProvider(provider);
    const result = await prov.addMissingCode({ name: name || 'my-project', files });
    for (const f of result.added || []) {
      if (!projectService.listFiles(ws.dir).some(x => x.path === f.path)) {
        projectService.writeFileText(projectId, f.path, f.content || '');
      }
    }
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
