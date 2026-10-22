/**
 * Trang /admin/blog-posts/edit/[id]: form sửa bài viết, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở BlogPostList.
 */

import { notFound } from 'next/navigation';
import { BlogPostForm } from '@/app/admin/(protected)/blog-posts/_components/BlogPostForm';

export default async function AdminBlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <BlogPostForm id={numericId} />;
}
