/**
 * Ngôn ngữ của site: gốc tiếng Việt (`vi`), bản dịch phụ `en` lưu ở cột translations phía backend, truy vấn qua `?lang=en`.
 * Dùng bởi: settings/site-settings.ts, settings/contact-page.ts.
 * Lưu ý: site public hiện chỉ render tiếng Việt; file chỉ giữ type / helper tối thiểu.
 */
export const LANGS = ["vi", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "vi";

export const HTML_LANG: Record<Lang, string> = { vi: "vi", en: "en" };
export const INTL_LOCALE: Record<Lang, string> = { vi: "vi-VN", en: "en-US" };

export function isLang(value: unknown): value is Lang {
  return value === "vi" || value === "en";
}
