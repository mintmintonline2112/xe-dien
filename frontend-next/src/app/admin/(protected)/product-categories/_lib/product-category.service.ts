/**
 * Gọi API CRUD danh mục sản phẩm, kiểu ProductCategory, bộ icon danh mục và hàm dựng lựa chọn danh mục (con thụt lề) cho admin.
 * Dùng bởi: ProductCategoryForm, ProductCategoryList, ProductForm, ProductList.
 * Lưu ý: cây 2 cấp (cha → con) theo docs/catalog-api.md; key icon phải khớp bộ icon của site public.
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';
import type { GenericSelectOption } from '@/app/admin/_components/generic-form/types';

export const PRODUCT_CATEGORY_QUERY_KEY = ['admin', 'product-categories'] as const;

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  imagePath: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  createdAt: string;
}

export const CATEGORY_ICON_OPTIONS: GenericSelectOption[] = [
  { label: 'Xe đạp điện', value: 'bike' },
  { label: 'Xe máy điện', value: 'moped' },
  { label: 'Scooter / xe điện 2 bánh', value: 'kick-scooter' },
  { label: 'Xe điện 3 bánh', value: 'tricycle' },
  { label: 'Ô tô điện', value: 'car' },
  { label: 'Xe điện trẻ em', value: 'kid' },
  { label: 'Xe chuyên dụng / tải', value: 'truck' },
  { label: 'Xe nâng điện', value: 'forklift' },
  { label: 'Xe bus điện', value: 'bus' },
  { label: 'Xe sân golf', value: 'golf' },
  { label: 'Pin / ắc quy', value: 'battery' },
  { label: 'Trạm sạc / bộ sạc', value: 'charger' },
  { label: 'Lốp xe', value: 'tire' },
  { label: 'Phụ tùng / linh kiện', value: 'parts' },
];

export const categoryIconLabelOf = (icon: string | null | undefined) =>
  CATEGORY_ICON_OPTIONS.find((option) => option.value === icon)?.label ?? null;

export function buildCategoryOptions(categories: ProductCategory[]): GenericSelectOption[] {
  const roots = categories.filter((category) => category.parentId == null);
  const childrenOf = (parentId: number) => categories.filter((category) => category.parentId === parentId);
  const knownIds = new Set(categories.map((category) => category.id));
  const orphans = categories.filter((category) => category.parentId != null && !knownIds.has(category.parentId));
  return [
    ...roots.flatMap((root) => [
      { label: root.name, value: root.id },
      ...childrenOf(root.id).map((child) => ({ label: `— ${child.name}`, value: child.id })),
    ]),
    ...orphans.map((category) => ({ label: category.name, value: category.id })),
  ];
}

export const productCategoryService = createCrudService<ProductCategory>('admin/product-categories', [
  { sortOrder: 'ASC' },
  { id: 'ASC' },
]);
