/**
 * Dữ liệu và luật kiểm tra của form yêu cầu tư vấn trên website (trang sản phẩm, section form, trang liên hệ).
 * Dùng bởi: quote-requests.controller.ts, quote-requests.service.ts, mail/templates/quote-request.template.ts.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  QUOTE_REQUEST_TYPES,
  type QuoteRequestType,
} from '../entities/quote-request.entity';

export class CreateQuoteRequestDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '0901 234 567' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+().\s-]{8,30}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @ApiPropertyOptional({ example: 'khach@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'TP. Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string;

  @ApiPropertyOptional({ enum: QUOTE_REQUEST_TYPES, default: 'consult' })
  @IsOptional()
  @IsIn(QUOTE_REQUEST_TYPES)
  requestType?: QuoteRequestType;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @ApiPropertyOptional({ example: 'Xe đạp điện Vnbike i1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productName?: string;

  @ApiPropertyOptional({ example: 'Tôi muốn mua trả góp 12 tháng.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @ApiPropertyOptional({ example: 'https://tramxedien.vn/san-pham/xe-dap-dien-vnbike-i1' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourceUrl?: string;
}
