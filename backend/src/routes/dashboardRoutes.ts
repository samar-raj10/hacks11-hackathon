import { Router } from 'express';
import { HealthReport } from '../models/HealthReport.js';
import { Advisory } from '../models/Advisory.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

function riskFromCases(activeCases: number) {
  if (activeCases >= 25) return 'HIGH_CONFIDENCE';
  if (activeCases >= 12) return 'SUSPICIOUS';
  if (activeCases >= 5) return 'WATCH';
  return 'NORMAL';
}

router.get('/student', requireAuth, requireRoles('STUDENT'), async (req: any, res, next) => {
  try {
    const myReports = await HealthReport.find({ studentId: req.user.id }).sort({ createdAt: -1 }).limit(5).lean();
    const advisories = await Advisory.find({ isActive: true, $or: [{ targetRoles: 'STUDENT' }, { targetRoles: { $size: 0 } }] }).sort({ createdAt: -1 }).limit(10).lean();
    const activeCases = await HealthReport.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    res.json({ campusRisk: riskFromCases(activeCases), activeCases, myReports, advisories });
  } catch (error) {
    next(error);
  }
});

router.get('/health-admin', requireAuth, requireRoles('HEALTH_ADMIN', 'SYSTEM_ADMIN'), async (_req, res, next) => {
  try {
    const totalCases = await HealthReport.countDocuments();
    const activeCases = await HealthReport.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const byHostel = await HealthReport.aggregate([{ $group: { _id: '$hostel', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const bySymptom = await HealthReport.aggregate([{ $unwind: '$symptoms' }, { $group: { _id: '$symptoms', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const recent = await HealthReport.find().sort({ createdAt: -1 }).limit(10).lean();
    res.json({ totalCases, activeCases, activeClusters: activeCases >= 5 ? 1 : 0, campusRisk: riskFromCases(activeCases), suspectedSources: [], byHostel, bySymptom, recent });
  } catch (error) {
    next(error);
  }
});

router.get('/facility', requireAuth, requireRoles('FACILITY_MANAGER', 'SYSTEM_ADMIN'), async (_req, res) => {
  res.json({ alerts: [], actionsRequired: 0, message: 'Facility workflow ready; corrective action storage is next implementation step.' });
});

router.get('/system-admin', requireAuth, requireRoles('SYSTEM_ADMIN'), async (_req, res) => {
  res.json({ status: 'ok', message: 'System admin endpoints are protected and ready for user/infrastructure management.' });
});

export default router;
