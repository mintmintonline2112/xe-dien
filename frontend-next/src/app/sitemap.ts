/**
 * Sinh /sitemap.xml: trang tĩnh + danh mục sản phẩm + toàn bộ sản phẩm + danh mục tin + toàn bộ bài viết đã đăng
 * (lấy qua mọi trang phân trang của API), cache 1 giờ.
 * Dùng bởi: Next.js App Router (metadata route).
 * Lưu ý: API lỗi / tắt lúc build thì vẫn sinh sitemap chỉ gồm trang tĩnh; ngày hỏng thì dùng thời điểm hiện tại.
 */
import type { MetadataRoute } from "next";
import { getProductCategories, getProducts } from "@/app/(site)/_lib/catalog";
import { getBlogCategories, getBlogPosts } from "@/app/(site)/_lib/cms";
import { toAbsoluteUrl } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export const revalidate = 3600;

const POSTS_PER_REQUEST = 100;
const PRODUCTS_PER_REQUEST = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: toAbsoluteUrl(siteRoutes.home), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: toAbsoluteUrl(siteRoutes.products), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: toAbsoluteUrl(siteRoutes.news), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: toAbsoluteUrl(siteRoutes.contact), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  let categories: Awaited<ReturnType<typeof getBlogCategories>> = [];
  let posts: Awaited<ReturnType<typeof fetchAllPosts>> = [];
  let productCategories: Awaited<ReturnType<typeof getProductCategories>> = [];
  let products: Awaited<ReturnType<typeof fetchAllProducts>> = [];
  try {
    [categories, posts, productCategories, products] = await Promise.all([
      getBlogCategories(),
      fetchAllPosts(),
      getProductCategories(),
      fetchAllProducts(),
    ]);
  } catch {
    categories = [];
    posts = [];
  }

  const productCategoryEntries: MetadataRoute.Sitemap = productCategories.map((category) => ({
    url: toAbsoluteUrl(siteRoutes.category(category.slug)),
    lastModified: toValidDate(category.updatedAt, now),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: toAbsoluteUrl(siteRoutes.product(product.slug)),
    lastModified: toValidDate(product.updatedAt ?? product.publishedAt, now),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({
      url: toAbsoluteUrl(siteRoutes.newsCategory(category.slug)),
      lastModified: toValidDate(category.updatedAt, now),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: toAbsoluteUrl(siteRoutes.newsPost(post.slug)),
    lastModified: toValidDate(post.updatedAt ?? post.publishedAt, now),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productCategoryEntries, ...productEntries, ...categoryEntries, ...postEntries];
}

function toValidDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function fetchAllPosts() {
  const firstPage = await getBlogPosts({ page: 1, limit: POSTS_PER_REQUEST });
  if (!firstPage) return [];
  const laterPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.meta.totalPages - 1) }, (_, i) =>
      getBlogPosts({ page: i + 2, limit: POSTS_PER_REQUEST }),
    ),
  );
  return [firstPage, ...laterPages].flatMap((page) => page?.data ?? []);
}

async function fetchAllProducts() {
  const firstPage = await getProducts({ page: 1, limit: PRODUCTS_PER_REQUEST, sort: "newest" });
  if (!firstPage) return [];
  const laterPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.meta.totalPages - 1) }, (_, i) =>
      getProducts({ page: i + 2, limit: PRODUCTS_PER_REQUEST, sort: "newest" }),
    ),
  );
  return [firstPage, ...laterPages].flatMap((page) => page?.data ?? []);
}
