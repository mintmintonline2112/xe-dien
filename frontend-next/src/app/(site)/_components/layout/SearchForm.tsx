/**
 * Ô tìm sản phẩm: form GET tới /san-pham với tham số q (không cần JS, Enter là tìm).
 * Dùng bởi: layout/Header.tsx (thanh chính + hàng tìm kiếm mobile), layout/CategoryDrawer.tsx, trang san-pham (khi không có kết quả).
 * Lưu ý: `id` phải khác nhau giữa các ô trên cùng một trang (label trỏ theo id).
 */
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export function SearchForm({
  id,
  defaultValue,
  autoFocus = false,
  className,
}: {
  id: string;
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <form action={siteRoutes.products} method="get" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Tìm sản phẩm
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Bạn cần tìm xe gì? VD: xe máy điện, xe đạp điện…"
        className="h-11 w-full rounded-full border-2 border-navy-700 bg-paper pr-14 pl-5 text-sm text-ink placeholder:text-ink-faint focus:border-navy-800 focus:ring-3 focus:ring-navy-700/15 focus:[outline:none]"
      />
      <button
        type="submit"
        className="absolute top-1 right-1 grid h-9 w-11 place-items-center rounded-full border-0 bg-navy-700 text-light hover:bg-navy-800"
        aria-label="Tìm kiếm"
      >
        <SiteIcon name="search" className="h-4.5 w-4.5" strokeWidth={2} />
      </button>
    </form>
  );
}
