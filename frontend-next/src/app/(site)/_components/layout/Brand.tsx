/**
 * Logo + tên thương hiệu của site (biểu tượng ghim trạm sạc BrandPinMark mặc định, hoặc ảnh logo admin upload).
 * Dùng bởi: _components/layout/Header.tsx, _components/layout/Footer.tsx.
 * Lưu ý: Admin → Cài đặt → Logo có ảnh thì thay hẳn SVG + chữ mặc định; `isFooter` là bản trên nền tối.
 * Dòng phụ dưới tên (`tagline`) chỉ hiện ở bản SVG mặc định.
 */
import Link from "next/link";
import { BrandPinMark } from "@/components/BrandPinMark";
import { siteRoutes } from "@/config/routes";
import { DEFAULT_BRAND_NAME } from "@/settings/site-settings";
import { cn } from "@/utils/cn";

export type BrandProps = {
  isFooter?: boolean;
  logoUrl?: string | null;
  logoHeight?: number | null;
  brandName?: string | null;
  tagline?: string | null;
};

export function Brand({ isFooter = false, logoUrl, logoHeight, brandName, tagline }: BrandProps) {
  const displayName = brandName?.trim() || DEFAULT_BRAND_NAME;
  return (
    <Link
      href={siteRoutes.home}
      className="inline-flex shrink-0 items-center gap-2.5 text-navy-700"
      aria-label={`${displayName} — trang chủ`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="block h-11 w-auto max-w-[230px] object-contain max-[640px]:h-9"
          src={logoUrl}
          alt={displayName}
          style={logoHeight ? { height: logoHeight } : undefined}
        />
      ) : (
        <>
          <BrandPinMark isOnDark={isFooter} className="h-11 w-11 shrink-0 max-[640px]:h-9 max-[640px]:w-9" />
          <span className="flex flex-col gap-1.5 leading-tight">
            <span
              className={cn(
                "font-display text-xl font-extrabold tracking-tight max-[640px]:text-lg",
                isFooter ? "text-light" : "text-navy-700",
              )}
            >
              {displayName}
            </span>
            {tagline ? (
              <span
                className={cn(
                  "text-2xs leading-none font-medium tracking-sm uppercase max-[640px]:hidden",
                  isFooter ? "text-light-soft" : "text-ink-faint",
                )}
              >
                {tagline}
              </span>
            ) : null}
          </span>
        </>
      )}
    </Link>
  );
}
