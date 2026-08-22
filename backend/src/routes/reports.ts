import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Report } from '../models/Report.js';
import { analyzeReport } from '../services/analyticsClient.js';
import { normalizeSymptomsText } from '../services/geminiService.js';

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

  const { symptoms, ...rest } = parsed.data;
  const normalized = await normalizeSymptomsText(symptoms);

  const report = await Report.create({
    studentId: req.user?.id,
    symptoms,
    ...rest,
    normalizedSymptoms: normalized.symptoms,
    syndrome: normalized.syndrome,
    normalizationStatus: normalized.status,
    onsetDateTime: new Date(parsed.data.onsetDateTime),
  });

  const recentReports = await Report.find({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  }).lean();

  const analyticsSummary = await analyzeReport({
    report: report.toObject(),
    recentReports,
  });

  await Report.findByIdAndUpdate(report._id, { analyticsSummary }, { new: true });

  return res.status(201).json({
    message: 'Report submitted successfully.',
    report,
    normalization: { status: normalized.status, syndrome: normalized.syndrome, symptoms: normalized.symptoms },
    analytics: analyticsSummary,
  });
});

export default reportsRouter;
