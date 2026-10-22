/**
 * Dữ liệu sửa trang: mọi field của CreatePageDto, đều không bắt buộc.
 * Dùng bởi: pages.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {}
