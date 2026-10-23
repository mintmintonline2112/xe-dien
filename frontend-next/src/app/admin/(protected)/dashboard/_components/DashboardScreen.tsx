'use client';

/**
 * Màn hình tổng quan admin: số liệu sản phẩm / yêu cầu tư vấn / nội dung / liên hệ, bài viết và liên hệ gần đây, lối tắt theo quyền.
 * Dùng bởi: dashboard/page.tsx.
 * Lưu ý: thẻ số liệu, bảng và nút làm mới cache chỉ hiện khi có quyền tương ứng; backend cũng chỉ trả nhóm số liệu được phép xem.
 */

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/app/admin/_lib/admin-api';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import { AdminIcon } from '@/app/admin/_components/AdminIcon';
import { PurgeCacheButton } from './PurgeCacheButton';
import type { DashboardSummary } from '@/app/admin/(protected)/dashboard/_lib/types';
import { adminRoutes } from '@/config/routes';
import { withQuery } from '@/utils/route';

const STAT_CARD_LIMIT = 4;

const numberFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function StatusBadge({ status }: { status: string }) {
  const labelByStatus: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    archived: 'Lưu trữ',
  };
  return (
    <span className={`admin-status is-${status}`}>
      {labelByStatus[status] ?? status}
    </span>
  );
}

