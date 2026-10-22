/**
 * Trang /admin/pages: danh sách trang của website.
 * Dùng bởi: Next.js App Router (route /admin/pages).
 */

import { PageList } from '@/app/admin/(protected)/pages/_components/PageList';

export default function AdminPagesPage() {
  return <PageList />;
}
