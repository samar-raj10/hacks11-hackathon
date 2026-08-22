import { Router } from 'express';

import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { Advisory } from '../models/Advisory.js';
import { HealthReport } from '../models/HealthReport.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { buildHeatmapData, buildMessExposureAlerts, buildMessHeatmapData } from '../services/heatmapService.js';

const dashboardRouter = Router();

const getRiskLevel = (count: number) => {
  if (count >= 18) return 'HIGH';
  if (count >= 8) return 'SUSPICIOUS';
  if (count >= 3) return 'WATCH';
  return 'LOW';
};

dashboardRouter.get('/student', requireAuth, requireRole('STUDENT'), async (req: AuthRequest, res) => {
  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const currentUser = await User.findById(req.user?.id);
  const recentReports = await HealthReport.find({ studentId: req.user?.id }).sort({ createdAt: -1 }).limit(5).lean();
  const advisories = await Advisory.find({ isActive: true, $or: [{ targetRoles: 'STUDENT' }, { targetRoles: { $size: 0 } }] }).sort({ createdAt: -1 }).limit(5).lean();
  const notifications = await Notification.find({ userId: req.user?.id }).sort({ createdAt: -1 }).limit(5).lean();

  const data = {
    role: 'STUDENT',
    overview: {
      totalStudents,
      campusHealth: recentReports.length ? 'Monitoring' : 'Stable',
      advisories: advisories.length,
      openReports: recentReports.length,
    },
    reports: recentReports,
    advisories,
    notifications: notifications.length > 0 ? notifications : [{ id: 'n-1', title: 'No active alerts', message: 'Your hostel is currently stable. Continue reporting any new symptoms.', createdAt: new Date().toISOString() }],
    profile: {
      name: currentUser?.name ?? 'Student',
      hostel: currentUser?.hostel ?? 'Not specified',
      block: currentUser?.block ?? 'Not specified',
      mess: currentUser?.mess ?? 'Not specified',
      waterSource: currentUser?.waterSource ?? 'Not specified',
    },
    message: recentReports.length ? 'Recent reports are being monitored for cluster and source review.' : 'No recent reports. Student health remains stable and reporting is encouraged.',
  };

  return res.json(data);
});

dashboardRouter.get('/health-admin', requireAuth, requireRole('HEALTH_ADMIN'), async (req: AuthRequest, res) => {
  const windowMs = 24 * 60 * 60 * 1000;
  const recentReports = await HealthReport.find({ createdAt: { $gte: new Date(Date.now() - windowMs) } }).sort({ createdAt: -1 }).lean();
  const allReports = await HealthReport.find().sort({ createdAt: -1 }).lean();
  const heatmap = buildHeatmapData(allReports, 24);
  const messHeatmap = buildMessHeatmapData(allReports, 24);
  const messAlerts = buildMessExposureAlerts(allReports, 24);
  const advisories = await Advisory.find({ isActive: true, $or: [{ targetRoles: 'HEALTH_ADMIN' }, { targetRoles: { $size: 0 } }] }).sort({ createdAt: -1 }).limit(10).lean();
  const notifications = await Notification.find({ userId: req.user?.id }).sort({ createdAt: -1 }).limit(10).lean();
  const activeClusters = heatmap.filter((cell) => cell.riskLevel === 'HIGH' || cell.riskLevel === 'SUSPICIOUS').length;
  const risk = getRiskLevel(recentReports.length);

  const analyticsFallback = {
    overallRisk: risk,
    suspectedExposureRanking: messAlerts.slice(0, 3),
    evidence: recentReports.length > 0 ? ['Recent report clustering', 'Shared meal exposure overlap', 'Block-level concentration'] : ['No cluster activity yet'],
    trend: recentReports.length > 10 ? 'Escalating' : 'Stable',
  };

  const analyticsFromReports = allReports
    .map((report) => report.analyticsSummary)
    .filter((value) => value && typeof value === 'object')
    .pop();

  const analytics = (analyticsFromReports && typeof analyticsFromReports === 'object') ? analyticsFromReports : analyticsFallback;

  const auditNotifications = notifications.length > 0 ? notifications : [{
    id: 'ha-1',
    title: 'Early warning review',
    message: risk === 'HIGH' ? 'Multiple exposure signals are clustering in the same timeframe.' : 'No critical cluster has been detected yet.',
    createdAt: new Date().toISOString(),
  }];

  return res.json({
    role: 'HEALTH_ADMIN',
    overview: {
      totalCases: allReports.length,
      activeCases: recentReports.length,
      activeClusters,
      campusRisk: analytics.overallRisk ?? risk,
      suspectedSources: messAlerts.length,
      advisories: advisories.length,
    },
    stats: [
      { label: 'Total reports', value: allReports.length },
      { label: 'Recent cases', value: recentReports.length },
      { label: 'High-risk blocks', value: heatmap.filter((cell) => cell.riskLevel === 'HIGH').length },
      { label: 'Suspected messes', value: messAlerts.length },
      { label: 'Advisories', value: advisories.length },
    ],
    alerts: messAlerts.slice(0, 5),
    advisories,
    notifications: auditNotifications,
    heatmap,
    messHeatmap,
    analytics,
    cases: recentReports,
    clusters: heatmap.filter((cell) => cell.riskLevel !== 'NORMAL').slice(0, 5),
    exposures: messAlerts.slice(0, 5),
    sources: messAlerts.slice(0, 5),
    message: 'Block and mess heatmaps reflect recent illness clusters, shared meal exposure, and source-level risk signals.',
  });
});

dashboardRouter.get('/facility', requireAuth, requireRole('FACILITY_MANAGER'), async (_req: AuthRequest, res) => {
  const reports = await HealthReport.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).sort({ createdAt: -1 }).lean();
  const alerts = buildMessExposureAlerts(reports, 168);

  return res.json({
    role: 'FACILITY_MANAGER',
    alerts,
    actions: [],
    messAlerts: alerts,
    waterAlerts: [],
    facilityAlerts: [],
    correctiveActions: [],
    message: 'Mess exposure alerts are based on shared meal and block-level report patterns.',
  });
});

dashboardRouter.get('/system-admin', requireAuth, requireRole('SYSTEM_ADMIN'), async (_req: AuthRequest, res) => {
  const totalUsers = await User.countDocuments({});
  return res.json({
    role: 'SYSTEM_ADMIN',
    overview: {
      totalUsers,
      totalRoles: 4,
      hostels: 0,
      blocks: 0,
      waterSources: 0,
    },
    users: [],
    hostels: [],
    blocks: [],
    messes: [],
    waterSources: [],
    auditLogs: [],
    message: 'No data available',
  });
});

export default dashboardRouter;
