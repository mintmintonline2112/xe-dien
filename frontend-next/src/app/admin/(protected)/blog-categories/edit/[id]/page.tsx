/**
 * Trang /admin/blog-categories/edit/[id]: form sửa danh mục blog, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở BlogCategoryList.
 */

import { notFound } from 'next/navigation';
import { BlogCategoryForm } from '@/app/admin/(protected)/blog-categories/_components/BlogCategoryForm';

export default async function AdminBlogCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <BlogCategoryForm id={numericId} />;
}
