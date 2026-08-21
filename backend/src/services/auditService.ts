import { AuditLog } from '../models/AuditLog.js';
import type { AuthRequest } from '../types.js';

export async function writeAudit(req: AuthRequest, action: string, targetType?: string, targetId?: string, metadata?: unknown) {
  await AuditLog.create({
    actorId: req.user?.id,
    actorRole: req.user?.role,
    action,
    targetType,
    targetId,
    metadata,
    ipAddress: req.ip,
  });
}
