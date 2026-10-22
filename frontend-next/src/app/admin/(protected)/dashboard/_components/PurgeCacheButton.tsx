'use client';

/**
 * Nút "Làm mới website": xoá toàn bộ cache backend và fetch cache của Next (menu, trang, bài viết) trong một cú bấm.
 * Dùng bởi: DashboardScreen.tsx.
 * Lưu ý: mọi thao tác ghi đã tự invalidate cache; nút này cho ca ngoài luồng (sửa DB trực tiếp, chạy lại seed, backend vừa
 * restart, env revalidate cấu hình sai).
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { adminApi } from '@/app/admin/_lib/admin-api';
import { getErrorMessage } from '@/app/admin/_lib/api-error';

export function PurgeCacheButton() {
  const [isPurging, setIsPurging] = useState(false);

  async function handlePurge() {
    setIsPurging(true);
    try {
      const result = await adminApi.post<{ purged: string[] }>('admin/cache/purge');
      toast.success(
        `Đã làm mới website (${result.purged.length} vùng cache: ${result.purged.join(', ')})`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsPurging(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-secondary-button"
      onClick={handlePurge}
      disabled={isPurging}
      title="Xóa cache backend + Next để website public hiển thị nội dung mới nhất"
    >
      {isPurging ? <span className="adm-spin adm-spin--dark" /> : <Zap size={16} />}
      {isPurging ? 'Đang làm mới…' : 'Làm mới website'}
    </button>
  );
}
