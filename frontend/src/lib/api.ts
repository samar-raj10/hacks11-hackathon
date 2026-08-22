import type { AuthResponse, DashboardPayload } from '../types';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('campusshield_token');

export async function apiRequest<T>(path: string, options: RequestInit = {}, tokenOverride?: string): Promise<T> {
  const token = tokenOverride ?? getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed.');
  }

  return payload as T;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  hostel?: string;
  block?: string;
  mess?: string;
  waterSource?: string;
  meal?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(token?: string): Promise<{ user: any }> {
  return apiRequest<{ user: any }>('/auth/me', { method: 'GET' }, token);
}

export async function getDashboard(role: string, token?: string): Promise<DashboardPayload> {
  return apiRequest<DashboardPayload>(`/dashboard/${role}`, { method: 'GET' }, token);
}

export async function submitReport(payload: {
  symptoms: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  onsetDateTime: string;
  hostel?: string;
  block?: string;
  meal?: string;
  mess?: string;
  waterSource?: string;
  otherExposureInfo?: string;
}, token?: string): Promise<{ message: string; report?: any }> {
  return apiRequest<{ message: string; report?: any }>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export async function getReports(token?: string): Promise<{ reports: any[] }> {
  return apiRequest<{ reports: any[] }>('/reports', { method: 'GET' }, token);
}
