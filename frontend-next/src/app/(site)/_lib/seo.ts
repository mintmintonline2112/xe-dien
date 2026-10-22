/**
 * Dựng metadata SEO (title, description, canonical, Open Graph, Twitter) cho từng trang public.
 * Dùng bởi: mọi page.tsx và layout.tsx trong app/(site), src/app/sitemap.ts (toAbsoluteUrl).
 * Lưu ý: openGraph / twitter của page GHI ĐÈ nguyên khối của layout (Next.js không merge sâu) nên phải điền đủ mọi field.
 * toAbsoluteUrl thêm "/" cuối theo `trailingSlash: true` để canonical không bị redirect. Tiêu đề đã chứa tên brand thì không gắn đuôi.
 */
import type { Metadata } from "next";
import { env } from "@/config/env";
import {
  brandNameOf,
  DEFAULT_BRAND_NAME,
  getSiteSettings,
  type SiteSettings,
} from "@/settings/site-settings";
import { toMediaUrl } from "./cms";

export const SITE_NAME = DEFAULT_BRAND_NAME;
export const SITE_DEFAULT_TITLE = "Xe Điện Xanh — Xe điện chính hãng, giá tận xưởng, trả góp 0%";
export const SITE_DEFAULT_DESCRIPTION =
  "Hệ thống phân phối xe đạp điện, xe máy điện, xe điện 3 bánh, ô tô điện, xe chuyên dụng và phụ tùng chính hãng. Giao xe tận nhà, bảo hành toàn quốc, trả góp 0%.";
export const DEFAULT_OG_IMAGE = "/images/hero/hero-1.webp";
export const SITE_LOCALE = "vi_VN";

export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const [pathname, queryAndHash = ""] = path.split(/(?=[?#])/, 2);
  const pathnameWithSlash =
    pathname === "/" || pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(pathname)
      ? pathname
      : `${pathname}/`;
  return `${env.siteUrl}${pathnameWithSlash}${queryAndHash}`;
}

export function resolveSiteSeo(settings: SiteSettings) {
  return {
    name: brandNameOf(settings),
    title: settings.siteTitle?.trim() || SITE_DEFAULT_TITLE,
    description: settings.siteDescription?.trim() || SITE_DEFAULT_DESCRIPTION,
  };
}

export type PageSeoInput = {
  title: string;
  absoluteTitle?: boolean;
  description?: string | null;
  path: string;
  image?: string | null;
  canonical?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
};

export async function buildPageMetadata(input: PageSeoInput): Promise<Metadata> {
  const settings = await getSiteSettings();
  const site = resolveSiteSeo(settings);

  const description = input.description ?? site.description;
  const image =
    toMediaUrl(input.image) ?? settings.ogImageUrl ?? settings.heroImageUrl ?? DEFAULT_OG_IMAGE;
  const url = toAbsoluteUrl(input.canonical ?? input.path);
  const isAbsoluteTitle = input.absoluteTitle || input.title.includes(site.name);
  const socialTitle = isAbsoluteTitle ? input.title : `${input.title} — ${site.name}`;
  const type = input.type ?? "website";

  return {
    title: isAbsoluteTitle ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: site.name,
      locale: SITE_LOCALE,
      title: socialTitle,
      description,
      url,
      images: [{ url: image, alt: socialTitle }],
      ...(type === "article"
        ? {
            publishedTime: input.publishedTime ?? undefined,
            modifiedTime: input.modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
