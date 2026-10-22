/**
 * Trang chi tiết sản phẩm (/san-pham/<slug>): bộ ảnh, giá + trả góp, điểm nổi bật, khuyến mãi, nút gọi / trả góp / Zalo, bài mô tả,
 * bảng thông số, form đăng ký tư vấn gắn sẵn sản phẩm, sản phẩm cùng danh mục; kèm dữ liệu cấu trúc Product (JSON-LD).
 * Dùng bởi: Next.js App Router (route động /san-pham/[slug]).
 * Lưu ý: sản phẩm chưa xuất bản / không có thì 404. Bốn cam kết dưới nút mua (PRODUCT_ASSURANCES) là chữ cố định của trang;
 * hotline + Zalo lấy từ Admin → Trang Liên hệ. Nút "Đăng ký trả góp" cuộn tới form #tu-van.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/app/(site)/_components/Breadcrumbs";
import { ConsultForm } from "@/app/(site)/_components/forms";
import { PriceTag } from "@/app/(site)/_components/catalog/PriceTag";
import { ProductCardGrid } from "@/app/(site)/_components/catalog/ProductCardGrid";
import { ProductGallery } from "@/app/(site)/_components/catalog/ProductGallery";
import {
  discountPercentOf,
  formatVnd,
  hasDiscount,
  monthlyInstallmentOf,
} from "@/app/(site)/_components/catalog/price-format";
import { stockLabelOf } from "@/app/(site)/_components/catalog/stock-status";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { getProduct, getProducts } from "@/app/(site)/_lib/catalog";
import { toImageUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { buildPageMetadata, toAbsoluteUrl } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import type { Product } from "@/types/cms";

const RELATED_LIMIT = 10;

const PRODUCT_ASSURANCES = [
  { icon: "truck", text: "Giao xe tận nhà, lắp ráp miễn phí" },
  { icon: "shield", text: "Bảo hành chính hãng toàn quốc" },
  { icon: "refresh", text: "Đổi trả trong 7 ngày nếu lỗi" },
  { icon: "wallet", text: "Thanh toán khi nhận xe" },
] as const;

type ProductParams = Promise<{ slug: string }>;

function imagesOf(product: Product): string[] {
  const paths = [product.thumbnailPath, ...(product.gallery ?? [])].filter((path): path is string => Boolean(path));
  return [...new Set(paths)].map((path) => toImageUrl(path)).filter((url): url is string => Boolean(url));
}

function plainTextOf(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function buildProductJsonLd(product: Product, images: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.map((image) => toAbsoluteUrl(image)),
    description: product.excerpt ?? plainTextOf(product.content).slice(0, 300),
    sku: product.sku ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    ...(product.price != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "VND",
            price: product.price,
            availability:
              product.stockStatus === "out_of_stock"
                ? "https://schema.org/OutOfStock"
                : product.stockStatus === "pre_order"
                  ? "https://schema.org/PreOrder"
                  : "https://schema.org/InStock",
            url: toAbsoluteUrl(siteRoutes.product(product.slug)),
          },
        }
      : {}),
  };
}

export async function generateMetadata({ params }: { params: ProductParams }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm", robots: { index: false } };
  return buildPageMetadata({
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.excerpt ?? plainTextOf(product.content).slice(0, 300),
    path: siteRoutes.product(product.slug),
    image: product.ogImagePath ?? product.thumbnailPath,
    canonical: product.canonicalUrl,
  });
}

export default async function ProductDetailPage({ params }: { params: ProductParams }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSiteSettings()]);
  if (!product) notFound();

  const contact = resolveContact(settings);
  const images = imagesOf(product);
  const discount = discountPercentOf(product.price, product.originalPrice);
  const monthly = monthlyInstallmentOf(product.price);
  const promotions = (product.promotion ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  const highlights = (product.highlights ?? []).filter((line) => line.trim());
  const specs = (product.specs ?? []).filter((spec) => spec.label?.trim() && spec.value?.trim());
  const related = product.category
    ? ((await getProducts({ category: product.category.slug, exclude: product.id, limit: RELATED_LIMIT }))?.data ?? [])
    : [];

  const crumbs: Crumb[] = [{ label: "Sản phẩm", href: siteRoutes.products }];
  if (product.category?.parent) {
    crumbs.push({ label: product.category.parent.name, href: siteRoutes.category(product.category.parent.slug) });
  }
  if (product.category) crumbs.push({ label: product.category.name, href: siteRoutes.category(product.category.slug) });
  crumbs.push({ label: product.title });

  return (
    <>
      <section className="pb-[clamp(2rem,4vw,3rem)]">
        <div className="site-container">
          <Breadcrumbs items={crumbs} />
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start gap-[clamp(1.5rem,4vw,3rem)] rounded-lg border border-line bg-paper p-[clamp(1rem,3vw,2rem)] max-[900px]:grid-cols-1">
            <ProductGallery images={images} title={product.title} discountLabel={discount ? `-${discount}%` : null} />

            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand ? (
                  <span className="rounded-md bg-navy-50 px-2.5 py-1 text-xs font-bold tracking-sm text-navy-700 uppercase">{product.brand}</span>
                ) : null}
                {product.badge ? (
                  <span className="rounded-md bg-gold-400 px-2.5 py-1 text-xs font-bold tracking-sm text-ink uppercase">{product.badge}</span>
                ) : null}
              </div>
              <h1 className="m-0 text-h2 leading-tight">{product.title}</h1>
              <p className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-faint">
                {product.sku ? <span>Mã: <strong className="text-ink-soft">{product.sku}</strong></span> : null}
                <span className="inline-flex items-center gap-1.5">
                  <span className={product.stockStatus === "out_of_stock" ? "h-2 w-2 rounded-full bg-danger" : "h-2 w-2 rounded-full bg-navy-600"} aria-hidden="true" />
                  {stockLabelOf(product.stockStatus)}
                </span>
                {product.category ? (
                  <Link href={siteRoutes.category(product.category.slug)} className="text-navy-700 hover:text-navy-800">
                    {product.category.name}
                  </Link>
                ) : null}
              </p>

              <div className="rounded-lg bg-cream p-4">
                <PriceTag price={product.price} originalPrice={product.originalPrice} size="lg" />
                {hasDiscount(product.price, product.originalPrice) ? (
                  <p className="m-0 mt-2 text-sm font-semibold text-sale">
                    Tiết kiệm {formatVnd(product.originalPrice - (product.price ?? 0))}
                  </p>
                ) : null}
                {monthly ? (
                  <p className="m-0 mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                    <SiteIcon name="card" className="h-4 w-4 text-navy-700" />
                    Trả góp 0% chỉ từ <strong className="text-navy-700">{formatVnd(monthly)}</strong>/tháng (12 tháng)
                  </p>
                ) : (
                  <p className="m-0 mt-2 text-sm text-ink-soft">Gọi hotline để nhận báo giá tốt nhất và cấu hình theo nhu cầu.</p>
                )}
              </div>

              {product.excerpt ? <p className="m-0 text-ink-soft">{product.excerpt}</p> : null}

              {highlights.length > 0 ? (
                <ul className="m-0 grid list-none gap-2 p-0">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2.5 text-sm text-ink">
                      <SiteIcon name="check" className="mt-0.5 h-4 w-4 text-navy-700" strokeWidth={2.4} />
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}

              {promotions.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-sale/40">
                  <p className="m-0 flex items-center gap-2 bg-sale px-4 py-2 text-sm font-bold text-light uppercase">
                    <SiteIcon name="gift" className="h-4 w-4" />
                    Khuyến mãi
                  </p>
                  <ul className="m-0 grid list-none gap-1.5 p-4">
                    {promotions.map((promotion, index) => (
                      <li key={promotion} className="flex items-start gap-2.5 text-sm text-ink">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sale text-2xs font-bold text-light">
                          {index + 1}
                        </span>
                        {promotion}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                <a href={contact.phoneHref} className="btn btn-sale btn-lg col-span-2 flex-col gap-0 py-3 max-[640px]:col-span-1">
                  <span className="inline-flex items-center gap-2">
                    <SiteIcon name="phone" className="h-5 w-5" />
                    Gọi đặt mua: {contact.phone}
                  </span>
                  <span className="text-xs font-medium opacity-90">Tư vấn miễn phí, giao xe tận nhà</span>
                </a>
                <a href="#tu-van" className="btn btn-gold">
                  <SiteIcon name="card" className="h-5 w-5" />
                  Đăng ký trả góp
                </a>
                {contact.zaloHref ? (
                  <a href={contact.zaloHref} target="_blank" rel="noopener noreferrer" className="btn btn-zalo">
                    <SiteIcon name="chat" className="h-5 w-5" />
                    Tư vấn qua Zalo
                  </a>
                ) : (
                  <a href={contact.hotlineHref} className="btn btn-primary">
                    <SiteIcon name="headset" className="h-5 w-5" />
                    Tổng đài {contact.hotline}
                  </a>
                )}
              </div>

              <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-2.5 border-t border-t-line pt-4 p-0 max-[640px]:grid-cols-1">
                {PRODUCT_ASSURANCES.map((assurance) => (
                  <li key={assurance.text} className="flex items-center gap-2 text-sm text-ink-soft">
                    <SiteIcon name={assurance.icon} className="h-5 w-5 text-navy-700" />
                    {assurance.text}
                  </li>
                ))}
              </ul>
              {product.warranty ? (
                <p className="m-0 flex items-start gap-2 rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-800">
                  <SiteIcon name="shield" className="mt-0.5 h-4 w-4" />
                  {product.warranty}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {product.content || specs.length > 0 ? (
        <section className="pb-[clamp(2rem,4vw,3rem)]">
          <div className="site-container grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start gap-6 max-[1000px]:grid-cols-1">
            {product.content ? (
              <article className="min-w-0 rounded-lg border border-line bg-paper p-[clamp(1.25rem,3vw,2rem)]">
                <h2 className="mb-4 border-b-2 border-b-navy-700 pb-3 text-h3">Đặc điểm nổi bật</h2>
                <div className="post-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(product.content) }} />
              </article>
            ) : null}
            {specs.length > 0 ? (
              <aside className="sticky top-[8.5rem] rounded-lg border border-line bg-paper p-[clamp(1.25rem,3vw,1.75rem)] max-[1000px]:static">
                <h2 className="mb-4 border-b-2 border-b-navy-700 pb-3 text-h3">Thông số kỹ thuật</h2>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {specs.map((spec, index) => (
                      <tr key={`${spec.label}-${index}`} className="odd:bg-cream">
                        <th scope="row" className="w-[42%] px-3 py-2.5 text-left align-top font-medium text-ink-faint">
                          {spec.label}
                        </th>
                        <td className="px-3 py-2.5 align-top font-semibold text-ink">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </aside>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        id="tu-van"
        className="bg-[linear-gradient(160deg,var(--navy-900)_0%,var(--navy-800)_100%)] py-[clamp(2.5rem,5vw,4rem)] text-light"
      >
        <div className="site-container grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-[clamp(2rem,5vw,4rem)] max-[900px]:grid-cols-1">
          <div>
            <h2 className="text-h2 text-light">Quan tâm {product.title}?</h2>
            <p className="text-light-soft">
              Để lại thông tin, chuyên viên sẽ gọi lại tư vấn màu sắc, cấu hình, thủ tục trả góp và thời gian giao xe phù hợp với bạn.
            </p>
            <a href={contact.phoneHref} className="inline-flex items-center gap-2 font-display text-h4 font-extrabold text-gold-300 hover:text-light">
              <SiteIcon name="phone" className="h-6 w-6" />
              {contact.phone}
            </a>
          </div>
          <ConsultForm
            productId={product.id}
            productName={product.title}
            title="Nhận tư vấn & báo giá"
            subtitle="Miễn phí, không ràng buộc — gọi lại trong 15 phút."
          />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="py-[clamp(2.5rem,5vw,4rem)]">
          <div className="site-container">
            <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-b-navy-700 pb-3">
              <h2 className="m-0 text-h3">Sản phẩm cùng danh mục</h2>
              {product.category ? (
                <Link href={siteRoutes.category(product.category.slug)} className="text-sm font-semibold whitespace-nowrap text-navy-700 hover:text-navy-800">
                  Xem tất cả
                </Link>
              ) : null}
            </div>
            <ProductCardGrid products={related} isRail />
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product, images)) }}
      />
    </>
  );
}
