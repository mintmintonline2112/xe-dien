/**
 * Kiểm tra yêu cầu bắt đầu cào một danh mục của website nguồn (link, hồ sơ site, giới hạn trang / sản phẩm / ảnh).
 * Dùng bởi: catalog-import.controller.ts (POST /admin/catalog-import/crawl).
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUrl,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class StartCrawlDto {
  @ApiProperty({ example: 'https://site-nguon.vn/o-to-dien/' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;

  @ApiProperty({ example: 'gd3' })
  @Matches(/^[a-z0-9-]+$/)
  profile: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  maxPages?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(40)
  maxImages?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  withImages: boolean;
}
