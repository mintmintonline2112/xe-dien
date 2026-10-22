'use client';

/**
 * Thanh phân trang (dãy số trang + chọn số dòng mỗi trang) và hàm buildPageList dựng dãy số có dấu "…".
 * Dùng bởi: DataTable.tsx, library/_components/LibraryScreen.tsx.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export function buildPageList(current: number, total: number): (number | string)[] {
  const pages: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  unit?: string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
  limit,
  onLimitChange,
  pageSizeOptions = [8, 10, 20, 50],
  unit,
  className,
}: PaginationProps) {
  return (
    <div className={cn('pg', className)}>
      <div className="pg-left">
        <span>
          {rangeStart}–{rangeEnd} / {total}
          {unit ? ` ${unit}` : ''}
        </span>
        {onLimitChange && limit != null && (
          <select
            className="pg-size"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}/trang
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="pg-nav">
        <button
          type="button"
          className="pg-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>
        {buildPageList(page, totalPages).map((pageItem, index) =>
          typeof pageItem === 'number' ? (
            <button
              key={index}
              type="button"
              className={cn('pg-page', pageItem === page && 'is-active')}
              onClick={() => onPageChange(pageItem)}
            >
              {pageItem}
            </button>
          ) : (
            <span key={index} className="pg-ellipsis">
              …
            </span>
          ),
        )}
        <button
          type="button"
          className="pg-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
