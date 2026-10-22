/**
 * Kiểm tra dữ liệu gửi lên khi tạo sản phẩm; nhận cả JSON lẫn FormData (khi kèm file ảnh đại diện).
 * Dùng bởi: products.controller.ts, dto/update-product.dto.ts.
 * Lưu ý: qua FormData mọi giá trị là chuỗi — gallery / specs / highlights / metadata đến dạng chuỗi JSON (parseJsonField; specs còn
 * phải đổi từng dòng thành ProductSpecDto, nếu không whitelist xoá sạch label / value),
 * boolean dạng "true"/"false" (@ToBoolean), số dạng chuỗi (@Type(() => Number)); chuỗi rỗng ở giá = null (về "Liên hệ").
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { IsTranslations } from 'src/common/i18n/translations.decorator';
import {
  PRODUCT_STOCK_STATUSES,
  type ProductStockStatus,
} from '../entities/product.entity';

const parseJsonField = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const toNullablePrice = ({ value }: { value: unknown }) => {
  if (value === undefined) return undefined;
  if (value === null || value === '' || value === 'null') return null;
  return Number(value);
};

export class ProductSpecDto {
  @ApiProperty({ example: 'Động cơ' })
  @IsString()
  @MaxLength(120)
  label: string;

  @ApiProperty({ example: '500W' })
  @IsString()
  @MaxLength(500)
  value: string;
}

const parseSpecsField = ({ value }: { value: unknown }) => {
  const parsed = parseJsonField({ value });
  return Array.isArray(parsed)
    ? parsed.map((row) =>
        row instanceof ProductSpecDto ? row : plainToInstance(ProductSpecDto, row),
      )
    : parsed;
};

export class CreateProductDto {
  @ApiProperty({ example: 'Xe đạp điện Vnbike i1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'xe-dap-dien-vnbike-i1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number | null;

  @ApiPropertyOptional({ example: 'XDX-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string | null;

  @ApiPropertyOptional({ example: 'Vnbike' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  brand?: string | null;

  @ApiPropertyOptional({ example: 9990000, nullable: true })
  @IsOptional()
  @Transform(toNullablePrice)
  @IsInt()
  @Min(0)
  price?: number | null;

  @ApiPropertyOptional({ example: 10550000, nullable: true })
  @IsOptional()
  @Transform(toNullablePrice)
  @IsInt()
  @Min(0)
  originalPrice?: number | null;

  @ApiPropertyOptional({ example: 'Bán chạy' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  badge?: string | null;

  @ApiPropertyOptional({ enum: PRODUCT_STOCK_STATUSES, default: 'in_stock' })
  @IsOptional()
  @IsIn(PRODUCT_STOCK_STATUSES)
  stockStatus?: ProductStockStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  thumbnailPath?: any;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(parseJsonField)
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  gallery?: string[] | null;

  @ApiPropertyOptional({ type: [ProductSpecDto] })
  @IsOptional()
  @Transform(parseSpecsField)
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  specs?: ProductSpecDto[] | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(parseJsonField)
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  highlights?: string[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotion?: string | null;

  @ApiPropertyOptional({ example: 'Bảo hành 24 tháng động cơ, 12 tháng pin' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  warranty?: string | null;

  @ApiPropertyOptional({ enum: PublishStatus, default: PublishStatus.DRAFT })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date | null;

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

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(parseJsonField)
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsTranslations()
  translations?: Record<string, Record<string, unknown>> | null;
}
