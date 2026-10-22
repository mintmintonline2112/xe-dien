/**
 * Kiểm tra dữ liệu sửa danh mục blog: mọi field của bản tạo, đều tùy chọn.
 * Dùng bởi: blog-categories.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateBlogCategoryDto } from './create-blog-category.dto';

export class UpdateBlogCategoryDto extends PartialType(CreateBlogCategoryDto) {}
