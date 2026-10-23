/**
 * Gọi API CRUD sản phẩm, kiểu Product, lựa chọn tình trạng kho và hàm định dạng giá VNĐ cho admin.
 * Dùng bởi: ProductForm, ProductList, contacts/_components/QuoteRequestList.tsx (link sản phẩm).
 * Lưu ý: price null = website hiện "Liên hệ"; originalPrice chỉ hiện gạch ngang khi lớn hơn price (docs/catalog-api.md).
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';
import type { TableStatusConfig } from '@/app/admin/_components/data-table/types';
import type { GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import type { PublishStatus } from '@/app/admin/_lib/publish-status';

export const PRODUCT_QUERY_KEY = ['admin', 'products'] as const;

export type StockStatus = 'in_stock' | 'pre_order' | 'out_of_stock';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  status: PublishStatus;
  sortOrder: number;
  categoryId: number | null;
  category?: { id: number; name: string; slug: string } | null;
  sku: string | null;
  brand: string | null;
  price: number | null;
  originalPrice: number | null;
  badge: string | null;
  stockStatus: StockStatus;
  isFeatured: boolean;
  excerpt: string | null;
  content: string | null;
  thumbnailPath: string | null;
  gallery: string[] | null;
  specs: ProductSpec[] | null;
  highlights: string[] | null;
  promotion: string | null;
  warranty: string | null;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export const STOCK_STATUS_OPTIONS: GenericSelectOption[] = [
  { label: 'Còn hàng', value: 'in_stock' },
  { label: 'Đặt trước', value: 'pre_order' },
  { label: 'Hết hàng', value: 'out_of_stock' },
];

export const STOCK_STATUS_CONFIG: TableStatusConfig[] = [
  { value: 'in_stock', label: 'Còn hàng', className: 'is-success' },
  { value: 'pre_order', label: 'Đặt trước', className: 'is-warning' },
  { value: 'out_of_stock', label: 'Hết hàng', className: 'is-muted' },
];

const VND_FORMATTER = new Intl.NumberFormat('vi-VN');

export function formatVnd(price: number | null | undefined): string {
  if (price == null) return 'Liên hệ';
  return `${VND_FORMATTER.format(price)}đ`;
}

export const productService = createCrudService<Product>('admin/products', [
  { sortOrder: 'ASC' },
  { createdAt: 'DESC' },
]);
