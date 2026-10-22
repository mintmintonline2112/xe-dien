/**
 * Gọi API yêu cầu tư vấn (bảng quote_requests): danh sách, chi tiết, đổi trạng thái, xoá, tải file Excel; kèm nhãn loại yêu cầu và trạng thái.
 * Dùng bởi: contacts/_components/QuoteRequestList.tsx.
 * Lưu ý: API không có PUT nên đổi trạng thái đi qua PATCH /:id/status; file Excel tải bằng fetch có cookie phiên (không qua adminApi vì là file nhị phân).
 */

import { adminApi } from '@/app/admin/_lib/admin-api';
import type { PaginatedResponse } from '@/app/admin/_lib/pagination';
import type { TableStatusConfig } from '@/app/admin/_components/data-table/types';
import { env } from '@/config/env';

export const QUOTE_REQUEST_QUERY_KEY = ['admin', 'quote-requests'] as const;

export type QuoteRequestType = 'consult' | 'quote' | 'installment' | 'test_ride' | 'dealer';
export type QuoteRequestStatus = 'new' | 'processing' | 'quoted' | 'closed';

export interface QuoteRequest {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  province: string | null;
  requestType: QuoteRequestType;
  productId: number | null;
  productName: string | null;
  message: string | null;
  sourceUrl: string | null;
  status: QuoteRequestStatus;
  createdAt: string;
}

export const QUOTE_REQUEST_TYPE_LABELS: Record<QuoteRequestType, string> = {
  consult: 'Tư vấn chọn xe',
  quote: 'Báo giá',
  installment: 'Mua trả góp',
  test_ride: 'Xem xe / lái thử',
  dealer: 'Đăng ký đại lý',
};

export const QUOTE_REQUEST_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  new: 'Mới',
  processing: 'Đang xử lý',
  quoted: 'Đã tư vấn / báo giá',
  closed: 'Đã đóng',
};

export const QUOTE_REQUEST_STATUS_CONFIG: TableStatusConfig[] = [
  { value: 'new', label: QUOTE_REQUEST_STATUS_LABELS.new, className: 'is-warning' },
  { value: 'processing', label: QUOTE_REQUEST_STATUS_LABELS.processing, className: 'is-muted' },
  { value: 'quoted', label: QUOTE_REQUEST_STATUS_LABELS.quoted, className: 'is-success' },
  { value: 'closed', label: QUOTE_REQUEST_STATUS_LABELS.closed, className: 'is-muted' },
];

const ENDPOINT = 'admin/quote-requests';

export const quoteRequestService = {
  paginate(params: Record<string, unknown>): Promise<PaginatedResponse<QuoteRequest>> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      query.set(key, String(value));
    }
    return adminApi.get<PaginatedResponse<QuoteRequest>>(`${ENDPOINT}?${query.toString()}`);
  },

  updateStatus(id: number, status: QuoteRequestStatus): Promise<QuoteRequest> {
    return adminApi.patch<QuoteRequest>(`${ENDPOINT}/${id}/status`, { status });
  },

  remove(id: number): Promise<{ id: number }> {
    return adminApi.delete<{ id: number }>(`${ENDPOINT}/${id}`);
  },

  async downloadExcel(): Promise<void> {
    const response = await fetch(`${env.apiUrl}/${ENDPOINT}/export`, { credentials: 'include' });
    if (!response.ok) throw new Error(`Không tải được file Excel (${response.status})`);
    const fileUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `yeu-cau-tu-van-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(fileUrl);
  },
};
