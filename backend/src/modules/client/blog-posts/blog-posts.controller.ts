/**
 * API công khai bài blog (/api/client/blog-posts, bí danh /api/client/articles): danh sách phân trang / lọc danh mục, chi tiết theo slug hoặc id; có cache.
 * Dùng bởi: frontend-next/src/app/(site)/_lib/cms.ts.
 * Lưu ý: chỉ trả bài PUBLISHED có publishedAt ≤ hiện tại; client không lật được điều kiện này (status / publishedAt / deletedAt bị bỏ khỏi filter).
 * `lang` đã nằm trong cache key (keyOf toàn bộ query) nên phải tách khỏi filters trước khi truy vấn.
 */
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { In, LessThanOrEqual } from 'typeorm';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { isBaseLang, normalizeLang } from 'src/common/i18n/translations';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';
import { ClientBlogPostsService } from './blog-posts.service';

@Controller(['client/blog-posts', 'client/articles'])
export class ClientBlogPostsController {
  constructor(
    private readonly postsService: ClientBlogPostsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.cache.wrap(
      CACHE_NS.blogPosts,
      `list:${AppCacheService.keyOf({ ...query })}`,
      async () => {
        const {
          page = 1,
          limit = 10,
          search,
          orderBy,
          categoryIds,
          lang: langRaw,
          ...filters
        } = query;
        const lang = normalizeLang(langRaw);
        delete filters.status;
        delete filters.publishedAt;
        delete filters.deletedAt;
        if (categoryIds) {
          const validCategoryIds = String(categoryIds)
            .split(',')
            .map((value) => Number(value))
            .filter((id) => Number.isInteger(id) && id > 0);
          if (validCategoryIds.length)
            filters.categoryId = In(validCategoryIds);
        }
        const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

        const result = await this.postsService.paginate(
          {
            where: {
              status: PublishStatus.PUBLISHED,
              publishedAt: LessThanOrEqual(new Date()),
            },
            relations: { category: true },
          },
          page,
          limit,
          search,
          ['title', 'excerpt'],
          filters,
          parsedOrderBy,
        );

        if (isBaseLang(lang)) return result;
        return {
          ...result,
          data: result.data.map((post) =>
            ClientBlogPostsService.localizePost(post, lang),
          ),
        };
      },
    );
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('lang') langRaw?: string,
  ): Promise<BlogPost | null> {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.blogPosts, `slug:${slug}:${lang}`, () =>
      this.postsService.findPublishedBySlug(slug, lang),
    );
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') langRaw?: string,
  ): Promise<BlogPost | null> {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.blogPosts, `id:${id}:${lang}`, async () => {
      const post = await this.postsService.findOne({
        where: {
          id,
          status: PublishStatus.PUBLISHED,
          publishedAt: LessThanOrEqual(new Date()),
        },
        relations: { category: true },
      });
      return ClientBlogPostsService.localizePost(post, lang);
    });
  }
}
