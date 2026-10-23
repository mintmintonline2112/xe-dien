/**
 * Trang CMS tự do (/<slug>): giới thiệu, chính sách, mua trả góp, hệ thống showroom… — banner có breadcrumb + các section của trang
 * render qua SectionRenderer + dải kêu gọi gọi điện cuối trang.
 * Dùng bởi: Next.js App Router (route động /[slug]).
 * Lưu ý: slug của các trang dựng tay (HAND_BUILT_PAGE_SLUGS trong _lib/cms.ts: home, products, news, contact) trả 404, riêng "home" chuyển về "/".
 * Hotline của dải cuối trang lấy từ Admin → Trang Liên hệ.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/app/(site)/_components/Breadcrumbs";
import { activeSectionsOf, SectionRenderer } from "@/app/(site)/_components/SectionRenderer";
import { CtaBand, PageHero, SECTION, SECTION_NOTE } from "@/app/(site)/_components/ui";
import { getCmsPage, HAND_BUILT_PAGE_SLUGS, toImageUrl } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params;
  if (HAND_BUILT_PAGE_SLUGS.has(slug)) return {};
  const page = await getCmsPage(slug);
  if (!page) return { title: "Không tìm thấy trang", robots: { index: false } };
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.page(page.slug),
    image: page.ogImagePath ?? page.heroImagePath,
    canonical: page.canonicalUrl,
  });
}

export default async function CmsGenericPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  if (slug === "home") redirect("/");
  if (HAND_BUILT_PAGE_SLUGS.has(slug)) notFound();

  const [page, settings] = await Promise.all([getCmsPage(slug), getSiteSettings()]);
  if (!page) notFound();

  const sections = activeSectionsOf(page);
  const contact = resolveContact(settings);

  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs items={[{ label: page.title }]} light className="pt-0 pb-4" />}
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        image={toImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />

      {sections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}

      {sections.length === 0 ? (
        <section className={SECTION}>
          <div className="site-container">
            <p className={cn(SECTION_NOTE, "reveal")}>Nội dung trang đang được cập nhật.</p>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Tư vấn miễn phí 8:00 – 21:00"
        title="Bạn cần tư vấn chọn xe điện phù hợp?"
        text="Gọi hotline hoặc ghé showroom gần nhất để được xem xe, lái thử và nhận báo giá tốt nhất."
      >
        <a href={contact.phoneHref} className="btn btn-gold">
          Gọi {contact.phone}
        </a>
        <Link href={siteRoutes.products} className="btn btn-ghost">
          Xem sản phẩm
        </Link>
      </CtaBand>
    </>
  );
}
