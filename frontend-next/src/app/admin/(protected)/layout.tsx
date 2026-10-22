/**
 * Khung chung cho mọi màn hình admin cần đăng nhập: bọc nội dung trong AdminShell.
 * Dùng bởi: Next.js App Router, tự áp cho mọi trang dưới src/app/admin/(protected)/.
 */

import type { ReactNode } from 'react';
import { AdminShell } from '@/app/admin/_layout/AdminShell';

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
