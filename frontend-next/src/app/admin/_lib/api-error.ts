/**
 * Lấy câu thông báo lỗi từ lỗi API (payload.message dạng chuỗi hoặc mảng) để hiện cho người dùng admin.
 * Dùng bởi: các form, danh sách và màn hình trong app/admin.
 */
export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    const payload = errorRecord.payload as Record<string, unknown> | undefined;
    const fromPayload = payload?.message;
    if (fromPayload) {
      return Array.isArray(fromPayload) ? fromPayload.join(', ') : String(fromPayload);
    }
    if (errorRecord.message) return String(errorRecord.message);
  }
  return fallback;
}
