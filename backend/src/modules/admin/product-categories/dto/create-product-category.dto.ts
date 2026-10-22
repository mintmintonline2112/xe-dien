/**
 * Kiểm tra dữ liệu gửi lên khi tạo danh mục sản phẩm.
 * Dùng bởi: product-categories.controller.ts, dto/update-product-category.dto.ts.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { IsTranslations } from 'src/common/i18n/translations.decorator';

export class CreateProductCategoryDto {
  @ApiProperty({ example: 'Xe đạp điện' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'xe-dap-dien' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: '/images/categories/xe-dap-dien.webp' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagePath?: string | null;

  @ApiPropertyOptional({ example: 'bike' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImagePath?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string | null;

  @IsTranslations()
  translations?: Record<string, Record<string, unknown>> | null;
}
