/**
 * Trang /admin/permissions: danh sách quyền (chỉ xem).
 * Dùng bởi: Next.js App Router (route /admin/permissions).
 */

import { PermissionList } from '@/app/admin/(protected)/permissions/_components/PermissionList';

export default function AdminPermissionsPage() {
  return <PermissionList />;
}
