/**
 * Namespace cache cho các API đọc công khai; mỗi namespace gom mọi mục cache của một loại dữ liệu để xoá một lần (tăng version).
 * Dùng bởi: controller client (pages, blog-posts, blog-categories, products, product-categories, menu, settings), controller admin tương ứng, admin-cache.controller.ts.
 */
export const CACHE_NS = {
  blogPosts: 'client:blog-posts',
  products: 'client:products',
  pages: 'client:pages',
  menu: 'client:menu',
  settings: 'client:settings',
} as const;

export type CacheNamespace = (typeof CACHE_NS)[keyof typeof CACHE_NS];
