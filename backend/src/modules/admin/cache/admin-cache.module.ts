/**
 * Module nút xoá cache website cho admin.
 * Dùng bởi: admin.module.ts.
 * Lưu ý: không cần import gì vì AppCacheService được cấp toàn cục (AppCacheModule).
 */
import { Module } from '@nestjs/common';
import { AdminCacheController } from './admin-cache.controller';

@Module({
  controllers: [AdminCacheController],
})
export class AdminCacheModule {}
