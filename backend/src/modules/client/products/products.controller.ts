/**
 * API công khai sản phẩm: GET /api/client/products (lọc danh mục / nổi bật / tìm / thương hiệu, sắp xếp, phân trang) và /slug/:slug; có cache.
 * Dùng bởi: frontend-next/src/app/(site)/_lib (đọc sản phẩm cho trang danh sách, danh mục, chi tiết và section lưới sản phẩm).
 * Lưu ý: tham số lạ bị bỏ qua; limit tối đa 60; sort không hợp lệ quay về `featured`. Cache key là toàn bộ query đã chuẩn hoá.
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { Product } from 'src/modules/admin/products/entities/product.entity';
import {
  ClientProductsService,
  PRODUCT_SORTS,
  type ProductListQuery,
  type ProductSort,
} from './products.service';

const MAX_PAGE_SIZE = 60;
const DEFAULT_PAGE_SIZE = 12;

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toTrimmedText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

function parseListQuery(query: Record<string, unknown>): ProductListQuery {
  const sort = toTrimmedText(query.sort);
  return {
    page: toPositiveInt(query.page, 1),
    limit: Math.min(toPositiveInt(query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
    categorySlug: toTrimmedText(query.category),
    isFeaturedOnly: query.featured === '1' || query.featured === 'true',
    search: toTrimmedText(query.search),
    brand: toTrimmedText(query.brand),
    excludeId: toPositiveInt(query.exclude, 0) || undefined,
    sort: (PRODUCT_SORTS as readonly string[]).includes(sort ?? '')
      ? (sort as ProductSort)
      : 'featured',
    lang: normalizeLang(query.lang),
  };
}

@ApiTags('Client - Products')
@Controller('client/products')
export class ClientProductsController {
  constructor(
    private readonly productsService: ClientProductsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'exclude', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: PRODUCT_SORTS })
  async findAll(@Query() query: Record<string, unknown>) {
    const listQuery = parseListQuery(query);
    return this.cache.wrap(
      CACHE_NS.products,
      `list:${AppCacheService.keyOf({ ...listQuery })}`,
      () => this.productsService.findPublishedPage(listQuery),
    );
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('lang') langRaw?: string,
  ): Promise<Product | null> {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.products, `slug:${slug}:${lang}`, () =>
      this.productsService.findPublishedBySlug(slug, lang),
    );
  }
}
