/**
 * Đọc nội dung CMS public từ backend (trang, bài viết, danh mục) và đổi đường dẫn media thành URL tuyệt đối.
 * Dùng bởi: các page.tsx và layout.tsx trong app/(site), SectionRenderer, sections/_shared, src/app/sitemap.ts.
 * Lưu ý: dữ liệu cache 60 giây theo tag ("pages", "blog-posts"); lỗi API thì trả null / [] để trang tự dùng bản dự phòng.
 * HAND_BUILT_PAGE_SLUGS: slug trang CMS chỉ giữ metadata / section cho route dựng tay (/, /san-pham, /tin-tuc, /lien-he),
 * không phục vụ ở /<slug> và không đưa vào sitemap.
 * Ảnh /images/... là file tĩnh của frontend, còn lại (uploads/...) trỏ về backend.
 */
import { ApiError, apiFetch } from "@/api/api-fetch";
import { env } from "@/config/env";
import type { BlogCategory, BlogPost, CmsPage, CmsPageSummary, Paginated } from "@/types/cms";

const CMS_REVALIDATE_SECONDS = 60;

export const HAND_BUILT_PAGE_SLUGS: ReadonlySet<string> = new Set(["home", "products", "news", "contact"]);

function buildCmsRequestInit(tag: string) {
  return {
    next: {
      revalidate: CMS_REVALIDATE_SECONDS,
      tags: [tag],
    },
  };
}

export type BlogPostQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
};

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    return await apiFetch<CmsPage | null>(
      `client/pages/${encodeURIComponent(slug)}`,
      buildCmsRequestInit("pages"),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function getCmsPageSummaries(): Promise<CmsPageSummary[]> {
  try {
    return await apiFetch<CmsPageSummary[]>("client/pages", buildCmsRequestInit("pages"));
  } catch {
    return [];
  }
}

export async function getBlogPosts(
  query: BlogPostQuery = {},
): Promise<Paginated<BlogPost> | null> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 12),
    orderBy: JSON.stringify([{ publishedAt: "DESC" }]),
  });
  if (query.search) params.set("search", query.search);
  if (query.categoryId) params.set("categoryId", String(query.categoryId));

  try {
    return await apiFetch<Paginated<BlogPost>>(
      `client/blog-posts?${params.toString()}`,
      buildCmsRequestInit("blog-posts"),
    );
  } catch {
    return null;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiFetch<BlogPost | null>(
      `client/blog-posts/slug/${encodeURIComponent(slug)}`,
      buildCmsRequestInit("blog-posts"),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    return await apiFetch<BlogCategory[]>(
      "client/blog-categories",
      buildCmsRequestInit("blog-posts"),
    );
  } catch {
    return [];
  }
}

export function toMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const apiOrigin = env.publicApiUrl.replace(/\/api$/, "");
  return `${apiOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function toImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("/images/") ? path : toMediaUrl(path);
}

export function buildSectionMap(page: CmsPage | null) {
  const sectionsByKey = new Map<string, CmsPage["sections"][number]>();
  for (const section of page?.sections ?? []) {
    if (section.isActive !== false) sectionsByKey.set(section.sectionKey, section);
  }
  return sectionsByKey;
}
