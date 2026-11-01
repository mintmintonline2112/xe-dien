/**
 * Cài đặt toàn site do admin chỉnh tại /admin/settings: kiểu dữ liệu, đọc từ API (cache 60s, tag settings), tên thương hiệu, favicon, thông tin liên hệ.
 * Dùng bởi: app/(site)/layout.tsx và các trang / layout component của site, app/admin/layout.tsx, các màn cài đặt của admin.
 * Lưu ý: lỗi API thì trả object rỗng để site dùng mặc định trong code / CSS. Favicon `/images/...` là file tĩnh của frontend, còn lại nằm ở API.
 */
import { apiFetch } from "@/api/api-fetch";
import { SITE_CONTACT } from "@/config/contact";
import { env } from "@/config/env";

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
  brandColors?: import("@/settings/brand-colors").BrandColors | null;
  translateEnabled?: boolean;
  copyProtection?: boolean;
  showPostMeta?: boolean;
  socialLinks?: SocialLinks;
  contactPage?: import("@/settings/contact-page").ContactPageConfig | null;
}

export type SocialKey = "facebook" | "youtube" | "instagram" | "tiktok" | "zalo";
export type SocialLinks = Partial<Record<SocialKey, string>>;

export const DEFAULT_BRAND_NAME = "Trạm Xe Điện";

export const DEFAULT_FAVICON = "/favicon.svg";

export function brandNameOf(settings: SiteSettings): string {
  return settings.brandName?.trim() || DEFAULT_BRAND_NAME;
}

export function faviconHrefOf(settings: SiteSettings): string {
  const path = settings.faviconUrl?.trim();
  if (!path) return DEFAULT_FAVICON;
  if (/^https?:\/\//.test(path) || path.startsWith("/images/")) return path;
  const apiOrigin = env.publicApiUrl.replace(/\/api$/, "");
  return `${apiOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const POST_TITLE_MIN = 28;
export const POST_TITLE_MAX = 96;
export const POST_TITLE_DEFAULT = 56;

export const FONT_STACKS: Record<string, string> = {
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  times: "'Times New Roman', Times, serif",
  arial: "Arial, Helvetica, sans-serif",
};

const toTelLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export function toZaloLink(zalo: string): string {
  return /^https?:\/\//.test(zalo) ? zalo : `https://zalo.me/${zalo.replace(/[^\d]/g, "")}`;
}

export function resolveContact(settings: SiteSettings) {
  const company = settings.contactPage?.company ?? {};
  const phone = company.phone?.trim() || SITE_CONTACT.phone;
  const hotline = company.hotline?.trim() || SITE_CONTACT.hotline;
  const zalo = company.zalo?.trim() || settings.socialLinks?.zalo?.trim() || SITE_CONTACT.zalo;
  return {
    name: company.name?.trim() || brandNameOf(settings),
    location: company.location?.trim() || SITE_CONTACT.location,
    address: company.address?.trim() || SITE_CONTACT.address,
    email: company.email?.trim() || SITE_CONTACT.email,
    phone,
    phoneHref: toTelLink(phone),
    hotline,
    hotlineHref: toTelLink(hotline),
    zaloHref: zalo ? toZaloLink(zalo) : null,
    messengerHref: company.messenger?.trim() || null,
    hours: company.hours?.trim() || SITE_CONTACT.hours,
    mapUrl: company.mapUrl?.trim() || null,
  };
}

export type SiteContact = ReturnType<typeof resolveContact>;

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await apiFetch<SiteSettings>("client/settings", {
      next: { revalidate: 60, tags: ["settings"] },
    });
    return settings ?? {};
  } catch {
    return {};
  }
}
