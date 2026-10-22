/**
 * Trang /admin/quote-requests: chuyển hướng về tab "Yêu cầu tư vấn" của /admin/contacts.
 * Dùng bởi: link trong thông báo (chuông) khi khách gửi yêu cầu tư vấn — backend gắn metadata.link = /admin/quote-requests.
 */

import { redirect } from 'next/navigation';
import { adminRoutes } from '@/config/routes';

export default function AdminQuoteRequestsPage() {
  redirect(adminRoutes.contacts);
}
