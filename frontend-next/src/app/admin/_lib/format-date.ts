/**
 * Định dạng ngày ISO cho admin: giá trị ô <input type="date"> và ngày hiển thị kiểu Việt Nam.
 * Dùng bởi: các màn danh sách và form trong app/admin/(protected).
 */
export function toDateInputValue(iso?: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
