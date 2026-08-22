import { Router } from 'express';

import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const dashboardRouter = Router();

const buildEmptyDashboard = (role: string) => ({
  role,
  overview: {
    totalCases: 0,
    activeCases: 0,
    activeClusters: 0,
    campusRisk: 'LOW',
    suspectedSources: 0,
  },
  stats: [],
  alerts: [],
  advisories: [],
  notifications: [],
  reports: [],
  recentActivity: [],
  message: 'No data available',
});

dashboardRouter.get('/student', requireAuth, requireRole('STUDENT'), async (_req: AuthRequest, res) => {
  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const currentUser = await User.findById(_req.user?.id);

  const data = {
    role: 'STUDENT',
    overview: {
      totalStudents,
      campusHealth: 'Stable',
      advisories: 0,
      openReports: 0,
    },
    reports: currentUser ? [] : [],
    advisories: [],
    notifications: [{ id: 'n-1', title: 'New Health Advisory', message: 'No active advisory yet.', createdAt: new Date().toISOString() }],
    profile: {
      name: currentUser?.name ?? _req.user?.name ?? 'Student',
      hostel: currentUser?.hostel ?? 'Not specified',
      block: currentUser?.block ?? 'Not specified',
      mess: currentUser?.mess ?? 'Not specified',
      waterSource: currentUser?.waterSource ?? 'Not specified',
    },
    message: 'No data available',
  };

  return res.json(data);
});

dashboardRouter.get('/health-admin', requireAuth, requireRole('HEALTH_ADMIN'), async (_req: AuthRequest, res) => {
  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const totalAdmins = await User.countDocuments({ role: 'HEALTH_ADMIN' });

  return res.json({
    role: 'HEALTH_ADMIN',
    overview: {
      totalCases: totalStudents,
      activeCases: 0,
      activeClusters: 0,
      campusRisk: 'LOW',
      suspectedSources: 0,
    },
    stats: [],
    alerts: [],
    advisories: [],
    notifications: [{ id: 'ha-1', title: 'New Cluster Detected', message: 'No cluster has been detected yet.', createdAt: new Date().toISOString() }],
    cases: [],
    clusters: [],
    exposures: [],
    sources: [],
    totalStudents,
    totalAdmins,
    message: 'No data available',
  });
});

dashboardRouter.get('/facility', requireAuth, requireRole('FACILITY_MANAGER'), async (_req: AuthRequest, res) => {
  return res.json({
    role: 'FACILITY_MANAGER',
    alerts: [],
    actions: [],
    messAlerts: [],
    waterAlerts: [],
    facilityAlerts: [],
    correctiveActions: [],
    message: 'No data available',
  });
});

dashboardRouter.get('/system-admin', requireAuth, requireRole('SYSTEM_ADMIN'), async (_req: AuthRequest, res) => {
  const totalUsers = await User.countDocuments({});
  return res.json({
    role: 'SYSTEM_ADMIN',
    overview: {
      totalUsers,
      totalRoles: 5,
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

dashboardRouter.get('/public-health', requireAuth, requireRole('PUBLIC_HEALTH_VIEWER'), async (_req: AuthRequest, res) => {
  const studentCount = await User.countDocuments({ role: 'STUDENT' });
  return res.json({
    role: 'PUBLIC_HEALTH_VIEWER',
    overview: {
      caseTrends: 0,
      clusterCounts: 0,
      riskLevel: 'LOW',
      hostelTrends: 0,
      suspectedExposureCategories: 0,
    },
    studentCount,
    caseTrends: [],
    clusterCounts: [],
    hostelTrends: [],
    insights: [],
    message: 'No data available',
  });
});

export default dashboardRouter;
