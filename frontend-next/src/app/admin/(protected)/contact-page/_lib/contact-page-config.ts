/**
 * Kiểu JSON `contactPage` (site_settings) mà admin đọc / ghi: tiêu đề trang, mạng xã hội, thông tin cửa hàng, form tư vấn, bản dịch `en`.
 * Dùng bởi: ContactPageScreen.tsx (+ toStoredInterests cho danh sách nhu cầu mặc định của site), settings/_components/SettingsScreen.tsx, settings/_lib/settings.service.ts.
 * Lưu ý: phải khớp kiểu ContactPageConfig của site (src/settings/contact-page.ts) — nội dung gốc tiếng Việt, bản dịch nằm trong
 * từng nhóm dưới key `en`. Các field hotline / zalo / messenger là kênh liên hệ nhanh của cửa hàng xe điện.
 */

export type ContactSocialKey = 'facebook' | 'youtube' | 'instagram' | 'tiktok' | 'zalo';

export type StoredContactInterest = { value: string; en?: string };

export function toStoredInterests(interests: ReadonlyArray<{ value: string }>): StoredContactInterest[] {
  return interests.map((interest) => {
    const englishLabel = (interest as { en?: unknown }).en;
    return { value: interest.value, ...(typeof englishLabel === 'string' && englishLabel ? { en: englishLabel } : {}) };
  });
}

export type StoredCompany = {
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

export type StoredContactPage = {
  hero?: {
    eyebrow?: string;
    title?: string;
    lead?: string;
    en?: { eyebrow?: string; title?: string; lead?: string };
  };
  social?: Partial<Record<ContactSocialKey, string>>;
  company?: StoredCompany;
  form?: {
    enabled?: boolean;
    kicker?: string;
    title?: string;
    interests?: StoredContactInterest[];
    note?: string;
    en?: { kicker?: string; title?: string; note?: string };
  };
};

export const CONTACT_SOCIAL_FIELDS: Array<[ContactSocialKey, string, string]> = [
  ['facebook', 'Facebook', 'https://facebook.com/ten-trang'],
  ['zalo', 'Zalo OA', 'https://zalo.me/so-dien-thoai-hoac-oa'],
  ['youtube', 'YouTube', 'https://youtube.com/@kenh'],
  ['tiktok', 'TikTok', 'https://tiktok.com/@tai-khoan'],
  ['instagram', 'Instagram', 'https://instagram.com/tai-khoan'],
];

