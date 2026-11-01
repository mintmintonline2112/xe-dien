/**
 * Gọi API /admin/catalog-import (cào danh mục site nguồn, xem trước, đẩy vào CMS) và kiểu dữ liệu của trang Nhập từ website.
 * Dùng bởi: các component trong product-import/_components.
 * Lưu ý: kiểu ở đây khớp backend/src/modules/admin/catalog-import/catalog-import.types.ts.
 */

import { adminApi } from '@/app/admin/_lib/admin-api';

export const PRODUCT_IMPORT_QUERY_KEY = ['admin', 'product-import'] as const;

export type ImportJobStatus = 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface ImportJob {
  id: string;
  kind: 'crawl' | 'push';
  runId: string;
  isDryRun: boolean;
  status: ImportJobStatus;
  startedBy: string;
  startedAt: string;
  finishedAt: string | null;
  log: string[];
}

export interface CatalogRunSummary {
  id: string;
  source: string;
  profile: string;
  crawledAt: string;
  productCount: number;
}

export interface CatalogRunPreviewProduct {
  sourceUrl: string;
  title: string;
  code: string | null;
  brand: string | null;
  price: number | null;
  originalPrice: number | null;
  isOutOfStock: boolean;
  imageCount: number;
  downloadedImageCount: number;
  specCount: number;
}

export interface CatalogRunDetail extends CatalogRunSummary {
  products: CatalogRunPreviewProduct[];
}

export interface ImportOverview {
  toolDir: string;
  profiles: string[];
  runs: CatalogRunSummary[];
  job: ImportJob | null;
}

export interface CrawlRequest {
  url: string;
  profile: string;
  maxPages?: number;
  limit?: number;
  maxImages?: number;
  withImages: boolean;
}

export interface PushRequest {
  runId: string;
  category: string;
  subRules?: string;
  status: 'published' | 'draft';
  update: boolean;
  dryRun: boolean;
}

const ENDPOINT = 'admin/catalog-import';

export const productImportService = {
  getOverview: () => adminApi.get<ImportOverview>(ENDPOINT),
  getJob: () => adminApi.get<ImportJob | null>(`${ENDPOINT}/job`),
  cancelJob: () => adminApi.post<ImportJob | null>(`${ENDPOINT}/job/cancel`),
  getRun: (runId: string) => adminApi.get<CatalogRunDetail>(`${ENDPOINT}/runs/${runId}`),
  deleteRun: (runId: string) => adminApi.delete<{ id: string }>(`${ENDPOINT}/runs/${runId}`),
  startCrawl: (request: CrawlRequest) => adminApi.post<ImportJob>(`${ENDPOINT}/crawl`, request),
  startPush: (request: PushRequest) => adminApi.post<ImportJob>(`${ENDPOINT}/push`, request),
};

export const JOB_STATUS_LABELS: Record<ImportJobStatus, { label: string; className: string }> = {
  running: { label: 'Đang chạy', className: 'is-warning' },
  succeeded: { label: 'Xong', className: 'is-success' },
  failed: { label: 'Lỗi', className: 'is-danger' },
  cancelled: { label: 'Đã dừng', className: 'is-muted' },
};

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
