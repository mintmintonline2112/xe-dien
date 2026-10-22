/**
 * Đa ngôn ngữ: nội dung gốc tiếng Việt; cột JSON `translations` (vd { en: { title, metadata } }) đè lên bản gốc khi client gửi `?lang=en`.
 * Dùng bởi: modules/client (pages, blog-posts, products), client-menu / client-settings controller, menu-items.service, translations.decorator.ts.
 * Lưu ý: chỉ đè field có giá trị khác rỗng (thiếu thì giữ tiếng Việt); `metadata` gộp thêm một cấp, mảng thay cả mảng,
 * riêng key `_component` và `layout` không bao giờ lấy từ bản dịch. Trả bản sao, không xoá `translations` gốc.
 */
export const BASE_LANG = 'vi' as const;
export const SUPPORTED_LANGS = ['vi', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export type TranslatableLang = Exclude<Lang, typeof BASE_LANG>;

export type Translations = Partial<
  Record<TranslatableLang, Record<string, unknown>>
>;

const STRUCTURAL_META_KEYS = ['_component', 'layout'];

export function normalizeLang(rawLang: unknown): Lang {
  return rawLang === 'en' ? 'en' : BASE_LANG;
}

export const isBaseLang = (lang: Lang): boolean => lang === BASE_LANG;

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return true;
}

export function mergeMetadataTranslation(
  base: unknown,
  translated: unknown,
): Record<string, unknown> | undefined {
  if (!isObject(translated)) return undefined;
  const merged: Record<string, unknown> = isObject(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(translated)) {
    if (STRUCTURAL_META_KEYS.includes(key) || !hasValue(value)) continue;
    merged[key] = value;
  }
  return merged;
}

export function applyTranslations<T extends { translations?: unknown }>(
  entity: T,
  lang: Lang,
): T {
  if (isBaseLang(lang) || !entity) return entity;
  const translatedFields = (
    entity.translations as Translations | null | undefined
  )?.[lang as TranslatableLang];
  if (!translatedFields || typeof translatedFields !== 'object') return entity;

  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(translatedFields)) {
    if (key === 'metadata') {
      const merged = mergeMetadataTranslation(
        (entity as Record<string, unknown>).metadata,
        value,
      );
      if (merged) patch.metadata = merged;
      continue;
    }
    if (hasValue(value)) patch[key] = value;
  }
  return Object.keys(patch).length ? { ...entity, ...patch } : entity;
}

export function isValidTranslations(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object' || Array.isArray(value)) return false;
  for (const [lang, translatedFields] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (lang === BASE_LANG || !SUPPORTED_LANGS.includes(lang as Lang))
      return false;
    if (
      translatedFields !== null &&
      (typeof translatedFields !== 'object' || Array.isArray(translatedFields))
    )
      return false;
  }
  return true;
}
