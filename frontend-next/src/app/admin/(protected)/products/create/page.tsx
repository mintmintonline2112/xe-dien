/**
 * Trang /admin/products/create: form thêm sản phẩm mới.
 * Dùng bởi: Next.js App Router; nút "Thêm sản phẩm" ở ProductList.
 */

import { ProductForm } from '@/app/admin/(protected)/products/_components/ProductForm';

export default function AdminProductCreatePage() {
  return <ProductForm />;
}
