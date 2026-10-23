/**
 * API CRUD bài viết blog cho admin (/admin/blog-posts), nhận ảnh bìa upload, ghi xong thì xoá cache blog.
 * Dùng bởi: frontend-next app/admin/(protected)/blog-posts/_lib/blog-post.service.ts.
 * Lưu ý: imageOptimize = 'skip' nghĩa là admin đã nén ảnh trên trình duyệt, server không nén lại.
 */
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseController } from 'src/common/base/base.controller';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostsService } from './blog-posts.service';

@ApiTags('Admin - Blog Posts')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'BLOG_POST')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.blogPosts])
@Controller('admin/blog-posts')
export class BlogPostsController extends BaseController<
  BlogPost,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  number
> {
  constructor(private readonly postsService: BlogPostsService) {
    super(postsService, 'BlogPost', {
      create: CreateBlogPostDto,
      update: UpdateBlogPostDto,
    });
  }

  protected getFilterableFields(): (keyof BlogPost)[] {
    return ['status', 'categoryId'];
  }

  protected override getSearchFields(): (keyof BlogPost)[] {
    return ['title', 'excerpt'];
  }

  @Post()
  @Permissions('CREATE')
  @UseInterceptors(FileInterceptor('coverImagePath'))
  @ApiBody({ type: CreateBlogPostDto })
  override async create(
    @Body() dto: CreateBlogPostDto,
    @UploadedFile() file?: Express.Multer.File,
    @Body('imageOptimize') imageOptimize?: string,
  ) {
    if (file) dto.coverImagePath = file as any;
    return this.postsService.createPost(dto, 'blog-posts', {
      skipOptimize: imageOptimize === 'skip',
    });
  }

  @Put(':id')
  @Permissions('UPDATE')
  @UseInterceptors(FileInterceptor('coverImagePath'))
  @ApiBody({ type: UpdateBlogPostDto })
  override async update(
    @Param('id') id: number,
    @Body() dto: UpdateBlogPostDto,
    @UploadedFile() file?: Express.Multer.File,
    @Body('imageOptimize') imageOptimize?: string,
  ) {
    if (file) dto.coverImagePath = file as any;
    return this.postsService.updatePost(Number(id), dto, 'blog-posts', {
      skipOptimize: imageOptimize === 'skip',
    });
  }
}
