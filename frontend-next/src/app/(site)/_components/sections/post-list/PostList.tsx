/**
 * Section `post-list`: bài viết mới nhất lấy từ API tin tức; bố cục `grid` (lưới 4 thẻ) hoặc `list` (1 bài lớn bên trái + danh sách bên phải).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.categorySlug (trống = mọi danh mục), limit, ctaLabel, ctaHref
 * (trống thì trỏ về /tin-tuc hoặc trang tin của danh mục). Ẩn ngày đăng theo Admin → Cài đặt. Không có bài thì ẩn khối.
 */
import { PostCard } from "@/app/(site)/_components/news/PostCard";
import { getBlogCategories, getBlogPosts } from "@/app/(site)/_lib/cms";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings } from "@/settings/site-settings";
import type { BlogPost } from "@/types/cms";
import {
  RowHead,
  Shell,
  alternatingTone,
  anchorIdOf,
  layoutOf,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["grid", "list"] as const;

export async function PostList({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "grid");
  const categorySlug = textOf(section, "categorySlug");
  const limit = Number.parseInt(textOf(section, "limit") ?? "", 10) || (layout === "list" ? 5 : 4);

  const [categories, settings] = await Promise.all([
    categorySlug ? getBlogCategories() : Promise.resolve([]),
    getSiteSettings(),
  ]);
  const category = categories.find((entry) => entry.slug === categorySlug);
  const result = await getBlogPosts({ limit, categoryId: category?.id });
  const posts = result?.data ?? [];
  if (posts.length === 0) return null;

  const showMeta = settings.showPostMeta !== false;
  const ctaHref = textOf(section, "ctaHref") ?? (category ? siteRoutes.newsCategory(category.slug) : siteRoutes.news);

  return (
    <Shell id={anchorIdOf(section, "post-list")} tone={alternatingTone(index)}>
      <RowHead section={section} ctaLabel={textOf(section, "ctaLabel")} ctaHref={ctaHref} />
      {layout === "list" ? (
        <ListBody posts={posts} showMeta={showMeta} />
      ) : (
        <ul
          className="reveal reveal-group m-0 grid list-none grid-cols-4 gap-4 p-0 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1"
          data-stagger="70"
        >
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} showMeta={showMeta} />
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function ListBody({ posts, showMeta }: { posts: BlogPost[]; showMeta: boolean }) {
  const [featured, ...others] = posts;
  return (
    <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-6 max-[900px]:grid-cols-1">
      <div className="reveal">
        <PostCard post={featured} showMeta={showMeta} />
      </div>
      {others.length > 0 ? (
        <ul className="reveal reveal-group m-0 flex list-none flex-col gap-4 p-0" data-stagger="70">
          {others.map((post) => (
            <li key={post.id} className="border-b border-b-line-soft pb-4 last:border-b-0 last:pb-0">
              <PostCard post={post} variant="row" showMeta={showMeta} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
