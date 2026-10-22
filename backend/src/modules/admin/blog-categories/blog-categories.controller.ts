/**
 * API CRUD danh mục blog cho admin (/admin/blog-categories, tên cũ /admin/article-categories), ghi xong thì xoá cache blog.
 * Dùng bởi: frontend-next app/admin/(protected)/blog-categories/_lib/blog-category.service.ts.
 */
import { Controller, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { BlogCategory } from './entities/blog-category.entity';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { BlogCategoriesService } from './blog-categories.service';

@ApiTags('Admin - Blog Categories')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'BLOG_CATEGORY')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.blogPosts])
@Controller(['admin/blog-categories', 'admin/article-categories'])
export class BlogCategoriesController extends BaseController<
  BlogCategory,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  number
> {
  constructor(private readonly categoriesService: BlogCategoriesService) {
    super(categoriesService, 'BlogCategory');
  }

  protected override getSearchFields(): (keyof BlogCategory)[] {
    return ['name', 'slug'];
  }
}
