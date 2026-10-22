/**
 * Sinh bản DỰ PHÒNG nội dung cho website từ page.seed.ts (trang home, contact) vào frontend-next/src/content/cms-fallback.json.
 * Dùng bởi: `npm run content:export`; website đọc file JSON khi API CMS lỗi.
 * Lưu ý: chạy lại mỗi khi sửa page.seed.ts, không sửa tay file JSON.
 */
import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import {
  PAGES,
  type PageDefinition,
} from 'src/database/seeding/seeds/page.seed';

const FIXED_TIMESTAMP = '2026-01-01T00:00:00.000Z';
const EXPORTED_SLUGS = ['home', 'contact'];

let nextId = 1;
const fallbackPages: Record<string, unknown> = {};

for (const definition of PAGES as PageDefinition[]) {
  const { page, sections } = definition;
  if (!EXPORTED_SLUGS.includes(page.slug)) continue;
  const pageId = nextId++;
  fallbackPages[page.slug] = {
    id: pageId,
    title: page.title,
    slug: page.slug,
    status: page.status ?? 'published',
    eyebrow: page.eyebrow ?? null,
    lead: page.lead ?? null,
    templateKey: page.templateKey ?? null,
    sortOrder: page.sortOrder ?? 0,
    metaTitle: page.metaTitle ?? null,
    metaDescription: page.metaDescription ?? null,
    ogImagePath: null,
    canonicalUrl: null,
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
    deletedAt: null,
    translations: null,
    sections: sections.map(
      (section: PageDefinition['sections'][number], index: number) => ({
        id: nextId++,
        pageId,
        sectionKey: section.sectionKey,
        heading: section.heading ?? null,
        subheading: section.subheading ?? null,
        content: section.content ?? null,
        mediaPath: section.mediaPath ?? null,
        metadata: section.metadata ?? null,
        isActive: section.isActive ?? true,
        sortOrder: section.sortOrder ?? index + 1,
        createdAt: FIXED_TIMESTAMP,
        updatedAt: FIXED_TIMESTAMP,
        deletedAt: null as null,
        translations: null as null,
      }),
    ),
  };
}

const targetPath = resolve(
  __dirname,
  '../../../frontend-next/src/content/cms-fallback.json',
);
writeFileSync(targetPath, JSON.stringify(fallbackPages, null, 2) + '\n');
console.log(
  `Wrote ${Object.keys(fallbackPages).length} page(s) → ${targetPath}`,
);
