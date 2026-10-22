/**
 * Trang tất cả sản phẩm (/san-pham): lưới sản phẩm có sắp xếp, phân trang, tìm kiếm theo ?q= (ô tìm trên header gửi tới đây).
 * Dùng bởi: Next.js App Router (route /san-pham, nhận ?q=&sort=&page=).
 * Lưu ý: tiêu đề / giới thiệu / SEO lấy từ trang CMS slug "products" nếu có; trang kết quả tìm kiếm khai noindex để Google
 * không lập chỉ mục vô số URL tìm kiếm.
 */
import type { Metadata } from "next";
import { ProductListing, type ListingHrefParams } from "@/app/(site)/_components/catalog/ProductListing";
import { buildCategoryTree, getProductCategories, getProducts, isProductSort } from "@/app/(site)/_lib/catalog";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

const PRODUCTS_PER_PAGE = 20;
const DEFAULT_TITLE = "Tất cả sản phẩm";

type ProductsSearchParams = { q?: string; sort?: string; page?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}): Promise<Metadata> {
  const [params, page] = await Promise.all([searchParams, getCmsPage("products")]);
  const query = params.q?.trim();
  return buildPageMetadata({
    title: query ? `Tìm kiếm: ${query}` : page?.metaTitle ?? page?.title ?? DEFAULT_TITLE,
    description: page?.metaDescription ?? page?.lead,
    path: siteRoutes.products,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
    noIndex: Boolean(query),
  });
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ProductsSearchParams> }) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const sort = isProductSort(params.sort) ? params.sort : query ? "name" : "featured";
  const pageNumber = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [cmsPage, categories, result] = await Promise.all([
    getCmsPage("products"),
    getProductCategories(),
    getProducts({ page: pageNumber, limit: PRODUCTS_PER_PAGE, search: query, sort }),
  ]);

  const hrefOf = ({ sort: nextSort, page }: ListingHrefParams) =>
    siteRoutes.productsFiltered({
      q: query,
      sort: nextSort && nextSort !== "featured" ? nextSort : undefined,
      page: page && page > 1 ? page : undefined,
    });

  return (
    <ProductListing
      title={query ? `Kết quả tìm kiếm “${query}”` : cmsPage?.title ?? DEFAULT_TITLE}
      intro={query ? null : cmsPage?.lead}
      crumbs={query ? [{ label: "Sản phẩm", href: siteRoutes.products }, { label: "Tìm kiếm" }] : [{ label: "Sản phẩm" }]}
      categories={buildCategoryTree(categories)}
      result={result}
      sort={sort}
      hrefOf={hrefOf}
      searchQuery={query}
    />
  );
}
