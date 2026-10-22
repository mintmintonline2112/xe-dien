/**
 * Trang /admin/menus/edit/[id]: form sửa mục menu, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở MenuItemList.
 */

import { notFound } from 'next/navigation';
import { MenuItemForm } from '@/app/admin/(protected)/menus/_components/MenuItemForm';

export default async function AdminMenuEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <MenuItemForm id={numericId} />;
}
