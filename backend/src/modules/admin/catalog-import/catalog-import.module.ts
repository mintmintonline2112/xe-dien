/**
 * Module Nhập sản phẩm từ website: chạy công cụ catalog-importer (cào + đẩy vào CMS) từ trang quản trị.
 * Dùng bởi: admin.module.ts.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CatalogImportController } from './catalog-import.controller';
import { CatalogImportService } from './catalog-import.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CatalogImportController],
  providers: [CatalogImportService],
})
export class CatalogImportModule {}
