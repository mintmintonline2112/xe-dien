/**
 * Trang /admin/menus/create: form tạo mục menu mới; ?location=footer chọn sẵn menu chân trang.
 * Dùng bởi: Next.js App Router; nút "Thêm" ở MenuItemList (gắn location của tab đang mở).
 */

import { MenuItemForm } from '@/app/admin/(protected)/menus/_components/MenuItemForm';
import { toMenuLocation } from '@/app/admin/(protected)/menus/_lib/menu-item.service';

export default async function AdminMenuCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  return <MenuItemForm defaultLocation={toMenuLocation(location)} />;
}
