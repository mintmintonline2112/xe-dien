/**
 * Trang /admin/pages/edit/[id]: form sửa trang, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở PageList.
 */

import { notFound } from 'next/navigation';
import { PageForm } from '@/app/admin/(protected)/pages/_components/PageForm';

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <PageForm id={numericId} />;
}
