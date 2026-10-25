import { existsSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { sebStatus } from '../middleware/seb.js';
import { sebSettings } from '../services/seb.js';

const router = Router();

router.get('/status', sebStatus);

router.get('/config', (req, res) => {
  const { configured, file } = sebSettings();
  if (!configured) {
    return res.status(503).json({
      error: 'Safe Exam Browser is not configured on this server.',
      code: 'seb_not_configured',
    });
  }

  const resolved = path.resolve(file);
  if (!existsSync(resolved)) {
    return res.status(503).json({
      error: 'The Safe Exam Browser configuration file is missing.',
      code: 'seb_config_missing',
    });
  }

  res.type('application/octet-stream');
  return res.download(resolved, 'exam.seb');
});

export default router;
