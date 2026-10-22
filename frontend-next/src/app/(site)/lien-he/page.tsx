/**
 * Trang Liên hệ (/lien-he): banner đầu trang có breadcrumb + các section đang bật của trang "contact" trong CMS.
 * Dùng bởi: Next.js App Router (route /lien-he).
 * Lưu ý: chữ banner lấy từ Admin → Trang Liên hệ, ô trống thì lấy của trang CMS; API lỗi thì dùng
 * bản dự phòng (_lib/fallback.ts).
 */
import type { Metadata } from "next";
import { Breadcrumbs } from "@/app/(site)/_components/Breadcrumbs";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { PageHero } from "@/app/(site)/_components/ui";
import { getCmsPage, toImageUrl } from "@/app/(site)/_lib/cms";
import { getFallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings } from "@/settings/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("contact")) ?? getFallbackPage("contact");
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.contact,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

export default async function ContactPage() {
  const [cmsPage, settings] = await Promise.all([getCmsPage("contact"), getSiteSettings()]);
  const page = cmsPage ?? getFallbackPage("contact");
  const hero = settings.contactPage?.hero ?? {};
  const title = hero.title?.trim() || page.title;

  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs items={[{ label: "Liên hệ" }]} light className="pt-0 pb-4" />}
        eyebrow={hero.eyebrow?.trim() || page.eyebrow}
        title={title}
        lead={hero.lead?.trim() || page.lead}
        image={toImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />
      <PageSections page={page} />
    </>
  );
}
