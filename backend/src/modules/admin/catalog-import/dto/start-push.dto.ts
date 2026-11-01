/**
 * Kiểm tra yêu cầu đẩy một lượt cào vào CMS (danh mục đích, quy tắc danh mục con, trạng thái, ghi đè, chạy thử).
 * Dùng bởi: catalog-import.controller.ts (POST /admin/catalog-import/push).
 * Lưu ý: subRules cùng cú pháp --sub của catalog-importer: "từ khoá=slug-danh-muc,từ khoá 2=slug-2".
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class StartPushDto {
  @ApiProperty({ example: 'o-to-dien-202611010800' })
  @Matches(/^[a-z0-9][a-z0-9-]*$/)
  runId: string;

  @ApiProperty({ example: 'o-to-dien' })
  @Matches(/^[a-z0-9-]+$/)
  category: string;

  @ApiPropertyOptional({ example: 'golf=xe-dien-san-golf,bus=xe-bus-dien' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  subRules?: string;

  @ApiProperty({ enum: ['published', 'draft'] })
  @IsIn(['published', 'draft'])
  status: 'published' | 'draft';

  @ApiProperty({ example: false })
  @IsBoolean()
  update: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  dryRun: boolean;
}
