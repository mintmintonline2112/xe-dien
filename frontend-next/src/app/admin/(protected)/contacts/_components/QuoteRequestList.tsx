'use client';

/**
 * Bảng yêu cầu tư vấn khách gửi từ website (tư vấn chọn xe, báo giá, trả góp, xem xe, đại lý): lọc, đổi trạng thái tại chỗ,
 * xem chi tiết trong hộp nổi, gọi / gửi mail, xoá, xuất Excel.
 * Dùng bởi: contacts/_components/ContactsScreen.tsx (tab "Yêu cầu tư vấn").
 */

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, X } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/app/admin/_components/data-table/DataTable';
import type { TableActionEvent, TableColumn, TableFilterOption } from '@/app/admin/_components/data-table/types';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { formatDate } from '@/app/admin/_lib/format-date';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import {
  quoteRequestService,
  QUOTE_REQUEST_QUERY_KEY,
  QUOTE_REQUEST_STATUS_LABELS,
  QUOTE_REQUEST_TYPE_LABELS,
  type QuoteRequest,
  type QuoteRequestStatus,
} from '@/app/admin/(protected)/contacts/_lib/quote-request.service';
import { adminRoutes } from '@/config/routes';

const STATUS_ENTRIES = Object.entries(QUOTE_REQUEST_STATUS_LABELS) as Array<[QuoteRequestStatus, string]>;

const toTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function QuoteRequestList() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAdminAuth();
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const canUpdateStatus = hasPermission('UPDATE_STATUS');

  const changeStatus = useCallback(
    async (request: QuoteRequest, status: QuoteRequestStatus) => {
      try {
        await quoteRequestService.updateStatus(request.id, status);
        await queryClient.invalidateQueries({ queryKey: QUOTE_REQUEST_QUERY_KEY });
        setSelectedRequest((current) => (current?.id === request.id ? { ...current, status } : current));
        toast.success(`Đã chuyển "${request.fullName}" sang ${QUOTE_REQUEST_STATUS_LABELS[status]}`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [queryClient],
  );

  const renderStatusSelect = useCallback(
    (request: QuoteRequest) => (
      <select
        className="gf-control"
        value={request.status}
        disabled={!canUpdateStatus}
        onChange={(e) => changeStatus(request, e.target.value as QuoteRequestStatus)}
        aria-label={`Trạng thái yêu cầu của ${request.fullName}`}
      >
        {STATUS_ENTRIES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    ),
    [canUpdateStatus, changeStatus],
  );

  const columns: TableColumn<QuoteRequest>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        label: 'Ngày gửi',
        type: 'custom',
        align: 'center',
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: 'fullName',
        label: 'Khách hàng',
        type: 'custom',
        align: 'left',
        render: (row) => (
          <>
            <button type="button" className="dt-link dt-link-button" onClick={() => setSelectedRequest(row)}>
              {row.fullName}
            </button>
            <small className="dt-sub">
              <a href={toTelHref(row.phone)}>{row.phone}</a>
              {row.province ? ` · ${row.province}` : ''}
            </small>
          </>
        ),
      },
      {
        key: 'requestType',
        label: 'Nhu cầu',
        type: 'custom',
        align: 'center',
        render: (row) => <span className="dt-badge">{QUOTE_REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType}</span>,
      },
      {
        key: 'productName',
        label: 'Sản phẩm',
        type: 'custom',
        align: 'left',
        render: (row) =>
          row.productName ? (
            row.productId ? (
              <Link className="dt-link" href={adminRoutes.products.edit(row.productId)}>
                {row.productName}
              </Link>
            ) : (
              row.productName
            )
          ) : (
            '—'
          ),
      },
      {
        key: 'status',
        label: 'Trạng thái',
        type: 'custom',
        align: 'center',
        render: renderStatusSelect,
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [renderStatusSelect],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'requestType',
        label: 'Tất cả nhu cầu',
        options: Object.entries(QUOTE_REQUEST_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      },
      {
        key: 'status',
        label: 'Tất cả trạng thái',
        options: STATUS_ENTRIES.map(([value, label]) => ({ label, value })),
      },
    ],
    [],
  );

  async function handleAction(event: TableActionEvent<QuoteRequest>) {
    const item = event.item;
    if (event.action !== 'delete' || !item?.id) return;
    await confirmAction(
      {
        title: 'Xóa yêu cầu tư vấn?',
        text: `Yêu cầu của "${item.fullName}" sẽ bị xóa.`,
        confirmButtonText: 'Xóa',
      },
      () => quoteRequestService.remove(item.id),
    );
    queryClient.invalidateQueries({ queryKey: QUOTE_REQUEST_QUERY_KEY });
  }

  async function handleExport() {
    try {
      await quoteRequestService.downloadExcel();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <DataTable<QuoteRequest>
        title="Yêu cầu tư vấn"
        subtitle="Khách để lại số điện thoại từ form tư vấn, báo giá, trả góp trên website"
        queryKey={[...QUOTE_REQUEST_QUERY_KEY]}
        columns={columns}
        fetcher={(params) => quoteRequestService.paginate(params)}
        showAdd={false}
        showExport={hasPermission('EXPORT')}
        onExport={handleExport}
        searchPlaceholder="Tìm tên, số điện thoại, sản phẩm…"
        filters={filters}
        enabledActions={['delete']}
        onAction={handleAction}
      />

      {selectedRequest && (
        <div className="lb-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="ct-detail" onClick={(e) => e.stopPropagation()}>
            <div className="lb-detail-head">
              <h3>{selectedRequest.fullName}</h3>
              <button type="button" onClick={() => setSelectedRequest(null)} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
            <dl className="lb-detail-rows">
              <div className="lb-detail-row">
                <dt>Nhu cầu</dt>
                <dd>{QUOTE_REQUEST_TYPE_LABELS[selectedRequest.requestType] ?? selectedRequest.requestType}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Điện thoại</dt>
                <dd>
                  <a href={toTelHref(selectedRequest.phone)}>{selectedRequest.phone}</a>
                </dd>
              </div>
              <div className="lb-detail-row">
                <dt>Email</dt>
                <dd>{selectedRequest.email || '—'}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Tỉnh / thành</dt>
                <dd>{selectedRequest.province || '—'}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Sản phẩm</dt>
                <dd>
                  {selectedRequest.productName && selectedRequest.productId ? (
                    <Link href={adminRoutes.products.edit(selectedRequest.productId)}>{selectedRequest.productName}</Link>
                  ) : (
                    selectedRequest.productName || '—'
                  )}
                </dd>
              </div>
              <div className="lb-detail-row">
                <dt>Trang gửi</dt>
                <dd>
                  {selectedRequest.sourceUrl ? (
                    <a href={selectedRequest.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {selectedRequest.sourceUrl}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="lb-detail-row">
                <dt>Ngày gửi</dt>
                <dd>{formatDate(selectedRequest.createdAt)}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Trạng thái</dt>
                <dd>{renderStatusSelect(selectedRequest)}</dd>
              </div>
              <div>
                <dt>Nội dung</dt>
                <p className="ct-message">{selectedRequest.message || '—'}</p>
              </div>
            </dl>
            <div className="lb-detail-actions">
              <a href={toTelHref(selectedRequest.phone)} className="adm-btn adm-btn--primary">
                <Phone size={15} /> Gọi khách
              </a>
              {selectedRequest.email && (
                <a href={`mailto:${selectedRequest.email}`} className="adm-btn">
                  <Mail size={15} /> Gửi email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
