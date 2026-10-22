/**
 * Phần dùng chung của đồng bộ bố cục trang giữa 2 database (máy dev → VPS): kiểu file layout.json, module Nest, đọc tham số dòng lệnh, chuẩn hoá link ảnh.
 * Dùng bởi: scripts/layout-sync/layout-export.ts (`npm run layout:export`), scripts/layout-sync/layout-import.ts (`npm run layout:import`).
 * Lưu ý: git chỉ mang code; section nào có trên trang, bật / tắt, thứ tự, nội dung nằm trong DATABASE nên phải đồng bộ bằng 2 script này.
 * Link ảnh tuyệt đối của máy dev (http://localhost:3012/uploads/x.jpg) được đổi thành /uploads/x.jpg để chạy đúng trên domain thật.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { AppConfigModule } from 'src/config/app-config.module';
import { DatabaseModule } from 'src/database/database.module';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import { SectionDefinition } from 'src/modules/admin/pages/entities/section-definition.entity';
import { PageSectionsService } from 'src/modules/admin/pages/page-sections.service';

export const DEFAULT_LAYOUT_FILE = resolve(
  process.cwd(),
  'layout-sync',
  'layout.json',
);

export type ExportedSection = {
  sectionKey: string;
  component: string;
  isActive: boolean;
  sortOrder: number;
  heading: string | null;
  subheading: string | null;
  content: string | null;
  mediaPath: string | null;
  metadata: Record<string, unknown> | null;
  translations: Record<string, Record<string, unknown>> | null;
};

export type ExportedPage = {
  slug: string;
  title: string;
  heroImagePath: string | null;
  heroImagePosition: string | null;
  sections: ExportedSection[];
};

export type LayoutFile = {
  exportedAt: string;
  pages: ExportedPage[];
};

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Page, PageSection, SectionDefinition]),
  ],
  providers: [PageSectionsService],
})
export class LayoutSyncModule {}

export function readArgValue(name: string): string | undefined {
  const matchedArg = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return matchedArg ? matchedArg.slice(name.length + 3) : undefined;
}

export const hasFlag = (name: string) => process.argv.includes(`--${name}`);

const LOCAL_UPLOAD_URL =
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/uploads\/)/;

export function toRelativeUploadUrls<T>(value: T): T {
  if (typeof value === 'string')
    return value.replace(LOCAL_UPLOAD_URL, '$1') as T;
  if (Array.isArray(value))
    return value.map((item) => toRelativeUploadUrls(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        toRelativeUploadUrls(item),
      ]),
    ) as T;
  }
  return value;
}

export function collectUploadPaths(
  value: unknown,
  uploadPaths = new Set<string>(),
): Set<string> {
  if (typeof value === 'string') {
    if (value.startsWith('/uploads/')) uploadPaths.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectUploadPaths(item, uploadPaths));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) =>
      collectUploadPaths(item, uploadPaths),
    );
  }
  return uploadPaths;
}
