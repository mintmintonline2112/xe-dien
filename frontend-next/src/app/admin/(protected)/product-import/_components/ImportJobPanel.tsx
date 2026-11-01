'use client';

/**
 * Khung tiến trình của việc cào / nhập gần nhất: trạng thái, người chạy, thời gian, nhật ký (tự cuộn xuống cuối), nút Dừng.
 * Dùng bởi: ProductImportScreen.tsx.
 * Lưu ý: nhật ký chỉ giữ 400 dòng cuối và mất khi backend khởi động lại.
 */

import { useEffect, useRef } from 'react';
import { Square } from 'lucide-react';
import {
  JOB_STATUS_LABELS,
  formatDateTime,
  type ImportJob,
} from '@/app/admin/(protected)/product-import/_lib/product-import.service';

interface ImportJobPanelProps {
  job: ImportJob;
  onCancel: () => void;
  onOpenRun: (runId: string) => void;
}

function describeJob(job: ImportJob): string {
  if (job.kind === 'crawl') return 'Cào danh mục';
  return job.isDryRun ? 'Chạy thử nhập' : 'Nhập vào CMS';
}

export function ImportJobPanel({ job, onCancel, onOpenRun }: ImportJobPanelProps) {
  const logBox = useRef<HTMLPreElement>(null);
  const status = JOB_STATUS_LABELS[job.status];

  useEffect(() => {
    if (logBox.current) logBox.current.scrollTop = logBox.current.scrollHeight;
  }, [job.log.length]);

  return (
    <section className="gf-card st-section">
      <div className="pi-job-head">
        <h2 className="st-section-title">Tiến trình: {describeJob(job)}</h2>
        <span className={`dt-status ${status.className}`}>
          {job.status === 'running' && <span className="adm-spin adm-spin--dark" />} {status.label}
        </span>
      </div>
      <p className="gf-hint">
        Lượt cào <code>{job.runId}</code> · {job.startedBy} · bắt đầu {formatDateTime(job.startedAt)}
        {job.finishedAt && ` · kết thúc ${formatDateTime(job.finishedAt)}`}
      </p>
      <pre className="pi-log" ref={logBox}>{job.log.length ? job.log.join('\n') : 'Đang khởi động…'}</pre>
      <div className="pi-actions">
        {job.status === 'running' && (
          <button type="button" className="adm-btn" onClick={onCancel}>
            <Square size={14} /> Dừng
          </button>
        )}
        {job.status !== 'running' && job.kind === 'crawl' && (
          <button type="button" className="adm-btn" onClick={() => onOpenRun(job.runId)}>
            Xem lượt cào này
          </button>
        )}
      </div>
    </section>
  );
}
