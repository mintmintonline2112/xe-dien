'use client';

/**
 * Bảng dữ liệu dùng chung của admin: tìm kiếm, lọc, phân trang phía server, các nút hành động theo dòng.
 * Dùng bởi: các màn danh sách *List.tsx trong app/admin/(protected).
 * Lưu ý: cột `status` coi số 1/0 như true/false vì MySQL trả tinyint cho cột boolean. Style ở styles/admin.css (`dt-*`).
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
}

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
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const debounceTimer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
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
                aria-label="Accept"
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
                aria-label="Cancel"
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
                aria-label="Reply"
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
                aria-label="Toggle approval"
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
                aria-label="Edit"
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
                aria-label="Block / Unblock"
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
                aria-label="Delete"
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

      <div className="dt-card">
        <div className="dt-scroll">
          <table className="dt-table">
            <thead>
              <tr>
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
                  <td colSpan={columns.length} className="dt-empty dt-error">
                    Không tải được dữ liệu: {formatLoadError(error)}
                  </td>
                </tr>
              ) : isFetching && rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dt-empty">
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dt-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const key = (row as Record<string, unknown>)[rowKey] ?? index;
                  return (
                    <tr key={String(key)}>
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
