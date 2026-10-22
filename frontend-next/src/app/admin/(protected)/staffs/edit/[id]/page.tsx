/**
 * Trang /admin/staffs/edit/[id]: form sửa tài khoản nhân sự (id dạng chuỗi), thiếu id thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở StaffList.
 */

import { notFound } from 'next/navigation';
import { StaffForm } from '@/app/admin/(protected)/staffs/_components/StaffForm';

export default async function AdminStaffEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  return <StaffForm id={id} />;
}
