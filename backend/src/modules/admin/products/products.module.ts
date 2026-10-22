/**
 * Module sản phẩm cho admin.
 * Dùng bởi: admin.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, UploadImageService],
  exports: [ProductsService],
})
export class ProductsModule {}
