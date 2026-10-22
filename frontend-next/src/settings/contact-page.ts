/**
 * Kiểu cấu hình trang Liên hệ (site_settings key `contactPage`, quản trị tại /admin/contact-page) và hàm định dạng hiển thị.
 * Dùng bởi: settings/site-settings.ts, lien-he/page.tsx, sections contact / store-list, ContactPageScreen.tsx, SettingsScreen.tsx, settings.service.ts.
 * Lưu ý: mọi trường đều tùy chọn, thiếu thì trang dùng mặc định trong code; bản dịch tiếng Anh (tuỳ chọn) nằm ngay trong từng nhóm dưới key `en`.
 * `company.hotline` = tổng đài miễn phí, `company.phone` = hotline mua hàng, `company.zalo` = số Zalo (hoặc link zalo.me).
 */
import type { Lang } from "@/config/i18n";
import type { SocialLinks } from "@/settings/site-settings";

export type ContactInterest = {
  value: string;
  en?: string;
};

export type ContactPageConfig = {
  hero?: {
    eyebrow?: string;
    title?: string;
    lead?: string;
    en?: { eyebrow?: string; title?: string; lead?: string };
  };
  social?: SocialLinks;
  company?: {
    name?: string;
    location?: string;
    address?: string;
    phone?: string;
    hotline?: string;
    zalo?: string;
    messenger?: string;
    email?: string;
    hours?: string;
    mapUrl?: string;
    en?: { name?: string; location?: string; address?: string; hours?: string };
  };
  form?: {
    enabled?: boolean;
    kicker?: string;
    title?: string;
    interests?: ContactInterest[];
    note?: string;
    en?: { kicker?: string; title?: string; note?: string };
  };
};

export const DEFAULT_INTERESTS: ContactInterest[] = [
  { value: "Tư vấn chọn xe", en: "Vehicle advice" },
  { value: "Báo giá sỉ / đăng ký đại lý", en: "Wholesale & dealership" },
  { value: "Bảo hành – sửa chữa", en: "Warranty & repair" },
  { value: "Mua trả góp", en: "Installment purchase" },
  { value: "Góp ý – khiếu nại", en: "Feedback & complaints" },
];

export function pickLocalizedText<T extends Record<string, unknown>>(
  group: (T & { en?: Partial<T> }) | undefined,
  key: keyof T & string,
  lang: Lang,
): string {
  const translatedValue = lang === "en" ? group?.en?.[key] : undefined;
  const value = (typeof translatedValue === "string" && translatedValue.trim()) || group?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export function interestLabelOf(item: ContactInterest, lang: Lang): string {
  return (lang === "en" && item.en?.trim()) || item.value;
}

export function toPhoneDigits(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function toTelHref(phone: string): string {
  return `tel:${toPhoneDigits(phone)}`;
}

export function formatPhone(phone: string): string {
  const trimmed = phone.trim();
  return /^\d{10}$/.test(trimmed) ? `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7)}` : trimmed;
}

export function toDisplayUrl(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}
