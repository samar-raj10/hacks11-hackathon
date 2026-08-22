import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, loginUser, registerUser } from '../lib/api';
import type { AppUser, AuthResponse } from '../types';

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    hostel?: string;
    block?: string;
    mess?: string;
    waterSource?: string;
    meal?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('campusshield_token');
    const storedUser = localStorage.getItem('campusshield_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const persistSession = (auth: AuthResponse) => {
    localStorage.setItem('campusshield_token', auth.token);
    localStorage.setItem('campusshield_user', JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
  };

  const login = async (email: string, password: string) => {
    const auth = await loginUser(email, password);
    persistSession(auth);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    hostel?: string;
    block?: string;
    mess?: string;
    waterSource?: string;
    meal?: string;
  }) => {
    const auth = await registerUser(payload);
    persistSession(auth);
  };

  const refreshUser = async () => {
    if (!token) return;

    const response = await getCurrentUser(token);
    if (response.user) {
      setUser(response.user);
      localStorage.setItem('campusshield_user', JSON.stringify(response.user));
    }
  };

  const logout = () => {
    localStorage.removeItem('campusshield_token');
    localStorage.removeItem('campusshield_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), loading, login, register, logout, refreshUser }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
