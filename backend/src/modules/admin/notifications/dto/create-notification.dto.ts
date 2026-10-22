/**
 * Dữ liệu tạo thông báo admin (kiểu, module, tiêu đề, nội dung).
 * Dùng bởi: notification.controller.ts.
 */
export class CreateNotificationDto {
  type: string;
  module: string;
  title: string;
  message?: string;
}
