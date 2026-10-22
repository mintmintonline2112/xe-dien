/**
 * Trang chủ (/): hiện các section đang bật của trang "home" trong CMS, theo thứ tự admin.
 * Dùng bởi: Next.js App Router (route /).
 * Lưu ý: API lỗi thì dùng bản dự phòng (_lib/fallback.ts). Tiêu đề SEO lấy metaTitle > Tiêu đề website,
 * không dùng page.title (tên nội bộ "Home") và không gắn đuôi tên brand.
 */
import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { getFallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata, resolveSiteSeo } from "@/app/(site)/_lib/seo";
import { getSiteSettings } from "@/settings/site-settings";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getCmsPage("home").then((cms) => cms ?? getFallbackPage("home")),
    getSiteSettings(),
  ]);
  return buildPageMetadata({
    title: page.metaTitle?.trim() || resolveSiteSeo(settings).title,
    absoluteTitle: true,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.home,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

export default async function HomePage() {
  const page = (await getCmsPage("home")) ?? getFallbackPage("home");
  return <PageSections page={page} />;
}
