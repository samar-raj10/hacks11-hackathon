<<<<<<< HEAD
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User, type UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export const signToken = (userId: string, role: UserRole, email: string, name: string) => {
  const secret = process.env.JWT_SECRET ?? 'local-dev-secret';
  return jwt.sign({ userId, role, email, name }, secret, { expiresIn: '7d' });
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const secret = process.env.JWT_SECRET ?? 'local-dev-secret';
    const decoded = jwt.verify(token, secret) as { userId: string; role: UserRole; email: string; name: string };

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account is invalid or inactive.' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }

    next();
  };
};
=======
import type { NextFunction, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/jwt.js';
import type { AuthRequest, Role } from '../types.js';

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
>>>>>>> 1e5f83279ff54e951d1ab9e6405460b3e20949de
