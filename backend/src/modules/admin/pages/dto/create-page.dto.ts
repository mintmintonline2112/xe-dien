/**
 * Dữ liệu và luật kiểm tra khi admin tạo một trang (tiêu đề, slug, ảnh đầu trang, SEO, bản dịch).
 * Dùng bởi: pages.controller.ts, dto/update-page.dto.ts.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { IsTranslations } from 'src/common/i18n/translations.decorator';

export class CreatePageDto {
  @ApiProperty({ example: 'Dr. Đỗ Thái Long' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 've-chung-toi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'Về chúng tôi' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  eyebrow?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lead?: string;

  @ApiPropertyOptional({
    example: '/uploads/pages/showroom-xe-dien.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  heroImagePath?: string;

  @ApiPropertyOptional({ example: '50% 62%' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  heroImagePosition?: string;

  @ApiPropertyOptional({ example: 'about' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  templateKey?: string;

  @ApiPropertyOptional({ enum: PublishStatus, default: PublishStatus.DRAFT })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImagePath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string;

  @IsTranslations()
  translations?: Record<string, Record<string, unknown>> | null;
}
