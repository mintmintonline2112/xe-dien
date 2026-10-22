/**
 * Đổi đường dẫn ảnh lưu trong CMS thành URL đầy đủ để hiện trong admin.
 * Dùng bởi: các màn có ảnh xem trước trong app/admin (thư viện, form, danh sách).
 * Lưu ý: ảnh `/images/...` là file tĩnh của frontend-next/public nên lấy từ siteUrl; còn lại là file upload ở origin của API.
 */
import { env } from '@/config/env';

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/images/')) return `${env.siteUrl}${path}`;
  const origin = env.apiUrl.replace(/\/api$/, '');
  return `${origin}/${path.replace(/^\//, '')}`;
}
