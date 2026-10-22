/**
 * Khung trang danh sách sản phẩm: breadcrumb, cột trái cây danh mục, đầu trang (tiêu đề, giới thiệu, chip danh mục con), thanh sắp xếp,
 * lưới sản phẩm, phân trang, trạng thái không có kết quả.
 * Dùng bởi: app/(site)/san-pham/page.tsx (tất cả / tìm kiếm), app/(site)/danh-muc/[slug]/page.tsx.
 * Lưu ý: mọi bộ lọc nằm trên URL (?sort=&page=&q=) nên không cần JS; trang truyền `hrefOf` để dựng link giữ nguyên bộ lọc.
 */
import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/app/(site)/_components/Breadcrumbs";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { SearchForm } from "@/app/(site)/_components/layout/SearchForm";
import { toHtml } from "@/app/(site)/_components/sections/_shared";
import type { CategoryNode, ProductSort } from "@/app/(site)/_lib/catalog";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { siteRoutes } from "@/config/routes";
import type { Paginated, Product, ProductCategory } from "@/types/cms";
import { cn } from "@/utils/cn";
import { Pagination } from "./Pagination";
import { ProductCardGrid } from "./ProductCardGrid";

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "featured", label: "Nổi bật" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
];

const CHIP = "inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-[border-color,background-color,color] duration-200 ease-brand";
const CHIP_IDLE = "border-line bg-paper text-ink-soft hover:border-navy-700 hover:text-navy-700";
const CHIP_ACTIVE = "border-navy-700 bg-navy-700 text-light";

export type ListingHrefParams = { sort?: ProductSort; page?: number };

