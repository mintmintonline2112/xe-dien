/**
 * Dữ liệu sửa thông báo admin: chỉ cờ đã đọc.
 * Dùng bởi: notification.controller.ts.
 */
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  is_read?: boolean;
}
