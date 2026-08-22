import { Router } from 'express';
import { z } from 'zod';
import { HealthReport } from '../models/HealthReport.js';
import { User } from '../models/User.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import type { AuthRequest } from '../types.js';
import { writeAudit } from '../services/auditService.js';
import { analyzeReport } from '../services/analyticsClient.js';
import { notifyUser } from '../services/notificationService.js';

const router = Router();

const reportSchema = z.object({
  symptoms: z.array(z.string()).min(1),
  severity: z.enum(['Mild', 'Moderate', 'Severe']),
  onsetAt: z.string().datetime(),
  hostel: z.string().min(1).max(80),
  block: z.string().min(1).max(80),
  exposure: z.object({
    meal: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'None', 'Not sure']).default('Not sure'),
    mess: z.string().max(120).optional().default(''),
    foodItems: z.array(z.string()).optional().default([]),
    waterSource: z.string().max(120).optional().default(''),
    events: z.array(z.string()).optional().default([]),
    places: z.array(z.string()).optional().default([]),
    notes: z.string().max(1000).optional().default(''),
  }),
});

router.post('/', requireAuth, requireRoles('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const body = reportSchema.parse(req.body);
    const report = await HealthReport.create({ ...body, studentId: req.user!.id, onsetAt: new Date(body.onsetAt) });
    const recentReports = await HealthReport.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).lean();
    const analytics = await analyzeReport({ report: report.toObject(), recentReports });
    report.analyticsSummary = analytics;
    await report.save();

    await notifyUser(req.user!.id, 'Report submitted successfully', 'Your health report was received and is available in your history.', 'STUDENT_ADVISORY', { reportId: report._id });
    await writeAudit(req, 'REPORT_CREATE', 'HealthReport', report._id.toString(), { severity: body.severity });
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});

router.get('/my', requireAuth, requireRoles('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const reports = await HealthReport.find({ studentId: req.user!.id }).sort({ createdAt: -1 }).lean();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

router.get('/', requireAuth, requireRoles('HEALTH_ADMIN', 'SYSTEM_ADMIN'), async (_req, res, next) => {
  try {
    const reports = await HealthReport.find().sort({ createdAt: -1 }).limit(250).lean();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

router.get('/public-health', requireAuth, requireRoles('PUBLIC_HEALTH_VIEWER', 'HEALTH_ADMIN', 'SYSTEM_ADMIN'), async (_req, res, next) => {
  try {
    const byHostel = await HealthReport.aggregate([{ $group: { _id: '$hostel', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const bySeverity = await HealthReport.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]);
    res.json({ byHostel, bySeverity });
  } catch (error) {
    next(error);
  }
});

export default router;