export function DashboardScreen() {
  const { user, hasPermission } = useAdminAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      setSummary(await adminApi.get<DashboardSummary>('/admin/dashboard/summary'));
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Không tải được dữ liệu dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const stats = summary
    ? [
        ...(summary.catalog
          ? [
              {
                label: 'Sản phẩm',
                value: summary.catalog.products,
                note: `${summary.catalog.publishedProducts} đang bán · ${summary.catalog.productCategories} danh mục`,
                icon: 'product' as const,
              },
            ]
          : []),
        ...(summary.quoteRequests
          ? [
              {
                label: 'Yêu cầu tư vấn',
                value: summary.quoteRequests.total,
                note: `${summary.quoteRequests.new} yêu cầu mới chưa xử lý`,
                icon: 'consult' as const,
              },
            ]
          : []),
        ...(summary.blogPosts
          ? [
              {
                label: 'Bài viết',
                value: summary.blogPosts.total,
                note: `${summary.blogPosts.published} đã xuất bản`,
                icon: 'article' as const,
              },
            ]
          : []),
        ...(summary.contacts
          ? [
              {
                label: 'Liên hệ',
                value: summary.contacts.total,
                note: `+${summary.contacts.thisMonth} trong tháng`,
                icon: 'contact' as const,
              },
            ]
          : []),
        ...(summary.pages
          ? [
              {
                label: 'Trang nội dung',
                value: summary.pages.total,
                note: `${summary.pages.sections} section`,
                icon: 'page' as const,
              },
            ]
          : []),
        ...(summary.staff
          ? [
              {
                label: 'Nhân sự',
                value: summary.staff.total,
                note: `${summary.staff.active} đang hoạt động`,
                icon: 'staff' as const,
              },
            ]
          : []),
      ].slice(0, STAT_CARD_LIMIT)
    : [];

  const canSeeBlogPosts = hasPermission('BLOG_POST_LIST');
  const canSeeContacts = hasPermission('CONTACT_LIST');

  return (
    <div className="admin-dashboard">
      <section className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Tổng quan hệ thống</p>
          <h1>Chào {user?.name || 'bạn'},</h1>
          <p>Theo dõi sản phẩm, nội dung website và các yêu cầu tư vấn mới từ khách hàng.</p>
        </div>
        <div className="admin-heading-actions">
          {hasPermission('CACHE_PURGE') ? <PurgeCacheButton /> : null}
          <button className="admin-secondary-button" onClick={loadSummary} disabled={isLoading}>
            <AdminIcon name="refresh" />
            {isLoading ? 'Đang tải' : 'Làm mới'}
          </button>
        </div>
      </section>

      {errorMessage ? (
        <div className="admin-error-state" role="alert">
          <strong>Chưa thể tải dashboard</strong>
          <p>{errorMessage}</p>
          <button type="button" onClick={loadSummary}>Thử lại</button>
        </div>
      ) : null}

      <section className="admin-stat-grid" aria-label="Thống kê tổng quan">
        {isLoading && !summary
          ? Array.from({ length: 4 }, (_, index) => (
              <div className="admin-stat-card is-loading" key={index} />
            ))
          : stats.map((stat) => (
              <article className="admin-stat-card" key={stat.label}>
                <span className="admin-stat-icon"><AdminIcon name={stat.icon} /></span>
                <div>
                  <p>{stat.label}</p>
                  <strong>{numberFormatter.format(stat.value)}</strong>
                  <small>{stat.note}</small>
                </div>
              </article>
            ))}
      </section>

      <div className="admin-dashboard-grid">
        {canSeeBlogPosts ? (
        <section className="admin-panel admin-panel-wide">
          <header className="admin-panel-header">
            <div>
              <h2>Bài viết cập nhật gần đây</h2>
              <p>{summary?.blogPosts?.drafts ?? 0} bản nháp đang chờ hoàn thiện</p>
            </div>
            <Link href={adminRoutes.blogPosts.list}>Xem tất cả</Link>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead>
              <tbody>
                {summary?.blogPosts?.recent.length ? summary.blogPosts.recent.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong><small>/{post.slug}</small></td>
                    <td><StatusBadge status={post.status} /></td>
                    <td>{dateFormatter.format(new Date(post.updatedAt))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="admin-empty-cell">Chưa có bài viết.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        ) : null}

        <section className="admin-panel">
          <header className="admin-panel-header">
            <div><h2>Truy cập nhanh</h2><p>Các tác vụ nội dung thường dùng</p></div>
          </header>
          <div className="admin-quick-links">
            {hasPermission('PRODUCT_LIST') ? <Link href={adminRoutes.products.list}><AdminIcon name="product" /><span><strong>Quản lý sản phẩm</strong><small>{summary?.catalog?.featuredProducts ?? 0} sản phẩm mua nhiều</small></span><AdminIcon name="chevron" /></Link> : null}
            {hasPermission('QUOTE_REQUEST_LIST') ? <Link href={adminRoutes.contacts}><AdminIcon name="consult" /><span><strong>Yêu cầu tư vấn</strong><small>{summary?.quoteRequests?.new ?? 0} yêu cầu mới</small></span><AdminIcon name="chevron" /></Link> : null}
            {canSeeBlogPosts ? <Link href={adminRoutes.blogPosts.list}><AdminIcon name="article" /><span><strong>Quản lý bài viết</strong><small>{summary?.blogPosts?.total ?? 0} nội dung</small></span><AdminIcon name="chevron" /></Link> : null}
            {hasPermission('PAGE_LIST') ? <Link href={adminRoutes.pages.list}><AdminIcon name="page" /><span><strong>Quản lý trang</strong><small>{summary?.pages?.published ?? 0} đang hiển thị</small></span><AdminIcon name="chevron" /></Link> : null}
            {canSeeContacts ? <Link href={withQuery(adminRoutes.contacts, { tab: 'lien-he' })}><AdminIcon name="contact" /><span><strong>Liên hệ khách hàng</strong><small>{summary?.contacts?.thisMonth ?? 0} trong tháng</small></span><AdminIcon name="chevron" /></Link> : null}
          </div>
        </section>

        {canSeeContacts ? (
        <section className="admin-panel admin-panel-full">
          <header className="admin-panel-header">
            <div><h2>Liên hệ mới nhất</h2><p>Yêu cầu gửi từ biểu mẫu trên website</p></div>
            <Link href={withQuery(adminRoutes.contacts, { tab: 'lien-he' })}>Xem tất cả</Link>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Khách hàng</th><th>Chủ đề</th><th>Ngày gửi</th></tr></thead>
              <tbody>
                {summary?.contacts?.recent.length ? summary.contacts.recent.map((contact) => (
                  <tr key={contact.id}>
                    <td><strong>{contact.fullname || 'Chưa cung cấp tên'}</strong><small>{contact.email || 'Không có email'}</small></td>
                    <td>{contact.subject || 'Liên hệ từ website'}</td>
                    <td>{dateFormatter.format(new Date(contact.createdAt))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="admin-empty-cell">Chưa có liên hệ nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        ) : null}
      </div>
    </div>
  );
}
