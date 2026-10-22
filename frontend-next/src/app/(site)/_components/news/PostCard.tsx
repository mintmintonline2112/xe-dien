/**
 * Thẻ bài viết: dạng `card` (ảnh 16:9 trên, danh mục + ngày, tiêu đề, mô tả) hoặc `row` (ảnh nhỏ bên trái, tiêu đề + ngày).
 * Dùng bởi: section post-list, trang tin-tuc, bài liên quan ở tin-tuc/[slug].
 * Lưu ý: `showMeta` theo Admin → Cài đặt (ẩn ngày đăng toàn site); ảnh bìa `/images/...` là file tĩnh, còn lại lấy từ backend.
 */
import Link from "next/link";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { toImageUrl } from "@/app/(site)/_lib/cms";
import { siteRoutes } from "@/config/routes";
import type { BlogPost } from "@/types/cms";
import { cn } from "@/utils/cn";
import { formatPostDate } from "./post-format";

export function PostCard({
  post,
  variant = "card",
  showMeta = true,
  className,
}: {
  post: BlogPost;
  variant?: "card" | "row";
  showMeta?: boolean;
  className?: string;
}) {
  const href = siteRoutes.newsPost(post.slug);
  const cover = toImageUrl(post.coverImagePath);
  const date = showMeta ? formatPostDate(post.publishedAt) : "";

  if (variant === "row") {
    return (
      <article className={cn("group grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-3", className)}>
        <Link href={href} className="block aspect-4/3 overflow-hidden rounded-md bg-cream" tabIndex={-1} aria-hidden="true">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-400 ease-brand group-hover:scale-105 motion-reduce:transition-none" />
          ) : null}
        </Link>
        <div className="min-w-0">
          <h3 className="m-0 mb-1 line-clamp-2 font-main text-sm leading-snug font-semibold">
            <Link href={href} className="text-ink hover:text-navy-700">
              {post.title}
            </Link>
          </h3>
          {date ? <p className="m-0 text-2xs text-ink-faint">{date}</p> : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper transition-[box-shadow,border-color] duration-250 ease-brand hover:border-navy-600 hover:shadow-lift",
        className,
      )}
    >
      <Link href={href} className="news-card-thumb block aspect-video overflow-hidden bg-cream" tabIndex={-1} aria-hidden="true">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-105 motion-reduce:transition-none" />
        ) : (
          <span className="grid h-full w-full place-items-center text-navy-100">
            <SiteIcon name="bolt" className="h-12 w-12" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="m-0 mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs font-semibold tracking-sm uppercase">
          {post.category ? <span className="text-navy-700">{post.category.name}</span> : null}
          {date ? <span className="font-medium text-ink-faint normal-case">{date}</span> : null}
        </p>
        <h3 className="m-0 mb-2 line-clamp-2 font-main text-base leading-snug font-bold">
          <Link href={href} className="text-ink hover:text-navy-700">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="m-0 line-clamp-3 text-sm text-ink-soft">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
