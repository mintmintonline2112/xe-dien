'use client';

/**
 * Chuông thông báo trên thanh đầu trang admin: tải 20 thông báo mới nhất mỗi phút, đánh dấu đã đọc, bấm thì mở trang liên quan.
 * Dùng bởi: app/admin/_layout/AdminShell.tsx.
 * Lưu ý: style nằm trong styles/admin.css (class `ntf-*`).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, FileText, Mail, Megaphone } from 'lucide-react';
import { adminApi } from '@/app/admin/_lib/admin-api';
import { cn } from '@/utils/cn';
import type { PaginatedResponse } from '@/app/admin/_lib/pagination';
import { adminRoutes } from '@/config/routes';

interface AppNotification {
  id: number;
  type: string;
  module: string;
  title: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  createdAt: string;
}

const NOTIFICATIONS_QUERY_KEY = ['admin', 'notifications'];

const MODULE_LINKS: Record<string, string> = {
  contact: adminRoutes.contacts,
  contacts: adminRoutes.contacts,
  admincontact: adminRoutes.contacts,
  quoterequests: adminRoutes.contacts,
  adminquoterequests: adminRoutes.contacts,
  products: adminRoutes.products.list,
  blogposts: adminRoutes.blogPosts.list,
  pages: adminRoutes.pages.list,
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  contact: <Mail size={15} />,
  contacts: <Mail size={15} />,
  admincontact: <Mail size={15} />,
  blogposts: <FileText size={15} />,
  pages: <FileText size={15} />,
};

function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function NotificationsBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () =>
      adminApi.get<PaginatedResponse<AppNotification>>(
        `admin/notifications?page=1&limit=20&orderBy=${encodeURIComponent(
          JSON.stringify([{ createdAt: 'DESC' }]),
        )}`,
      ),
    refetchInterval: 60_000,
  });

  const items = data?.data ?? [];
  const unreadItems = items.filter((notification) => !notification.is_read);

  async function markAllAsRead() {
    if (unreadItems.length === 0) return;
    try {
      await adminApi.patch('admin/notifications/mark-as-read', {
        ids: unreadItems.map((notification) => notification.id),
      });
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    } catch {
    }
  }

  async function openNotification(notification: AppNotification) {
    setIsOpen(false);
    if (!notification.is_read) {
      try {
        await adminApi.patch('admin/notifications/mark-as-read', { ids: [notification.id] });
        await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      } catch {
      }
    }
    const link =
      (notification.metadata?.link as string | undefined) ??
      MODULE_LINKS[notification.module?.toLowerCase?.() ?? ''] ??
      adminRoutes.dashboard;
    router.push(link);
  }

  return (
    <div className="ntf">
      <button
        type="button"
        className="ntf-btn"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-label="Thông báo"
      >
        <Bell size={18} />
        {unreadItems.length > 0 && (
          <span className="ntf-badge">{unreadItems.length > 9 ? '9+' : unreadItems.length}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="ntf-overlay" onClick={() => setIsOpen(false)} />
          <div className="ntf-pop">
            <div className="ntf-head">
              <span>Thông báo</span>
              {unreadItems.length > 0 && (
                <button type="button" className="ntf-clear" onClick={markAllAsRead}>
                  <CheckCheck size={13} /> Đánh dấu đã đọc
                </button>
              )}
            </div>
            <div className="ntf-list">
              {items.length === 0 ? (
                <p className="ntf-empty">Chưa có thông báo nào</p>
              ) : (
                items.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn('ntf-item', !notification.is_read && 'is-unread')}
                    onClick={() => openNotification(notification)}
                  >
                    <span className="ntf-icon">
                      {MODULE_ICONS[notification.module?.toLowerCase?.() ?? ''] ?? <Megaphone size={15} />}
                    </span>
                    <span className="ntf-body">
                      <span className="ntf-title">{notification.title}</span>
                      {notification.message && <span className="ntf-msg">{notification.message}</span>}
                    </span>
                    <span className="ntf-time">{formatTimeLabel(notification.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
