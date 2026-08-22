import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Report } from '../models/Report.js';

const reportsRouter = Router();

const reportSchema = z.object({
  symptoms: z.string().min(3, 'Symptoms are required.'),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).default('MODERATE'),
  onsetDateTime: z.string().or(z.date()),
  hostel: z.string().optional(),
  block: z.string().optional(),
  meal: z.string().optional(),
  mess: z.string().optional(),
  waterSource: z.string().optional(),
  otherExposureInfo: z.string().optional(),
});

reportsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const reports = await Report.find({ studentId: req.user?.id }).sort({ createdAt: -1 });
  return res.json({ reports });
});

reportsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = reportSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid report payload.' });
  }

  const report = await Report.create({
    studentId: req.user?.id,
    ...parsed.data,
    onsetDateTime: new Date(parsed.data.onsetDateTime),
  });

  return res.status(201).json({ message: 'Report submitted successfully.', report });
});

export default reportsRouter;
