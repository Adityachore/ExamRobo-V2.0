import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_TTL || '4h' });
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function tokenFromRequest(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Role gate. A missing token and a wrong-role token are both 401, so one
// role's session can never satisfy the other role's routes.
export function requireRole(role) {
  return (req, res, next) => {
    const user = verifyToken(tokenFromRequest(req));
    if (!user || user.role !== role) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  };
}

export const requireStudent = requireRole('student');
export const requireAdmin = requireRole('admin');

export function requireUser(req, res, next) {
  const user = verifyToken(tokenFromRequest(req));
  if (!user || !['student', 'admin'].includes(user.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}
