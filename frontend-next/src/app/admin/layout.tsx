/**
 * Layout gốc của khu admin: nạp admin.css, font Barlow, AuthProvider + AdminProviders; tiêu đề tab và favicon theo cài đặt thương hiệu, noindex.
 * Dùng bởi: Next.js App Router cho mọi trang dưới /admin.
 * Lưu ý: fontClassName gắn biến --font-barlow / --font-barlow-cond mà admin.css dùng.
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/app/admin/_auth/AuthProvider';
import { AdminProviders } from '@/app/admin/_layout/AdminProviders';
import { fontClassName } from '@/fonts/barlow-fonts';
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={fontClassName}>
      <AuthProvider>
        <AdminProviders>{children}</AdminProviders>
      </AuthProvider>
    </div>
  );
}
