/**
 * Trang /admin/roles/create: form tạo vai trò mới.
 * Dùng bởi: Next.js App Router; nút "Thêm" ở RoleList.
 */

import { RoleForm } from '@/app/admin/(protected)/roles/_components/RoleForm';

export default function AdminRoleCreatePage() {
  return <RoleForm />;
}
