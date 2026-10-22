"use client";

/**
 * Header 3 tầng kiểu cửa hàng: thanh trên (tổng đài, hotline, giờ mở cửa, mạng xã hội — thu lại khi cuộn), thanh chính (logo, ô tìm
 * sản phẩm, hotline, nút trả góp), thanh menu màu chủ đạo (nút "Danh mục sản phẩm" thả cây danh mục + menu CMS có menu con).
 * Dùng bởi: app/(site)/layout.tsx.
 * Lưu ý: dưới 900px thanh menu ẩn, thay bằng ngăn kéo bên trái (CategoryDrawer.tsx). Trạng thái cuộn / mở ngăn kéo ghi lên <header>
 * bằng data-scrolled / data-open, tầng con đọc qua `group-data-scrolled/header`. Ô tìm kiếm gửi GET /san-pham?q=.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CategoryNode } from "@/app/(site)/_lib/catalog";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { siteRoutes } from "@/config/routes";
import type { SiteContact, SocialLinks } from "@/settings/site-settings";
import { cn } from "@/utils/cn";
import { isActivePath } from "@/utils/route";
import { Brand, type BrandProps } from "./Brand";
import { CategoryDrawer } from "./CategoryDrawer";
import { SearchForm } from "./SearchForm";
import { SocialIcons } from "./SocialIcons";

const TOPBAR_LINK = "inline-flex items-center gap-1.5 whitespace-nowrap text-light-soft hover:text-gold-300 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gold-300";

const NAV_LINK =
  "relative flex h-full items-center gap-1 px-3.5 text-sm font-semibold whitespace-nowrap text-light transition-[background-color,color] duration-200 ease-brand hover:bg-navy-800 aria-[current=page]:bg-navy-800 aria-[current=page]:text-gold-300";

const DROPDOWN_PANEL =
  "invisible absolute top-full z-30 min-w-56 translate-y-1 rounded-b-lg border border-line border-t-0 bg-paper py-2 opacity-0 shadow-float transition-[opacity,transform,visibility] duration-200 ease-brand group-hover/item:visible group-hover/item:translate-y-0 group-hover/item:opacity-100 group-focus-within/item:visible group-focus-within/item:translate-y-0 group-focus-within/item:opacity-100";

const DROPDOWN_LINK = "flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-navy-50 hover:text-navy-700";

export function Header({
  menu,
  categories,
  brand,
  contact,
  social,
  installmentHref,
}: {
  menu: SiteMenuItem[];
  categories: CategoryNode[];
  brand?: BrandProps;
  contact: SiteContact;
  social?: SocialLinks | null;
  installmentHref: string;
}) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const isCurrent = (href: string) => isActivePath(pathname, href, siteRoutes.home);

  return (
    <header
      className="group/header sticky top-0 z-100 bg-paper transition-shadow duration-250 ease-brand data-scrolled:shadow-lift"
      data-scrolled={isScrolled ? "" : undefined}
      data-open={isDrawerOpen ? "" : undefined}
      id="site-header"
    >
      <div className="max-h-10 overflow-hidden bg-navy-900 text-xs [transition:max-height_300ms_var(--ease),opacity_220ms_var(--ease)] group-data-scrolled/header:max-h-0 group-data-scrolled/header:opacity-0 max-[900px]:hidden">
        <div className="site-container flex h-10 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-6">
            <a className={TOPBAR_LINK} href={contact.hotlineHref}>
              <SiteIcon name="headset" />
              Tổng đài miễn phí: <strong className="font-bold text-light">{contact.hotline}</strong>
            </a>
            <a className={TOPBAR_LINK} href={contact.phoneHref}>
              <SiteIcon name="phone" />
              Mua hàng: <strong className="font-bold text-light">{contact.phone}</strong>
            </a>
            {contact.hours ? (
              <span className={cn(TOPBAR_LINK, "max-[1100px]:hidden")}>
                <SiteIcon name="clock" />
                {contact.hours}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-5">
            <Link className={TOPBAR_LINK} href={siteRoutes.page("he-thong-showroom")}>
              <SiteIcon name="store" />
              Hệ thống showroom
            </Link>
            <SocialIcons
              links={social}
              className="inline-flex items-center gap-1.5"
              linkClassName="grid h-6 w-6 place-items-center rounded-full text-light-soft hover:bg-gold-400 hover:text-ink [&>svg]:h-3.5 [&>svg]:w-3.5"
              label="Mạng xã hội"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-b-line-soft">
        <div className="site-container flex items-center gap-6 py-3 transition-[padding] duration-300 ease-brand group-data-scrolled/header:py-2 max-[900px]:gap-3 max-[900px]:py-2.5">
          <button
            className="hidden h-10 w-10 shrink-0 place-items-center rounded-md border border-line text-navy-700 max-[900px]:grid"
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="site-drawer"
            aria-label="Mở menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <SiteIcon name="menu" className="h-5 w-5" />
          </button>

          <Brand {...brand} />

          <SearchForm id="header-search" className="max-w-[36rem] flex-1 max-[900px]:hidden" />

          <div className="ml-auto flex items-center gap-4 max-[640px]:gap-2">
            <a href={contact.phoneHref} className="group/hotline flex items-center gap-2.5 max-[1100px]:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-50 text-navy-700 group-hover/hotline:bg-navy-700 group-hover/hotline:text-gold-300">
                <SiteIcon name="phone" className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-2xs font-medium tracking-xs text-ink-faint uppercase">Hotline mua hàng</span>
                <strong className="font-display text-lg font-extrabold text-sale">{contact.phone}</strong>
              </span>
            </a>
            <Link href={installmentHref} className="btn btn-gold btn-sm max-[640px]:hidden">
              <SiteIcon name="card" className="h-4 w-4" />
              Trả góp 0%
            </Link>
            <button
              className="hidden h-10 w-10 place-items-center rounded-md border border-line text-navy-700 max-[900px]:grid"
              type="button"
              aria-expanded={isSearchOpen}
              aria-controls="mobile-search"
              aria-label="Tìm kiếm sản phẩm"
              onClick={() => setIsSearchOpen((wasOpen) => !wasOpen)}
            >
              <SiteIcon name={isSearchOpen ? "close" : "search"} className="h-5 w-5" />
            </button>
            <a
              href={contact.phoneHref}
              className="hidden h-10 w-10 place-items-center rounded-md bg-sale text-light max-[900px]:grid"
              aria-label={`Gọi ${contact.phone}`}
            >
              <SiteIcon name="phone" className="h-5 w-5" />
            </a>
          </div>
        </div>
        {isSearchOpen ? (
          <div className="site-container hidden pb-3 max-[900px]:block" id="mobile-search">
            <SearchForm id="mobile-search-input" autoFocus />
          </div>
        ) : null}
      </div>

      <nav className="bg-navy-700 max-[900px]:hidden" aria-label="Menu chính">
        <div className="site-container flex h-12 items-stretch">
          <CategoryMenu categories={categories} />
          <ul className="m-0 flex min-w-0 flex-1 list-none items-stretch p-0">
            {menu.map((item) => {
              const hasChildren = item.showSubmenu !== false && (item.children?.length ?? 0) > 0;
              return (
                <li key={item.key} className="group/item relative">
                  <Link
                    href={item.href}
                    className={NAV_LINK}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                  >
                    {item.label}
                    {hasChildren ? <SiteIcon name="chevron-down" className="h-3.5 w-3.5 opacity-70" /> : null}
                  </Link>
                  {hasChildren ? (
                    <ul className={cn(DROPDOWN_PANEL, "left-0 m-0 list-none")}>
                      {item.children!.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className={DROPDOWN_LINK}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        menu={menu}
        categories={categories}
        brand={brand}
        contact={contact}
        isCurrent={isCurrent}
      />
    </header>
  );
}

function CategoryMenu({ categories }: { categories: CategoryNode[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="group/item relative mr-2 shrink-0">
      <Link
        href={siteRoutes.products}
        className="flex h-full w-64 items-center gap-2.5 bg-navy-900 px-4 text-sm font-bold tracking-xs text-light uppercase hover:text-gold-300"
      >
        <SiteIcon name="menu" className="h-5 w-5 text-gold-300" />
        Danh mục sản phẩm
      </Link>
      <ul className={cn(DROPDOWN_PANEL, "left-0 m-0 w-64 list-none rounded-bl-lg")}>
        {categories.map((category) => (
          <li key={category.id} className="group/cat relative">
            <Link href={siteRoutes.category(category.slug)} className={cn(DROPDOWN_LINK, "justify-between")}>
              <span className="flex items-center gap-2.5">
                <SiteIcon name={category.icon} className="h-5 w-5 text-navy-700" strokeWidth={1.5} />
                {category.name}
              </span>
              {category.children.length > 0 ? <SiteIcon name="chevron-right" className="h-3.5 w-3.5 text-ink-faint" /> : null}
            </Link>
            {category.children.length > 0 ? (
              <ul className="invisible absolute top-0 left-full m-0 min-h-full w-60 list-none rounded-r-lg border border-line bg-paper py-2 opacity-0 shadow-float transition-[opacity,visibility] duration-150 ease-brand group-hover/cat:visible group-hover/cat:opacity-100 group-focus-within/cat:visible group-focus-within/cat:opacity-100">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link href={siteRoutes.category(child.slug)} className={DROPDOWN_LINK}>
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
