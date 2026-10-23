/**
 * Dữ liệu tạo thông báo admin (kiểu, module, tiêu đề, nội dung).
 * Dùng bởi: notification.controller.ts.
 */
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  module: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  message?: string;
}
