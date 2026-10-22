/**
 * confirmAction: hỏi xác nhận (SweetAlert), chạy thao tác khi đồng ý rồi báo thành công / lỗi; trả về thao tác có chạy được không.
 * Dùng bởi: các màn danh sách trong app/admin/(protected) (xóa bài viết, trang, section, menu, file thư viện…).
 */
import Swal, { type SweetAlertIcon } from 'sweetalert2';
import { getErrorMessage } from './api-error';

interface ConfirmConfig {
  title: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  confirmButtonColor?: string;
}

export async function confirmAction(
  config: ConfirmConfig,
  action: () => Promise<unknown>,
): Promise<boolean> {
  const result = await Swal.fire({
    title: config.title,
    text: config.text,
    icon: config.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonColor: config.confirmButtonColor ?? '#ff3838',
    cancelButtonColor: '#6b7280',
    confirmButtonText: config.confirmButtonText ?? 'Xác nhận',
    cancelButtonText: 'Hủy',
  });

  if (!result.isConfirmed) return false;

  try {
    await action();
    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Thao tác đã được thực hiện.',
      confirmButtonColor: '#000',
      confirmButtonText: 'OK',
    });
    return true;
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: getErrorMessage(error),
      confirmButtonColor: '#000',
    });
    return false;
  }
}
