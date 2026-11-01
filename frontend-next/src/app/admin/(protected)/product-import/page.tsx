/**
 * Trang /admin/product-import: nhập sản phẩm từ danh mục của website khác (cào → xem trước → đẩy vào CMS).
 * Dùng bởi: Next.js App Router (route /admin/product-import).
 */

import { ProductImportScreen } from '@/app/admin/(protected)/product-import/_components/ProductImportScreen';

export default function AdminProductImportPage() {
  return <ProductImportScreen />;
}
