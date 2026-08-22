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
