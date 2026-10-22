/**
 * Gọi API CRUD mục menu website, kiểu dữ liệu MenuItem và vị trí menu (header / footer) cho admin.
 * Dùng bởi: MenuItemForm, MenuItemList, menus/create/page.tsx.
 * Lưu ý: menu footer: cấp 1 = tiêu đề cột, cấp 2 = link trong cột (docs/catalog-api.md mục Menu).
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';
import type { GenericSelectOption } from '@/app/admin/_components/generic-form/types';

export const MENU_ITEM_QUERY_KEY = ['admin', 'menu-items'] as const;

export type MenuLocation = 'header' | 'footer';

export const MENU_LOCATIONS: Array<{ value: MenuLocation; label: string; hint: string }> = [
  { value: 'header', label: 'Menu chính (header)', hint: 'Thanh menu đầu trang và submenu từng mục' },
  { value: 'footer', label: 'Menu chân trang (footer)', hint: 'Mục gốc là tiêu đề cột, mục con là link trong cột' },
];

export const MENU_LOCATION_OPTIONS: GenericSelectOption[] = MENU_LOCATIONS.map((location) => ({
  label: location.label,
  value: location.value,
}));

export function toMenuLocation(value: unknown): MenuLocation {
  return value === 'footer' ? 'footer' : 'header';
}

export interface MenuItem {
  id: number;
  label: string;
  href: string;
  parentId: number | null;
  location: MenuLocation;
  description: string | null;
  isActive: boolean;
  showSubmenu: boolean;
  sortOrder: number;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const menuItemService = createCrudService<MenuItem>('admin/menu-items', [
  { parentId: 'ASC' },
  { sortOrder: 'ASC' },
]);
