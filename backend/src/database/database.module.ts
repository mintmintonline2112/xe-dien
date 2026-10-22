/**
 * Module kết nối database cho Nest, lấy cấu hình nhóm 'database' (config/database.config.ts) qua ConfigService.
 * Dùng bởi: src/app.module.ts, database/seeding/seeding.module.ts, scripts/layout-sync/layout-sync.shared.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseConfig =
          configService.get<TypeOrmModuleOptions>('database');
        if (!databaseConfig) {
          throw new Error('Database configuration not found');
        }
        return databaseConfig;
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
