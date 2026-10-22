/**
 * Bảng đường dẫn của frontend (adminRoutes, siteRoutes) — nguồn duy nhất cho <Link>, router.push, redirect, sidebar; không hardcode URL nơi khác.
 * Dùng bởi: hầu hết trang và component của app/(site) và app/admin, robots.ts, sitemap.ts.
 * Lưu ý: URL thật do tên thư mục trong src/app quyết định; đổi một segment thì đổi ở đây VÀ đổi tên thư mục tương ứng.
 */
import { createCrudRoutes, joinPath, withHash, withQuery } from '@/utils/route';

export const ADMIN_BASE = '/admin';

const adminPath = (segment: string) => joinPath(ADMIN_BASE, segment);
const adminCrudRoutes = (segment: string) => createCrudRoutes(ADMIN_BASE, segment);

export const adminRoutes = {
  root: ADMIN_BASE,
  login: adminPath('login'),
  dashboard: adminPath('dashboard'),

  products: adminCrudRoutes('products'),
  productCategories: adminCrudRoutes('product-categories'),

  blogPosts: adminCrudRoutes('blog-posts'),
  blogCategories: adminCrudRoutes('blog-categories'),
  pages: adminCrudRoutes('pages'),
  pageSections: adminCrudRoutes('page-sections'),
  menus: adminCrudRoutes('menus'),
  library: adminPath('library'),

  contacts: adminPath('contacts'),
  contactPage: adminPath('contact-page'),

  staffs: adminCrudRoutes('staffs'),
  roles: adminCrudRoutes('roles'),
  permissions: adminPath('permissions'),
  settings: adminPath('settings'),
} as const;

const HOME = '/';
const PRODUCTS = '/san-pham';
const CATEGORY = '/danh-muc';
const NEWS = '/tin-tuc';
const CONTACT = '/lien-he';

type QueryParams = Record<string, string | number | null | undefined>;

export const siteRoutes = {
  home: HOME,
  homeSection: (anchor: string) => withHash(HOME, anchor),

  products: PRODUCTS,
  productsFiltered: (params: QueryParams) => withQuery(PRODUCTS, params),
  product: (slug: string) => joinPath(PRODUCTS, slug),

  category: (slug: string) => joinPath(CATEGORY, slug),
  categoryFiltered: (slug: string, params: QueryParams) => withQuery(joinPath(CATEGORY, slug), params),

  news: NEWS,
  newsCategory: (slug: string) => withQuery(NEWS, { category: slug }),
  newsFiltered: (params: QueryParams) => withQuery(NEWS, params),
  newsPost: (slug: string) => joinPath(NEWS, slug),

  contact: CONTACT,
  contactSection: (anchor: string) => withHash(CONTACT, anchor),

  page: (slug: string) => joinPath(slug),
} as const;
