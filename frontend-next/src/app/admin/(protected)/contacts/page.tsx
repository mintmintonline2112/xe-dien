/**
 * Trang /admin/contacts: yêu cầu tư vấn (mặc định) và liên hệ khách gửi từ website, chọn tab bằng ?tab=lien-he.
 * Dùng bởi: Next.js App Router (route /admin/contacts); quote-requests/page.tsx chuyển hướng về đây.
 */

import { ContactsScreen } from '@/app/admin/(protected)/contacts/_components/ContactsScreen';

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <ContactsScreen tab={tab === 'lien-he' ? 'lien-he' : 'tu-van'} />;
}
