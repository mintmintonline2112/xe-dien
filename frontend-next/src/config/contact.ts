/**
 * Thông tin liên hệ mặc định của cửa hàng (tên, địa chỉ, tổng đài, hotline mua hàng, Zalo, email, giờ mở cửa).
 * Dùng bởi: settings/site-settings.ts (resolveContact), layout/Footer.tsx, admin ContactPageScreen.tsx, SettingsScreen.tsx.
 * Lưu ý: chỉ dùng khi Admin → Trang Liên hệ → Thông tin công ty để trống ô tương ứng. Số điện thoại / địa chỉ ở đây là
 * dữ liệu mẫu — chủ cửa hàng nhập số thật trong Admin.
 */
export const SITE_CONTACT = {
  name: "Trạm Xe Điện",
  location: "TP. Hồ Chí Minh",
  address: "123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7",
  email: "lienhe@tramxedien.vn",
  phone: "0900 000 000",
  phoneHref: "tel:0900000000",
  hotline: "1800 0000",
  zalo: "0900000000",
  hours: "8:00 – 21:00, Thứ 2 – Chủ nhật",
} as const;
