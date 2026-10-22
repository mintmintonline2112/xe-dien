/**
 * Nhóm field "Bản dịch tiếng Anh (tuỳ chọn)" dùng chung cho form CMS: dựng field `en_<key>`, đọc giá trị từ translations.en, gom lại thành payload.
 * Dùng bởi: BlogCategoryForm, BlogPostForm, MenuItemForm, PageSectionForm, PageForm, ProductForm, ProductCategoryForm trong app/admin/(protected).
 * Lưu ý: nội dung gốc là tiếng Việt; backend nhận `translations: { en: { field } }`, trường để trống thì bản tiếng Anh (?lang=en) dùng
 * nội dung tiếng Việt. Richtext chỉ có <p></p> coi là rỗng; key cũ không nằm trong danh sách được giữ nguyên; trả null khi không còn
 * bản dịch nào (gửi translations: null để xóa).
 */
import type { GenericFormField, GenericFormGroup } from '@/app/admin/_components/generic-form/types';

export const EN_TRANSLATION_GROUP: GenericFormGroup = {
  id: 'en',
  title: 'Bản dịch tiếng Anh (tuỳ chọn)',
  description: 'Để trống thì phiên bản tiếng Anh dùng nội dung tiếng Việt.',
  collapsed: true,
};

export type EnFieldSpec = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext';
  placeholder?: string;
};

export const enFieldKey = (key: string) => `en_${key}`;

export function buildEnFields(specs: EnFieldSpec[]): GenericFormField[] {
  return specs.map((spec) => ({
    key: enFieldKey(spec.key),
    label: `${spec.label} (Tiếng Anh)`,
    type: spec.type,
    group: EN_TRANSLATION_GROUP.id,
    placeholder: spec.placeholder,
  }));
}

function enTranslationOf(translations: unknown): Record<string, unknown> {
  if (!translations || typeof translations !== 'object') return {};
  const enTranslation = (translations as Record<string, unknown>).en;
  if (!enTranslation || typeof enTranslation !== 'object' || Array.isArray(enTranslation)) return {};
  return enTranslation as Record<string, unknown>;
}

export type EnValues<K extends string> = { [P in K as `en_${P}`]: string };

export function enValuesFrom<K extends string>(
  translations: unknown,
  keys: readonly K[],
): EnValues<K> {
  const enTranslation = enTranslationOf(translations);
  const values: Record<string, string> = {};
  for (const key of keys) {
    const value = enTranslation[key];
    values[enFieldKey(key)] = typeof value === 'string' ? value : value == null ? '' : String(value);
  }
  return values as EnValues<K>;
}

const EMPTY_RICHTEXT_PATTERN = /^(\s*<p>\s*<\/p>\s*)+$/;

function toCleanTranslation(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || EMPTY_RICHTEXT_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function buildEnTranslationsPayload(
  values: object,
  keys: readonly string[],
  existing?: unknown,
): Record<string, Record<string, unknown>> | null {
  const enTranslation: Record<string, unknown> = {};
  const source = values as Record<string, unknown>;

  for (const [key, value] of Object.entries(enTranslationOf(existing))) {
    if (!keys.includes(key)) enTranslation[key] = value;
  }

  for (const key of keys) {
    const cleaned = toCleanTranslation(source[enFieldKey(key)]);
    if (cleaned !== null) enTranslation[key] = cleaned;
  }

  return Object.keys(enTranslation).length > 0 ? { en: enTranslation } : null;
}
