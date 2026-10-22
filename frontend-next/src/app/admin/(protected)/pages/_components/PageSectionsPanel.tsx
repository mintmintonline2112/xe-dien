'use client';

/**
 * Bảng section của một trang (trong form sửa Page): kéo thả / mũi tên đổi thứ tự, bật / tắt hiển thị tại chỗ, sửa, xoá —
 * thấy được thứ tự các khối trên trang mà không phải mở từng section.
 * Dùng bởi: PageForm.tsx.
 * Lưu ý: đổi thứ tự lưu ngay qua sortOrder và chỉ gửi những dòng thực sự đổi; lỗi thì trả lại thứ tự cũ.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import {
  fetchSectionDefinitions,
  pageSectionService,
  PAGE_SECTION_QUERY_KEY,
  SECTION_DEFINITION_QUERY_KEY,
} from '@/app/admin/(protected)/page-sections/_lib/page-section.service';
import { PAGE_QUERY_KEY, type PageSectionSummary } from '@/app/admin/(protected)/pages/_lib/page.service';
import { adminRoutes } from '@/config/routes';

function compareBySortOrderThenId(sectionA: PageSectionSummary, sectionB: PageSectionSummary): number {
  return sectionA.sortOrder - sectionB.sortOrder || sectionA.id - sectionB.id;
}

export function PageSectionsPanel({
  pageId,
  sections,
}: {
  pageId: number;
  sections: PageSectionSummary[];
}) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<PageSectionSummary[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setRows([...sections].sort(compareBySortOrderThenId));
  }, [sections]);

  const { data: definitions } = useQuery({
    queryKey: SECTION_DEFINITION_QUERY_KEY,
    queryFn: fetchSectionDefinitions,
    staleTime: 5 * 60_000,
  });

  const componentLabelByKey = useMemo(() => {
    const labels = new Map<string, string>();
    for (const definition of definitions ?? []) labels.set(definition.sectionKey, definition.label.replace(/^[^·]*·\s*/, ''));
    return labels;
  }, [definitions]);

  async function refreshPageQueries() {
    await queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: PAGE_SECTION_QUERY_KEY });
  }

  async function saveSectionOrder(next: PageSectionSummary[]) {
    const changedRows = next
      .map((row, index) => ({ row, sortOrder: index + 1 }))
      .filter(({ row, sortOrder }) => row.sortOrder !== sortOrder);
    if (changedRows.length === 0) return;

    setIsBusy(true);
    try {
      for (const { row, sortOrder } of changedRows) {
        await pageSectionService.edit(row.id, { sortOrder });
      }
      setRows(next.map((row, index) => ({ ...row, sortOrder: index + 1 })));
      await refreshPageQueries();
      toast.success('Đã lưu thứ tự section');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setRows([...sections].sort(compareBySortOrderThenId));
    } finally {
      setIsBusy(false);
    }
  }

  function moveRow(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= rows.length || fromIndex === toIndex) return;
    const next = [...rows];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setRows(next);
    void saveSectionOrder(next);
  }

  async function toggleRowActive(row: PageSectionSummary) {
    setIsBusy(true);
    try {
      await pageSectionService.edit(row.id, { isActive: !row.isActive });
      setRows((current) => current.map((currentRow) => (currentRow.id === row.id ? { ...currentRow, isActive: !currentRow.isActive } : currentRow)));
      await refreshPageQueries();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function removeRow(row: PageSectionSummary) {
    await confirmAction(
      {
        title: 'Xóa section?',
        text: `Section "${row.heading ?? row.sectionKey}" sẽ bị xóa khỏi trang.`,
        confirmButtonText: 'Xóa',
      },
      async () => {
        await pageSectionService.remove(row.id);
        setRows((current) => current.filter((currentRow) => currentRow.id !== row.id));
        await refreshPageQueries();
      },
    );
  }

  return (
    <div className="gf-card ps-panel" style={{ marginTop: 24 }}>
      <div className="ps-panel-head">
        <div>
          <label className="gf-label" style={{ margin: 0 }}>Section thuộc trang này ({rows.length})</label>
          <p className="gf-hint" style={{ margin: '4px 0 0' }}>
            Kéo thả (hoặc dùng mũi tên) để đổi thứ tự khối trên trang — lưu ngay khi thả.
          </p>
        </div>
        <Link
          href={`${adminRoutes.pageSections.create}?pageId=${pageId}`}
          className="adm-btn adm-btn--primary adm-btn--sm"
        >
          + Thêm section cho trang này
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="gf-hint">Trang chưa có section nào — bấm &quot;Thêm section cho trang này&quot;.</p>
      ) : (
        <ul className={`ps-rows${isBusy ? ' is-busy' : ''}`}>
          {rows.map((row, index) => {
            const componentKey =
              typeof row.metadata?._component === 'string' ? row.metadata._component : row.sectionKey;
            const componentLabel = componentLabelByKey.get(componentKey);
            return (
              <li
                key={row.id}
                className={`ps-row${dragId === row.id ? ' is-dragging' : ''}${row.isActive ? '' : ' is-off'}`}
                draggable
                onDragStart={() => setDragId(row.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragId == null) return;
                  const fromIndex = rows.findIndex((currentRow) => currentRow.id === dragId);
                  setDragId(null);
                  moveRow(fromIndex, index);
                }}
              >
                <span className="ps-handle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
                  </svg>
                </span>
                <span className="ps-order">{index + 1}</span>
                <span className="ps-main">
                  <Link href={adminRoutes.pageSections.edit(row.id)} className="ps-heading">
                    {row.heading ?? row.sectionKey}
                  </Link>
                  <span className="ps-meta">
                    <span className="dt-badge">{row.sectionKey}</span>
                    {componentLabel ? <span className="ps-component">{componentLabel}</span> : <em>generic</em>}
                  </span>
                </span>

                <span className="ps-actions">
                  <button
                    type="button"
                    className="ps-icon-btn"
                    title="Lên"
                    aria-label="Đưa lên trên"
                    disabled={index === 0 || isBusy}
                    onClick={() => moveRow(index, index - 1)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
                  </button>
                  <button
                    type="button"
                    className="ps-icon-btn"
                    title="Xuống"
                    aria-label="Đưa xuống dưới"
                    disabled={index === rows.length - 1 || isBusy}
                    onClick={() => moveRow(index, index + 1)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  <button
                    type="button"
                    className={`ps-switch${row.isActive ? ' is-on' : ''}`}
                    role="switch"
                    aria-checked={row.isActive}
                    aria-label={row.isActive ? 'Đang hiển thị — bấm để ẩn' : 'Đang ẩn — bấm để hiển thị'}
                    disabled={isBusy}
                    onClick={() => toggleRowActive(row)}
                  >
                    <span className="ps-switch-dot" />
                    <span className="ps-switch-text">{row.isActive ? 'Hiển thị' : 'Ẩn'}</span>
                  </button>
                  <Link href={adminRoutes.pageSections.edit(row.id)} className="ps-icon-btn" title="Sửa" aria-label="Sửa section">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L20 8l-4-4L4 16v4z" /></svg>
                  </Link>
                  <button
                    type="button"
                    className="ps-icon-btn is-danger"
                    title="Xoá"
                    aria-label="Xoá section"
                    disabled={isBusy}
                    onClick={() => removeRow(row)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" /></svg>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
