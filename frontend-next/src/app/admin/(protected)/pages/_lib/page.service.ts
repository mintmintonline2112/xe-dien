/**
 * Gọi API CRUD trang website, kiểu dữ liệu SitePage và tóm tắt section của trang cho admin.
 * Dùng bởi: PageForm, PageList, PageSectionsPanel, PageSectionForm, PageSectionList, PageSectionPagePicker, SettingsScreen.
 * Lưu ý: PageSectionSummary.metadata._component là component thật; sectionKey có thể khác (VD hero-slider-2).
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';
import type { PublishStatus } from '@/app/admin/_lib/publish-status';

export const PAGE_QUERY_KEY = ['admin', 'pages'] as const;

export interface PageSectionSummary {
  id: number;
  sectionKey: string;
  heading: string | null;
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown> | null;
}

export interface SitePage {
  id: number;
  title: string;
  slug: string;
  status: PublishStatus;
  eyebrow: string | null;
  lead: string | null;
  heroImagePath?: string | null;
  heroImagePosition?: string | null;
  templateKey: string | null;
  sortOrder: number;
  sections?: PageSectionSummary[];
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const pageService = createCrudService<SitePage>('admin/pages', [
  { sortOrder: 'ASC' },
  { id: 'ASC' },
]);
