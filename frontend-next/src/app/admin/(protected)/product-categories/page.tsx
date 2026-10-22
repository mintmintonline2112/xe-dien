/**
 * Trang /admin/product-categories: danh sách danh mục sản phẩm.
 * Dùng bởi: Next.js App Router (route /admin/product-categories).
 */

import { ProductCategoryList } from '@/app/admin/(protected)/product-categories/_components/ProductCategoryList';

export default function AdminProductCategoriesPage() {
  return <ProductCategoryList />;
}
