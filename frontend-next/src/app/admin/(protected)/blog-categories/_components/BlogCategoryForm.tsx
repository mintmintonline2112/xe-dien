'use client';

/**
 * Form tạo / sửa danh mục blog: tên, tên hiển thị ngoài website, danh mục cha, SEO, bản dịch tiếng Anh.
 * Dùng bởi: blog-categories/create/page.tsx, blog-categories/edit/[id]/page.tsx.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
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
import {
  EN_TRANSLATION_GROUP,
  buildEnFields,
  enValuesFrom,
  buildEnTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import { blogCategoryService, BLOG_CATEGORY_QUERY_KEY } from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';
import { adminRoutes } from '@/config/routes';

interface FormValues extends SeoFormValues {
  name: string;
  displayName: string;
  parentId: string;
  description: string;
  isActive: boolean;
  en_name: string;
  en_description: string;
}

const EN_KEYS = ['name', 'description'] as const;

const EMPTY_FORM_VALUES: FormValues = {
  name: '',
  displayName: '',
  parentId: '',
  description: '',
  isActive: true,
  ...EMPTY_SEO,
  en_name: '',
  en_description: '',
};

export function BlogCategoryForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY_FORM_VALUES);
  const [formKey, setFormKey] = useState(0);

  const { data: categories } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => blogCategoryService.paginate({ limit: 1000 }),
  });

  const parentOptions: GenericSelectOption[] = useMemo(
    () =>
      (categories?.data ?? [])
        .filter((category) => category.id !== id)
        .map((category) => ({ label: category.name, value: category.id })),
    [categories, id],
  );

  const { data } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'detail', id],
    queryFn: () => blogCategoryService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        name: data.name ?? '',
        displayName: data.displayName ?? '',
        parentId: data.parentId != null ? String(data.parentId) : '',
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        ...seoValuesFrom(data),
        ...enValuesFrom(data.translations, EN_KEYS),
      });
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const fields: GenericFormField[] = useMemo(
    () => [
      { key: 'name', label: 'Tên danh mục', type: 'text', required: true, placeholder: 'VD: Hướng dẫn sử dụng xe điện' },
      {
        key: 'displayName',
        label: 'Tên hiển thị ngoài website',
        type: 'text',
        placeholder: 'Để trống = dùng Tên danh mục',
        hint: 'Dùng khi tên trong dashboard cần rõ hơn để phân biệt. VD: tên "Tin khuyến mãi tháng" nhưng ngoài website chỉ hiện "Khuyến mãi".',
      },
      { key: 'parentId', label: 'Danh mục cha', type: 'select', placeholder: '— Không có —', options: parentOptions },
      { key: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả ngắn về danh mục' },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Cho phép hiển thị trên website' },
      ...SEO_FIELDS,
      ...buildEnFields([
        { key: 'name', label: 'Tên danh mục', type: 'text' },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
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
          displayName: values.displayName.trim() || null,
          description: values.description,
          isActive: values.isActive,
          parentId: values.parentId ? Number(values.parentId) : null,
          ...buildSeoPayload(values),
          translations: buildEnTranslationsPayload(values, EN_KEYS, data?.translations),
        },
        { keepNull: ['parentId', 'displayName', 'translations', ...SEO_NULLABLE_KEYS] },
      );

      if (isEdit) await blogCategoryService.edit(id!, payload);
      else await blogCategoryService.add(payload);

      await queryClient.invalidateQueries({ queryKey: BLOG_CATEGORY_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      router.push(adminRoutes.blogCategories.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa danh mục' : 'Tạo danh mục'}
      subtitle={isEdit ? 'Cập nhật thông tin danh mục blog' : 'Thêm danh mục blog mới'}
      breadcrumbs={[
        { label: 'Danh mục blog', link: adminRoutes.blogCategories.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={[EN_TRANSLATION_GROUP]}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.blogCategories.list)}
    />
  );
}
