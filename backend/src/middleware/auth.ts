import type { NextFunction, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/jwt.js';
import type { AuthRequest, Role } from '../types.js';

export type { AuthRequest, Role } from '../types.js';

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new ApiError(401, 'Authentication required'));

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function requireRoles(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!allowedRoles.includes(req.user.role)) return next(new ApiError(403, 'Forbidden for this role'));
    next();
  };
}

export function requireRole(...allowedRoles: Role[]) {
  return requireRoles(...allowedRoles);
}
