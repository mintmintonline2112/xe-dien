'use client';

/**
 * Màn Khách hàng → Yêu cầu tư vấn & liên hệ: hai tab "Yêu cầu tư vấn" (quote_requests) và "Liên hệ" (contacts), chỉ hiện tab có quyền xem.
 * Dùng bởi: contacts/page.tsx (tab lấy từ ?tab=, mặc định yêu cầu tư vấn).
 */

import Link from 'next/link';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import { ContactList } from '@/app/admin/(protected)/contacts/_components/ContactList';
import { QuoteRequestList } from '@/app/admin/(protected)/contacts/_components/QuoteRequestList';
import { adminRoutes } from '@/config/routes';
import { cn } from '@/utils/cn';
import { withQuery } from '@/utils/route';

export type ContactsTab = 'tu-van' | 'lien-he';

const TABS: Array<{ value: ContactsTab; label: string; permission: string }> = [
  { value: 'tu-van', label: 'Yêu cầu tư vấn', permission: 'QUOTE_REQUEST_LIST' },
  { value: 'lien-he', label: 'Liên hệ', permission: 'CONTACT_LIST' },
];

export function ContactsScreen({ tab }: { tab: ContactsTab }) {
  const { hasPermission } = useAdminAuth();
  const visibleTabs = TABS.filter((item) => hasPermission(item.permission));
  const activeTab = visibleTabs.find((item) => item.value === tab)?.value ?? visibleTabs[0]?.value;

  if (!activeTab) return <p className="dt-empty">Tài khoản chưa được cấp quyền xem yêu cầu tư vấn hoặc liên hệ.</p>;

  return (
    <>
      {visibleTabs.length > 1 && (
        <nav className="adm-tabs" aria-label="Loại yêu cầu">
          {visibleTabs.map((item) => (
            <Link
              key={item.value}
              href={withQuery(adminRoutes.contacts, { tab: item.value === 'tu-van' ? undefined : item.value })}
              className={cn('adm-tab', item.value === activeTab && 'is-active')}
              aria-current={item.value === activeTab ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      {activeTab === 'tu-van' ? <QuoteRequestList /> : <ContactList />}
    </>
  );
}
