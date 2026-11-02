/**
 * confirmAction: hỏi xác nhận (SweetAlert), chạy thao tác khi đồng ý rồi báo thành công / lỗi; trả về thao tác có chạy được không.
 * Dùng bởi: các màn danh sách trong app/admin/(protected) (xóa bài viết, trang, section, menu, file thư viện…), nhập sản phẩm.
 * Lưu ý: popup gắn vào .admin-root và tắt style mặc định của SweetAlert (buttonsStyling: false) để lấy màu thương hiệu + font
 * admin từ admin.css (khối .admin-swal); tone 'danger' = nút đỏ cho thao tác xoá, 'primary' = nút màu chủ đạo.
 */
import Swal, { type SweetAlertIcon, type SweetAlertOptions } from 'sweetalert2';
import { getErrorMessage } from './api-error';

type ConfirmTone = 'danger' | 'primary';

interface ConfirmConfig {
  title: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  tone?: ConfirmTone;
}

function fireAdminAlert(options: SweetAlertOptions, tone: ConfirmTone = 'primary') {
  return Swal.fire({
    target: document.querySelector<HTMLElement>('.admin-root') ?? document.body,
    buttonsStyling: false,
    customClass: {
      popup: 'admin-swal',
      confirmButton: `admin-swal-button admin-swal-button--${tone}`,
      cancelButton: 'admin-swal-button admin-swal-button--ghost',
    },
    ...options,
  });
}

export async function confirmAction(
  config: ConfirmConfig,
  action: () => Promise<unknown>,
): Promise<boolean> {
  const result = await fireAdminAlert(
    {
      title: config.title,
      text: config.text,
      icon: config.icon ?? 'warning',
      showCancelButton: true,
      confirmButtonText: config.confirmButtonText ?? 'Xác nhận',
      cancelButtonText: 'Hủy',
    },
    config.tone ?? 'danger',
  );

  if (!result.isConfirmed) return false;

  try {
    await action();
    await fireAdminAlert({
      icon: 'success',
      title: 'Thành công!',
      text: 'Thao tác đã được thực hiện.',
      confirmButtonText: 'OK',
    });
    return true;
  } catch (error) {
    await fireAdminAlert({
      icon: 'error',
      title: 'Lỗi',
      text: getErrorMessage(error),
      confirmButtonText: 'Đóng',
    });
    return false;
  }
}
