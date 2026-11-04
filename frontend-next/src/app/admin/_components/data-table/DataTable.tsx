'use client';

/**
 * Bảng dữ liệu dùng chung của admin: tìm kiếm, lọc, phân trang phía server, các nút hành động theo dòng; truyền bulkActions thì có
 * cột chọn nhiều, ô chọn cả trang, nút "Chọn tất cả N mục" theo bộ lọc hiện tại và thanh thao tác hàng loạt.
 * Dùng bởi: các màn danh sách *List.tsx trong app/admin/(protected).
 * Lưu ý: đổi tìm kiếm / bộ lọc thì bỏ chọn; "chọn tất cả" tải tối đa 1000 mục (giới hạn limit của backend). Cột `status` coi số 1/0 như true/false vì MySQL trả tinyint cho cột boolean. Style ở styles/admin.css (`dt-*`).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Download,
  Check,
  Ban,
  ShieldOff,
  MessageSquareReply,
  CircleCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';
import { Pagination } from './Pagination';
import type {
  TableAction,
  TableActionEvent,
  TableBulkAction,
  TableColumn,
  TableFetcher,
  TableFilterOption,
} from './types';

function formatLoadError(error: unknown): string {
  const status = (error as { status?: number })?.status;
  if (status === 403) {
    return 'tài khoản chưa có quyền xem mục này. Hãy đăng xuất rồi đăng nhập lại để cập nhật quyền mới.';
  }
  return getErrorMessage(error);
}

interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  fetcher: TableFetcher<T>;
  queryKey: unknown[];
  title?: string;
  subtitle?: string;
  rowKey?: string;
  limit?: number;
  showAdd?: boolean;
  addLabel?: string;
  searchPlaceholder?: string;
  statusOptions?: string[];
  filters?: TableFilterOption[];
  enabledActions?: TableAction[];
  query?: Record<string, unknown>;
  onAction?: (event: TableActionEvent<T>) => void;
  showExport?: boolean;
  onExport?: () => void;
  headerActions?: React.ReactNode;
  bulkActions?: TableBulkAction<T>[];
}

const SELECT_ALL_LIMIT = 1000;

export function DataTable<T extends object>({
  columns,
  fetcher,
  queryKey,
  title,
  subtitle,
  rowKey = 'id',
  limit: initialLimit = 20,
  showAdd = true,
  addLabel = 'Thêm mới',
  searchPlaceholder = 'Tìm kiếm...',
  statusOptions = [],
  filters = [],
  enabledActions = ['edit', 'delete'],
  query = {},
  onAction,
  showExport = false,
  onExport,
  headerActions,
  bulkActions = [],
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Map<string, T>>(new Map());
  const [isBulkBusy, setIsBulkBusy] = useState(false);
  const hasBulkActions = bulkActions.length > 0;

  useEffect(() => {
    const debounceTimer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setSelectedRows(new Map());
  }, [search, status, extraFilters, limit]);

  const params = useMemo(
    () => ({ page, limit, search, status, ...query, ...extraFilters }),
    [page, limit, search, status, query, extraFilters],
  );

  const { data, isFetching, error } = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.page ?? page;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const total = meta?.total ?? rows.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, total);

  const rowKeyOf = (row: T, index = 0) => String((row as Record<string, unknown>)[rowKey] ?? index);
  const selectedOnPageCount = rows.filter((row) => selectedRows.has(rowKeyOf(row))).length;
  const isPageSelected = rows.length > 0 && selectedOnPageCount === rows.length;
  const columnCount = columns.length + (hasBulkActions ? 1 : 0);

  function toggleRow(row: T) {
    setSelectedRows((current) => {
      const next = new Map(current);
      const key = rowKeyOf(row);
      if (next.has(key)) next.delete(key);
      else next.set(key, row);
      return next;
    });
  }

  function togglePage() {
    setSelectedRows((current) => {
      const next = new Map(current);
      for (const row of rows) {
        if (isPageSelected) next.delete(rowKeyOf(row));
        else next.set(rowKeyOf(row), row);
      }
      return next;
    });
  }

  async function selectAllMatching() {
    setIsBulkBusy(true);
    try {
      const allRows = await fetcher({ ...params, page: 1, limit: Math.min(total, SELECT_ALL_LIMIT) });
      setSelectedRows(new Map(allRows.data.map((row, index) => [rowKeyOf(row, index), row])));
    } finally {
      setIsBulkBusy(false);
    }
  }

  async function runBulkAction(bulkAction: TableBulkAction<T>) {
    setIsBulkBusy(true);
    try {
      const isDone = await bulkAction.run([...selectedRows.values()]);
      if (isDone !== false) setSelectedRows(new Map());
    } finally {
      setIsBulkBusy(false);
    }
  }

  const emitAction = (action: TableAction, item?: T, value?: number) =>
    onAction?.({ action, item, value });

  const getCellValue = (column: TableColumn<T>, row: T): unknown =>
    column.value ? column.value(row) : (row as Record<string, unknown>)[column.key as string];

  const alignClassOf = (align?: string) =>
    align === 'center' ? 'is-center' : align === 'right' ? 'is-right' : undefined;

  function renderCell(column: TableColumn<T>, row: T): React.ReactNode {
    switch (column.type) {
      case 'badge':
        return <span className="dt-badge">{String(getCellValue(column, row) ?? '')}</span>;
      case 'image': {
        const src = resolveImageUrl(getCellValue(column, row) as string | null);
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="dt-thumb" />
        ) : (
          <span className="dt-dash">—</span>
        );
      }
      case 'status': {
        const rawValue = getCellValue(column, row);
        const normalizedValue =
          typeof rawValue === 'number' && (rawValue === 0 || rawValue === 1) ? rawValue === 1 : rawValue;
        const statusConfig = column.statusConfig?.find(
          (option) => option.value === rawValue || option.value === normalizedValue,
        );
        return (
          <span className={cn('dt-status', statusConfig?.className)}>
            {statusConfig?.label ?? String(rawValue ?? '')}
          </span>
        );
      }
      case 'sort':
        return (
          <input
            type="number"
            min={column.minSort ?? 1}
            defaultValue={Number(getCellValue(column, row) ?? 1)}
            onBlur={(e) => {
              const sortValue = Number(e.target.value);
              if (Number.isInteger(sortValue) && sortValue >= 1) emitAction('sort', row, sortValue);
            }}
            className="dt-sort-input"
          />
        );
      case 'custom':
        return column.render ? column.render(row) : null;
      case 'action': {
        if (column.actionGuard?.(row)) return null;
        const isAcceptDisabled = column.actionConfig?.accept?.disabled?.(row) ?? false;
        const isCancelDisabled = column.actionConfig?.cancel?.disabled?.(row) ?? false;
        return (
          <div className="dt-actions">
            {enabledActions.includes('accept') && (
              <button
                type="button"
                disabled={isAcceptDisabled}
                onClick={() => emitAction('accept', row)}
                className="dt-action dt-action--accept"
                aria-label="Duyệt"
                title="Xác nhận"
              >
                <Check size={15} />
              </button>
            )}
            {enabledActions.includes('cancel') && (
              <button
                type="button"
                disabled={isCancelDisabled}
                onClick={() => emitAction('cancel', row)}
                className="dt-action dt-action--cancel"
                aria-label="Huỷ"
                title="Hủy"
              >
                <Ban size={15} />
              </button>
            )}
            {enabledActions.includes('reply') && (
              <button
                type="button"
                onClick={() => emitAction('reply', row)}
                className="dt-action dt-action--reply"
                aria-label="Trả lời"
                title="Trả lời"
              >
                <MessageSquareReply size={15} />
              </button>
            )}
            {enabledActions.includes('toggle') && (
              <button
                type="button"
                onClick={() => emitAction('toggle', row)}
                className="dt-action dt-action--toggle"
                aria-label="Bật / tắt duyệt"
                title="Duyệt / Bỏ duyệt"
              >
                <CircleCheck size={15} />
              </button>
            )}
            {enabledActions.includes('edit') && (
              <button
                type="button"
                onClick={() => emitAction('edit', row)}
                className="dt-action"
                aria-label="Sửa"
                title="Sửa"
              >
                <Pencil size={15} />
              </button>
            )}
            {enabledActions.includes('block') && (
              <button
                type="button"
                onClick={() => emitAction('block', row)}
                className="dt-action dt-action--block"
                aria-label="Khoá / mở khoá"
                title="Khóa / Mở khóa"
              >
                <ShieldOff size={15} />
              </button>
            )}
            {enabledActions.includes('delete') && (
              <button
                type="button"
                onClick={() => emitAction('delete', row)}
                className="dt-action dt-action--delete"
                aria-label="Xoá"
                title="Xóa"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      }
      case 'text':
      default: {
        const value = getCellValue(column, row);
        const href = column.link?.(row);
        const content = value == null || value === '' ? '—' : String(value);
        return href ? (
          <Link href={href} className="dt-link">
            {content}
          </Link>
        ) : (
          <span>{content}</span>
        );
      }
    }
  }

  return (
    <div>
      {(title || showAdd || showExport || headerActions) && (
        <div className="adm-page-header is-row">
          <div>
            {title && <h1 className="adm-page-title">{title}</h1>}
            {subtitle && <p className="adm-page-subtitle">{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {headerActions}
            {showExport && (
              <button type="button" onClick={onExport} className="adm-btn">
                <Download size={16} /> Xuất Excel
              </button>
            )}
            {showAdd && (
              <button type="button" onClick={() => emitAction('add')} className="adm-btn adm-btn--primary">
                <Plus size={16} /> {addLabel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="dt-toolbar">
        <div className="dt-search">
          <Search size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        {statusOptions.length > 0 && (
          <select className="dt-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        )}

        {filters.map((filter) => (
          <select
            key={filter.key}
            className="dt-filter"
            value={extraFilters[filter.key] ?? ''}
            onChange={(e) =>
              setExtraFilters((current) => {
                const next = { ...current };
                if (e.target.value === '') delete next[filter.key];
                else next[filter.key] = e.target.value;
                return next;
              })
            }
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {hasBulkActions && selectedRows.size > 0 && (
        <div className="dt-bulkbar" role="region" aria-label="Thao tác hàng loạt">
          <strong>Đã chọn {selectedRows.size}</strong>
          {selectedRows.size < total && total <= SELECT_ALL_LIMIT && (
            <button type="button" className="dt-bulk-link" onClick={selectAllMatching} disabled={isBulkBusy}>
              Chọn tất cả {total} mục
            </button>
          )}
          <button type="button" className="dt-bulk-link" onClick={() => setSelectedRows(new Map())} disabled={isBulkBusy}>
            Bỏ chọn
          </button>
          <div className="dt-bulk-actions">
            {bulkActions.map((bulkAction) => (
              <button
                key={bulkAction.key}
                type="button"
                className={cn('adm-btn', bulkAction.tone === 'danger' && 'adm-btn--danger')}
                onClick={() => runBulkAction(bulkAction)}
                disabled={isBulkBusy}
              >
                {bulkAction.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="dt-card">
        <div className="dt-scroll">
          <table className="dt-table">
            <thead>
              <tr>
                {hasBulkActions && (
                  <th className="dt-check">
                    <input
                      type="checkbox"
                      checked={isPageSelected}
                      ref={(checkbox) => {
                        if (checkbox) checkbox.indeterminate = selectedOnPageCount > 0 && !isPageSelected;
                      }}
                      onChange={togglePage}
                      disabled={rows.length === 0}
                      aria-label="Chọn tất cả mục trên trang này"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={String(column.key)} className={alignClassOf(column.align)}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={columnCount} className="dt-empty dt-error">
                    Không tải được dữ liệu: {formatLoadError(error)}
                  </td>
                </tr>
              ) : isFetching && rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="dt-empty">
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="dt-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const key = rowKeyOf(row, index);
                  const isSelected = selectedRows.has(key);
                  return (
                    <tr key={key} className={cn(isSelected && 'is-selected')}>
                      {hasBulkActions && (
                        <td className="dt-check">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row)}
                            aria-label="Chọn dòng này"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={String(column.key)} className={alignClassOf(column.align)}>
                          {renderCell(column, row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          className="in-card"
          page={currentPage}
          totalPages={totalPages}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
