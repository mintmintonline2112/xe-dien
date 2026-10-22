/**
 * Lưới thẻ sản phẩm (2 cột mobile → 4 / 5 cột desktop) hoặc dải trượt ngang, hiện lần lượt khi cuộn tới.
 * Dùng bởi: section product-grid, trang san-pham, danh-muc/[slug], sản phẩm liên quan ở san-pham/[slug].
 * Lưu ý: `columns` = số cột tối đa ở desktop; `isRail` = cuộn ngang có snap (mobile vuốt), không cần JS.
 */
import type { Product } from "@/types/cms";
import { cn } from "@/utils/cn";
import { ProductCard } from "./ProductCard";

const GRID_COLUMNS = {
  3: "grid-cols-2 min-[900px]:grid-cols-3",
  4: "grid-cols-2 min-[760px]:grid-cols-3 min-[1100px]:grid-cols-4",
  5: "grid-cols-2 min-[760px]:grid-cols-3 min-[1000px]:grid-cols-4 min-[1200px]:grid-cols-5",
} as const;

export function ProductCardGrid({
  products,
  columns = 4,
  isRail = false,
  priorityCount = 0,
  className,
}: {
  products: Product[];
  columns?: keyof typeof GRID_COLUMNS;
  isRail?: boolean;
  priorityCount?: number;
  className?: string;
}) {
  if (products.length === 0) return null;
  return (
    <ul
      className={cn(
        "reveal reveal-group m-0 list-none p-0",
        isRail
          ? "-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin] max-[640px]:gap-3"
          : cn("grid gap-4 max-[640px]:gap-3", GRID_COLUMNS[columns]),
        className,
      )}
      data-stagger="60"
    >
      {products.map((product, index) => (
        <li key={product.id} className={cn(isRail && "w-[min(15.5rem,46vw)] shrink-0 snap-start")}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
