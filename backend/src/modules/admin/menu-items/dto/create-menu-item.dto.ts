/**
 * Dữ liệu và luật kiểm tra khi admin tạo một mục menu.
 * Dùng bởi: menu-items.controller.ts, dto/update-menu-item.dto.ts.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsTranslations } from 'src/common/i18n/translations.decorator';
import { MENU_LOCATIONS, type MenuLocation } from '../menu-item.entity';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Xe đạp điện' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  label: string;

  @ApiProperty({ example: '/danh-muc/xe-dap-dien' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  href: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID menu cha (null = menu gốc)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Mở khung danh mục con khi bấm (false = đi thẳng tới trang)',
  })
  @IsOptional()
  @IsBoolean()
  showSubmenu?: boolean;

  @ApiPropertyOptional({ enum: MENU_LOCATIONS, default: 'header' })
  @IsOptional()
  @IsIn(MENU_LOCATIONS)
  location?: MenuLocation;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsTranslations()
  translations?: Record<string, Record<string, unknown>> | null;
}
