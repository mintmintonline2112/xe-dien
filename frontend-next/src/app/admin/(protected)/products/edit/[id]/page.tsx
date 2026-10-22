/**
 * Trang /admin/products/edit/[id]: form sửa sản phẩm, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở ProductList.
 */

import { notFound } from 'next/navigation';
import { ProductForm } from '@/app/admin/(protected)/products/_components/ProductForm';

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <ProductForm id={numericId} />;
}
