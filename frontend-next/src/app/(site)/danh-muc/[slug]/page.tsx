/**
 * Trang danh mục sản phẩm (/danh-muc/<slug>): giới thiệu danh mục, chip danh mục con, lưới sản phẩm (gồm cả danh mục con) có sắp xếp + phân trang.
 * Dùng bởi: Next.js App Router (route động /danh-muc/[slug], nhận ?sort=&page=).
 * Lưu ý: slug không có hoặc danh mục đang tắt thì 404. SEO lấy metaTitle / metaDescription / ogImagePath của danh mục (Admin → Danh mục sản phẩm).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing, type ListingHrefParams } from "@/app/(site)/_components/catalog/ProductListing";
import {
  buildCategoryTree,
  getProductCategories,
  getProductCategory,
  getProducts,
  isProductSort,
} from "@/app/(site)/_lib/catalog";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import type { Crumb } from "@/app/(site)/_components/Breadcrumbs";

const PRODUCTS_PER_PAGE = 20;

type CategoryParams = Promise<{ slug: string }>;
type CategorySearchParams = Promise<{ sort?: string; page?: string }>;

export async function generateMetadata({ params }: { params: CategoryParams }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getProductCategory(slug);
  if (!category) return { title: "Không tìm thấy danh mục", robots: { index: false } };
  return buildPageMetadata({
    title: category.metaTitle ?? category.name,
    description: category.metaDescription ?? category.description?.replace(/<[^>]+>/g, " ").trim().slice(0, 300),
    path: siteRoutes.category(category.slug),
    image: category.ogImagePath ?? category.imagePath,
    canonical: category.canonicalUrl,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: CategoryParams;
  searchParams: CategorySearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const sort = isProductSort(query.sort) ? query.sort : "featured";
  const pageNumber = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);

  const [category, categories, result] = await Promise.all([
    getProductCategory(slug),
    getProductCategories(),
    getProducts({ category: slug, page: pageNumber, limit: PRODUCTS_PER_PAGE, sort }),
  ]);
  if (!category) notFound();

  const crumbs: Crumb[] = [{ label: "Sản phẩm", href: siteRoutes.products }];
  if (category.parent) crumbs.push({ label: category.parent.name, href: siteRoutes.category(category.parent.slug) });
  crumbs.push({ label: category.name });

  const hrefOf = ({ sort: nextSort, page }: ListingHrefParams) =>
    siteRoutes.categoryFiltered(category.slug, {
      sort: nextSort && nextSort !== "featured" ? nextSort : undefined,
      page: page && page > 1 ? page : undefined,
    });

  return (
    <ProductListing
      title={category.name}
      intro={category.description}
      crumbs={crumbs}
      categories={buildCategoryTree(categories)}
      activeSlug={category.slug}
      childCategories={category.children ?? []}
      result={result}
      sort={sort}
      hrefOf={hrefOf}
    />
  );
}
