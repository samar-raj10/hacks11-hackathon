import { Router } from 'express';
import { z } from 'zod';
import { Advisory } from '../models/Advisory.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import type { AuthRequest } from '../types.js';
import { writeAudit } from '../services/auditService.js';

const router = Router();

const advisorySchema = z.object({
  title: z.string().min(3).max(160),
  message: z.string().min(10).max(2000),
  severity: z.enum(['INFO', 'WATCH', 'SUSPICIOUS', 'HIGH_RISK']).default('INFO'),
  targetRoles: z.array(z.string()).default(['STUDENT']),
  targetHostel: z.string().optional().default(''),
  targetBlock: z.string().optional().default(''),
});

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const role = req.user!.role;
    const advisories = await Advisory.find({
      isActive: true,
      $or: [{ targetRoles: role }, { targetRoles: { $size: 0 } }],
    }).sort({ createdAt: -1 }).lean();
    res.json({ advisories });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, requireRoles('HEALTH_ADMIN', 'SYSTEM_ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const body = advisorySchema.parse(req.body);
    const advisory = await Advisory.create({ ...body, createdBy: req.user!.id });
    const users = await User.find({ role: { $in: body.targetRoles }, isActive: true }).select('_id').lean();
    await Notification.insertMany(users.map((user) => ({
      userId: user._id,
      type: body.targetRoles.includes('STUDENT') ? 'STUDENT_ADVISORY' : 'SYSTEM_NOTIFICATION',
      title: body.title,
      message: body.message,
      metadata: { advisoryId: advisory._id },
    })));
    await writeAudit(req, 'ADVISORY_CREATE', 'Advisory', advisory._id.toString(), { targetedUsers: users.length });
    res.status(201).json({ advisory, targetedUsers: users.length });
  } catch (error) {
    next(error);
  }
});

export default router;
