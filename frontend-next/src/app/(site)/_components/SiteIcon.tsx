/**
 * Bộ icon nét (viewBox 24) của cả site: loại xe theo danh mục, cam kết dịch vụ, liên hệ, giao diện (tìm kiếm, mũi tên, menu).
 * Dùng bởi: sections/_shared/icons.tsx (ICONS cho section CMS), layout (Header, Footer, ContactDock), catalog (CategoryIcon, ProductCard), trang sản phẩm.
 * Lưu ý: key là tên CMS nhập vào (`icon: 'truck'`, danh mục `icon: 'moped'`); thêm icon = thêm key ở đây và ghi tên vào ICON_HINT
 * của seed backend (section-definition.seed.ts) + danh sách icon danh mục trong admin. Tên lạ thì SiteIcon vẽ tia sét `bolt`.
 */
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export const SITE_ICON_PATHS: Record<string, ReactNode> = {
  bolt: <path d="M13 2 5 13.5h6L10 22l9-12.5h-6z" />,
  bike: (
    <>
      <circle cx="5.5" cy="16.5" r="3.5" />
      <circle cx="18.5" cy="16.5" r="3.5" />
      <path d="M5.5 16.5 9.2 9h5.6l3.7 7.5M9.2 9l3.4 7.5H5.5M12.6 16.5 15.6 6.5h2.6" />
      <rect x="9.6" y="10.6" width="3.6" height="2" rx="0.6" />
    </>
  ),
  moped: (
    <>
      <circle cx="6" cy="17" r="2.6" />
      <circle cx="18" cy="17" r="2.6" />
      <path d="M8.6 17h6.8l-1.9-7.4H16M13.5 9.6h-2.8M7.2 13.6h6.6M3.8 14.6c.6-2 2.2-3.1 4.4-3.1H11M15.2 6.4h2.2l.9 1.7" />
    </>
  ),
  "kick-scooter": (
    <>
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 18h9.6L17.8 5h-3M17.8 5h2.6M5.6 16.2l.6-1.6h10.6" />
    </>
  ),
  tricycle: (
    <>
      <circle cx="5" cy="17.5" r="2" />
      <circle cx="14.5" cy="17.5" r="2" />
      <circle cx="19.5" cy="17.5" r="2" />
      <path d="M7 17.5h5.5M5 15.5 7.5 9H10l1.5 5.5M11 8.5h10.5v6.5h-10" />
    </>
  ),
  car: (
    <>
      <path d="M3 15.5v-3l2.2-4.6A2 2 0 0 1 7 6.8h10a2 2 0 0 1 1.8 1.1l2.2 4.6v3a1 1 0 0 1-1 1h-1.2M5.2 16.5H4a1 1 0 0 1-1-1M8.8 16.5h6.4M3 12.5h18" />
      <circle cx="7" cy="16.5" r="1.8" />
      <circle cx="17" cy="16.5" r="1.8" />
    </>
  ),
  golf: (
    <>
      <path d="M4 5h14.5M6 5v8M16.5 5v8M3 13h17.5v3H3zM6 10h5l1 3" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </>
  ),
  bus: (
    <>
      <rect x="3.5" y="3.5" width="17" height="13.5" rx="2.5" />
      <path d="M3.5 11h17M9 3.5V11M15 3.5V11" />
      <circle cx="7.5" cy="18.8" r="1.4" />
      <circle cx="16.5" cy="18.8" r="1.4" />
    </>
  ),
  kid: (
    <>
      <path d="M4 15v-2.5l2-3.5h7l3 3.5h2.5a1.5 1.5 0 0 1 1.5 1.5v1" />
      <circle cx="7.5" cy="16" r="2" />
      <circle cx="16.5" cy="16" r="2" />
      <path d="m18 2.8.9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2.1-.3z" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
      <circle cx="6.5" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  forklift: (
    <>
      <path d="M3 16.5V8h5.5l2.2 4v4.5M3 12h7.7M9 8 8 4H4.2M14 3.5v13.5h7M14 14h6" />
      <circle cx="5" cy="17.5" r="1.8" />
      <circle cx="10" cy="17.5" r="1.8" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M21 10.5v3M11.5 9 9 12.5h3.5L10 16" />
    </>
  ),
  charger: (
    <>
      <rect x="4" y="3.5" width="10" height="17" rx="2" />
      <path d="M4 8h10M9.8 10.4 7.6 13.5h2.8l-2.2 3.1M14 11h2.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 0 3 0V8l-2-2" />
    </>
  ),
  tire: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5" />
    </>
  ),
  parts: (
    <path d="M14.6 5.4a4 4 0 0 0-5.3 5.1L4 15.8 6.2 18l5.3-5.3a4 4 0 0 0 5.1-5.3L14 10l-2-.5-.5-2z" />
  ),
  wrench: (
    <path d="M14.6 5.4a4 4 0 0 0-5.3 5.1L4 15.8 6.2 18l5.3-5.3a4 4 0 0 0 5.1-5.3L14 10l-2-.5-.5-2z" />
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8.2 7.5 9.5 4.4-1.3 7.5-5.1 7.5-9.5V6z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5M4 13a8 8 0 0 0 14.3 4.6L20 15.5" />
      <path d="M4 4v4.5h4.5M20 20v-4.5h-4.5" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4h-12A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
      <path d="M3 6.5A2.5 2.5 0 0 0 5.5 9h13A1.5 1.5 0 0 1 20 10.5V15h-4a2 2 0 0 1 0-4h4" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5 5 19" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12M12 8c-1-3-4.5-4-5.5-2.2C5.6 7.4 8 8 12 8zM12 8c1-3 4.5-4 5.5-2.2.9 1.6-1.5 2.2-5.5 2.2z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18M10.5 12.5v2h3v-2" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v10h16V10M3 6.5 5 3.5h14l2 3v1.2a2.8 2.8 0 0 1-5.4 1A2.8 2.8 0 0 1 12 9.5a2.8 2.8 0 0 1-3.6-.8A2.8 2.8 0 0 1 3 7.7z" />
      <path d="M9.5 20v-5h5v5" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13.5" width="4" height="6" rx="1.5" />
      <rect x="17" y="13.5" width="4" height="6" rx="1.5" />
      <path d="M19 19.5c0 1.4-1.6 2-4 2h-2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
    </>
  ),
  leaf: (
    <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19c3-4 6-6.5 9.5-8.5" />
  ),
  star: (
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  pin: (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  phone: (
    <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 7 8.5-7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21M14 10h4.5a1.5 1.5 0 0 1 1.5 1.5V21M2.5 21h19" />
      <path d="M7.5 8h3M7.5 12h3M7.5 16h3" />
    </>
  ),
  box: (
    <>
      <path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z" />
      <path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" />
    </>
  ),
  chat: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5z" />
  ),
  messenger: (
    <>
      <path d="M12 3c-5 0-9 3.7-9 8.4 0 2.6 1.2 4.9 3.2 6.4V21l3-1.6c.9.2 1.8.4 2.8.4 5 0 9-3.7 9-8.4S17 3 12 3z" />
      <path d="m7.5 13.5 3-3.2 2.2 2.2 3.8-2.6-3 3.2-2.2-2.2z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  "chevron-right": <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  "chevron-left": <path d="M14.5 5.5 8 12l6.5 6.5" />,
  "chevron-down": <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  "arrow-right": <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </>
  ),
};

export function hasSiteIcon(name: string | null | undefined): name is string {
  return !!name && name in SITE_ICON_PATHS;
}

export function SiteIcon({
  name,
  className,
  strokeWidth = 1.7,
}: {
  name: string | null | undefined;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={cn("h-5 w-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hasSiteIcon(name) ? SITE_ICON_PATHS[name] : SITE_ICON_PATHS.bolt}
    </svg>
  );
}
