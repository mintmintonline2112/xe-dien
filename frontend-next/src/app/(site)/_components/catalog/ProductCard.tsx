/**
 * Thẻ sản phẩm: ảnh vuông (nhãn % giảm + nhãn admin), thương hiệu, tên 2 dòng, giá, dòng trả góp + tình trạng kho.
 * Dùng bởi: catalog/ProductCardGrid.tsx (section product-grid, trang san-pham, danh-muc, sản phẩm liên quan).
 * Lưu ý: thẻ nằm trong <li> của lưới reveal-group nên được đặt transition / hover ngay trên <article>.
 */
import Link from "next/link";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { toImageUrl } from "@/app/(site)/_lib/cms";
import { siteRoutes } from "@/config/routes";
import type { Product } from "@/types/cms";
import { cn } from "@/utils/cn";
import { PriceTag } from "./PriceTag";
import { discountPercentOf } from "./price-format";
import { stockLabelOf } from "./stock-status";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = siteRoutes.product(product.slug);
  const image = toImageUrl(product.thumbnailPath ?? product.gallery?.[0]);
  const discount = discountPercentOf(product.price, product.originalPrice);
  const isAvailable = product.stockStatus !== "out_of_stock";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper transition-[border-color,box-shadow] duration-250 ease-brand hover:border-navy-600 hover:shadow-lift">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden bg-cream"
        tabIndex={-1}
        aria-hidden="true"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-navy-100">
            <SiteIcon name="bolt" className="h-16 w-16" />
          </span>
        )}
        {discount ? (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-sale px-2.5 py-0.5 text-xs font-bold text-light shadow-badge">
            -{discount}%
          </span>
        ) : null}
        {product.badge ? (
          <span className="absolute top-2.5 right-2.5 max-w-[60%] truncate rounded-md bg-gold-400 px-2 py-0.5 text-2xs font-bold tracking-xs text-ink uppercase shadow-badge">
            {product.badge}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 max-[640px]:p-3">
        {product.brand ? (
          <p className="m-0 text-2xs font-semibold tracking-sm text-ink-faint uppercase">{product.brand}</p>
        ) : null}
        <h3 className="m-0 line-clamp-2 min-h-[2.5em] font-main text-sm leading-snug font-semibold text-ink">
          <Link href={href} className="text-inherit hover:text-navy-700">
            {product.title}
          </Link>
        </h3>
        <PriceTag price={product.price} originalPrice={product.originalPrice} />
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-t-line-soft pt-2.5 text-2xs">
          <span className="inline-flex items-center gap-1 font-semibold text-navy-700">
            <SiteIcon name="card" className="h-3.5 w-3.5" />
            Trả góp 0%
          </span>
          <span className={cn("font-medium", isAvailable ? "text-ink-faint" : "text-danger")}>
            {stockLabelOf(product.stockStatus)}
          </span>
        </div>
      </div>
    </article>
  );
}
