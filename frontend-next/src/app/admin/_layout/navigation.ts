/**
 * Danh sách nhóm / mục menu của admin (nhãn, đường dẫn, icon, quyền cần có) và hàm lấy tiêu đề trang theo đường dẫn.
 * Dùng bởi: AdminSidebar.tsx, AdminShell.tsx.
 * Lưu ý: `permission` là mã quyền LIST theo entity của controller backend (PRODUCT_LIST…); mảng = có một trong các quyền là thấy.
 */
import type { AdminIconName } from '@/app/admin/_components/AdminIcon';
import { adminRoutes } from '@/config/routes';
import { isActivePath } from '@/utils/route';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: AdminIconName;
  permission?: string | string[];
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNavigation: AdminNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: adminRoutes.dashboard, icon: 'dashboard' },
    ],
  },
  {
    label: 'Sản phẩm',
    items: [
      {
        label: 'Sản phẩm',
        href: adminRoutes.products.list,
        icon: 'product',
        permission: 'PRODUCT_LIST',
      },
      {
        label: 'Danh mục sản phẩm',
        href: adminRoutes.productCategories.list,
        icon: 'category',
        permission: 'PRODUCT_CATEGORY_LIST',
      },
      {
        label: 'Nhập từ website',
        href: adminRoutes.productImport,
        icon: 'import',
        permission: 'PRODUCT_CREATE',
      },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      {
        label: 'Bài viết',
        href: adminRoutes.blogPosts.list,
        icon: 'article',
        permission: 'BLOG_POST_LIST',
      },
      {
        label: 'Danh mục blog',
        href: adminRoutes.blogCategories.list,
        icon: 'category',
        permission: 'BLOG_CATEGORY_LIST',
      },
      {
        label: 'Trang',
        href: adminRoutes.pages.list,
        icon: 'page',
        permission: 'PAGE_LIST',
      },
      {
        label: 'Page section',
        href: adminRoutes.pageSections.list,
        icon: 'section',
        permission: 'PAGE_SECTION_LIST',
      },
      {
        label: 'Menu website',
        href: adminRoutes.menus.list,
        icon: 'menu',
        permission: 'MENU_ITEM_LIST',
      },
      {
        label: 'Thư viện ảnh & video',
        href: adminRoutes.library,
        icon: 'image',
        permission: 'LIBRARY_LIST',
      },
    ],
  },
  {
    label: 'Khách hàng',
    items: [
      {
        label: 'Yêu cầu tư vấn & liên hệ',
        href: adminRoutes.contacts,
        icon: 'consult',
        permission: ['QUOTE_REQUEST_LIST', 'CONTACT_LIST'],
      },
      {
        label: 'Trang Liên hệ',
        href: adminRoutes.contactPage,
        icon: 'contactPage',
        permission: 'SETTING_LIST',
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Nhân sự',
        href: adminRoutes.staffs.list,
        icon: 'staff',
        permission: 'STAFF_LIST',
      },
      {
        label: 'Vai trò',
        href: adminRoutes.roles.list,
        icon: 'role',
        permission: 'ROLE_LIST',
      },
      {
        label: 'Phân quyền',
        href: adminRoutes.permissions,
        icon: 'permission',
        permission: 'PERMISSION_LIST',
      },
      {
        label: 'Cài đặt',
        href: adminRoutes.settings,
        icon: 'settings',
        permission: 'SETTING_LIST',
      },
    ],
  },
];

export function canSeeNavItem(item: AdminNavItem, hasPermission: (code: string) => boolean): boolean {
  if (!item.permission) return true;
  const codes = Array.isArray(item.permission) ? item.permission : [item.permission];
  return codes.some((code) => hasPermission(code));
}

export function getAdminPageTitle(pathname: string): string {
  const item = adminNavigation
    .flatMap((group) => group.items)
    .find((entry) => isActivePath(pathname, entry.href));
  return item?.label ?? 'Quản trị nội dung';
}
