/**
 * Trang /admin/staffs: danh sách nhân sự có tài khoản admin.
 * Dùng bởi: Next.js App Router (route /admin/staffs).
 */

import { StaffList } from '@/app/admin/(protected)/staffs/_components/StaffList';

export default function AdminStaffsPage() {
  return <StaffList />;
}
