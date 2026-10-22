/**
 * Module API blog công khai: controller bài viết + danh mục, service đọc bảng blog_posts / blog_categories.
 * Dùng bởi: modules/client/client.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { ClientBlogPostsController } from './blog-posts.controller';
import { ClientBlogCategoriesController } from './blog-categories.controller';
import { ClientBlogPostsService } from './blog-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, BlogCategory])],
  controllers: [ClientBlogPostsController, ClientBlogCategoriesController],
  providers: [ClientBlogPostsService],
})
export class ClientBlogPostsModule {}
