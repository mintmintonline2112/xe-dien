/**
 * Layout gốc của khu admin: nạp admin.css, font Barlow, AuthProvider + AdminProviders; tiêu đề tab, favicon và 4 màu thương hiệu theo cài đặt, noindex.
 * Dùng bởi: Next.js App Router cho mọi trang dưới /admin.
 * Lưu ý: fontClassName gắn biến --font-barlow / --font-barlow-cond mà admin.css dùng. Màu admin.css suy từ --brand-* (styles/base.css) nên đổi màu ở Cài đặt thì admin đổi theo site.
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/app/admin/_auth/AuthProvider';
import { AdminProviders } from '@/app/admin/_layout/AdminProviders';
import { fontClassName } from '@/fonts/barlow-fonts';
import { buildBrandColorsCss } from '@/settings/brand-colors';
import { brandNameOf, faviconHrefOf, getSiteSettings } from '@/settings/site-settings';
import '@/styles/admin.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Quản trị ${brandNameOf(settings)}`,
    icons: { icon: faviconHrefOf(settings) },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const brandCss = buildBrandColorsCss((await getSiteSettings()).brandColors);
  return (
    <div className={fontClassName}>
      {brandCss ? <style>{brandCss}</style> : null}
      <AuthProvider>
        <AdminProviders>{children}</AdminProviders>
      </AuthProvider>
    </div>
  );
}
