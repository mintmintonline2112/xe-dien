/**
 * Thanh phân trang bằng link (không cần JS): trước / sau, trang đầu cuối, các trang quanh trang hiện tại.
 * Dùng bởi: trang san-pham, danh-muc/[slug], tin-tuc.
 * Lưu ý: `hrefOf(page)` do trang truyền vào để giữ nguyên bộ lọc đang chọn trên URL.
 */
import Link from "next/link";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { cn } from "@/utils/cn";

const PAGE_LINK =
  "grid h-10 min-w-10 place-items-center rounded-md border border-line bg-paper px-3 text-sm font-semibold text-ink-soft transition-[border-color,color] duration-200 ease-brand hover:border-navy-700 hover:text-navy-700";

function visiblePagesOf(current: number, total: number): Array<number | "gap"> {
  const candidates = [1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total);
  const sorted = [...new Set(candidates)].sort((left, right) => left - right);
  const withGaps: Array<number | "gap"> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) withGaps.push("gap");
    withGaps.push(page);
  });
  return withGaps;
}

export function Pagination({
  page,
  totalPages,
  hrefOf,
}: {
  page: number;
  totalPages: number;
  hrefOf: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang">
      {page > 1 ? (
        <Link className={PAGE_LINK} href={hrefOf(page - 1)} aria-label="Trang trước">
          <SiteIcon name="chevron-left" className="h-4 w-4" />
        </Link>
      ) : null}
      {visiblePagesOf(page, totalPages).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-faint" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={entry}
            className={cn(PAGE_LINK, entry === page && "border-navy-700 bg-navy-700 text-light hover:text-light")}
            href={hrefOf(entry)}
            aria-current={entry === page ? "page" : undefined}
          >
            {entry}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link className={PAGE_LINK} href={hrefOf(page + 1)} aria-label="Trang sau">
          <SiteIcon name="chevron-right" className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}
