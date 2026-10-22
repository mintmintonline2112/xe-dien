/**
 * Xuất bố cục trang (section, bật / tắt, thứ tự, nội dung, ảnh nền đầu trang) từ database hiện tại (thường là máy dev) ra layout-sync/layout.json.
 * Dùng bởi: `npm run layout:export` (tuỳ chọn `-- --pages=home,contact`, `-- --file=duong/dan.json`); commit file rồi chạy layout:import trên VPS.
 * Lưu ý: ảnh mà dữ liệu trỏ tới phải nằm trong git (backend/uploads được version hoá) thì VPS mới có — script cảnh báo ảnh chưa commit.
 */
import 'reflect-metadata';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import {
  DEFAULT_LAYOUT_FILE,
  type LayoutFile,
  LayoutSyncModule,
  collectUploadPaths,
  readArgValue,
  toRelativeUploadUrls,
} from './layout-sync.shared';

async function main() {
  const fileArg = readArgValue('file');
  const file = fileArg ? resolve(fileArg) : DEFAULT_LAYOUT_FILE;
  const onlySlugs = readArgValue('pages')
    ?.split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

  const app = await NestFactory.createApplicationContext(LayoutSyncModule, {
    logger: ['error', 'warn'],
  });
  try {
    const pageRepo = app.get<Repository<Page>>(getRepositoryToken(Page));
    const sectionRepo = app.get<Repository<PageSection>>(
      getRepositoryToken(PageSection),
    );

    const pages = await pageRepo.find({
      where: onlySlugs?.length ? { slug: In(onlySlugs) } : {},
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    const layout: LayoutFile = {
      exportedAt: new Date().toISOString(),
      pages: [],
    };
    for (const page of pages) {
      const sections = await sectionRepo.find({
        where: { pageId: page.id },
        order: { sortOrder: 'ASC', id: 'ASC' },
      });
      layout.pages.push(
        toRelativeUploadUrls({
          slug: page.slug,
          title: page.title,
          heroImagePath: page.heroImagePath ?? null,
          heroImagePosition: page.heroImagePosition ?? null,
          sections: sections.map((section) => ({
            sectionKey: section.sectionKey,
            component:
              typeof section.metadata?._component === 'string'
                ? section.metadata._component
                : section.sectionKey,
            isActive: Boolean(section.isActive),
            sortOrder: section.sortOrder,
            heading: section.heading,
            subheading: section.subheading,
            content: section.content,
            mediaPath: section.mediaPath,
            metadata: section.metadata,
            translations: section.translations,
          })),
        }),
      );
    }

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(layout, null, 2)}\n`);

    console.log(`Đã xuất ${layout.pages.length} trang → ${file}`);
    for (const page of layout.pages) {
      const activeKeys = page.sections
        .filter((section) => section.isActive)
        .map((section) => section.sectionKey);
      console.log(
        `  ${page.slug}: ${page.sections.length} section (${activeKeys.length} đang bật: ${activeKeys.join(', ') || '—'})`,
      );
    }

    const uploadsMissingInGit = [...collectUploadPaths(layout)].filter(
      (path) => {
        const diskPath = resolve(process.cwd(), path.slice(1));
        if (!existsSync(diskPath)) return true;
        try {
          execFileSync('git', ['ls-files', '--error-unmatch', path.slice(1)], {
            stdio: 'ignore',
          });
          return false;
        } catch {
          return true;
        }
      },
    );
    if (uploadsMissingInGit.length > 0) {
      console.warn(
        `\n!! ${uploadsMissingInGit.length} ảnh chưa có trong git (VPS sẽ thiếu) — commit các file này cùng layout.json:`,
      );
      uploadsMissingInGit.forEach((path) => console.warn(`   backend${path}`));
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
