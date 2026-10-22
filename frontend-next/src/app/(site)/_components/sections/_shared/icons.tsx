/**
 * Icon cho section CMS: ICONS (= bộ icon chung SiteIcon), iconFor chọn icon theo tên hoặc xoay vòng ICON_CYCLE, huy hiệu tròn IconBadge.
 * Dùng bởi: mọi section qua _shared/index.ts (feature-cards, icon-card-list, service-strip, promo-tiles, contact…).
 * Lưu ý: item CMS đặt `icon: '<tên>'`; danh sách tên nằm ở _components/SiteIcon.tsx (thêm icon ở đó, không thêm ở đây).
 */
import type { ReactNode } from "react";
import { SITE_ICON_PATHS } from "@/app/(site)/_components/SiteIcon";
import { cn } from "@/utils/cn";

export const ICONS: Record<string, ReactNode> = SITE_ICON_PATHS;

export const ICON_CYCLE = [
  "bolt",
  "shield",
  "truck",
  "wallet",
  "star",
  "headset",
] as const;

export function iconFor(name: string | undefined, index: number): ReactNode {
  return (name && ICONS[name]) ?? ICONS[ICON_CYCLE[index % ICON_CYCLE.length]];
}

export const BRAND_ICON = ICONS.bolt;

export function IconBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-navy-700 transition-transform duration-250 ease-brand motion-reduce:transition-none [&>svg]:h-6 [&>svg]:w-6",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}
