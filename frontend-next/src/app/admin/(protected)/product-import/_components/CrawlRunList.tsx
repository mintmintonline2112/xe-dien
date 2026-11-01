'use client';

/**
 * Bước 2 của trang Nhập từ website: bảng các lượt cào đã có (nguồn, số sản phẩm, thời gian), chọn để xem trước / nhập, hoặc xoá.
 * Dùng bởi: ProductImportScreen.tsx.
 * Lưu ý: xoá lượt cào chỉ xoá file tạm của công cụ (products.json + ảnh đã tải), không đụng sản phẩm đã nhập vào CMS.
 */

import { Trash2 } from 'lucide-react';
import { confirmAction } from '@/app/admin/_lib/confirm';
import {
  formatDateTime,
  productImportService,
  type CatalogRunSummary,
} from '@/app/admin/(protected)/product-import/_lib/product-import.service';

interface CrawlRunListProps {
  runs: CatalogRunSummary[];
  selectedRunId: string | null;
  isBusy: boolean;
  busyRunId?: string;
  onSelect: (runId: string) => void;
  onDeleted: (runId: string) => void;
}

export function CrawlRunList({ runs, selectedRunId, isBusy, busyRunId, onSelect, onDeleted }: CrawlRunListProps) {
  async function handleDelete(run: CatalogRunSummary) {
    const isDeleted = await confirmAction(
      {
        title: 'Xoá lượt cào?',
        text: `Xoá ${run.productCount} sản phẩm đã cào và ảnh tải về của lượt ${run.id}. Sản phẩm đã nhập vào CMS không bị ảnh hưởng.`,
        confirmButtonText: 'Xoá',
      },
      () => productImportService.deleteRun(run.id),
    );
    if (isDeleted) onDeleted(run.id);
  }

  return (
    <section className="gf-card st-section">
      <h2 className="st-section-title">2. Các lượt cào</h2>
      {runs.length === 0 ? (
        <p className="gf-hint">Chưa có lượt cào nào. Làm bước 1 trước.</p>
      ) : (
        <div className="dt-card">
          <div className="dt-scroll">
            <table className="dt-table">
              <thead>
                <tr>
                  <th>Lượt cào</th>
                  <th>Nguồn</th>
                  <th className="is-right">Sản phẩm</th>
                  <th>Thời gian</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className={run.id === selectedRunId ? 'pi-row-selected' : undefined}>
                    <td><code>{run.id}</code></td>
                    <td className="pi-cell-url">{run.source}</td>
                    <td className="is-right">{run.productCount}</td>
                    <td>{formatDateTime(run.crawledAt)}</td>
                    <td className="is-right pi-row-actions">
                      <button type="button" className="adm-btn" onClick={() => onSelect(run.id)}>
                        {run.id === selectedRunId ? 'Đang xem' : 'Xem & nhập'}
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn is-danger"
                        title="Xoá lượt cào"
                        disabled={isBusy && busyRunId === run.id}
                        onClick={() => handleDelete(run)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
