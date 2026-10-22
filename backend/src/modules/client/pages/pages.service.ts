/**
 * Đọc trang đã xuất bản theo slug cho website: chỉ section đang bật, theo thứ tự sort_order, gộp bản dịch cho trang và từng section.
 * Dùng bởi: modules/client/pages/pages.controller.ts.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { applyTranslations, type Lang } from 'src/common/i18n/translations';
import { Page } from 'src/modules/admin/pages/entities/page.entity';

@Injectable()
export class ClientPagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async findPublishedBySlug(
    slug: string,
    lang: Lang = 'vi',
  ): Promise<Page | null> {
    const page = await this.pageRepo.findOne({
      where: {
        slug,
        status: PublishStatus.PUBLISHED,
      },
      relations: { sections: true },
      order: { sections: { sortOrder: 'ASC' } },
    });

    if (!page) return null;

    const sections = page.sections
      .filter((section) => section.isActive)
      .map((section) => applyTranslations(section, lang));

    return { ...applyTranslations(page, lang), sections } as Page;
  }
}
