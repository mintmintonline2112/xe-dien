/**
 * Trang /admin/blog-categories: danh sách danh mục blog.
 * Dùng bởi: Next.js App Router (route /admin/blog-categories).
 */

import { BlogCategoryList } from '@/app/admin/(protected)/blog-categories/_components/BlogCategoryList';

export default function AdminBlogCategoriesPage() {
  return <BlogCategoryList />;
}
