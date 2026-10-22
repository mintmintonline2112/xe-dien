/**
 * Trang /admin/product-categories/edit/[id]: form sửa danh mục sản phẩm, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở ProductCategoryList.
 */

import { notFound } from 'next/navigation';
import { ProductCategoryForm } from '@/app/admin/(protected)/product-categories/_components/ProductCategoryForm';

export default async function AdminProductCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <ProductCategoryForm id={numericId} />;
}
