/**
 * API POST /admin/cache/purge: admin bấm xoá cache website (cache backend + tag Next), có thể chỉ xoá một số tag.
 * Dùng bởi: frontend-next app/admin/(protected)/dashboard/_components/PurgeCacheButton.tsx.
 * Lưu ý: các API ghi đã tự xoá cache qua InvalidateCacheInterceptor; nút này dành cho sửa DB tay, seed lại, khởi động lại backend, env cấu hình sai.
 */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';

const ALL_CACHE_NAMESPACES = [
  CACHE_NS.blogPosts,
  CACHE_NS.products,
  CACHE_NS.pages,
  CACHE_NS.menu,
  CACHE_NS.settings,
];
const namespaceToTag = (namespace: string) =>
  namespace.replace(/^client:/, '');

@ApiTags('Admin - Cache')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard)
@Controller('admin/cache')
export class AdminCacheController {
  constructor(private readonly cache: AppCacheService) {}

  @Post('purge')
  @ApiOperation({
    summary: 'Purge storefront caches (backend + Next). Optional: tags[].',
  })
  async purge(@Body() body: { tags?: string[] }) {
    const requestedTags = body?.tags;
    const targets =
      Array.isArray(requestedTags) && requestedTags.length
        ? ALL_CACHE_NAMESPACES.filter((namespace) =>
            requestedTags.includes(namespaceToTag(namespace)),
          )
        : ALL_CACHE_NAMESPACES;

    await Promise.all(
      targets.map((namespace) => this.cache.invalidate(namespace)),
    );
    return { purged: targets.map(namespaceToTag) };
  }
}
