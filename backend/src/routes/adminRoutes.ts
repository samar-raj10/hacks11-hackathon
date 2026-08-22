import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import type { AuthRequest } from '../types.js';
import { roles } from '../types.js';
import { writeAudit } from '../services/auditService.js';

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(roles),
  hostel: z.string().optional().default(''),
  block: z.string().optional().default(''),
});

router.get('/users', requireAuth, requireRoles('SYSTEM_ADMIN'), async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.post('/users', requireAuth, requireRoles('SYSTEM_ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({ ...body, email: body.email.toLowerCase(), passwordHash });
    await writeAudit(req, 'USER_CREATE', 'User', user._id.toString(), { role: body.role });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', requireAuth, requireRoles('SYSTEM_ADMIN'), async (_req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

export default router;
