/**
 * API công khai danh mục sản phẩm: GET /api/client/product-categories (đang bật, kèm productCount) và /slug/:slug (kèm cha + con); có cache.
 * Dùng bởi: frontend-next/src/app/(site)/_lib (menu danh mục, trang danh mục, section lưới danh mục).
 * Lưu ý: productCount = số sản phẩm đã xuất bản của danh mục cộng các danh mục con trực tiếp.
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { ClientProductsService } from './products.service';

@ApiTags('Client - Product Categories')
@Controller('client/product-categories')
export class ClientProductCategoriesController {
  constructor(
    private readonly productsService: ClientProductsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query('lang') langRaw?: string) {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.products, `categories:${lang}`, () =>
      this.productsService.findActiveCategories(lang),
    );
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('lang') langRaw?: string,
  ) {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(
      CACHE_NS.products,
      `category:${slug}:${lang}`,
      () => this.productsService.findActiveCategoryBySlug(slug, lang),
    );
  }
}
