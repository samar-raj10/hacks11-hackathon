import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

const rolePaths: Record<UserRole, string> = {
  STUDENT: '/student/dashboard',
  HEALTH_ADMIN: '/health-admin/dashboard',
  FACILITY_MANAGER: '/facility/dashboard',
  SYSTEM_ADMIN: '/system-admin/dashboard',
};

export function ProtectedRoute({
  allowedRole,
  children,
}: {
  allowedRole?: UserRole;
  children: ReactElement;
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-200">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={rolePaths[user.role]} replace />;
  }

  return children;
}
