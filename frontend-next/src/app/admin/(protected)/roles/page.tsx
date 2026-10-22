/**
 * Trang /admin/roles: danh sách vai trò.
 * Dùng bởi: Next.js App Router (route /admin/roles).
 */

import { RoleList } from '@/app/admin/(protected)/roles/_components/RoleList';

export default function AdminRolesPage() {
  return <RoleList />;
}
