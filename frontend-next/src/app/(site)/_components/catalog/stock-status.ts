/**
 * Nhãn hiển thị tình trạng kho của sản phẩm (Còn hàng / Đặt trước / Hết hàng).
 * Dùng bởi: catalog/ProductCard.tsx, san-pham/[slug]/page.tsx.
 */
import type { StockStatus } from "@/types/cms";

export const STOCK_LABELS: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  pre_order: "Đặt trước",
  out_of_stock: "Hết hàng",
};

export function stockLabelOf(status: StockStatus | null | undefined): string {
  return STOCK_LABELS[status ?? "in_stock"] ?? STOCK_LABELS.in_stock;
}
