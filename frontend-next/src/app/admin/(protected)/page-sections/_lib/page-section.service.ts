/**
 * Gọi API section của trang và danh mục loại section (bảng section_definitions), kèm kiểu field spec metadata.
 * Dùng bởi: PageSectionForm, PageSectionList, MetadataEditor, ComponentPicker, PageSectionsPanel.
 * Lưu ý: SectionFieldSpec phải khớp kiểu cùng tên ở backend (section-definition.entity.ts). layouts = chỉ hiện field khi
 * metadata.layout thuộc danh sách; positionKey = key metadata lưu object-position của ảnh (hiện FocalPointPicker).
 */

import { adminApi } from '@/app/admin/_lib/admin-api';
import { createCrudService } from '@/app/admin/_lib/crud-service';

export const PAGE_SECTION_QUERY_KEY = ['admin', 'page-sections'] as const;
export const SECTION_DEFINITION_QUERY_KEY = ['admin', 'section-definitions'] as const;

type FieldSpecBase = {
  key: string;
  label: string;
  hint?: string;
  layouts?: string[];
};

export type SectionFieldSpec = FieldSpecBase &
  (
    | { type: 'stringList' }
    | {
        type: 'itemList';
        itemFields: Array<{ name: string; label: string; kind: 'text' | 'textarea' | 'image' }>;
      }
    | { type: 'textMap'; fields: Array<{ name: string; label: string }> }
    | { type: 'image'; positionKey?: string }
    | { type: 'json' }
    | { type: 'select'; options: Array<{ value: string; label: string; hint?: string }> }
  );

export interface SectionDefinition {
  id: number;
  pageSlug: string;
  sectionKey: string;
  label: string;
  description: string | null;
  fields: SectionFieldSpec[];
  sortOrder: number;
}

export function fetchSectionDefinitions(): Promise<SectionDefinition[]> {
  return adminApi.get<SectionDefinition[]>('admin/section-definitions');
}

export interface PageSection {
  id: number;
  pageId: number;
  sectionKey: string;
  heading: string | null;
  subheading: string | null;
  content: string | null;
  mediaPath: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const pageSectionService = createCrudService<PageSection>('admin/page-sections', [
  { pageId: 'ASC' },
  { sortOrder: 'ASC' },
]);
