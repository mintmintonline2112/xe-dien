/**
 * Trạng thái tài khoản nhân viên (giá trị lưu trong DB).
 * Dùng bởi: modules/admin/staffs, modules/admin/auth, dashboard, notifications, staff.seed.ts.
 */
export enum AccountStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}
