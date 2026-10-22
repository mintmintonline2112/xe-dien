/**
 * Trang /admin/page-sections/edit/[id]: form sửa section, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; PageSectionList, PageSectionsPanel (form Page).
 */

import { notFound } from 'next/navigation';
import { PageSectionForm } from '@/app/admin/(protected)/page-sections/_components/PageSectionForm';

export default async function AdminPageSectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <PageSectionForm id={numericId} />;
}
