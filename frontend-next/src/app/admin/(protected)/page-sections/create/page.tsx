/**
 * Trang /admin/page-sections/create: chưa có ?pageId= thì hiện bước chọn trang, có thì hiện form với trang đã khoá.
 * Dùng bởi: Next.js App Router; PageSectionList, PageSectionsPanel (nút thêm section của một trang).
 */

import { PageSectionForm } from '@/app/admin/(protected)/page-sections/_components/PageSectionForm';
import { PageSectionPagePicker } from '@/app/admin/(protected)/page-sections/_components/PageSectionPagePicker';

export default async function AdminPageSectionCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ pageId?: string }>;
}) {
  const { pageId } = await searchParams;
  const presetPageId = Number(pageId);
  if (!Number.isInteger(presetPageId) || presetPageId < 1) return <PageSectionPagePicker />;
  return <PageSectionForm key={presetPageId} presetPageId={presetPageId} />;
}
