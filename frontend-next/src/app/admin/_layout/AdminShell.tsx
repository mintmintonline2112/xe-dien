'use client';

/**
 * Khung trang admin sau đăng nhập: kiểm tra phiên, sidebar, thanh đầu trang (tiêu đề, chuông thông báo, xem website, đăng xuất).
 * Dùng bởi: app/admin/(protected)/layout.tsx.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import { AdminIcon } from '@/app/admin/_components/AdminIcon';
import { NotificationsBell } from '@/app/admin/_components/NotificationsBell';
import { AdminSidebar } from './AdminSidebar';
import { getAdminPageTitle } from './navigation';
import { adminRoutes } from '@/config/routes';

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isReady, refreshCurrentUser, logout } = useAdminAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void refreshCurrentUser().then((currentUser) => {
      if (isMounted && !currentUser) router.replace(adminRoutes.login);
    });
    return () => {
      isMounted = false;
    };
  }, [refreshCurrentUser, router]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
    router.replace(adminRoutes.login);
    router.refresh();
  }, [logout, router]);

  if (!isReady || !user) {
    return (
      <div className="admin-auth-loading" role="status">
        <span className="admin-loader" />
        <p>Đang xác thực phiên đăng nhập…</p>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <AdminSidebar isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button
              className="admin-icon-button admin-mobile-menu"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Mở menu quản trị"
            >
              <AdminIcon name="menu" />
            </button>
            <span>
              <small>Xe Điện Xanh CMS</small>
              <strong>{getAdminPageTitle(pathname)}</strong>
            </span>
          </div>
          <div className="admin-topbar-actions">
            <NotificationsBell />
            <Link className="admin-site-link" href="/" target="_blank">
              Xem website
              <AdminIcon name="external" />
            </Link>
            <button
              className="admin-icon-button"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Đăng xuất"
              title="Đăng xuất"
            >
              <AdminIcon name="logout" />
            </button>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
