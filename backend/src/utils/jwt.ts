import jwt from 'jsonwebtoken';
import type { Role } from '../types.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export function signToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return jwt.verify(token, secret) as JwtPayload;
}
