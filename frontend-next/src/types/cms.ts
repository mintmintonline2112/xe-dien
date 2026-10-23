/**
 * Kiểu dữ liệu CMS mà site public đọc từ API: sản phẩm, danh mục sản phẩm, bài viết, danh mục tin, trang, section, phân trang, bản dịch.
 * Dùng bởi: app/(site)/_lib (cms, catalog, fallback), _components/catalog, SectionRenderer.tsx, sections/_shared, các trang sản phẩm / tin tức.
 * Lưu ý: field sản phẩm khớp docs/catalog-api.md; giá là số VNĐ nguyên, null = "Liên hệ".
 */
export type PublishStatus = "draft" | "published" | "archived";

export type Translations = Partial<
  Record<"en", Record<string, unknown>>
> | null;

export type BaseEntityFields = {
  id: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  translations?: Translations;
};

export type SeoContentFields = BaseEntityFields & {
  title: string;
  slug: string;
  status: PublishStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
};

export type BlogCategory = BaseEntityFields & {
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
};

export type BlogPost = SeoContentFields & {
  categoryId: number | null;
  category: BlogCategory | null;
  authorStaffId: string | null;
  excerpt: string | null;
  content: string;
  coverImagePath: string | null;
  videoPath: string | null;
  videoOrientation: "landscape" | "portrait" | null;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
};

export type StockStatus = "in_stock" | "pre_order" | "out_of_stock";

export type ProductSpec = { label: string; value: string };

export type ProductCategory = BaseEntityFields & {
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  imagePath: string | null;
  icon: string | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  productCount?: number;
  parent?: ProductCategory | null;
  children?: ProductCategory[];
};

export type ProductCategoryRef = Pick<ProductCategory, "id" | "name" | "slug"> & {
  parentId?: number | null;
  parent?: ProductCategoryRef | null;
};

export type Product = SeoContentFields & {
  categoryId: number | null;
  category: ProductCategoryRef | null;
  sku: string | null;
  brand: string | null;
  price: number | null;
  originalPrice: number | null;
  badge: string | null;
  stockStatus: StockStatus;
  isFeatured: boolean;
  excerpt: string | null;
  content: string | null;
  thumbnailPath: string | null;
  gallery: string[] | null;
  specs: ProductSpec[] | null;
  highlights: string[] | null;
  promotion: string | null;
  warranty: string | null;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
};

export type PageSection = BaseEntityFields & {
  pageId: number;
  sectionKey: string;
  heading: string | null;
  subheading: string | null;
  content: string | null;
  mediaPath: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
};

export type CmsPage = SeoContentFields & {
  eyebrow: string | null;
  lead: string | null;
  heroImagePath?: string | null;
  heroImagePosition?: string | null;
  templateKey: string | null;
  sections: PageSection[];
};

export type CmsPageSummary = {
  slug: string;
  updatedAt: string | null;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};
