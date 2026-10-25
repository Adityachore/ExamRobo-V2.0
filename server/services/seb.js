import crypto from 'node:crypto';
import path from 'node:path';

export const SEB_HEADER = 'x-safeexambrowser-configkeyhash';
export const SEB_KEY_RE = /^[a-f0-9]{64}$/i;

export function normalizeSebKey(value) {
  const key = String(value || '').trim().toLowerCase();
  return SEB_KEY_RE.test(key) ? key : null;
}

export function sebAbsoluteUrl(req) {
  const protocol = req.protocol || 'http';
  const host = req.get?.('host') || req.headers?.host || 'localhost';
  const original = req.originalUrl || req.url || '/';
  return `${protocol}://${host}${original}`;
}

export function sebHash(url, key) {
  return crypto.createHash('sha256').update(`${url}${key}`, 'utf8').digest('hex');
}

function equalHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function sebHeader(req) {
  const value = req.get?.(SEB_HEADER) ?? req.headers?.[SEB_HEADER];
  return String(Array.isArray(value) ? value[0] : value || '').trim().toLowerCase();
}

export function verifySebRequest(req, key) {
  const expected = normalizeSebKey(key);
  const received = sebHeader(req);
  if (!expected || !SEB_KEY_RE.test(received)) return false;
  return equalHex(received, sebHash(sebAbsoluteUrl(req), expected));
}

export function sebSettings() {
  const required = String(process.env.SEB_REQUIRED || '').toLowerCase() === 'true';
  const key = normalizeSebKey(process.env.SEB_CONFIG_KEY);
  return {
    required,
    key,
    configured: !!key,
    file: process.env.SEB_CONFIG_FILE || path.join(process.cwd(), 'assets', 'exam.seb'),
    startUrl: process.env.SEB_START_URL || '',
  };
}

export function createSebGate({ required = false, key = null } = {}) {
  const expected = normalizeSebKey(key);
  return (req, res, next) => {
    const verified = expected ? verifySebRequest(req, expected) : false;
    req.seb = { required: !!required, configured: !!expected, verified };

    if (!required) return next();
    if (!expected) {
      return res.status(503).json({
        error: 'Safe Exam Browser is required but the server is not configured.',
        code: 'seb_not_configured',
        seb_required: true,
      });
    }
    if (!verified) {
      return res.status(403).json({
        error: 'This exam must be opened in Safe Exam Browser.',
        code: 'seb_required',
        seb_required: true,
      });
    }
    next();
  };
}
