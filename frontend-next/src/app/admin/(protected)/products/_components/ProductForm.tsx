'use client';

/**
 * Form tạo / sửa sản phẩm: ảnh đại diện, tên, danh mục, giá, kho, nhãn, điểm nổi bật, thông số, ảnh phụ, khuyến mãi, bài mô tả, SEO.
 * Dùng bởi: products/create/page.tsx, products/edit/[id]/page.tsx.
 * Lưu ý: ảnh đại diện mới tải lên được đưa vào Thư viện (thư mục "products") trước, rồi gửi đường dẫn bằng JSON — nhờ vậy giá xoá trắng
 * vẫn gửi null (FormData bỏ mất null). Giá để trống = "Liên hệ"; dòng trống trong danh sách bị lọc trước khi gửi.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import { toStoredImagePath, type PairItem } from '@/app/admin/_components/generic-form/ListFields';
import type { GenericFormField, GenericFormGroup } from '@/app/admin/_components/generic-form/types';
import {
  SEO_FIELDS,
  EMPTY_SEO,
  seoValuesFrom,
  buildSeoPayload,
  type SeoFormValues,
  SEO_NULLABLE_KEYS,
} from '@/app/admin/_lib/seo-fields';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import { libraryService } from '@/app/admin/_lib/library.service';
import { PUBLISH_STATUS_OPTIONS, type PublishStatus } from '@/app/admin/_lib/publish-status';
import { toDateInputValue } from '@/app/admin/_lib/format-date';
import {
  buildCategoryOptions,
  productCategoryService,
  PRODUCT_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import {
  productService,
  PRODUCT_QUERY_KEY,
  STOCK_STATUS_OPTIONS,
  type StockStatus,
} from '@/app/admin/(protected)/products/_lib/product.service';
import { adminRoutes } from '@/config/routes';

interface FormValues extends SeoFormValues {
  thumbnailPath: string | File | null;
  title: string;
  categoryId: string;
  brand: string;
  sku: string;
  price: number | string;
  originalPrice: number | string;
  badge: string;
  stockStatus: StockStatus;
  isFeatured: boolean;
  warranty: string;
  excerpt: string;
  highlights: string[];
  specs: PairItem[];
  gallery: string[];
  promotion: string;
  content: string;
  status: PublishStatus;
  publishedAt: string;
}

const FORM_GROUPS: GenericFormGroup[] = [
  { id: 'details', title: 'Điểm nổi bật & thông số kỹ thuật', description: 'Hiện ở trang chi tiết sản phẩm' },
  { id: 'media', title: 'Ảnh phụ (thư viện ảnh sản phẩm)', description: 'Ảnh đầu tiên đứng ngay sau ảnh đại diện' },
  { id: 'content', title: 'Khuyến mãi & bài mô tả' },
  { id: 'seo', title: 'SEO', collapsed: true },
];

const EMPTY_FORM_VALUES: FormValues = {
  thumbnailPath: null,
  title: '',
  categoryId: '',
  brand: '',
  sku: '',
  price: '',
  originalPrice: '',
  badge: '',
  stockStatus: 'in_stock',
  isFeatured: false,
  warranty: '',
  excerpt: '',
  highlights: [],
  specs: [],
  gallery: [],
  promotion: '',
  content: '',
  status: 'draft',
  publishedAt: '',
  ...EMPTY_SEO,
};

function toPriceOrNull(value: number | string): number | null {
  const price = typeof value === 'number' ? value : value.trim() ? Number(value) : NaN;
  return Number.isFinite(price) && price >= 0 ? Math.round(price) : null;
}

const toTextOrNull = (value: string) => (value.trim() ? value.trim() : null);

async function buildThumbnailPayload(value: string | File | null, isEdit: boolean): Promise<string | null | undefined> {
  if (value instanceof File) {
    const uploadedImage = await libraryService.upload(value, 'products');
    return toStoredImagePath(uploadedImage.url);
  }
  if (typeof value === 'string' && value.trim()) return toStoredImagePath(value);
  return isEdit ? null : undefined;
}

export function ProductForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY_FORM_VALUES);
  const [formKey, setFormKey] = useState(0);

  const { data: categories } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => productCategoryService.paginate({ limit: 1000 }),
  });

  const categoryOptions = useMemo(() => buildCategoryOptions(categories?.data ?? []), [categories]);

  const { data } = useQuery({
    queryKey: [...PRODUCT_QUERY_KEY, 'detail', id],
    queryFn: () => productService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        thumbnailPath: data.thumbnailPath ?? null,
        title: data.title ?? '',
        categoryId: data.categoryId != null ? String(data.categoryId) : '',
        brand: data.brand ?? '',
        sku: data.sku ?? '',
        price: data.price ?? '',
        originalPrice: data.originalPrice ?? '',
        badge: data.badge ?? '',
        stockStatus: data.stockStatus ?? 'in_stock',
        isFeatured: data.isFeatured ?? false,
        warranty: data.warranty ?? '',
        excerpt: data.excerpt ?? '',
        highlights: data.highlights ?? [],
        specs: data.specs ?? [],
        gallery: data.gallery ?? [],
        promotion: data.promotion ?? '',
        content: data.content ?? '',
        status: data.status ?? 'draft',
        publishedAt: toDateInputValue(data.publishedAt),
        ...seoValuesFrom(data),
      });
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const fields: GenericFormField[] = useMemo(
    () => [
      { key: 'thumbnailPath', label: 'Ảnh đại diện', type: 'image' },
      { key: 'title', label: 'Tên sản phẩm', type: 'text', required: true, placeholder: 'VD: Xe đạp điện Vnbike i1' },
      { key: 'categoryId', label: 'Danh mục', type: 'select', placeholder: '— Chưa phân loại —', options: categoryOptions },
      { key: 'brand', label: 'Thương hiệu', type: 'text', placeholder: 'VD: Vnbike, YAKA, Pega' },
      { key: 'sku', label: 'Mã sản phẩm (SKU)', type: 'text', placeholder: 'VD: VNB-I1' },
      {
        key: 'price',
        label: 'Giá bán (VNĐ)',
        type: 'number',
        placeholder: 'VD: 9990000',
        hint: 'Để trống thì website hiện "Liên hệ".',
        rules: { min: { value: 0, message: 'Giá không được âm' } },
      },
      {
        key: 'originalPrice',
        label: 'Giá gốc (VNĐ)',
        type: 'number',
        placeholder: 'VD: 10550000',
        hint: 'Hiện gạch ngang và % giảm khi lớn hơn giá bán. Để trống nếu không giảm giá.',
        rules: { min: { value: 0, message: 'Giá không được âm' } },
      },
      { key: 'badge', label: 'Nhãn góc ảnh', type: 'text', placeholder: 'VD: Bán chạy, Mới, Trả góp 0%' },
      { key: 'stockStatus', label: 'Tình trạng kho', type: 'select', required: true, options: STOCK_STATUS_OPTIONS },
      { key: 'isFeatured', label: 'Sản phẩm mua nhiều', type: 'checkbox', hint: 'Hiện trong khối "Sản phẩm mua nhiều" ở trang chủ' },
      { key: 'warranty', label: 'Bảo hành', type: 'text', placeholder: 'VD: Bảo hành 24 tháng động cơ, 12 tháng pin' },
      { key: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Hiện dưới tên sản phẩm' },
      { key: 'status', label: 'Trạng thái', type: 'select', required: true, options: PUBLISH_STATUS_OPTIONS },
      { key: 'publishedAt', label: 'Ngày đăng', type: 'date', hint: 'Để trống nếu đăng ngay khi xuất bản' },
      {
        key: 'highlights',
        label: 'Điểm nổi bật',
        type: 'stringList',
        group: 'details',
        placeholder: 'VD: Quãng đường 60–70 km/lần sạc',
        addLabel: 'Thêm điểm nổi bật',
      },
      {
        key: 'specs',
        label: 'Thông số kỹ thuật',
        type: 'pairList',
        group: 'details',
        pairColumns: { label: 'Thông số', value: 'Giá trị' },
        addLabel: 'Thêm thông số',
      },
      { key: 'gallery', label: 'Ảnh phụ', type: 'imageList', group: 'media', uploadFolder: 'products' },
      {
        key: 'promotion',
        label: 'Khuyến mãi riêng',
        type: 'textarea',
        group: 'content',
        placeholder: 'Mỗi dòng một ưu đãi, VD: Tặng mũ bảo hiểm',
      },
      { key: 'content', label: 'Bài mô tả chi tiết', type: 'richtext', group: 'content', placeholder: 'Giới thiệu chi tiết sản phẩm…' },
      ...SEO_FIELDS.map((field) => ({ ...field, group: 'seo' })),
    ],
    [categoryOptions],
  );

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        {
          title: values.title,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          brand: toTextOrNull(values.brand),
          sku: toTextOrNull(values.sku),
          price: toPriceOrNull(values.price),
          originalPrice: toPriceOrNull(values.originalPrice),
          badge: toTextOrNull(values.badge),
          stockStatus: values.stockStatus,
          isFeatured: values.isFeatured,
          warranty: toTextOrNull(values.warranty),
          excerpt: toTextOrNull(values.excerpt),
          highlights: values.highlights.map((line) => line.trim()).filter(Boolean),
          specs: values.specs
            .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
            .filter((spec) => spec.label && spec.value),
          gallery: values.gallery.filter(Boolean),
          promotion: toTextOrNull(values.promotion),
          content: values.content && values.content !== '<p></p>' ? values.content : null,
          status: values.status,
          publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
          thumbnailPath: await buildThumbnailPayload(values.thumbnailPath, isEdit),
          ...buildSeoPayload(values),
        },
        {
          keepNull: [
            'categoryId',
            'brand',
            'sku',
            'price',
            'originalPrice',
            'badge',
            'warranty',
            'excerpt',
            'promotion',
            'content',
            'thumbnailPath',
            ...SEO_NULLABLE_KEYS,
          ],
        },
      );

      if (isEdit) await productService.edit(id!, payload);
      else await productService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm');
      router.push(adminRoutes.products.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      subtitle={isEdit ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm mới vào danh mục'}
      breadcrumbs={[
        { label: 'Sản phẩm', link: adminRoutes.products.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={FORM_GROUPS}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.products.list)}
    />
  );
}
