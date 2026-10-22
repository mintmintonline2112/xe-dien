/**
 * Giá trị cột `module` của bảng notifications cho thông báo liên hệ và yêu cầu báo giá.
 * Dùng bởi: modules/admin/contact/contact.service.ts, modules/admin/quote-requests/quote-requests.service.ts.
 * Lưu ý: PHẢI trùng tên controller viết thường bỏ hậu tố `Controller` (AdminContactController → admincontact),
 * vì permission.seed.ts sinh permission.module theo quy tắc đó và notification.service.ts lọc theo quyền.
 * Lệch một ký tự là thông báo biến mất khỏi chuông, không báo lỗi. Đổi tên controller → sửa luôn ở đây.
 */
export const NOTIFICATION_MODULE = {
  contact: 'admincontact',
  quoteRequest: 'adminquoterequests',
} as const;
