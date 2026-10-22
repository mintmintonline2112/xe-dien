/**
 * API public GET /client/menu: trả cây menu của website theo vị trí (`?location=header|footer`, mặc định header) và ngôn ngữ, có cache.
 * Dùng bởi: menu-items.module.ts; site gọi từ frontend-next/src/app/(site)/_lib/menu.ts.
 * Lưu ý: location lạ quay về header; cache key gồm cả vị trí lẫn ngôn ngữ.
 */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { MENU_LOCATIONS, MenuItem, type MenuLocation } from './menu-item.entity';
import { MenuItemsService } from './menu-items.service';

const toMenuLocation = (value: unknown): MenuLocation =>
  (MENU_LOCATIONS as readonly unknown[]).includes(value)
    ? (value as MenuLocation)
    : 'header';

@ApiTags('Client - Menu')
@Controller('client/menu')
export class ClientMenuController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'location', required: false, enum: MENU_LOCATIONS })
  async findTree(
    @Query('location') locationRaw?: string,
    @Query('lang') langRaw?: string,
  ): Promise<MenuItem[]> {
    const location = toMenuLocation(locationRaw);
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.menu, `tree:${location}:${lang}`, () =>
      this.menuItemsService.findPublicTree(location, lang),
    );
  }
}
