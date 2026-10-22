/**
 * Trang bài viết (/tin-tuc/<slug>): breadcrumb, tiêu đề + danh mục + ngày + phút đọc, ảnh bìa, nội dung; cột phải có bài mới,
 * sản phẩm mua nhiều và hộp hotline; cuối trang là bài cùng danh mục.
 * Dùng bởi: Next.js App Router (route động /tin-tuc/[slug]).
 * Lưu ý: nội dung qua sanitizeRichText trước khi render; ẩn ngày / phút đọc theo Admin → Cài đặt (showPostMeta); cỡ tiêu đề theo postTitleSize.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/app/(site)/_components/Breadcrumbs";
import { PostCard } from "@/app/(site)/_components/news/PostCard";
import { formatPostDate, formatReadingTime } from "@/app/(site)/_components/news/post-format";
import { ProductCard } from "@/app/(site)/_components/catalog/ProductCard";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { getProducts } from "@/app/(site)/_lib/catalog";
import { getBlogPost, getBlogPosts, toImageUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, POST_TITLE_DEFAULT, resolveContact } from "@/settings/site-settings";

const SIDEBAR_TITLE = "mb-4 border-b-2 border-b-navy-700 pb-2 font-main text-base font-bold uppercase";

type PostParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: PostParams }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false } };
  return buildPageMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    path: siteRoutes.newsPost(post.slug),
    image: post.ogImagePath ?? post.coverImagePath,
    canonical: post.canonicalUrl,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function NewsDetailPage({ params }: { params: PostParams }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getBlogPost(slug), getSiteSettings()]);
  if (!post) notFound();

  const [latest, related, featuredProducts] = await Promise.all([
    getBlogPosts({ limit: 6 }),
    post.categoryId ? getBlogPosts({ limit: 5, categoryId: post.categoryId }) : Promise.resolve(null),
    getProducts({ featured: true, limit: 3 }),
  ]);
  const latestPosts = (latest?.data ?? []).filter((entry) => entry.id !== post.id).slice(0, 5);
  const relatedPosts = (related?.data ?? []).filter((entry) => entry.id !== post.id).slice(0, 4);
  const showMeta = settings.showPostMeta !== false;
  const contact = resolveContact(settings);
  const cover = toImageUrl(post.coverImagePath);
  const titleSize =
    settings.postTitleSize && settings.postTitleSize !== POST_TITLE_DEFAULT
      ? `min(${settings.postTitleSize}px, 8.5vw)`
      : undefined;

  const crumbs: Crumb[] = [{ label: "Tin tức", href: siteRoutes.news }];
  if (post.category) crumbs.push({ label: post.category.name, href: siteRoutes.newsCategory(post.category.slug) });
  crumbs.push({ label: post.title });

  return (
    <section className="pb-(--section-pad)">
      <div className="site-container">
        <Breadcrumbs items={crumbs} />
        <div className="grid grid-cols-[minmax(0,1fr)_20rem] items-start gap-8 max-[1000px]:grid-cols-1">
          <article className="min-w-0 rounded-lg border border-line bg-paper p-[clamp(1.25rem,3.5vw,2.5rem)]">
            <p className="m-0 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
              {post.category ? (
                <Link
                  href={siteRoutes.newsCategory(post.category.slug)}
                  className="rounded-full bg-navy-50 px-3 py-1 font-semibold tracking-sm text-navy-700 uppercase hover:bg-navy-700 hover:text-light"
                >
                  {post.category.name}
                </Link>
              ) : null}
              {showMeta && post.publishedAt ? <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time> : null}
              {showMeta ? <span>{formatReadingTime(post.content)}</span> : null}
            </p>
            <h1 className="mb-4 text-h1 leading-tight text-balance" style={titleSize ? { fontSize: titleSize } : undefined}>
              {post.title}
            </h1>
            {post.excerpt ? <p className="mb-6 text-lg font-medium text-ink-soft">{post.excerpt}</p> : null}
            {cover ? (
              <figure className="news-featured-photo m-0 mb-8 aspect-video overflow-hidden rounded-lg bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={post.title} fetchPriority="high" className="h-full w-full object-cover" />
              </figure>
            ) : null}
            <div className="post-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }} />
            <p className="mt-10 mb-0 border-t border-t-line pt-5">
              <Link href={siteRoutes.news} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-800">
                <SiteIcon name="chevron-left" className="h-4 w-4" />
                Xem tất cả tin tức
              </Link>
            </p>
          </article>

          <aside className="flex flex-col gap-6">
            <div className="rounded-lg bg-navy-800 p-5 text-light">
              <p className="m-0 mb-1 text-sm text-light-soft">Cần tư vấn chọn xe?</p>
              <a href={contact.phoneHref} className="flex items-center gap-2 font-display text-2xl font-extrabold text-gold-300 hover:text-light">
                <SiteIcon name="phone" className="h-6 w-6" />
                {contact.phone}
              </a>
              <p className="m-0 mt-2 text-xs text-light-soft">Tổng đài miễn phí {contact.hotline} · {contact.hours}</p>
            </div>

            {latestPosts.length > 0 ? (
              <div className="rounded-lg border border-line bg-paper p-5">
                <h2 className={SIDEBAR_TITLE}>Bài viết mới</h2>
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {latestPosts.map((entry) => (
                    <li key={entry.id}>
                      <PostCard post={entry} variant="row" showMeta={showMeta} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(featuredProducts?.data.length ?? 0) > 0 ? (
              <div className="rounded-lg border border-line bg-paper p-5">
                <h2 className={SIDEBAR_TITLE}>Sản phẩm mua nhiều</h2>
                <ul className="m-0 grid list-none gap-3 p-0 max-[1000px]:grid-cols-3 max-[640px]:grid-cols-2">
                  {featuredProducts!.data.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {relatedPosts.length > 0 ? (
          <div className="mt-[clamp(2.5rem,5vw,4rem)]">
            <h2 className="mb-6 border-b-2 border-b-navy-700 pb-3 text-h3">Bài viết cùng chủ đề</h2>
            <ul className="reveal reveal-group m-0 grid list-none grid-cols-4 gap-4 p-0 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1" data-stagger="70">
              {relatedPosts.map((entry) => (
                <li key={entry.id}>
                  <PostCard post={entry} showMeta={showMeta} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
