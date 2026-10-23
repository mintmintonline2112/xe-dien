/**
 * Kiểu cấu hình trang Liên hệ (site_settings key `contactPage`, quản trị tại /admin/contact-page) và hàm định dạng hiển thị.
 * Dùng bởi: settings/site-settings.ts, lien-he/page.tsx, sections contact / store-list, ContactPageScreen.tsx, SettingsScreen.tsx, settings.service.ts.
 * Lưu ý: mọi trường đều tùy chọn, thiếu thì trang dùng mặc định trong code. Site chỉ render tiếng Việt; bản dịch `en` cũ (nếu còn
 * trong DB) bị bỏ qua. `company.hotline` = tổng đài miễn phí, `company.phone` = hotline mua hàng, `company.zalo` = số Zalo (hoặc link zalo.me).
 */
import type { SocialLinks } from "@/settings/site-settings";

export type ContactInterest = {
  value: string;
};

export type ContactPageConfig = {
  hero?: {
    eyebrow?: string;
    title?: string;
    lead?: string;
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
  };
  form?: {
    enabled?: boolean;
    kicker?: string;
    title?: string;
    interests?: ContactInterest[];
    note?: string;
  };
};

export const DEFAULT_INTERESTS: ContactInterest[] = [
  { value: "Tư vấn chọn xe" },
  { value: "Báo giá sỉ / đăng ký đại lý" },
  { value: "Bảo hành – sửa chữa" },
  { value: "Mua trả góp" },
  { value: "Góp ý – khiếu nại" },
];

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
