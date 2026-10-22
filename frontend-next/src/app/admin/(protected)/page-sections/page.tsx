/**
 * Trang /admin/page-sections: danh sách section của các trang.
 * Dùng bởi: Next.js App Router (route /admin/page-sections).
 */

import { PageSectionList } from '@/app/admin/(protected)/page-sections/_components/PageSectionList';

export default function AdminPageSectionsPage() {
  return <PageSectionList />;
}
