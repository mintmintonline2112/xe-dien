/**
 * Trạng thái xuất bản của trang và bài blog (draft / published / archived), lưu trong DB.
 * Dùng bởi: seo-content.entity.ts, DTO trang / bài blog, modules/client, dashboard, page.seed.ts, blog.seed.ts.
 */
export enum PublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
