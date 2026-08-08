import { Router } from 'express';
import config from '../config.js';
import aiService, { availableProviders } from '../services/ai/index.js';

import githubRouter from './github.js';
import projectRouter from './project.js';
import aiRouter from './ai.js';
import deployRouter from './deploy.js';
import vibeBridgeRouter from './vibeBridge.js';

const router = Router();

router.use('/github', githubRouter);
router.use('/project', projectRouter);
router.use('/ai', aiRouter);
router.use('/deploy', deployRouter);
router.use('/vibe', vibeBridgeRouter);

// App metadata + provider settings
router.get('/info', (req, res) => {
  res.json({
    app: 'VibeDev',
    version: '1.0.0',
    providers: availableProviders(),
    activeProvider: aiService.defaultName,
    githubOAuthConfigured: Boolean(config.githubClientId && config.githubClientSecret),
    vibeBridge: true,
  });
});

router.get('/health', (req, res) => res.json({ ok: true }));

export default router;
