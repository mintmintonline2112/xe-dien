/**
 * Loại tài khoản quản trị: admin hoặc staff (giá trị lưu trong DB).
 * Dùng bởi: modules/admin/staffs, modules/admin/auth, is-admin.helper.ts, staff.seed.ts.
 */
export enum AccountType {
  ADMIN = 'admin',
  STAFF = 'staff',
}
