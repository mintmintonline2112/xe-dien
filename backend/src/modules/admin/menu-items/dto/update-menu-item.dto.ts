/**
 * Dữ liệu sửa mục menu: mọi field của CreateMenuItemDto, đều không bắt buộc.
 * Dùng bởi: menu-items.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateMenuItemDto } from './create-menu-item.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
