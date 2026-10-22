'use client';

/**
 * Bảng danh mục sản phẩm: ảnh, tên, danh mục cha, icon, số sản phẩm, hiển thị; lọc theo danh mục cha, sắp xếp, ẩn / hiện, sửa, xoá.
 * Dùng bởi: product-categories/page.tsx.
 * Lưu ý: cột số sản phẩm chỉ có số khi backend trả `productCount`; xoá danh mục thì sản phẩm thuộc nó về "Chưa phân loại".
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/app/admin/_components/data-table/DataTable';
import type { TableActionEvent, TableColumn, TableFilterOption } from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { ACTIVE_STATUS_CONFIG } from '@/app/admin/_lib/publish-status';
import {
  categoryIconLabelOf,
  productCategoryService,
  PRODUCT_CATEGORY_QUERY_KEY,
  type ProductCategory,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import { adminRoutes } from '@/config/routes';

export function ProductCategoryList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: allCategories } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => productCategoryService.paginate({ limit: 1000 }),
  });

  const nameById = useMemo(() => {
    const names = new Map<number, string>();
    for (const category of allCategories?.data ?? []) names.set(category.id, category.name);
    return names;
  }, [allCategories]);

  const rootCategories = useMemo(
    () => (allCategories?.data ?? []).filter((category) => category.parentId == null),
    [allCategories],
  );

  const columns: TableColumn<ProductCategory>[] = useMemo(
    () => [
      { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
      { key: 'imagePath', label: 'Ảnh', type: 'image', align: 'center' },
      {
        key: 'name',
        label: 'Tên danh mục',
        type: 'custom',
        align: 'left',
        render: (row) => (
          <>
            <Link className="dt-link" href={adminRoutes.productCategories.edit(row.id)}>
              {row.name}
            </Link>
            <small className="dt-sub">/{row.slug}</small>
          </>
        ),
      },
      {
        key: 'parentId',
        label: 'Danh mục cha',
        type: 'custom',
        align: 'center',
        render: (row) =>
          row.parentId == null ? (
            <span className="dt-status is-success">Danh mục gốc</span>
          ) : (
            (nameById.get(row.parentId) ?? `#${row.parentId}`)
          ),
      },
      {
        key: 'icon',
        label: 'Icon',
        type: 'custom',
        align: 'center',
        render: (row) => categoryIconLabelOf(row.icon) ?? '—',
      },
      {
        key: 'productCount',
        label: 'Sản phẩm',
        type: 'custom',
        align: 'center',
        render: (row) => (typeof row.productCount === 'number' ? row.productCount : '—'),
      },
      { key: 'isActive', label: 'Trạng thái', type: 'status', align: 'center', statusConfig: ACTIVE_STATUS_CONFIG },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [nameById],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'parentId',
        label: 'Tất cả cấp',
        options: rootCategories.map((category) => ({
          label: `Danh mục con của: ${category.name}`,
          value: String(category.id),
        })),
      },
    ],
    [rootCategories],
  );

  async function handleAction(event: TableActionEvent<ProductCategory>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push(adminRoutes.productCategories.create);
        break;
      case 'edit':
        if (item?.id) router.push(adminRoutes.productCategories.edit(item.id));
        break;
      case 'sort':
        if (item?.id && event.value) {
          await productCategoryService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
        }
        break;
      case 'toggle':
        if (item?.id) {
          await productCategoryService.edit(item.id, { isActive: !item.isActive });
          queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
          toast.success(item.isActive ? `Đã ẩn "${item.name}"` : `Đã hiện "${item.name}"`);
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa danh mục?',
              text: `Xóa danh mục "${item.name}"? Sản phẩm thuộc danh mục sẽ chuyển về "Chưa phân loại".`,
              confirmButtonText: 'Xóa',
            },
            () => productCategoryService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<ProductCategory>
      title="Danh mục sản phẩm"
      subtitle="Nhóm sản phẩm hiển thị trên menu, trang chủ và trang danh mục"
      queryKey={[...PRODUCT_CATEGORY_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => productCategoryService.paginate(params)}
      addLabel="Thêm danh mục"
      searchPlaceholder="Tìm theo tên…"
      filters={filters}
      enabledActions={['toggle', 'edit', 'delete']}
      onAction={handleAction}
    />
  );
}
