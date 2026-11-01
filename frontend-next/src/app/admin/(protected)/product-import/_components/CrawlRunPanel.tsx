'use client';

/**
 * Bước 3 của trang Nhập từ website: xem trước sản phẩm của một lượt cào và đẩy vào CMS (danh mục đích, quy tắc danh mục con,
 * trạng thái, ghi đè), có nút Chạy thử chỉ in kế hoạch.
 * Dùng bởi: ProductImportScreen.tsx.
 * Lưu ý: quy tắc danh mục con so từ khoá với tên sản phẩm dạng không dấu (gửi lên dạng "từ khoá=slug,…" như tham số --sub của
 * catalog-importer); sản phẩm không khớp quy tắc nào vào danh mục đích.
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Upload } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { formatVnd } from '@/app/admin/(protected)/products/_lib/product.service';
import {
  PRODUCT_CATEGORY_QUERY_KEY,
  buildCategoryOptions,
  productCategoryService,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import {
  PRODUCT_IMPORT_QUERY_KEY,
  formatDateTime,
  productImportService,
  type ImportJob,
  type PushRequest,
} from '@/app/admin/(protected)/product-import/_lib/product-import.service';

interface CrawlRunPanelProps {
  runId: string;
  isBusy: boolean;
  onStarted: (job: ImportJob) => void;
}

interface SubcategoryRule {
  keyword: string;
  categorySlug: string;
}

const toSubRulesParam = (rules: SubcategoryRule[]) =>
  rules
    .map((rule) => ({ keyword: rule.keyword.replace(/[=,]/g, ' ').trim(), categorySlug: rule.categorySlug }))
    .filter((rule) => rule.keyword && rule.categorySlug)
    .map((rule) => `${rule.keyword}=${rule.categorySlug}`)
    .join(',');

export function CrawlRunPanel({ runId, isBusy, onStarted }: CrawlRunPanelProps) {
  const [category, setCategory] = useState('');
  const [rules, setRules] = useState<SubcategoryRule[]>([]);
  const [status, setStatus] = useState<PushRequest['status']>('draft');
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: run, isLoading, error } = useQuery({
    queryKey: [...PRODUCT_IMPORT_QUERY_KEY, 'run', runId],
    queryFn: () => productImportService.getRun(runId),
  });

  const { data: categories } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => productCategoryService.paginate({ limit: 1000 }),
  });

  const categoryChoices = useMemo(() => {
    const slugById = new Map((categories?.data ?? []).map((item) => [item.id, item.slug]));
    return buildCategoryOptions(categories?.data ?? []).map((option) => ({
      label: option.label,
      slug: slugById.get(Number(option.value)) ?? '',
    }));
  }, [categories]);

  const updateRule = (index: number, changes: Partial<SubcategoryRule>) =>
    setRules((currentRules) => currentRules.map((rule, i) => (i === index ? { ...rule, ...changes } : rule)));

  async function requestPush(isDryRun: boolean) {
    const request: PushRequest = {
      runId,
      category,
      subRules: toSubRulesParam(rules) || undefined,
      status,
      update: shouldUpdate,
      dryRun: isDryRun,
    };
    setIsSubmitting(true);
    try {
      onStarted(await productImportService.startPush(request));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDryRun() {
    if (!category) {
      toast.error('Chọn danh mục đích trước');
      return;
    }
    try {
      await requestPush(true);
    } catch (pushError) {
      toast.error(getErrorMessage(pushError));
    }
  }

  async function handleImport() {
    if (!category) {
      toast.error('Chọn danh mục đích trước');
      return;
    }
    await confirmAction(
      {
        title: 'Nhập vào CMS?',
        text: `Bắt đầu tạo ${run?.productCount ?? 0} sản phẩm (trạng thái ${status === 'draft' ? 'Nháp' : 'Hiển thị'}) và upload ảnh lên Thư viện. Theo dõi ở khung Tiến trình.`,
        icon: 'question',
        confirmButtonText: 'Nhập',
        confirmButtonColor: '#1a2744',
      },
      () => requestPush(false),
    );
  }

  if (isLoading) return <section className="gf-card st-section"><p className="gf-hint">Đang tải lượt cào…</p></section>;
  if (error || !run) {
    return <section className="gf-card st-section"><p className="dt-error">{getErrorMessage(error, 'Không đọc được lượt cào')}</p></section>;
  }

  const productsWithoutImages = run.products.filter((product) => product.downloadedImageCount === 0).length;

  return (
    <section className="gf-card st-section">
      <h2 className="st-section-title">3. Xem trước &amp; nhập — {run.productCount} sản phẩm</h2>
      <p className="gf-hint">
        Nguồn <span className="pi-cell-url">{run.source}</span> · hồ sơ {run.profile} · cào lúc {formatDateTime(run.crawledAt)}
      </p>
      {productsWithoutImages > 0 && (
        <div className="pi-notice">
          {productsWithoutImages} sản phẩm chưa có ảnh tải về (cào với tuỳ chọn không tải ảnh, hoặc ảnh lỗi) — nhập vào sẽ thiếu ảnh.
        </div>
      )}

      <div className="dt-card">
        <div className="dt-scroll pi-preview">
          <table className="dt-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Mã</th>
                <th>Hãng</th>
                <th className="is-right">Giá</th>
                <th className="is-center">Ảnh</th>
                <th className="is-center">Thông số</th>
              </tr>
            </thead>
            <tbody>
              {run.products.map((product) => (
                <tr key={product.sourceUrl}>
                  <td>
                    <a className="dt-link" href={product.sourceUrl} target="_blank" rel="noopener noreferrer">{product.title}</a>
                    {product.isOutOfStock && <small className="pi-muted"> · hết hàng</small>}
                  </td>
                  <td>{product.code ?? '—'}</td>
                  <td>{product.brand ?? '—'}</td>
                  <td className="is-right">
                    {formatVnd(product.price)}
                    {product.originalPrice && <small className="pi-muted pi-strike">{formatVnd(product.originalPrice)}</small>}
                  </td>
                  <td className="is-center">
                    {product.downloadedImageCount}/{product.imageCount}
                  </td>
                  <td className="is-center">{product.specCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pi-grid">
        <div>
          <label className="gf-label">Danh mục đích</label>
          <select className="gf-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">— Chọn danh mục —</option>
            {categoryChoices.map((choice) => (
              <option key={choice.slug} value={choice.slug}>{choice.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="gf-label">Trạng thái sau khi nhập</label>
          <select className="gf-control" value={status} onChange={(e) => setStatus(e.target.value as PushRequest['status'])}>
            <option value="draft">Nháp (soát lại rồi mới hiện)</option>
            <option value="published">Hiển thị ngay trên website</option>
          </select>
        </div>
      </div>

      <div>
        <label className="gf-label">Xếp vào danh mục con theo tên (tuỳ chọn)</label>
        <p className="gf-hint pi-hint-top">Tên sản phẩm chứa từ khoá (không phân biệt dấu) thì vào danh mục con đó; quy tắc trên được ưu tiên.</p>
        <div className="cp-interests">
          {rules.map((rule, index) => (
            <div className="pi-rule-row" key={index}>
              <input
                className="gf-control"
                value={rule.keyword}
                placeholder="Từ khoá, VD: golf"
                onChange={(e) => updateRule(index, { keyword: e.target.value })}
              />
              <select className="gf-control" value={rule.categorySlug} onChange={(e) => updateRule(index, { categorySlug: e.target.value })}>
                <option value="">— Danh mục —</option>
                {categoryChoices.map((choice) => (
                  <option key={choice.slug} value={choice.slug}>{choice.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="adm-icon-btn is-danger"
                title="Xoá quy tắc"
                onClick={() => setRules((currentRules) => currentRules.filter((_, i) => i !== index))}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div>
            <button type="button" className="adm-btn" onClick={() => setRules((currentRules) => [...currentRules, { keyword: '', categorySlug: '' }])}>
              <Plus size={15} /> Thêm quy tắc
            </button>
          </div>
        </div>
      </div>

      <label className="gf-check">
        <input type="checkbox" checked={shouldUpdate} onChange={(e) => setShouldUpdate(e.target.checked)} />
        <span>Ghi đè sản phẩm đã có (cùng slug hoặc cùng link nguồn). Không tick thì bỏ qua sản phẩm trùng.</span>
      </label>

      <div className="pi-actions">
        <button type="button" className="adm-btn" disabled={isBusy || isSubmitting} onClick={handleDryRun}>
          Chạy thử
        </button>
        <button type="button" className="adm-btn adm-btn--primary" disabled={isBusy || isSubmitting || run.productCount === 0} onClick={handleImport}>
          {isSubmitting ? <span className="adm-spin" /> : <Upload size={16} />}
          Nhập vào CMS
        </button>
        {isBusy && <span className="gf-hint">Đang có việc chạy…</span>}
      </div>
    </section>
  );
}
