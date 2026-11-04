'use client';

/**
 * Khung sắp xếp dạng cây (mục gốc → mục con): kéo thả hoặc bấm ↑ ↓ để đổi chỗ trong cùng cấp, bấm Lưu để ghi thứ tự mới.
 * Dùng bởi: menus/_components/MenuItemList.tsx (menu website), product-categories/_components/ProductCategoryList.tsx (danh mục sản phẩm).
 * Lưu ý: chỉ đổi chỗ giữa các mục cùng cha (chuyển sang cha khác thì sửa ở form); lưu xong mỗi cấp được đánh số lại 1, 2, 3…
 * và chỉ gửi những mục đổi số qua onSave. Style ở styles/admin.css (`mo-*`).
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { cn } from '@/utils/cn';

export interface TreeOrderItem {
  id: number;
  parentId: number | null;
  sortOrder: number;
  label: string;
  detail?: string;
  isHidden?: boolean;
}

export interface TreeOrderChange {
  id: number;
  sortOrder: number;
}

type SiblingOrder = Record<string, number[]>;

const ROOT_GROUP = 'root';
const groupKeyOf = (parentId: number | null) => (parentId == null ? ROOT_GROUP : String(parentId));

function buildSiblingOrder(items: TreeOrderItem[]): SiblingOrder {
  const order: SiblingOrder = {};
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  for (const item of sorted) (order[groupKeyOf(item.parentId)] ??= []).push(item.id);
  return order;
}

function moveWithin(ids: number[], fromIndex: number, toIndex: number): number[] {
  const next = [...ids];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function TreeOrderPanel({
  items,
  hint,
  emptyText,
  onSave,
}: {
  items: TreeOrderItem[];
  hint: string;
  emptyText: string;
  onSave: (changes: TreeOrderChange[]) => Promise<void>;
}) {
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const [order, setOrder] = useState<SiblingOrder>(() => buildSiblingOrder(items));
  const [dragging, setDragging] = useState<{ group: string; id: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setOrder(buildSiblingOrder(items)), [items]);

  const changes = useMemo(
    () =>
      Object.values(order).flatMap((ids) =>
        ids
          .map((id, index) => ({ id, sortOrder: index + 1 }))
          .filter(({ id, sortOrder }) => itemById.get(id)?.sortOrder !== sortOrder),
      ),
    [order, itemById],
  );

  function moveItem(group: string, fromIndex: number, toIndex: number) {
    const ids = order[group] ?? [];
    if (toIndex < 0 || toIndex >= ids.length || fromIndex === toIndex) return;
    setOrder((current) => ({ ...current, [group]: moveWithin(current[group] ?? [], fromIndex, toIndex) }));
  }

  function handleDrop(group: string, targetId: number) {
    if (!dragging || dragging.group !== group) return;
    const ids = order[group] ?? [];
    moveItem(group, ids.indexOf(dragging.id), ids.indexOf(targetId));
    setDragging(null);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(changes);
      toast.success('Đã lưu thứ tự');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không lưu được thứ tự'));
    } finally {
      setIsSaving(false);
    }
  }

  function renderGroup(group: string, depth: number) {
    const ids = order[group] ?? [];
    if (ids.length === 0) return null;
    return (
      <ol className={cn('mo-list', depth > 0 && 'is-nested')}>
        {ids.map((id, index) => {
          const item = itemById.get(id);
          if (!item) return null;
          return (
            <li key={id}>
              <div
                className={cn('mo-row', item.isHidden && 'is-hidden', dragging?.id === id && 'is-dragging')}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDragging({ group, id });
                }}
                onDragEnd={() => setDragging(null)}
                onDragOver={(e) => {
                  if (dragging?.group === group) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(group, id);
                }}
              >
                <GripVertical size={16} className="mo-grip" aria-hidden="true" />
                <span className="mo-index">{index + 1}</span>
                <span className="mo-label">{item.label}</span>
                {item.detail && <span className="mo-href">{item.detail}</span>}
                {item.isHidden && <span className="mo-badge">Đang ẩn</span>}
                <span className="mo-actions">
                  <button
                    type="button"
                    onClick={() => moveItem(group, index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Đưa "${item.label}" lên`}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(group, index, index + 1)}
                    disabled={index === ids.length - 1}
                    aria-label={`Đưa "${item.label}" xuống`}
                  >
                    <ArrowDown size={15} />
                  </button>
                </span>
              </div>
              {renderGroup(String(id), depth + 1)}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <section className="gf-card mo-panel">
      <div className="mo-head">
        <div>
          <h2 className="mo-title">Sắp xếp thứ tự</h2>
          <p className="gf-hint">{hint}</p>
        </div>
        <div className="mo-head-actions">
          {changes.length > 0 && (
            <button
              type="button"
              className="adm-btn"
              onClick={() => setOrder(buildSiblingOrder(items))}
              disabled={isSaving}
            >
              Hoàn tác
            </button>
          )}
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={handleSave}
            disabled={isSaving || changes.length === 0}
          >
            {isSaving ? 'Đang lưu…' : 'Lưu thứ tự'}
          </button>
        </div>
      </div>
      {items.length > 0 ? renderGroup(ROOT_GROUP, 0) : <p className="gf-hint">{emptyText}</p>}
    </section>
  );
}
