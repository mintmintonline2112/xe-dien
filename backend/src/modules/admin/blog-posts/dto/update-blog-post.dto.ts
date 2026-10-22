/**
 * Kiểm tra dữ liệu sửa bài viết blog: mọi field của bản tạo, đều tùy chọn.
 * Dùng bởi: blog-posts.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateBlogPostDto } from './create-blog-post.dto';

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
