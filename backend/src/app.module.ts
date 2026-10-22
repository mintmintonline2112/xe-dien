/**
 * Module gốc của API: cấu hình, rate-limit, cache, database, nhóm module admin và client.
 * Dùng bởi: src/main.ts, test/app.e2e-spec.ts.
 * Lưu ý: ThrottlerModule chỉ khai cấu hình; giới hạn chỉ áp nơi gắn ThrottlerGuard (route auth nhạy cảm), KHÔNG bật toàn cục
 * vì mọi request SSR đều đến từ một IP của server Next.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from './config/app-config.module';
import { AppCacheModule } from './common/cache/app-cache.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AppConfigModule,
    AppCacheModule,
    DatabaseModule,
    AdminModule,
    ClientModule,
  ],
})
export class AppModule {}
