/**
 * Trang /admin/blog-categories/create: form tạo danh mục blog mới.
 * Dùng bởi: Next.js App Router; nút "Thêm" ở BlogCategoryList.
 */

import { BlogCategoryForm } from '@/app/admin/(protected)/blog-categories/_components/BlogCategoryForm';

export default function AdminBlogCategoryCreatePage() {
  return <BlogCategoryForm />;
}
