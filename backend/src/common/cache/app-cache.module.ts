/**
 * Module cache toàn cục (Global), store mặc định là bộ nhớ trong tiến trình, cung cấp AppCacheService.
 * Dùng bởi: src/app.module.ts.
 * Lưu ý: chuyển sang Redis chỉ cần thêm `stores: [createKeyv(process.env.REDIS_URL)]` (gói @keyv/redis) vào CacheModule.register;
 * AppCacheService.wrap() / invalidate() giữ nguyên.
 */
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppCacheService } from './app-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: AppCacheService.DEFAULT_TTL,
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
