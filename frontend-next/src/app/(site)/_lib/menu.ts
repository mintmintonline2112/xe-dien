/**
 * Lấy menu public từ CMS (bảng menu_items, quản lý tại /admin/menus) theo vị trí: `header` (menu chính) hoặc `footer` (cột chân trang).
 * Dùng bởi: app/(site)/layout.tsx (truyền vào Header, Footer).
 * Lưu ý: lỗi API hoặc menu rỗng thì dùng menu tĩnh trong site-menu.ts (SITE_MENU_ITEMS / FOOTER_MENU_ITEMS).
 */
import { apiFetch } from "@/api/api-fetch";
import { FOOTER_MENU_ITEMS, SITE_MENU_ITEMS, type MenuLocation, type SiteMenuItem } from "./site-menu";

type ApiMenuItem = {
  id: number;
  label: string;
  href: string;
  showSubmenu?: boolean;
  children?: { id: number; label: string; href: string }[];
};

const FALLBACK_MENUS: Record<MenuLocation, SiteMenuItem[]> = {
  header: SITE_MENU_ITEMS,
  footer: FOOTER_MENU_ITEMS,
};

export async function getSiteMenu(location: MenuLocation = "header"): Promise<SiteMenuItem[]> {
  const fallback = FALLBACK_MENUS[location];
  try {
    const path = location === "header" ? "client/menu" : `client/menu?location=${location}`;
    const items = await apiFetch<ApiMenuItem[]>(path, {
      next: { revalidate: 60, tags: ["menu"] },
    });
    if (!items?.length) return fallback;

    return items.map((item) => ({
      key: String(item.id),
      label: item.label,
      href: item.href,
      showSubmenu: item.showSubmenu !== false,
      children: item.children?.length
        ? item.children.map((child) => ({
            label: child.label,
            href: child.href,
          }))
        : undefined,
    }));
  } catch {
    return fallback;
  }
}
