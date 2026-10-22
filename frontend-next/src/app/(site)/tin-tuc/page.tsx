/**
 * Trang tin tức (/tin-tuc): banner, chip lọc danh mục, bài nổi bật (trang 1, chưa lọc), lưới bài có phân trang.
 * Dùng bởi: Next.js App Router (route /tin-tuc, nhận ?category=&page=).
 * Lưu ý: tiêu đề / mô tả / ảnh banner lấy từ trang CMS slug "news" (trống thì dùng chữ mặc định); ẩn ngày đăng theo Admin → Cài đặt.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/app/(site)/_components/Breadcrumbs";
import { Pagination } from "@/app/(site)/_components/catalog/Pagination";
import { PostCard } from "@/app/(site)/_components/news/PostCard";
import { formatPostDate } from "@/app/(site)/_components/news/post-format";
import { getBlogCategories, getBlogPosts, getCmsPage, toImageUrl } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings } from "@/settings/site-settings";
import type { BlogPost } from "@/types/cms";
import { cn } from "@/utils/cn";

const POSTS_PER_PAGE = 9;
const DEFAULT_TITLE = "Tin tức xe điện";
const DEFAULT_LEAD = "Kinh nghiệm chọn xe, hướng dẫn sử dụng – bảo dưỡng, đánh giá mẫu mới và chương trình khuyến mãi.";

const CHIP = "inline-block rounded-full border px-4 py-1.5 text-sm font-medium transition-[background-color,color,border-color] duration-200 ease-brand";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("news");
  return buildPageMetadata({
    title: page?.metaTitle ?? page?.title ?? DEFAULT_TITLE,
    description: page?.metaDescription ?? page?.lead ?? DEFAULT_LEAD,
    path: siteRoutes.news,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [cmsPage, settings, allCategories] = await Promise.all([getCmsPage("news"), getSiteSettings(), getBlogCategories()]);
  const categories = allCategories.filter((category) => category.isActive !== false && !category.parentId);
  const activeCategory = params.category ? categories.find((category) => category.slug === params.category) : undefined;
  const showMeta = settings.showPostMeta !== false;

  const result = await getBlogPosts({ page: pageNumber, limit: POSTS_PER_PAGE, categoryId: activeCategory?.id });
  const posts = result?.data ?? [];
  const showFeatured = pageNumber === 1 && !activeCategory && posts.length > 3;
  const [featured, ...rest] = posts;
  const gridPosts: BlogPost[] = showFeatured ? rest : posts;

  const hrefOf = (page: number) =>
    siteRoutes.newsFiltered({ category: activeCategory?.slug, page: page > 1 ? page : undefined });

  return (
    <section className="pb-(--section-pad)">
      <div className="site-container">
        <Breadcrumbs items={activeCategory ? [{ label: "Tin tức", href: siteRoutes.news }, { label: activeCategory.name }] : [{ label: "Tin tức" }]} />
        <header className="mb-6">
          <h1 className="mb-2 text-h1">{activeCategory?.name ?? cmsPage?.title ?? DEFAULT_TITLE}</h1>
          <p className="m-0 max-w-[48rem] text-ink-soft">{cmsPage?.lead ?? DEFAULT_LEAD}</p>
        </header>

        {categories.length > 0 ? (
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="Danh mục tin">
            <Link
              href={siteRoutes.news}
              className={cn(CHIP, !activeCategory ? "border-navy-700 bg-navy-700 text-light" : "border-line bg-paper text-ink-soft hover:border-navy-700 hover:text-navy-700")}
            >
              Tất cả
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={siteRoutes.newsCategory(category.slug)}
                className={cn(
                  CHIP,
                  activeCategory?.slug === category.slug
                    ? "border-navy-700 bg-navy-700 text-light"
                    : "border-line bg-paper text-ink-soft hover:border-navy-700 hover:text-navy-700",
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        ) : null}

        {showFeatured && featured ? <FeaturedPost post={featured} showMeta={showMeta} /> : null}

        {gridPosts.length > 0 ? (
          <ul className="reveal reveal-group m-0 grid list-none grid-cols-3 gap-5 p-0 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1" data-stagger="70">
            {gridPosts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} showMeta={showMeta} />
              </li>
            ))}
          </ul>
        ) : posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-paper px-6 py-12 text-center text-ink-faint">
            {result ? "Chưa có bài viết nào trong mục này." : "Chưa tải được bài viết — vui lòng thử lại sau."}
          </p>
        ) : null}

        <Pagination page={pageNumber} totalPages={result?.meta.totalPages ?? 1} hrefOf={hrefOf} />
      </div>
    </section>
  );
}

function FeaturedPost({ post, showMeta }: { post: BlogPost; showMeta: boolean }) {
  const cover = toImageUrl(post.coverImagePath);
  return (
    <article className="reveal mb-8 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] overflow-hidden rounded-lg border border-line bg-paper shadow-soft max-[900px]:grid-cols-1">
      <Link href={siteRoutes.newsPost(post.slug)} className="news-featured-photo block aspect-video overflow-hidden bg-cream max-[900px]:aspect-video" tabIndex={-1} aria-hidden="true">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : null}
      </Link>
      <div className="flex flex-col justify-center p-[clamp(1.25rem,3vw,2.25rem)]">
        <p className="m-0 mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-sm uppercase">
          <span className="rounded-full bg-gold-400 px-3 py-1 text-ink">Nổi bật</span>
          {post.category ? <span className="text-navy-700">{post.category.name}</span> : null}
          {showMeta && post.publishedAt ? <span className="font-medium text-ink-faint normal-case">{formatPostDate(post.publishedAt)}</span> : null}
        </p>
        <h2 className="mb-3 text-h3 leading-tight">
          <Link href={siteRoutes.newsPost(post.slug)} className="text-ink hover:text-navy-700">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="mb-4 line-clamp-4 text-ink-soft">{post.excerpt}</p> : null}
        <Link href={siteRoutes.newsPost(post.slug)} className="btn btn-primary btn-sm self-start">
          Đọc tiếp
        </Link>
      </div>
    </article>
  );
}
