import type { Request } from 'express';

export const roles = ['STUDENT', 'HEALTH_ADMIN', 'FACILITY_MANAGER', 'SYSTEM_ADMIN'] as const;
export type Role = (typeof roles)[number];

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
