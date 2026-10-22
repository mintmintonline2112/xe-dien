/**
 * Trang /admin: chuyển hướng sang dashboard.
 * Dùng bởi: Next.js App Router.
 */
import { redirect } from 'next/navigation';
import { adminRoutes } from '@/config/routes';

export default function AdminIndexPage() {
  redirect(adminRoutes.dashboard);
}