export function ProductListing({
  title,
  intro,
  crumbs,
  categories,
  activeSlug,
  childCategories = [],
  result,
  sort,
  hrefOf,
  searchQuery,
}: {
  title: string;
  intro?: string | null;
  crumbs: Crumb[];
  categories: CategoryNode[];
  activeSlug?: string;
  childCategories?: ProductCategory[];
  result: Paginated<Product> | null;
  sort: ProductSort;
  hrefOf: (params: ListingHrefParams) => string;
  searchQuery?: string;
}) {
  const products = result?.data ?? [];
  const total = result?.meta.total ?? 0;
  const page = result?.meta.page ?? 1;
  const totalPages = result?.meta.totalPages ?? 1;

  return (
    <section className="pb-(--section-pad)">
      <div className="site-container">
        <Breadcrumbs items={crumbs} />
        <div className="grid grid-cols-[16rem_minmax(0,1fr)] items-start gap-6 max-[1000px]:grid-cols-1">
          <CategorySidebar categories={categories} activeSlug={activeSlug} />

          <div className="min-w-0">
            <header className="mb-5 rounded-lg border border-line bg-paper p-5 max-[640px]:p-4">
              <h1 className="mb-1 text-h2">{title}</h1>
              {intro ? (
                <div
                  className="max-w-[60rem] text-sm text-ink-soft [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(toHtml(intro)) }}
                />
              ) : null}
              {childCategories.length > 0 ? (
                <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                  {childCategories.map((child) => (
                    <li key={child.id}>
                      <Link href={siteRoutes.category(child.slug)} className={cn(CHIP, CHIP_IDLE)}>
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </header>

            <MobileCategoryChips categories={categories} activeSlug={activeSlug} />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-sm text-ink-faint">
                <strong className="text-ink">{total}</strong> sản phẩm
                {searchQuery ? (
                  <>
                    {" "}cho “<strong className="text-ink">{searchQuery}</strong>”
                  </>
                ) : null}
              </p>
              <nav className="flex flex-wrap items-center gap-2" aria-label="Sắp xếp">
                <span className="text-sm text-ink-faint max-[640px]:hidden">Sắp xếp:</span>
                {SORT_OPTIONS.map((option) => (
                  <Link
                    key={option.value}
                    href={hrefOf({ sort: option.value })}
                    className={cn(CHIP, "px-3 py-1 text-xs", option.value === sort ? CHIP_ACTIVE : CHIP_IDLE)}
                    aria-current={option.value === sort ? "true" : undefined}
                    scroll={false}
                  >
                    {option.label}
                  </Link>
                ))}
              </nav>
            </div>

            {products.length > 0 ? (
              <ProductCardGrid products={products} columns={4} priorityCount={4} />
            ) : (
              <EmptyResult searchQuery={searchQuery} />
            )}

            <Pagination page={page} totalPages={totalPages} hrefOf={(pageNumber) => hrefOf({ sort, page: pageNumber })} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySidebar({ categories, activeSlug }: { categories: CategoryNode[]; activeSlug?: string }) {
  if (categories.length === 0) return null;
  return (
    <aside className="sticky top-[8.5rem] overflow-hidden rounded-lg border border-line bg-paper max-[1000px]:hidden">
      <p className="m-0 flex items-center gap-2 bg-navy-700 px-4 py-3 text-sm font-bold tracking-xs text-light uppercase">
        <SiteIcon name="grid" className="h-4 w-4 text-gold-300" />
        Danh mục sản phẩm
      </p>
      <ul className="m-0 list-none p-0 py-1">
        <li>
          <Link
            href={siteRoutes.products}
            className={cn("block px-4 py-2 text-sm hover:text-navy-700", !activeSlug ? "font-bold text-navy-700" : "text-ink")}
          >
            Tất cả sản phẩm
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = category.slug === activeSlug || category.children.some((child) => child.slug === activeSlug);
          return (
            <li key={category.id} className="border-t border-t-line-soft">
              <Link
                href={siteRoutes.category(category.slug)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-sm hover:text-navy-700",
                  category.slug === activeSlug ? "font-bold text-navy-700" : "font-medium text-ink",
                )}
              >
                <SiteIcon name={category.icon} className="h-4.5 w-4.5 text-navy-700" strokeWidth={1.6} />
                <span className="flex-1">{category.name}</span>
                {category.productCount ? <span className="text-2xs text-ink-faint">{category.productCount}</span> : null}
              </Link>
              {isActive && category.children.length > 0 ? (
                <ul className="m-0 list-none bg-cream py-1 pl-11">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={siteRoutes.category(child.slug)}
                        className={cn(
                          "block py-1.5 pr-4 text-xs hover:text-navy-700",
                          child.slug === activeSlug ? "font-bold text-navy-700" : "text-ink-soft",
                        )}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function MobileCategoryChips({ categories, activeSlug }: { categories: CategoryNode[]; activeSlug?: string }) {
  if (categories.length === 0) return null;
  return (
    <ul className="-mx-4 mb-4 hidden list-none gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] max-[1000px]:flex">
      <li>
        <Link href={siteRoutes.products} className={cn(CHIP, !activeSlug ? CHIP_ACTIVE : CHIP_IDLE)}>
          Tất cả
        </Link>
      </li>
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={siteRoutes.category(category.slug)}
            className={cn(
              CHIP,
              category.slug === activeSlug || category.children.some((child) => child.slug === activeSlug) ? CHIP_ACTIVE : CHIP_IDLE,
            )}
          >
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyResult({ searchQuery }: { searchQuery?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper px-6 py-12 text-center">
      <SiteIcon name="search" className="mx-auto mb-3 h-10 w-10 text-navy-100" />
      <p className="mb-1 text-lg font-semibold text-ink">
        {searchQuery ? "Không tìm thấy sản phẩm phù hợp" : "Danh mục đang cập nhật sản phẩm"}
      </p>
      <p className="mb-5 text-sm text-ink-faint">Thử từ khoá khác hoặc gọi hotline để được tư vấn mẫu xe phù hợp.</p>
      <SearchForm id="empty-search" defaultValue={searchQuery} className="mx-auto max-w-[28rem]" />
    </div>
  );
}
