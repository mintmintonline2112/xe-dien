'use client';

/**
 * Context đăng nhập của admin: người dùng hiện tại, đăng nhập / đăng xuất / làm mới phiên, kiểm tra quyền và module.
 * Dùng bởi: app/admin/layout.tsx (bọc), useAdminAuth trong AdminShell, AdminSidebar, LoginScreen, DashboardScreen.
 * Lưu ý: tài khoản loại `admin` có mọi quyền; quyền so khớp không phân biệt hoa thường.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { adminApi } from '@/app/admin/_lib/admin-api';
import { clearStoredUser, getStoredUser, setStoredUser } from '@/app/admin/_lib/session';
import type { AdminUser, AuthResponse, LoginCredentials } from '@/app/admin/_lib/types';

interface AuthContextValue {
  user: AdminUser | null;
  isReady: boolean;
  login: (credentials: LoginCredentials) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<AdminUser | null>;
  hasPermission: (code: string) => boolean;
  hasModule: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const storeUser = useCallback((nextUser: AdminUser | null) => {
    setUser(nextUser);
    setStoredUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await adminApi.post<AuthResponse>(
        '/admin/auth/login-staff',
        credentials,
      );
      storeUser(response.user);
      setIsReady(true);
      return response.user;
    },
    [storeUser],
  );

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/admin/auth/logout');
    } catch {
    } finally {
      clearStoredUser();
      setUser(null);
      setIsReady(true);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const response = await adminApi.get<AuthResponse>('/admin/auth/me');
      storeUser(response.user);
      return response.user;
    } catch {
      storeUser(null);
      return null;
    } finally {
      setIsReady(true);
    }
  }, [storeUser]);

  const permissions = useMemo(
    () => new Set((user?.permissions ?? []).map((code) => code.toUpperCase())),
    [user],
  );
  const modules = useMemo(
    () => new Set((user?.modules ?? []).map((module) => module.toLowerCase())),
    [user],
  );

  const hasPermission = useCallback(
    (code: string) =>
      user?.type?.toLowerCase() === 'admin' || permissions.has(code.toUpperCase()),
    [permissions, user?.type],
  );
  const hasModule = useCallback(
    (moduleName: string) =>
      user?.type?.toLowerCase() === 'admin' || modules.has(moduleName.toLowerCase()),
    [modules, user?.type],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login,
      logout,
      refreshCurrentUser,
      hasPermission,
      hasModule,
    }),
    [user, isReady, login, logout, refreshCurrentUser, hasPermission, hasModule],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside AuthProvider');
  }
  return context;
}
