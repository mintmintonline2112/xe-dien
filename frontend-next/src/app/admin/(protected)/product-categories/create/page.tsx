/**
 * Trang /admin/product-categories/create: form tạo danh mục sản phẩm mới.
 * Dùng bởi: Next.js App Router; nút "Thêm danh mục" ở ProductCategoryList.
 */

import { ProductCategoryForm } from '@/app/admin/(protected)/product-categories/_components/ProductCategoryForm';

export default function AdminProductCategoryCreatePage() {
  return <ProductCategoryForm />;
}
