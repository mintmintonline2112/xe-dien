/**
 * Kiểm tra dữ liệu sửa danh mục sản phẩm: mọi field của bản tạo, đều tùy chọn.
 * Dùng bởi: product-categories.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateProductCategoryDto } from './create-product-category.dto';

export class UpdateProductCategoryDto extends PartialType(
  CreateProductCategoryDto,
) {}
