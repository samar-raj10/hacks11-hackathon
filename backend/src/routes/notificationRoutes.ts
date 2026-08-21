import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthRequest } from '../types.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/read', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!.id }, { readAt: new Date() }, { new: true });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

export default router;
