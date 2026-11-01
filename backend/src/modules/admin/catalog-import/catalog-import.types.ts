/**
 * Kiểu dữ liệu của tính năng Nhập sản phẩm từ website: việc đang chạy (cào / đẩy), lượt cào và sản phẩm trong products.json.
 * Dùng bởi: catalog-import.service.ts, catalog-import.controller.ts.
 * Lưu ý: CatalogRunFile phải khớp định dạng products.json của catalog-importer (catalog-importer/README.md).
 */
export type ImportJobKind = 'crawl' | 'push';

export type ImportJobStatus = 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface ImportJob {
  id: string;
  kind: ImportJobKind;
  runId: string;
  isDryRun: boolean;
  status: ImportJobStatus;
  startedBy: string;
  startedAt: string;
  finishedAt: string | null;
  log: string[];
}

export interface CatalogRunProduct {
  sourceUrl: string;
  title: string;
  slug: string;
  code: string | null;
  brand: string | null;
  price: number | null;
  originalPrice: number | null;
  isOutOfStock: boolean;
  specs: { label: string; value: string }[];
  images: { url: string; file: string | null }[];
}

export interface CatalogRunFile {
  source: string;
  profile: string;
  crawledAt: string;
  products: CatalogRunProduct[];
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
