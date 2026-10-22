/**
 * Trang /admin/staffs/create: form tạo tài khoản nhân sự mới.
 * Dùng bởi: Next.js App Router; nút "Thêm" ở StaffList.
 */

import { StaffForm } from '@/app/admin/(protected)/staffs/_components/StaffForm';

export default function AdminStaffCreatePage() {
  return <StaffForm />;
}
