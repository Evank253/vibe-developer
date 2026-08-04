import { Router } from 'express';
import github from './github.js';
import project from './project.js';
import ai from './ai.js';
import deploy from './deploy.js';

const router = Router();

router.get('/info', (req, res) => {
  res.json({
    name: 'VibeDev',
    version: '1.0.0',
    description: 'AI super-developer API'
  });
});

router.use('/github', github);
router.use('/project', project);
router.use('/ai', ai);
router.use('/deploy', deploy);

export default router;
