import { existsSync } from 'node:fs';
import { createSebGate, sebSettings } from '../services/seb.js';

export function requireSEB(req, res, next) {
  const { required, key } = sebSettings();
  return createSebGate({ required, key })(req, res, next);
}

export function sebStatus(req, res) {
  const { required, configured, file, startUrl } = sebSettings();
  const ready = !!configured && existsSync(file);
  res.json({
    required,
    configured: ready,
    verified: !!req.seb?.verified,
    download_available: ready,
    start_url: startUrl || null,
  });
}
