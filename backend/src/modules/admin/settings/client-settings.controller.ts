/**
 * API public GET /client/settings: trả cấu hình website đã ghép bản dịch theo ?lang, có cache.
 * Dùng bởi: settings.module.ts; site đọc qua frontend-next/src/settings/site-settings.ts.
 * Lưu ý: ?lang=en thì translations.en.* (siteTitle, siteDescription...) đè lên giá trị gốc tiếng Việt; bản thân
 * `translations` vẫn được trả về để admin đọc.
 */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { applyTranslations, normalizeLang } from 'src/common/i18n/translations';
import { SettingsService } from './settings.service';

@ApiTags('Client - Settings')
@Controller('client/settings')
export class ClientSettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  findAll(@Query('lang') langRaw?: string) {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.settings, `all:${lang}`, async () => {
      const allSettings = await this.settingsService.getAll();
      return applyTranslations(allSettings as { translations?: unknown }, lang);
    });
  }
}
