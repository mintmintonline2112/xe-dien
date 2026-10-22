/**
 * Trang /admin/settings: cài đặt chung của website (logo, màu, font, mạng xã hội…).
 * Dùng bởi: Next.js App Router (route /admin/settings).
 */

import { SettingsScreen } from '@/app/admin/(protected)/settings/_components/SettingsScreen';

export default function AdminSettingsPage() {
  return <SettingsScreen />;
}
