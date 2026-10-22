/**
 * Trang /admin/blog-posts/create: form tạo bài viết mới.
 * Dùng bởi: Next.js App Router; nút "Thêm" ở BlogPostList.
 */

import { BlogPostForm } from '@/app/admin/(protected)/blog-posts/_components/BlogPostForm';

export default function AdminBlogPostCreatePage() {
  return <BlogPostForm />;
}
