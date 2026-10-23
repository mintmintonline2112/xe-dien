/**
 * Kiểu JSON `contactPage` (site_settings) mà admin đọc / ghi: tiêu đề trang, mạng xã hội, thông tin cửa hàng, form tư vấn.
 * Dùng bởi: ContactPageScreen.tsx, settings/_components/SettingsScreen.tsx, settings/_lib/settings.service.ts.
 * Lưu ý: phải khớp kiểu ContactPageConfig của site (src/settings/contact-page.ts). DB cũ có thể còn bản dịch dưới key `en` trong
 * từng nhóm; admin không sửa nhưng giữ nguyên khi lưu. Các field hotline / zalo / messenger là kênh liên hệ nhanh của cửa hàng xe điện.
 */

export type ContactSocialKey = 'facebook' | 'youtube' | 'instagram' | 'tiktok' | 'zalo';

export type StoredContactInterest = { value: string };

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
};

export type StoredContactPage = {
  hero?: {
    eyebrow?: string;
    title?: string;
    lead?: string;
  };
  social?: Partial<Record<ContactSocialKey, string>>;
  company?: StoredCompany;
  form?: {
    enabled?: boolean;
    kicker?: string;
    title?: string;
    interests?: StoredContactInterest[];
    note?: string;
  };
};

export const CONTACT_SOCIAL_FIELDS: Array<[ContactSocialKey, string, string]> = [
  ['facebook', 'Facebook', 'https://facebook.com/ten-trang'],
  ['zalo', 'Zalo OA', 'https://zalo.me/so-dien-thoai-hoac-oa'],
  ['youtube', 'YouTube', 'https://youtube.com/@kenh'],
  ['tiktok', 'TikTok', 'https://tiktok.com/@tai-khoan'],
  ['instagram', 'Instagram', 'https://instagram.com/tai-khoan'],
];

