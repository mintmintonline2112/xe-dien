/**
 * Kiểm tra dữ liệu sửa sản phẩm: mọi field của bản tạo, đều tùy chọn.
 * Dùng bởi: products.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
