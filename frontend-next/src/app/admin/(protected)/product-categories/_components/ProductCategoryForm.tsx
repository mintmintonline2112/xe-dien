'use client';

/**
 * Form tạo / sửa danh mục sản phẩm: tên, danh mục cha, icon, ảnh ô danh mục, mô tả, thứ tự, hiển thị, SEO, bản dịch tiếng Anh.
 * Dùng bởi: product-categories/create/page.tsx, product-categories/edit/[id]/page.tsx.
 * Lưu ý: chỉ danh mục gốc được chọn làm cha (cây 2 cấp). Ảnh mới tải lên được đưa vào Thư viện (thư mục "product-categories") rồi
 * gửi đường dẫn bằng JSON.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import { toStoredImagePath } from '@/app/admin/_components/generic-form/ListFields';
import type { GenericFormField, GenericSelectOption } from '@/app/admin/_components/generic-form/types';
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
import {
  EN_TRANSLATION_GROUP,
  buildEnFields,
  enValuesFrom,
  buildEnTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import {
  CATEGORY_ICON_OPTIONS,
  productCategoryService,
  PRODUCT_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import { adminRoutes } from '@/config/routes';

interface FormValues extends SeoFormValues {
  imagePath: string | File | null;
  name: string;
  parentId: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  en_name: string;
  en_description: string;
  en_metaTitle: string;
  en_metaDescription: string;
}

const EN_KEYS = ['name', 'description', 'metaTitle', 'metaDescription'] as const;

const EMPTY_FORM_VALUES: FormValues = {
  imagePath: null,
  name: '',
  parentId: '',
  icon: '',
  description: '',
  sortOrder: 1,
  isActive: true,
  ...EMPTY_SEO,
  en_name: '',
  en_description: '',
  en_metaTitle: '',
  en_metaDescription: '',
};

async function buildImagePayload(value: string | File | null, isEdit: boolean): Promise<string | null | undefined> {
  if (value instanceof File) {
    const uploadedImage = await libraryService.upload(value, 'product-categories');
    return toStoredImagePath(uploadedImage.url);
  }
  if (typeof value === 'string' && value.trim()) return toStoredImagePath(value);
  return isEdit ? null : undefined;
}

export function ProductCategoryForm({ id }: { id?: number }) {
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

  const parentOptions: GenericSelectOption[] = useMemo(
    () =>
      (categories?.data ?? [])
        .filter((category) => category.parentId == null && category.id !== id)
        .map((category) => ({ label: category.name, value: category.id })),
    [categories, id],
  );

  const { data } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'detail', id],
    queryFn: () => productCategoryService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        imagePath: data.imagePath ?? null,
        name: data.name ?? '',
        parentId: data.parentId != null ? String(data.parentId) : '',
        icon: data.icon ?? '',
        description: data.description ?? '',
        sortOrder: data.sortOrder ?? 1,
        isActive: data.isActive ?? true,
        ...seoValuesFrom(data),
        ...enValuesFrom(data.translations, EN_KEYS),
      });
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const fields: GenericFormField[] = useMemo(
    () => [
      { key: 'imagePath', label: 'Ảnh ô danh mục', type: 'image' },
      { key: 'name', label: 'Tên danh mục', type: 'text', required: true, placeholder: 'VD: Xe đạp điện' },
      {
        key: 'parentId',
        label: 'Danh mục cha',
        type: 'select',
        placeholder: '— Danh mục gốc —',
        options: parentOptions,
        hint: 'Chọn danh mục cha để biến mục này thành danh mục con.',
      },
      {
        key: 'icon',
        label: 'Icon',
        type: 'select',
        placeholder: '— Không dùng icon —',
        options: CATEGORY_ICON_OPTIONS,
        hint: 'Icon hiện trong ô danh mục và menu danh mục của website.',
      },
      {
        key: 'description',
        label: 'Mô tả',
        type: 'textarea',
        placeholder: 'Đoạn giới thiệu ngắn hiện đầu trang danh mục',
      },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 0, message: 'Tối thiểu là 0' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Cho phép hiển thị trên website' },
      ...SEO_FIELDS,
      ...buildEnFields([
        { key: 'name', label: 'Tên danh mục', type: 'text' },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
        { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text' },
        { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea' },
      ]),
    ],
    [parentOptions],
  );

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        {
          name: values.name,
          parentId: values.parentId ? Number(values.parentId) : null,
          icon: values.icon || null,
          description: values.description.trim() || null,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          isActive: values.isActive,
          imagePath: await buildImagePayload(values.imagePath, isEdit),
          ...buildSeoPayload(values),
          translations: buildEnTranslationsPayload(values, EN_KEYS, data?.translations),
        },
        { keepNull: ['parentId', 'icon', 'description', 'imagePath', 'translations', ...SEO_NULLABLE_KEYS] },
      );

      if (isEdit) await productCategoryService.edit(id!, payload);
      else await productCategoryService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      router.push(adminRoutes.productCategories.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa danh mục sản phẩm' : 'Tạo danh mục sản phẩm'}
      subtitle={isEdit ? 'Cập nhật thông tin danh mục' : 'Thêm danh mục sản phẩm mới'}
      breadcrumbs={[
        { label: 'Danh mục sản phẩm', link: adminRoutes.productCategories.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={[EN_TRANSLATION_GROUP]}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.productCategories.list)}
    />
  );
}
