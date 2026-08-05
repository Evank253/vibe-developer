import { Router } from 'express';
import projectService from '../services/projectService.js';
import { buildDeployPlan, summarizeDeploy } from '../services/deployService.js';

const router = Router();

// Generate a deploy plan (config files) for a project
router.post('/plan', (req, res) => {
  try {
    const { projectId, name, owner } = req.body;
    const ws = projectService.getWorkspace(projectId);
    const files = projectService.listFiles(ws.dir).map(f => ({ path: f.path, content: f.contentPreview }));
    const plan = buildDeployPlan({ name: name || 'my-app', files }, { owner });
    res.json(plan);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Write the generated deploy config files into the project workspace
router.post('/apply', (req, res) => {
  try {
    const { projectId, generatedFiles } = req.body;
    for (const f of generatedFiles || []) {
      projectService.writeFileText(projectId, f.path, f.content);
    }
    const ws = projectService.getWorkspace(projectId);
    res.json({ ok: true, files: projectService.listFiles(ws.dir) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
