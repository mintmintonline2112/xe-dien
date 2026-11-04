'use client';

/**
 * Bảng danh sách sản phẩm: ảnh, tên (kèm mã / thương hiệu), danh mục, giá, bật / tắt "mua nhiều", trạng thái; lọc, sắp xếp, sửa, xoá;
 * chọn nhiều / chọn tất cả để xuất bản, chuyển nháp, bật / bỏ "mua nhiều" hoặc xoá hàng loạt.
 * Dùng bởi: products/page.tsx.
 */

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/app/admin/_components/data-table/DataTable';
import type {
  TableActionEvent,
  TableBulkAction,
  TableColumn,
  TableFilterOption,
} from '@/app/admin/_components/data-table/types';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { runInBatches } from '@/app/admin/_lib/run-in-batches';
import { PUBLISH_STATUS_CONFIG, PUBLISH_STATUS_OPTIONS } from '@/app/admin/_lib/publish-status';
import {
  buildCategoryOptions,
  productCategoryService,
  PRODUCT_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import {
  formatVnd,
  productService,
  PRODUCT_QUERY_KEY,
  STOCK_STATUS_CONFIG,
  type Product,
} from '@/app/admin/(protected)/products/_lib/product.service';
import { adminRoutes } from '@/config/routes';
import { cn } from '@/utils/cn';

export function ProductList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => productCategoryService.paginate({ limit: 1000 }),
  });

  const categoryNameById = useMemo(() => {
    const nameById = new Map<number, string>();
    for (const category of categories?.data ?? []) nameById.set(category.id, category.name);
    return nameById;
  }, [categories]);

  const toggleFeatured = useCallback(
    async (product: Product) => {
      try {
        await productService.edit(product.id, { isFeatured: !product.isFeatured });
        await queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
        toast.success(
          product.isFeatured ? `Đã bỏ "${product.title}" khỏi Mua nhiều` : `Đã thêm "${product.title}" vào Mua nhiều`,
        );
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [queryClient],
  );

  const columns: TableColumn<Product>[] = useMemo(
    () => [
      { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
      { key: 'thumbnailPath', label: 'Ảnh', type: 'image', align: 'center' },
      {
        key: 'title',
        label: 'Sản phẩm',
        type: 'custom',
        align: 'left',
        render: (row) => (
          <>
            <Link className="dt-link" href={adminRoutes.products.edit(row.id)}>
              {row.title}
            </Link>
            {(row.sku || row.brand) && (
              <small className="dt-sub">{[row.brand, row.sku && `Mã: ${row.sku}`].filter(Boolean).join(' · ')}</small>
            )}
          </>
        ),
      },
      {
        key: 'categoryId',
        label: 'Danh mục',
        type: 'custom',
        align: 'center',
        render: (row) =>
          row.categoryId != null
            ? (row.category?.name ?? categoryNameById.get(row.categoryId) ?? `#${row.categoryId}`)
            : '—',
      },
      {
        key: 'price',
        label: 'Giá',
        type: 'custom',
        align: 'right',
        render: (row) => (
          <span className="pc-price">
            <strong>{formatVnd(row.price)}</strong>
            {row.price != null && row.originalPrice != null && row.originalPrice > row.price && (
              <s>{formatVnd(row.originalPrice)}</s>
            )}
          </span>
        ),
      },
      {
        key: 'isFeatured',
        label: 'Mua nhiều',
        type: 'custom',
        align: 'center',
        render: (row) => (
          <button
            type="button"
            className={cn('pc-featured', row.isFeatured && 'is-on')}
            title={row.isFeatured ? 'Bỏ khỏi Sản phẩm mua nhiều' : 'Thêm vào Sản phẩm mua nhiều'}
            aria-pressed={row.isFeatured}
            onClick={() => toggleFeatured(row)}
          >
            <Star size={15} fill={row.isFeatured ? 'currentColor' : 'none'} />
          </button>
        ),
      },
      { key: 'stockStatus', label: 'Kho', type: 'status', align: 'center', statusConfig: STOCK_STATUS_CONFIG },
      { key: 'status', label: 'Trạng thái', type: 'status', align: 'center', statusConfig: PUBLISH_STATUS_CONFIG },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [categoryNameById, toggleFeatured],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'categoryId',
        label: 'Tất cả danh mục',
        options: buildCategoryOptions(categories?.data ?? []).map((option) => ({
          label: option.label,
          value: String(option.value),
        })),
      },
      {
        key: 'status',
        label: 'Tất cả trạng thái',
        options: PUBLISH_STATUS_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
      },
      {
        key: 'isFeatured',
        label: 'Mua nhiều: tất cả',
        options: [
          { label: 'Chỉ sản phẩm mua nhiều', value: 'true' },
          { label: 'Không thuộc mua nhiều', value: 'false' },
        ],
      },
    ],
    [categories],
  );

  const bulkActions: TableBulkAction<Product>[] = useMemo(() => {
    const confirmBulkEdit = (
      products: Product[],
      title: string,
      confirmButtonText: string,
      payload: Partial<Pick<Product, 'status' | 'isFeatured'>>,
    ) =>
      confirmAction(
        { title, text: `Áp dụng cho ${products.length} sản phẩm đã chọn.`, confirmButtonText, tone: 'primary', icon: 'question' },
        async () => {
          await runInBatches(products, (product) => productService.edit(product.id, payload));
          await queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
        },
      );

    return [
      {
        key: 'publish',
        label: 'Xuất bản',
        run: (products) => confirmBulkEdit(products, 'Xuất bản sản phẩm?', 'Xuất bản', { status: 'published' }),
      },
      {
        key: 'draft',
        label: 'Chuyển nháp',
        run: (products) => confirmBulkEdit(products, 'Chuyển về bản nháp?', 'Chuyển nháp', { status: 'draft' }),
      },
      {
        key: 'featured-on',
        label: 'Thêm vào Mua nhiều',
        run: (products) => confirmBulkEdit(products, 'Thêm vào Mua nhiều?', 'Thêm', { isFeatured: true }),
      },
      {
        key: 'featured-off',
        label: 'Bỏ Mua nhiều',
        run: (products) => confirmBulkEdit(products, 'Bỏ khỏi Mua nhiều?', 'Bỏ', { isFeatured: false }),
      },
      {
        key: 'delete',
        label: 'Xoá',
        tone: 'danger',
        run: (products) =>
          confirmAction(
            {
              title: `Xóa ${products.length} sản phẩm?`,
              text: 'Các sản phẩm đã chọn sẽ bị gỡ khỏi website.',
              confirmButtonText: 'Xóa',
            },
            async () => {
              await runInBatches(products, (product) => productService.remove(product.id));
              await queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
            },
          ),
      },
    ];
  }, [queryClient]);

  async function handleAction(event: TableActionEvent<Product>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push(adminRoutes.products.create);
        break;
      case 'edit':
        if (item?.id) router.push(adminRoutes.products.edit(item.id));
        break;
      case 'sort':
        if (item?.id && event.value) {
          await productService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa sản phẩm?',
              text: `Sản phẩm "${item.title}" sẽ bị gỡ khỏi website.`,
              confirmButtonText: 'Xóa',
            },
            () => productService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<Product>
      title="Sản phẩm"
      subtitle="Xe điện, phụ tùng và thiết bị hiển thị trên website"
      queryKey={[...PRODUCT_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => productService.paginate(params)}
      addLabel="Thêm sản phẩm"
      searchPlaceholder="Tìm theo tên, mã, thương hiệu…"
      filters={filters}
      bulkActions={bulkActions}
      onAction={handleAction}
    />
  );
}
