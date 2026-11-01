'use client';

/**
 * Màn hình Admin → Sản phẩm → Nhập từ website: 3 bước cào danh mục site nguồn, xem trước lượt cào, đẩy vào danh mục của CMS,
 * kèm khung tiến trình (nhật ký) của việc đang chạy và danh sách các lượt cào cũ.
 * Dùng bởi: product-import/page.tsx.
 * Lưu ý: backend chỉ chạy một việc một lúc; màn này hỏi lại trạng thái mỗi 1,5 giây khi đang chạy, xong thì tự mở lượt cào vừa tạo.
 * Công cụ phía sau là catalog-importer/ ở gốc repo (README ở đó giải thích hồ sơ site).
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { PRODUCT_QUERY_KEY } from '@/app/admin/(protected)/products/_lib/product.service';
import {
  PRODUCT_IMPORT_QUERY_KEY,
  productImportService,
  type ImportJob,
} from '@/app/admin/(protected)/product-import/_lib/product-import.service';
import { CrawlForm } from './CrawlForm';
import { ImportJobPanel } from './ImportJobPanel';
import { CrawlRunList } from './CrawlRunList';
import { CrawlRunPanel } from './CrawlRunPanel';

const OVERVIEW_QUERY_KEY = [...PRODUCT_IMPORT_QUERY_KEY, 'overview'] as const;
const JOB_QUERY_KEY = [...PRODUCT_IMPORT_QUERY_KEY, 'job'] as const;
const JOB_POLL_MS = 1500;

export function ProductImportScreen() {
  const queryClient = useQueryClient();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const lastSeenJob = useRef<Pick<ImportJob, 'id' | 'status'> | null>(null);

  const { data: overview, isLoading, error } = useQuery({
    queryKey: OVERVIEW_QUERY_KEY,
    queryFn: productImportService.getOverview,
  });

  const { data: job } = useQuery({
    queryKey: JOB_QUERY_KEY,
    queryFn: productImportService.getJob,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? JOB_POLL_MS : false),
  });

  useEffect(() => {
    if (!job) return;
    const previous = lastSeenJob.current;
    lastSeenJob.current = { id: job.id, status: job.status };
    const hasJustFinished = previous?.id === job.id && previous.status === 'running' && job.status !== 'running';
    if (!hasJustFinished) return;

    queryClient.invalidateQueries({ queryKey: OVERVIEW_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: [...PRODUCT_IMPORT_QUERY_KEY, 'run', job.runId] });
    if (job.kind === 'push' && !job.isDryRun) queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });

    if (job.status === 'succeeded') {
      toast.success(job.kind === 'crawl' ? 'Cào xong — xem trước sản phẩm bên dưới' : job.isDryRun ? 'Chạy thử xong' : 'Đã nhập vào CMS');
      if (job.kind === 'crawl') setSelectedRunId(job.runId);
    } else if (job.status === 'failed') {
      toast.error('Có lỗi — xem nhật ký');
    }
  }, [job, queryClient]);

  function handleJobStarted(startedJob: ImportJob) {
    lastSeenJob.current = { id: startedJob.id, status: startedJob.status };
    queryClient.setQueryData(JOB_QUERY_KEY, startedJob);
  }

  async function handleCancel() {
    try {
      queryClient.setQueryData(JOB_QUERY_KEY, await productImportService.cancelJob());
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError));
    }
  }

  function handleRunDeleted(runId: string) {
    if (selectedRunId === runId) setSelectedRunId(null);
    queryClient.invalidateQueries({ queryKey: OVERVIEW_QUERY_KEY });
  }

  if (isLoading) return <p className="dt-empty">Đang tải…</p>;
  if (error || !overview) return <p className="dt-empty dt-error">{getErrorMessage(error, 'Không tải được trang nhập sản phẩm')}</p>;

  const isBusy = job?.status === 'running';

  return (
    <div className="st-screen pi-screen">
      <div className="adm-page-header">
        <h1 className="adm-page-title">Nhập sản phẩm từ website</h1>
        <p className="adm-page-subtitle">
          Cào một danh mục sản phẩm của website khác (tên, giá, ảnh, thông số, mô tả), xem trước rồi đưa vào danh mục của bạn.
        </p>
      </div>

      <div className="pi-notice">
        <strong>Chỉ dùng với nội dung bạn được phép sao chép</strong> — website cũ của chính bạn, nhà cung cấp / hãng đã đồng ý.
        Chữ và ảnh của website khác có bản quyền; nhiều site cấm công cụ tự động trong robots.txt.
      </div>

      <details className="gf-card pi-guide">
        <summary>Hướng dẫn sử dụng</summary>
        <ol>
          <li>
            <b>Cào:</b> dán link trang danh mục của website nguồn (VD <code>https://site-nguon.vn/o-to-dien/</code>), chọn hồ sơ site
            rồi bấm <i>Bắt đầu cào</i>. Lần đầu nên đặt <i>Giới hạn sản phẩm</i> = 3 để thử. Công cụ nghỉ ~1 giây giữa các trang nên
            30 sản phẩm có ảnh mất khoảng 5–10 phút.
          </li>
          <li>
            <b>Xem trước:</b> cào xong, bảng sản phẩm hiện ra ở bước 3. Kiểm tra tên, giá, số ảnh, số thông số. Cột nào trống hết
            nghĩa là hồ sơ site không khớp giao diện website nguồn.
          </li>
          <li>
            <b>Nhập:</b> chọn danh mục đích, thêm quy tắc danh mục con nếu cần (tên có chữ &ldquo;golf&rdquo; → Xe điện sân golf), bấm
            <i> Chạy thử</i> để xem sản phẩm nào vào đâu, rồi bấm <i>Nhập vào CMS</i>. Nên chọn trạng thái <i>Nháp</i> để soát lại
            trong mục Sản phẩm trước khi hiện lên website.
          </li>
          <li>
            Sản phẩm đã có (cùng slug hoặc cùng link nguồn) sẽ được bỏ qua; tick <i>Ghi đè sản phẩm đã có</i> để cập nhật lại.
            Ảnh được đưa vào Thư viện, thư mục <code>products</code>.
          </li>
          <li>
            Website nguồn có giao diện khác hồ sơ đang có: cần lập trình viên thêm một file hồ sơ trong
            <code> catalog-importer/src/profiles/</code> (xem README của công cụ).
          </li>
        </ol>
      </details>

      <CrawlForm profiles={overview.profiles} isBusy={isBusy} onStarted={handleJobStarted} />

      {job && <ImportJobPanel job={job} onCancel={handleCancel} onOpenRun={setSelectedRunId} />}

      <CrawlRunList
        runs={overview.runs}
        selectedRunId={selectedRunId}
        isBusy={isBusy}
        busyRunId={isBusy ? job?.runId : undefined}
        onSelect={setSelectedRunId}
        onDeleted={handleRunDeleted}
      />

      {selectedRunId && (
        <CrawlRunPanel runId={selectedRunId} isBusy={isBusy} onStarted={handleJobStarted} />
      )}
    </div>
  );
}
