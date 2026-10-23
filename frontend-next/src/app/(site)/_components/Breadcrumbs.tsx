/**
 * Thanh breadcrumb (Trang chủ › … › trang hiện tại) kèm dữ liệu cấu trúc BreadcrumbList (JSON-LD) cho Google.
 * Dùng bởi: trang san-pham, san-pham/[slug], danh-muc/[slug], tin-tuc/[slug], [slug] (trang CMS).
 * Lưu ý: mục cuối là trang hiện tại (không link). JSON-LD dùng URL tuyệt đối qua toAbsoluteUrl (khớp trailingSlash).
 */
import Link from "next/link";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { toAbsoluteUrl } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, light = false, className }: { items: Crumb[]; light?: boolean; className?: string }) {
  const trail: Crumb[] = [{ label: "Trang chủ", href: siteRoutes.home }, ...items];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: toAbsoluteUrl(crumb.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Đường dẫn trang" className={cn("py-3 text-xs", light ? "text-light-soft" : "text-ink-faint", className)}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className={light ? "text-light-soft hover:text-gold-300" : "text-ink-soft hover:text-navy-700"}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn("truncate font-medium", light ? "text-light" : "text-ink")} aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
              {!isLast ? <SiteIcon name="chevron-right" className={cn("h-3 w-3", light ? "text-light-soft" : "text-ink-faint")} /> : null}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </nav>
  );
}
