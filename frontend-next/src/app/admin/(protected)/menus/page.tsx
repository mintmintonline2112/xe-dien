/**
 * Trang /admin/menus: danh sách mục menu website theo vị trí (?location=footer = menu chân trang, mặc định header).
 * Dùng bởi: Next.js App Router (route /admin/menus).
 */

import { MenuItemList } from '@/app/admin/(protected)/menus/_components/MenuItemList';
import { toMenuLocation } from '@/app/admin/(protected)/menus/_lib/menu-item.service';

export default async function AdminMenusPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const menuLocation = toMenuLocation(location);
  return <MenuItemList key={menuLocation} location={menuLocation} />;
}
