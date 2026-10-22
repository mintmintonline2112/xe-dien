/**
 * Đọc danh mục sản phẩm từ backend cho site public: danh sách sản phẩm (lọc / sắp xếp / phân trang), chi tiết theo slug, cây danh mục.
 * Dùng bởi: trang san-pham, danh-muc, sections product-grid / category-grid, layout (menu danh mục, footer), src/app/sitemap.ts.
 * Lưu ý: cache 60 giây theo tag "products" (backend ping revalidate khi admin sửa); lỗi API thì trả null / [] để trang tự ẩn khối.
 * Tham số khớp docs/catalog-api.md — đổi ở đó thì đổi ở đây.
 */
import { ApiError, apiFetch } from "@/api/api-fetch";
import type { Paginated, Product, ProductCategory } from "@/types/cms";

const CATALOG_REVALIDATE_SECONDS = 60;

const CATALOG_REQUEST_INIT = {
  next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["products"] },
};

export const PRODUCT_SORTS = ["featured", "newest", "price_asc", "price_desc", "name"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductQuery = {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  brand?: string;
  exclude?: number;
  sort?: ProductSort;
};

export function isProductSort(value: unknown): value is ProductSort {
  return typeof value === "string" && (PRODUCT_SORTS as readonly string[]).includes(value);
}

function toProductSearchParams(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 12),
  });
  if (query.category) params.set("category", query.category);
  if (query.featured) params.set("featured", "1");
  if (query.search) params.set("search", query.search);
  if (query.brand) params.set("brand", query.brand);
  if (query.exclude) params.set("exclude", String(query.exclude));
  if (query.sort) params.set("sort", query.sort);
  return params;
}

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product> | null> {
  try {
    return await apiFetch<Paginated<Product>>(
      `client/products?${toProductSearchParams(query).toString()}`,
      CATALOG_REQUEST_INIT,
    );
  } catch {
    return null;
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product | null>(
      `client/products/slug/${encodeURIComponent(slug)}`,
      CATALOG_REQUEST_INIT,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    return (await apiFetch<ProductCategory[]>("client/product-categories", CATALOG_REQUEST_INIT)) ?? [];
  } catch {
    return [];
  }
}

export async function getProductCategory(slug: string): Promise<ProductCategory | null> {
  try {
    return await apiFetch<ProductCategory | null>(
      `client/product-categories/slug/${encodeURIComponent(slug)}`,
      CATALOG_REQUEST_INIT,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export type CategoryNode = ProductCategory & { children: ProductCategory[] };

export function buildCategoryTree(categories: ProductCategory[]): CategoryNode[] {
  const roots = categories.filter((category) => !category.parentId);
  return roots.map((root) => ({
    ...root,
    children: categories.filter((category) => category.parentId === root.id),
  }));
}
