'use client';

/**
 * Form tạo / sửa bài viết blog: ảnh bìa, tiêu đề, danh mục, trạng thái, nội dung, SEO, bản dịch tiếng Anh.
 * Dùng bởi: blog-posts/create/page.tsx, blog-posts/edit/[id]/page.tsx.
 * Lưu ý: ảnh bìa chọn từ Thư viện được rút về đường dẫn tương đối "uploads/..." (không dính domain, khớp sync-content.js);
 * đang sửa mà xoá ảnh thì gửi null, tạo mới không có ảnh thì không gửi field.
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
import { PUBLISH_STATUS_OPTIONS, type PublishStatus } from '@/app/admin/_lib/publish-status';
import { toDateInputValue } from '@/app/admin/_lib/format-date';
import {
  blogCategoryService,
  BLOG_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';
import { blogPostService, BLOG_POST_QUERY_KEY } from '@/app/admin/(protected)/blog-posts/_lib/blog-post.service';
import { adminRoutes } from '@/config/routes';

interface FormValues extends SeoFormValues {
  title: string;
  categoryId: string;
  status: PublishStatus;
  publishedAt: string;
  excerpt: string;
  content: string;
  coverImagePath: string | File | null;
  en_title: string;
  en_excerpt: string;
  en_content: string;
  en_metaTitle: string;
  en_metaDescription: string;
}

const EN_KEYS = ['title', 'excerpt', 'content', 'metaTitle', 'metaDescription'] as const;

function buildCoverImagePayload(value: string | File | null, isEdit: boolean): string | File | null | undefined {
  if (value instanceof File) return value;
  if (typeof value === 'string' && value.trim()) {
    return value.replace(/^https?:\/\/[^/]+\//i, '').replace(/^\//, '');
  }
  return isEdit ? null : undefined;
}

const EMPTY_FORM_VALUES: FormValues = {
  title: '',
  categoryId: '',
  status: 'draft',
  publishedAt: '',
  excerpt: '',
  content: '',
  coverImagePath: null,
  ...EMPTY_SEO,
  en_title: '',
  en_excerpt: '',
  en_content: '',
  en_metaTitle: '',
  en_metaDescription: '',
};

export function BlogPostForm({ id }: { id?: number }) {
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

  const categoryOptions: GenericSelectOption[] = useMemo(
    () => (categories?.data ?? []).map((category) => ({ label: category.name, value: category.id })),
    [categories],
  );

  const { data } = useQuery({
    queryKey: [...BLOG_POST_QUERY_KEY, 'detail', id],
    queryFn: () => blogPostService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        title: data.title ?? '',
        categoryId: data.categoryId != null ? String(data.categoryId) : '',
        status: data.status ?? 'draft',
        publishedAt: toDateInputValue(data.publishedAt),
        excerpt: data.excerpt ?? '',
        content: data.content ?? '',
        coverImagePath: data.coverImagePath ?? null,
        ...seoValuesFrom(data),
        ...enValuesFrom(data.translations, EN_KEYS),
      });
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const fields: GenericFormField[] = useMemo(
    () => [
      { key: 'coverImagePath', label: 'Ảnh bìa', type: 'image' },
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true, placeholder: 'Nhập tiêu đề bài viết' },
      { key: 'categoryId', label: 'Danh mục', type: 'select', placeholder: '— Không có —', options: categoryOptions },
      { key: 'status', label: 'Trạng thái', type: 'select', required: true, options: PUBLISH_STATUS_OPTIONS },
      { key: 'publishedAt', label: 'Ngày đăng', type: 'date', hint: 'Để trống nếu đăng ngay khi xuất bản' },
      { key: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Tóm tắt hiển thị ở danh sách bài viết' },
      { key: 'content', label: 'Nội dung', type: 'richtext', required: true, placeholder: 'Viết nội dung bài…' },
      ...SEO_FIELDS,
      ...buildEnFields([
        { key: 'title', label: 'Tiêu đề', type: 'text' },
        { key: 'excerpt', label: 'Mô tả ngắn', type: 'textarea' },
        { key: 'content', label: 'Nội dung', type: 'richtext' },
        { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text' },
        { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea' },
      ]),
    ],
    [categoryOptions],
  );

  async function handleSubmit(values: FormValues) {
    if (!values.content || values.content === '<p></p>') {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        {
          title: values.title,
          status: values.status,
          publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
          excerpt: values.excerpt,
          content: values.content,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          coverImagePath: buildCoverImagePayload(values.coverImagePath, isEdit),
          ...buildSeoPayload(values),
          translations: buildEnTranslationsPayload(values, EN_KEYS, data?.translations),
        },
        { keepNull: ['categoryId', 'translations', 'coverImagePath', ...SEO_NULLABLE_KEYS] },
      );

      if (isEdit) await blogPostService.edit(id!, payload);
      else await blogPostService.add(payload);

      await queryClient.invalidateQueries({ queryKey: BLOG_POST_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết');
      router.push(adminRoutes.blogPosts.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa bài viết' : 'Viết bài mới'}
      subtitle={isEdit ? 'Cập nhật nội dung bài viết' : 'Thêm bài viết mới'}
      breadcrumbs={[
        { label: 'Bài viết', link: adminRoutes.blogPosts.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={[EN_TRANSLATION_GROUP]}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Đăng bài'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.blogPosts.list)}
    />
  );
}
