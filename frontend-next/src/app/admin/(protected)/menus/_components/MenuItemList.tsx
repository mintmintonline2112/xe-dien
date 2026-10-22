'use client';

/**
 * Bảng mục menu website theo vị trí (tab header / footer): lọc theo menu cha, sắp xếp, ẩn / hiện, sửa, xoá (xoá menu gốc xoá luôn submenu).
 * Dùng bởi: menus/page.tsx.
 * Lưu ý: lọc theo vị trí qua ?location= gửi lên API (backend phải cho lọc cột location); nút thêm mở form với vị trí của tab.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/app/admin/_components/data-table/DataTable';
import type {
  TableColumn,
  TableActionEvent,
  TableFilterOption,
} from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { ACTIVE_STATUS_CONFIG } from '@/app/admin/_lib/publish-status';
import {
  menuItemService,
  MENU_ITEM_QUERY_KEY,
  MENU_LOCATIONS,
  toMenuLocation,
  type MenuItem,
  type MenuLocation,
} from '@/app/admin/(protected)/menus/_lib/menu-item.service';
import { adminRoutes } from '@/config/routes';
import { cn } from '@/utils/cn';
import { withQuery } from '@/utils/route';

const menuListHrefOf = (location: MenuLocation) =>
  withQuery(adminRoutes.menus.list, { location: location === 'footer' ? 'footer' : undefined });

export function MenuItemList({ location }: { location: MenuLocation }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: allItems } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'options'],
    queryFn: () => menuItemService.paginate({ limit: 1000 }),
  });

  const labelById = useMemo(() => {
    const labels = new Map<number, string>();
    for (const item of allItems?.data ?? []) labels.set(item.id, item.label);
    return labels;
  }, [allItems]);

  const rootItems = useMemo(
    () =>
      (allItems?.data ?? []).filter(
        (item) => item.parentId == null && toMenuLocation(item.location) === location,
      ),
    [allItems, location],
  );

  const tableQuery = useMemo(() => ({ location }), [location]);

  const columns: TableColumn<MenuItem>[] = useMemo(
    () => [
      { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
      {
        key: 'label',
        label: 'Tên menu',
        type: 'text',
        align: 'left',
        link: (row) => adminRoutes.menus.edit(row.id),
      },
      { key: 'href', label: 'Đường dẫn', type: 'badge', align: 'left' },
      {
        key: 'parentId',
        label: 'Thuộc menu',
        type: 'custom',
        align: 'center',
        render: (row) =>
          row.parentId == null ? (
            <span className="dt-status is-success">Menu gốc</span>
          ) : (
            (labelById.get(row.parentId) ?? `#${row.parentId}`)
          ),
      },
      {
        key: 'isActive',
        label: 'Trạng thái',
        type: 'status',
        align: 'center',
        statusConfig: ACTIVE_STATUS_CONFIG,
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [labelById],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'parentId',
        label: 'Tất cả cấp',
        options: rootItems.map((item) => ({
          label: `Submenu của: ${item.label}`,
          value: String(item.id),
        })),
      },
    ],
    [rootItems],
  );

  async function handleAction(event: TableActionEvent<MenuItem>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push(withQuery(adminRoutes.menus.create, { location }));
        break;
      case 'edit':
        if (item?.id) router.push(adminRoutes.menus.edit(item.id));
        break;
      case 'sort':
        if (item?.id && event.value) {
          await menuItemService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
        }
        break;
      case 'toggle':
        if (item?.id) {
          await menuItemService.edit(item.id, { isActive: !item.isActive });
          queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
          toast.success(item.isActive ? `Đã ẩn "${item.label}"` : `Đã hiện "${item.label}"`);
        }
        break;
      case 'delete':
        if (item?.id) {
          const isRoot = item.parentId == null;
          await confirmAction(
            {
              title: 'Xóa menu?',
              text: isRoot
                ? `Menu "${item.label}" và toàn bộ submenu của nó sẽ bị xóa.`
                : `Xóa mục "${item.label}" khỏi submenu?`,
              confirmButtonText: 'Xóa',
            },
            () => menuItemService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <>
      <nav className="adm-tabs" aria-label="Vị trí menu">
        {MENU_LOCATIONS.map((tab) => (
          <Link
            key={tab.value}
            href={menuListHrefOf(tab.value)}
            className={cn('adm-tab', tab.value === location && 'is-active')}
            aria-current={tab.value === location ? 'page' : undefined}
            title={tab.hint}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <DataTable<MenuItem>
        title="Menu website"
        subtitle={MENU_LOCATIONS.find((tab) => tab.value === location)?.hint}
        queryKey={[...MENU_ITEM_QUERY_KEY, location]}
        query={tableQuery}
        columns={columns}
        fetcher={(params) => menuItemService.paginate(params)}
        addLabel="Thêm menu"
        searchPlaceholder="Tìm theo tên, đường dẫn…"
        filters={filters}
        enabledActions={['toggle', 'edit', 'delete']}
        onAction={handleAction}
      />
    </>
  );
}
