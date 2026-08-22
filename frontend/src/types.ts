export type UserRole = 'STUDENT' | 'HEALTH_ADMIN' | 'FACILITY_MANAGER' | 'SYSTEM_ADMIN';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hostel?: string;
  block?: string;
  mess?: string;
  waterSource?: string;
  meal?: string;
  phone?: string;
  isActive?: boolean;
};

export type AuthResponse = {
  token: string;
  user: AppUser;
  message?: string;
};

export type DashboardPayload = {
  role: UserRole | string;
  overview?: Record<string, any>;
  stats?: Array<Record<string, any>>;
  alerts?: Array<Record<string, any>>;
  advisories?: Array<Record<string, any>>;
  notifications?: Array<Record<string, any>>;
  reports?: Array<Record<string, any>>;
  message?: string;
  [key: string]: any;
};
