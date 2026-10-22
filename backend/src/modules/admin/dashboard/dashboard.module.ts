/**
 * Module trang tổng quan admin.
 * Dùng bởi: admin.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategory } from '../blog-categories/entities/blog-category.entity';
import { BlogPost } from '../blog-posts/entities/blog-post.entity';
import { ContactEntity } from '../contact/entities/contact.entity';
import { PageSection } from '../pages/entities/page-section.entity';
import { Page } from '../pages/entities/page.entity';
import { Staff } from '../staffs/staff.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Product } from '../products/entities/product.entity';
import { QuoteRequest } from '../quote-requests/entities/quote-request.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPost,
      BlogCategory,
      Page,
      PageSection,
      ContactEntity,
      Staff,
      Product,
      ProductCategory,
      QuoteRequest,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
