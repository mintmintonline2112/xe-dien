/**
 * Kiểu dữ liệu phân trang của API admin (meta, response có data + meta, tham số truy vấn).
 * Dùng bởi: crud-service.ts, data-table/types.ts, NotificationsBell.tsx.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginateParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  [key: string]: unknown;
}
