/**
 * Gọi API cài đặt website (đọc / lưu), kiểu SiteSettings, giới hạn cỡ chữ tiêu đề bài viết và danh sách font.
 * Dùng bởi: SettingsScreen, ContactPageScreen.
 * Lưu ý: POST_TITLE_MIN / MAX / DEFAULT (px, desktop) phải khớp POST_TITLE_* ở src/settings/site-settings.ts.
 * brandName trống / footerText trống thì website dùng chữ mặc định; footerText hiện sau "© <năm> ".
 */

import { adminApi } from '@/app/admin/_lib/admin-api';
import type { BrandColors } from '@/settings/brand-colors';
import type { ContactSocialKey, StoredContactPage } from '@/app/admin/(protected)/contact-page/_lib/contact-page-config';

export const SETTINGS_QUERY_KEY = ['admin', 'settings'] as const;

export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  brandName?: string;
  footerText?: string;
  faviconUrl?: string;
  logoUrl?: string;
  logoHeight?: number;
  footerLogoUrl?: string;
  footerLogoHeight?: number;
  heroImageUrl?: string;
  ogImageUrl?: string;
  fontFamily?: string;
  postTitleSize?: number;
  brandColors?: BrandColors | null;
  translateEnabled?: boolean;
  copyProtection?: boolean;
  showPostMeta?: boolean;
  socialLinks?: Partial<Record<ContactSocialKey, string>> | null;
  contactPage?: StoredContactPage | null;
}

export const settingsService = {
  get(): Promise<SiteSettings> {
    return adminApi.get<SiteSettings>('admin/settings');
  },
  update(values: Record<string, unknown>): Promise<SiteSettings> {
    return adminApi.put<SiteSettings>('admin/settings', values);
  },
};

export const POST_TITLE_MIN = 28;
export const POST_TITLE_MAX = 96;
export const POST_TITLE_DEFAULT = 56;

export const FONT_OPTIONS = [
  { value: '', label: 'Roboto (mặc định của website)' },
  { value: 'system', label: 'Font hệ thống (system-ui)' },
  { value: 'georgia', label: 'Georgia (serif)' },
  { value: 'times', label: 'Times New Roman (serif)' },
  { value: 'arial', label: 'Arial (sans-serif)' },
];
