"use client";

/**
 * Ngăn kéo menu mobile (dưới 900px): logo + nút đóng, ô tìm kiếm, cây danh mục sản phẩm (mở danh mục con bằng <details>), menu CMS, nút gọi.
 * Dùng bởi: layout/Header.tsx.
 * Lưu ý: Header giữ trạng thái mở và khoá cuộn trang; bấm nền mờ hoặc phím Esc để đóng. Ẩn hẳn khi đóng (không giữ trong tab order).
 */
import Link from "next/link";
import type { CategoryNode } from "@/app/(site)/_lib/catalog";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { siteRoutes } from "@/config/routes";
import type { SiteContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";
import { Brand, type BrandProps } from "./Brand";
import { SearchForm } from "./SearchForm";

const DRAWER_TITLE = "m-0 mb-2 px-4 text-2xs font-bold tracking-lg text-ink-faint uppercase";
const DRAWER_LINK = "flex items-center gap-3 px-4 py-2.5 text-base font-medium text-ink hover:bg-navy-50 hover:text-navy-700";

export function CategoryDrawer({
  isOpen,
  onClose,
  menu,
  categories,
  brand,
  contact,
  isCurrent,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: SiteMenuItem[];
  categories: CategoryNode[];
  brand?: BrandProps;
  contact: SiteContact;
  isCurrent: (href: string) => boolean;
}) {
  return (
    <div className={cn("fixed inset-0 z-200", isOpen ? "block" : "hidden")} id="site-drawer">
      <button type="button" className="absolute inset-0 border-0 bg-navy-900/60" aria-label="Đóng menu" onClick={onClose} />
      <div
        className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] animate-[drawer-in_260ms_var(--ease)_both] flex-col overflow-y-auto bg-paper shadow-float motion-reduce:animate-none"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between gap-3 border-b border-b-line px-4 py-3">
          <Brand {...brand} />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-ink"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <SiteIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4">
          <SearchForm id="drawer-search" />
        </div>

        {categories.length > 0 ? (
          <nav className="pb-3" aria-label="Danh mục sản phẩm">
            <p className={DRAWER_TITLE}>Danh mục sản phẩm</p>
            <ul className="m-0 list-none p-0">
              {categories.map((category) =>
                category.children.length > 0 ? (
                  <li key={category.id}>
                    <details className="group/details">
                      <summary className={cn(DRAWER_LINK, "cursor-pointer list-none justify-between [&::-webkit-details-marker]:hidden")}>
                        <span className="flex items-center gap-3">
                          <SiteIcon name={category.icon} className="h-5 w-5 text-navy-700" strokeWidth={1.5} />
                          {category.name}
                        </span>
                        <SiteIcon name="chevron-down" className="h-4 w-4 text-ink-faint transition-transform duration-200 group-open/details:rotate-180" />
                      </summary>
                      <ul className="m-0 list-none bg-cream py-1 pl-12">
                        <li>
                          <Link href={siteRoutes.category(category.slug)} className="block py-2 pr-4 text-sm font-semibold text-navy-700">
                            Tất cả {category.name.toLowerCase()}
                          </Link>
                        </li>
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link href={siteRoutes.category(child.slug)} className="block py-2 pr-4 text-sm text-ink-soft hover:text-navy-700">
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li key={category.id}>
                    <Link href={siteRoutes.category(category.slug)} className={DRAWER_LINK}>
                      <SiteIcon name={category.icon} className="h-5 w-5 text-navy-700" strokeWidth={1.5} />
                      {category.name}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        ) : null}

        <nav className="border-t border-t-line py-3" aria-label="Menu chính">
          <ul className="m-0 list-none p-0">
            {menu.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(DRAWER_LINK, "aria-[current=page]:text-navy-700")}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto grid gap-2 border-t border-t-line p-4">
          <a href={contact.phoneHref} className="btn btn-sale btn-sm">
            <SiteIcon name="phone" className="h-4 w-4" />
            Mua hàng: {contact.phone}
          </a>
          <a href={contact.hotlineHref} className="btn btn-ghost-dark btn-sm">
            <SiteIcon name="headset" className="h-4 w-4" />
            Tổng đài miễn phí: {contact.hotline}
          </a>
        </div>
      </div>
    </div>
  );
}
