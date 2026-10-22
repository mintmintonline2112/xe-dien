/**
 * Module API sản phẩm công khai: controller sản phẩm + danh mục, service đọc bảng products / product_categories.
 * Dùng bởi: modules/client/client.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/modules/admin/products/entities/product.entity';
import { ProductCategory } from 'src/modules/admin/product-categories/entities/product-category.entity';
import { ClientProductsController } from './products.controller';
import { ClientProductCategoriesController } from './product-categories.controller';
import { ClientProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory])],
  controllers: [ClientProductsController, ClientProductCategoriesController],
  providers: [ClientProductsService],
})
export class ClientProductsModule {}
