/**
 * Loại yêu cầu tư vấn khách chọn trong form (khớp enum requestType của backend, docs/catalog-api.md) và hàm kiểm tra giá trị hợp lệ.
 * Dùng bởi: forms.tsx (ConsultForm, client), sections/quote-form/QuoteForm.tsx (server).
 * Lưu ý: phải nằm ngoài forms.tsx — giá trị export từ file "use client" sang server chỉ là tham chiếu client, không gọi được .some().
 */
export const REQUEST_TYPES = [
  { value: "consult", label: "Tư vấn chọn xe" },
  { value: "quote", label: "Nhận báo giá" },
  { value: "installment", label: "Mua trả góp 0%" },
  { value: "test_ride", label: "Xem xe / lái thử" },
  { value: "dealer", label: "Đăng ký đại lý" },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]["value"];

export function toRequestType(raw: string | undefined, fallback: RequestType = "consult"): RequestType {
  return REQUEST_TYPES.some((type) => type.value === raw) ? (raw as RequestType) : fallback;
}
