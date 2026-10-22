/**
 * Thoát ký tự HTML (& < > " ') cho dữ liệu khách nhập trước khi chèn vào email, tránh chèn mã vào hộp thư admin.
 * Dùng bởi: mail/templates/quote-request.template.ts, mail/templates/contact.template.ts.
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}
