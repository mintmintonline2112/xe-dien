/**
 * Dữ liệu sửa section: mọi field của CreatePageSectionDto, đều không bắt buộc.
 * Dùng bởi: page-sections.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreatePageSectionDto } from './create-page-section.dto';

export class UpdatePageSectionDto extends PartialType(CreatePageSectionDto) {}
