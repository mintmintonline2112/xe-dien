/**
 * Khung chung của site public: metadata mặc định, header (menu CMS + cây danh mục sản phẩm), nội dung, footer, nút liên hệ nổi,
 * hiệu ứng, chặn sao chép.
 * Dùng bởi: Next.js App Router (bọc mọi trang trong app/(site)).
 * Lưu ý: font, logo, màu thương hiệu, favicon, SEO, liên hệ, hạn chế sao chép đều đọc từ Admin → Cài đặt / Trang Liên hệ; ô trống thì
 * giữ mặc định. Logo /images/... là file tĩnh, ảnh Thư viện (/uploads/...) đi qua toMediaUrl. Site không khai noindex.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactDock } from "@/app/(site)/_components/layout/ContactDock";
import { CopyGuard } from "@/app/(site)/_components/layout/CopyGuard";
import { Footer } from "@/app/(site)/_components/layout/Footer";
import { Header } from "@/app/(site)/_components/layout/Header";
import { SiteEffects } from "@/app/(site)/_components/layout/SiteEffects";
import { buildCategoryTree, getProductCategories } from "@/app/(site)/_lib/catalog";
import { toMediaUrl } from "@/app/(site)/_lib/cms";
import { getSiteMenu } from "@/app/(site)/_lib/menu";
import { DEFAULT_OG_IMAGE, resolveSiteSeo, SITE_LOCALE } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { buildBrandColorsCss } from "@/settings/brand-colors";
import { faviconHrefOf, FONT_STACKS, getSiteSettings, resolveContact } from "@/settings/site-settings";

const BRAND_TAGLINE = "Xe điện chính hãng";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = settings.ogImageUrl ?? settings.heroImageUrl ?? DEFAULT_OG_IMAGE;
  const site = resolveSiteSeo(settings);
  return {
    title: { default: site.title, template: `%s — ${site.name}` },
    icons: { icon: faviconHrefOf(settings) },
    description: site.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: SITE_LOCALE,
      title: site.title,
      description: site.description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [menu, footerMenu, settings, categories] = await Promise.all([
    getSiteMenu("header"),
    getSiteMenu("footer"),
    getSiteSettings(),
    getProductCategories(),
  ]);
  const categoryTree = buildCategoryTree(categories);

  const fontStack = settings.fontFamily ? FONT_STACKS[settings.fontFamily] : undefined;

  const logoUrlOf = (path?: string | null) =>
    !path ? null : path.startsWith("/images/") ? path : toMediaUrl(path);
  const brand = {
    logoUrl: logoUrlOf(settings.logoUrl),
    logoHeight: settings.logoHeight ?? null,
    brandName: settings.brandName ?? null,
    tagline: BRAND_TAGLINE,
  };
  const footerBrand = settings.footerLogoUrl
    ? { ...brand, logoUrl: logoUrlOf(settings.footerLogoUrl), logoHeight: settings.footerLogoHeight ?? null }
    : brand;

  const contact = resolveContact(settings);
  const brandCss = buildBrandColorsCss(settings.brandColors);

  return (
    <>
      {fontStack ? <style>{`:root { --font-main: ${fontStack}; }`}</style> : null}
      {brandCss ? <style>{brandCss}</style> : null}
      {settings.copyProtection !== false ? <CopyGuard /> : null}
      <SiteEffects />
      <Header
        menu={menu}
        categories={categoryTree}
        brand={brand}
        contact={contact}
        social={settings.socialLinks}
        installmentHref={siteRoutes.page("mua-tra-gop")}
      />
      <main id="main">{children}</main>
      <Footer
        brand={footerBrand}
        contact={contact}
        menu={footerMenu}
        categories={categoryTree}
        social={settings.socialLinks}
        footerText={settings.footerText ?? null}
      />
      <ContactDock contact={contact} />
    </>
  );
}
