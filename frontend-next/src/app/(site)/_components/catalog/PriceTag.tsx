/**
 * Giá sản phẩm: giá bán màu đỏ khuyến mãi, giá gốc gạch ngang khi có giảm, "Liên hệ" khi chưa có giá.
 * Dùng bởi: catalog/ProductCard.tsx, san-pham/[slug]/page.tsx.
 */
import { cn } from "@/utils/cn";
import { CONTACT_PRICE_LABEL, formatVnd, hasDiscount } from "./price-format";

export function PriceTag({
  price,
  originalPrice,
  size = "sm",
  className,
}: {
  price: number | null;
  originalPrice: number | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const isLarge = size === "lg";
  return (
    <p className={cn("m-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <strong
        className={cn(
          "font-display leading-none font-extrabold text-sale",
          isLarge ? "text-h2" : "text-base",
        )}
      >
        {price != null ? formatVnd(price) : CONTACT_PRICE_LABEL}
      </strong>
      {hasDiscount(price, originalPrice) ? (
        <del className={cn("leading-none text-ink-faint", isLarge ? "text-lg" : "text-xs")}>
          {formatVnd(originalPrice)}
        </del>
      ) : null}
    </p>
  );
}
