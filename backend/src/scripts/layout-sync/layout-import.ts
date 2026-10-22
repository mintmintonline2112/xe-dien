/**
 * Nhập bố cục trang từ layout-sync/layout.json vào database hiện tại (VPS); mặc định CHẠY THỬ, chỉ in kế hoạch.
 * Dùng bởi: `npm run layout:import` (thêm `-- --apply` để ghi, `-- --pages=home`, `-- --update-content` để ghi đè cả nội dung section đã có).
 * Lưu ý: section chưa có → TẠO MỚI qua PageSectionsService (kiểm tra metadata như admin); đã có → chỉ chỉnh bật / tắt + thứ tự, giữ nội dung;
 * đã bị xoá trên VPS → bỏ qua; chỉ có trên VPS → giữ nguyên. Ảnh nền đầu trang đặt theo file nếu file có giá trị.
 * Không đụng menu, logo, cài đặt, liên hệ / yêu cầu báo giá.
 */
import 'reflect-metadata';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import { PageSectionsService } from 'src/modules/admin/pages/page-sections.service';
import {
  DEFAULT_LAYOUT_FILE,
  type ExportedSection,
  type LayoutFile,
  LayoutSyncModule,
  hasFlag,
  readArgValue,
} from './layout-sync.shared';

type PendingChange = { label: string; apply: () => Promise<unknown> };

const formatOnOff = (isOn: boolean) => (isOn ? 'bật' : 'tắt');

async function main() {
  const fileArg = readArgValue('file');
  const file = fileArg ? resolve(fileArg) : DEFAULT_LAYOUT_FILE;
  const shouldApply = hasFlag('apply');
  const shouldUpdateContent = hasFlag('update-content');
  const onlySlugs = readArgValue('pages')
    ?.split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

  if (!existsSync(file))
    throw new Error(
      `Không thấy file ${file} — ở máy dev chạy: npm run layout:export`,
    );
  const layout = JSON.parse(readFileSync(file, 'utf8')) as LayoutFile;

  const app = await NestFactory.createApplicationContext(LayoutSyncModule, {
    logger: ['error', 'warn'],
  });
  try {
    const pageRepo = app.get<Repository<Page>>(getRepositoryToken(Page));
    const sectionRepo = app.get<Repository<PageSection>>(
      getRepositoryToken(PageSection),
    );
    const sectionsService = app.get(PageSectionsService);

    console.log(`File: ${file} (xuất lúc ${layout.exportedAt})`);
    console.log(
      shouldApply
        ? 'Chế độ: GHI VÀO DATABASE\n'
        : 'Chế độ: CHẠY THỬ — chưa ghi gì (thêm --apply để ghi)\n',
    );

    const changes: PendingChange[] = [];

    for (const exported of layout.pages) {
      if (onlySlugs?.length && !onlySlugs.includes(exported.slug)) continue;

      const page = await pageRepo.findOne({ where: { slug: exported.slug } });
      if (!page) {
        console.log(
          `■ ${exported.slug}: KHÔNG có trang này trên máy đích — bỏ qua (tạo trang trong admin trước).\n`,
        );
        continue;
      }
      console.log(`■ ${exported.slug}`);
      const changeCountBefore = changes.length;

      const targetSections = await sectionRepo.find({
        where: { pageId: page.id },
        withDeleted: true,
      });
      const targetSectionByKey = new Map(
        targetSections.map((section) => [section.sectionKey, section]),
      );

      for (const section of exported.sections) {
        const target = targetSectionByKey.get(section.sectionKey);

        if (!target) {
          changes.push({
            label: `  + TẠO ${section.sectionKey} [${section.component}] · ${formatOnOff(section.isActive)} · thứ tự ${section.sortOrder}`,
            apply: () =>
              sectionsService.create({
                ...contentOf(section),
                pageId: page.id,
                sectionKey: section.sectionKey,
              }),
          });
          continue;
        }
        if (target.deletedAt) {
          console.log(
            `  ! ${section.sectionKey}: đã bị xoá trên máy đích — bỏ qua`,
          );
          continue;
        }

        const patch: Partial<PageSection> = {};
        const notes: string[] = [];
        if (Boolean(target.isActive) !== section.isActive) {
          patch.isActive = section.isActive;
          notes.push(
            `${formatOnOff(Boolean(target.isActive))} → ${formatOnOff(section.isActive)}`,
          );
        }
        if (target.sortOrder !== section.sortOrder) {
          patch.sortOrder = section.sortOrder;
          notes.push(`thứ tự ${target.sortOrder} → ${section.sortOrder}`);
        }
        if (
          shouldUpdateContent &&
          JSON.stringify(pickContent(target)) !==
            JSON.stringify(contentOf(section))
        ) {
          Object.assign(patch, contentOf(section));
          notes.push('ghi đè nội dung');
        }
        if (notes.length > 0) {
          changes.push({
            label: `  ~ SỬA ${section.sectionKey}: ${notes.join(', ')}`,
            apply: () =>
              patch.metadata !== undefined || patch.translations !== undefined
                ? sectionsService.update(target.id, patch)
                : sectionRepo.update(target.id, patch),
          });
        }
      }

      const exportedKeys = new Set(
        exported.sections.map((section) => section.sectionKey),
      );
      const onlyOnTarget = targetSections.filter(
        (section) =>
          !section.deletedAt && !exportedKeys.has(section.sectionKey),
      );
      for (const section of onlyOnTarget) {
        console.log(
          `  = GIỮ ${section.sectionKey} (chỉ có trên máy đích, ${formatOnOff(Boolean(section.isActive))})`,
        );
      }

      if (
        exported.heroImagePath &&
        exported.heroImagePath !== page.heroImagePath
      ) {
        changes.push({
          label: `  ~ ẢNH NỀN ĐẦU TRANG: ${page.heroImagePath ?? '(mặc định)'} → ${exported.heroImagePath}`,
          apply: () =>
            pageRepo.update(page.id, {
              heroImagePath: exported.heroImagePath,
              heroImagePosition: exported.heroImagePosition,
            }),
        });
      }

      if (changes.length === changeCountBefore)
        console.log('  ✔ đã khớp, không cần đổi');
      else
        changes
          .slice(changeCountBefore)
          .forEach((change) => console.log(change.label));
      console.log('');
    }

    if (changes.length === 0) {
      console.log('Không có gì cần thay đổi.');
      return;
    }
    if (!shouldApply) {
      console.log(
        `${changes.length} thay đổi ở trên CHƯA được ghi. Kiểm tra xong chạy: npm run layout:import -- --apply`,
      );
      return;
    }

    for (const change of changes) {
      await change.apply();
      console.log(`✔${change.label.trimStart().slice(1)}`);
    }
    console.log(
      `\nĐã ghi ${changes.length} thay đổi. Website cập nhật sau ~3 phút (cache), muốn thấy ngay:` +
        '\n  pm2 restart xedien_api xedien_web',
    );
  } finally {
    await app.close();
  }
}

function contentOf(section: ExportedSection) {
  return {
    heading: section.heading,
    subheading: section.subheading,
    content: section.content,
    mediaPath: section.mediaPath,
    metadata: section.metadata,
    translations: section.translations,
    isActive: section.isActive,
    sortOrder: section.sortOrder,
  };
}

function pickContent(section: PageSection) {
  return {
    heading: section.heading,
    subheading: section.subheading,
    content: section.content,
    mediaPath: section.mediaPath,
    metadata: section.metadata,
    translations: section.translations,
    isActive: Boolean(section.isActive),
    sortOrder: section.sortOrder,
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
