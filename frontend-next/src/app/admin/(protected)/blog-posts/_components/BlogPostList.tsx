'use client';

/**
 * Bảng danh sách bài viết blog: lọc theo trạng thái / danh mục, sửa, xoá.
 * Dùng bởi: blog-posts/page.tsx.
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/app/admin/_components/data-table/DataTable';
import type {
  TableColumn,
  TableActionEvent,
  TableFilterOption,
} from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { PUBLISH_STATUS_CONFIG, PUBLISH_STATUS_OPTIONS } from '@/app/admin/_lib/publish-status';
import { formatDate } from '@/app/admin/_lib/format-date';
import {
  blogCategoryService,
  BLOG_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';
import { blogPostService, BLOG_POST_QUERY_KEY, type BlogPost } from '@/app/admin/(protected)/blog-posts/_lib/blog-post.service';
import { adminRoutes } from '@/config/routes';

export function BlogPostList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => blogCategoryService.paginate({ limit: 1000 }),
  });

  const categoryNameById = useMemo(() => {
    const nameById = new Map<number, string>();
    for (const category of categories?.data ?? []) nameById.set(category.id, category.name);
    return nameById;
  }, [categories]);

  const columns: TableColumn<BlogPost>[] = useMemo(
    () => [
      { key: 'coverImagePath', label: 'Ảnh', type: 'image', align: 'center' },
      {
        key: 'title',
        label: 'Tiêu đề',
        type: 'text',
        align: 'left',
        link: (row) => adminRoutes.blogPosts.edit(row.id),
      },
      {
        key: 'categoryId',
        label: 'Danh mục',
        type: 'custom',
        align: 'center',
        render: (row) =>
          row.categoryId != null ? (categoryNameById.get(row.categoryId) ?? `#${row.categoryId}`) : '—',
      },
      {
        key: 'status',
        label: 'Trạng thái',
        type: 'status',
        align: 'center',
        statusConfig: PUBLISH_STATUS_CONFIG,
      },
      {
        key: 'publishedAt',
        label: 'Ngày đăng',
        type: 'custom',
        align: 'center',
        render: (row) => formatDate(row.publishedAt),
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [categoryNameById],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Tất cả trạng thái',
        options: PUBLISH_STATUS_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
      },
      {
        key: 'categoryId',
        label: 'Tất cả danh mục',
        options: (categories?.data ?? []).map((category) => ({ label: category.name, value: String(category.id) })),
      },
    ],
    [categories],
  );

  async function handleAction(event: TableActionEvent<BlogPost>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push(adminRoutes.blogPosts.create);
        break;
      case 'edit':
        if (item?.id) router.push(adminRoutes.blogPosts.edit(item.id));
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa bài viết?',
              text: `Bài viết "${item.title}" sẽ bị xóa. Thao tác này không thể hoàn tác.`,
              confirmButtonText: 'Xóa',
            },
            () => blogPostService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: BLOG_POST_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<BlogPost>
      title="Bài viết"
      subtitle="Tin tức & bài viết trên website"
      queryKey={[...BLOG_POST_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => blogPostService.paginate(params)}
      addLabel="Viết bài mới"
      searchPlaceholder="Tìm theo tiêu đề, mô tả…"
      filters={filters}
      onAction={handleAction}
    />
  );
}
