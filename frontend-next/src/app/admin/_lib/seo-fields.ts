/**
 * Nhóm field SEO (slug, meta title / description, og:image, canonical) dùng chung cho form CMS, kèm giá trị rỗng và hàm dựng payload.
 * Dùng bởi: BlogCategoryForm.tsx, BlogPostForm.tsx, PageForm.tsx, ProductForm.tsx, ProductCategoryForm.tsx.
 * Lưu ý: field SEO xóa trắng được gửi thành null (SEO_NULLABLE_KEYS) để backend xóa giá trị cũ — nơi gọi nhớ đưa các key này vào keepNull của buildPayload.
 */
import type { GenericFormField } from '@/app/admin/_components/generic-form/types';

export interface SeoFormValues {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogImagePath: string;
  canonicalUrl: string;
}

export const EMPTY_SEO: SeoFormValues = {
  slug: '',
  metaTitle: '',
  metaDescription: '',
  ogImagePath: '',
  canonicalUrl: '',
};

export const SEO_FIELDS: GenericFormField[] = [
  {
    key: 'slug',
    label: 'SEO · Slug',
    type: 'text',
    placeholder: 'Để trống để tự sinh từ tiêu đề',
    hint: 'Dạng URL, ví dụ: xe-dap-dien-vnbike-i1',
  },
  { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text', placeholder: 'Thẻ <title> (mặc định: tiêu đề)' },
  { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea', placeholder: '<meta name="description">' },
  {
    key: 'ogImagePath',
    label: 'SEO · Ảnh chia sẻ (og:image)',
    type: 'imageUrl',
    placeholder: 'Chọn từ Thư viện hoặc dán URL',
    hint: 'Ảnh hiện khi chia sẻ link trang này lên Facebook/Zalo. Trống thì dùng ảnh chia sẻ chung trong Cài đặt.',
  },
  { key: 'canonicalUrl', label: 'SEO · Canonical URL', type: 'text', placeholder: 'https://...' },
];

type SeoSource = Partial<Record<keyof SeoFormValues, string | null | undefined>>;

export function seoValuesFrom(source: SeoSource): SeoFormValues {
  return {
    slug: source.slug ?? '',
    metaTitle: source.metaTitle ?? '',
    metaDescription: source.metaDescription ?? '',
    ogImagePath: source.ogImagePath ?? '',
    canonicalUrl: source.canonicalUrl ?? '',
  };
}

export const SEO_NULLABLE_KEYS = [
  'metaTitle',
  'metaDescription',
  'ogImagePath',
  'canonicalUrl',
] as const;

export function buildSeoPayload(
  values: SeoFormValues,
): { slug: string } & Record<(typeof SEO_NULLABLE_KEYS)[number], string | null> {
  const toNullIfBlank = (value: string) => (value.trim() ? value : null);
  return {
    slug: values.slug,
    metaTitle: toNullIfBlank(values.metaTitle),
    metaDescription: toNullIfBlank(values.metaDescription),
    ogImagePath: toNullIfBlank(values.ogImagePath),
    canonicalUrl: toNullIfBlank(values.canonicalUrl),
  };
}
