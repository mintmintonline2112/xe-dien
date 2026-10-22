/**
 * Lệnh chạy seed dữ liệu mẫu (quyền, vai trò, nhân viên, cài đặt, danh mục sản phẩm, sản phẩm, blog, trang, section, menu) qua SeedingService.
 * Dùng bởi: `npm run db:seed`, `npm run db:seed:prod` (dist/seed.js), `npm run db:fresh`.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedingModule } from './database/seeding/seeding.module';
import { SeedingService } from './database/seeding/seeding.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedingModule);
  const logger = new Logger('Seeding');
  const seedingService = appContext.get(SeedingService);

  try {
    logger.log('Seeding started');
    await seedingService.run();
    logger.log('Seeding completed');
  } catch (error) {
    logger.error('Seeding failed');
    console.error(error);
    throw error;
  } finally {
    await appContext.close();
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during seeding');
  console.error(error);
  process.exit(1);
});
