/**
 * Trang /admin/products: danh sách sản phẩm.
 * Dùng bởi: Next.js App Router (route /admin/products).
 */

import { ProductList } from '@/app/admin/(protected)/products/_components/ProductList';

export default function AdminProductsPage() {
  return <ProductList />;
}
