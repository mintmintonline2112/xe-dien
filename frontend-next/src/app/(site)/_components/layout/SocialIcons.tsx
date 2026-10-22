/**
 * Hàng icon mạng xã hội lấy từ Admin → Cài đặt → Mạng xã hội.
 * Dùng bởi: _components/layout/Header.tsx (thanh trên), Footer.tsx.
 * Lưu ý: link nào trống thì ẩn icon đó; không có link nào thì không render gì.
 */
import type { ReactNode } from "react";
import type { SocialKey, SocialLinks } from "@/settings/site-settings";

const SOCIAL_ICONS: Record<SocialKey, { label: string; path: ReactNode }> = {
  zalo: {
    label: "Zalo",
    path: (
      <>
        <path d="M12 3C6.5 3 2.5 6.6 2.5 11.1c0 2.5 1.2 4.7 3.2 6.2L5 21l3.9-2c1 .3 2 .4 3.1.4 5.5 0 9.5-3.6 9.5-8.1S17.5 3 12 3Z" />
        <path d="M8.6 8.6h5.6l-5.4 6.2h5.6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  facebook: {
    label: "Facebook",
    path: (
      <path d="M14 8.5h2.2V5.6h-2.6c-2.3 0-3.6 1.4-3.6 3.7v1.6H7.8v2.9H10V21h3v-7.2h2.3l.4-2.9H13V9.6c0-.8.3-1.1 1-1.1Z" />
    ),
  },
  youtube: {
    label: "YouTube",
    path: (
      <>
        <path d="M21.2 8.6a2.6 2.6 0 0 0-1.8-1.8C17.8 6.4 12 6.4 12 6.4s-5.8 0-7.4.4A2.6 2.6 0 0 0 2.8 8.6C2.4 10.2 2.4 12 2.4 12s0 1.8.4 3.4a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.4.4 7.4.4s5.8 0 7.4-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-3.4.4-3.4s0-1.8-.4-3.4Z" />
        <path d="M10.2 14.9 15 12l-4.8-2.9v5.8Z" fill="#fff" />
      </>
    ),
  },
  instagram: {
    label: "Instagram",
    path: (
      <>
        <rect
          x="3.4"
          y="3.4"
          width="17.2"
          height="17.2"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="17.1" cy="6.9" r="1.2" />
      </>
    ),
  },
  tiktok: {
    label: "TikTok",
    path: (
      <path d="M14.4 3h2.7c.2 1.7 1.2 3.1 2.9 3.4v2.7a6.4 6.4 0 0 1-3.4-1.1v5.9a5.4 5.4 0 1 1-4.6-5.3v2.8a2.6 2.6 0 1 0 1.8 2.5V3Z" />
    ),
  },
};

const SOCIAL_ORDER: SocialKey[] = ["facebook", "zalo", "youtube", "tiktok", "instagram"];

export function SocialIcons({
  links,
  className,
  linkClassName,
  label = "Mạng xã hội",
}: {
  links?: SocialLinks | null;
  className?: string;
  linkClassName?: string;
  label?: string;
}) {
  const visibleKeys = SOCIAL_ORDER.filter((key) => links?.[key]?.trim());
  if (visibleKeys.length === 0) return null;

  return (
    <div className={className} aria-label={label} role="group">
      {visibleKeys.map((key) => (
        <a
          key={key}
          href={links![key]!}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClassName}
          aria-label={SOCIAL_ICONS[key].label}
          title={SOCIAL_ICONS[key].label}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {SOCIAL_ICONS[key].path}
          </svg>
        </a>
      ))}
    </div>
  );
}
