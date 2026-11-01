/**
 * Menu tĩnh dự phòng của site public (menu chính + menu chân trang), kèm kiểu dữ liệu mục menu.
 * Dùng bởi: _lib/menu.ts (khi API menu lỗi hoặc CMS chưa có dữ liệu), _components/layout/Header.tsx, Footer.tsx.
 * Lưu ý: menu thật quản lý ở Admin → Menu (vị trí header / footer); footer: cấp 1 = tiêu đề cột, cấp 2 = link.
 */
import { siteRoutes } from "@/config/routes";

export type SiteMenuChild = {
  label: string;
  href: string;
};

export type SiteMenuItem = {
  key: string;
  label: string;
  href: string;
  showSubmenu?: boolean;
  children?: SiteMenuChild[];
};

export type MenuLocation = "header" | "footer";

export const SITE_MENU_ITEMS: SiteMenuItem[] = [
  { key: "home", label: "Trang chủ", href: siteRoutes.home },
  { key: "xe-san-golf", label: "Xe sân golf", href: siteRoutes.category("xe-dien-san-golf") },
  { key: "xe-resort", label: "Xe resort – du lịch", href: siteRoutes.category("xe-dien-du-lich") },
  { key: "xe-nang-dien", label: "Xe nâng điện", href: siteRoutes.category("xe-nang-dien") },
  { key: "san-pham", label: "Sản phẩm khác", href: siteRoutes.products },
  { key: "gioi-thieu", label: "Giới thiệu", href: siteRoutes.page("gioi-thieu") },
  { key: "tin-tuc", label: "Tin tức", href: siteRoutes.news },
  { key: "lien-he", label: "Liên hệ", href: siteRoutes.contact },
];

export const FOOTER_MENU_ITEMS: SiteMenuItem[] = [
  {
    key: "ho-tro",
    label: "Hỗ trợ khách hàng",
    href: "#",
    children: [
      { label: "Hướng dẫn mua hàng", href: siteRoutes.page("huong-dan-mua-hang") },
      { label: "Chính sách bảo hành", href: siteRoutes.page("chinh-sach-bao-hanh") },
      { label: "Chính sách vận chuyển", href: siteRoutes.page("chinh-sach-van-chuyen") },
      { label: "Chính sách đổi trả", href: siteRoutes.page("chinh-sach-doi-tra") },
      { label: "Mua trả góp", href: siteRoutes.page("mua-tra-gop") },
    ],
  },
  {
    key: "ve-chung-toi",
    label: "Về chúng tôi",
    href: "#",
    children: [
      { label: "Giới thiệu", href: siteRoutes.page("gioi-thieu") },
      { label: "Hệ thống showroom", href: siteRoutes.page("he-thong-showroom") },
      { label: "Tin tức", href: siteRoutes.news },
      { label: "Liên hệ", href: siteRoutes.contact },
    ],
  },
];
