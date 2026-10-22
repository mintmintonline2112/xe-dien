/**
 * Trang /admin/roles/edit/[id]: form sửa vai trò, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở RoleList.
 */

import { notFound } from 'next/navigation';
import { RoleForm } from '@/app/admin/(protected)/roles/_components/RoleForm';

export default async function AdminRoleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <RoleForm id={numericId} />;
}
