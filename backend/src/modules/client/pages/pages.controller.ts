/**
 * API công khai trang: GET /api/client/pages (mọi trang đã xuất bản, chỉ { slug, updatedAt }) và GET /api/client/pages/:slug
 * (trang kèm section đang bật, đã gộp bản dịch theo `?lang=`); cả hai cache trong namespace client:pages.
 * Dùng bởi: frontend-next/src/app/(site)/_lib/cms.ts (getCmsPage, getCmsPageSummaries cho sitemap.ts).
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { ClientPagesService, type PublishedPageSummary } from './pages.service';

@Controller('client/pages')
export class ClientPagesController {
  constructor(
    private readonly pagesService: ClientPagesService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  findPublishedSummaries(): Promise<PublishedPageSummary[]> {
    return this.cache.wrap(CACHE_NS.pages, 'summaries', () =>
      this.pagesService.findPublishedPageSummaries(),
    );
  }

  @Public()
  @Get(':slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('lang') langRaw?: string,
  ): Promise<Page | null> {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.pages, `slug:${slug}:${lang}`, () =>
      this.pagesService.findPublishedBySlug(slug, lang),
    );
  }
}
