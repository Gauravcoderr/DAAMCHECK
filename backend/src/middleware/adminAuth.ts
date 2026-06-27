import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'daamcheck-admin-secret-change-in-prod';

// Token format: base64(username:timestamp) + '.' + hmac-sha256(payload, ADMIN_SECRET)
export function createAdminToken(username: string): string {
  const payload = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return false;

  const payload = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  if (!payload || !sig) return false;

  const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');

  // Lengths must match before timingSafeEqual to avoid RangeError
  if (sig.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7); // strip 'Bearer '
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
