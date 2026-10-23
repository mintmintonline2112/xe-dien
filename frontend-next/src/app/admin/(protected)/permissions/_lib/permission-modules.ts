/**
 * Tên tiếng Việt cho cột `module` của quyền (backend lưu tên controller viết thường, vd `adminquoterequests`).
 * Dùng bởi: permissions/_components/PermissionList.tsx, roles/_components/RoleForm.tsx.
 * Lưu ý: thêm controller mới vào backend permission.seed.ts thì thêm 1 dòng ở đây, thiếu thì màn hình hiện mã thô.
 */

const PERMISSION_MODULE_LABELS: Record<string, string> = {
  staffs: 'Nhân viên',
  roles: 'Vai trò',
  permissions: 'Phân quyền',
  products: 'Sản phẩm',
  productcategories: 'Danh mục sản phẩm',
  blogposts: 'Bài viết',
  blogcategories: 'Danh mục blog',
  pages: 'Trang',
  pagesections: 'Section trang',
  library: 'Thư viện ảnh',
  admincontact: 'Liên hệ',
  adminquoterequests: 'Yêu cầu tư vấn',
  menuitems: 'Menu',
  settings: 'Cài đặt',
  notification: 'Thông báo',
  admincache: 'Cache website',
};

export const permissionModuleLabelOf = (moduleName: string): string =>
  PERMISSION_MODULE_LABELS[moduleName.toLowerCase()] ?? moduleName;
