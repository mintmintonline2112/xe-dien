/**
 * Định dạng giá VNĐ và tính phần trăm giảm cho thẻ sản phẩm / trang chi tiết.
 * Dùng bởi: catalog/PriceTag.tsx, catalog/ProductCard.tsx, san-pham/[slug]/page.tsx.
 * Lưu ý: giá null = "Liên hệ"; giá gốc chỉ tính là giảm khi lớn hơn giá bán.
 */
const VND_FORMATTER = new Intl.NumberFormat("vi-VN");

export const CONTACT_PRICE_LABEL = "Liên hệ";

export function formatVnd(amount: number): string {
  return `${VND_FORMATTER.format(amount)}₫`;
}

export function hasDiscount(price: number | null, originalPrice: number | null): originalPrice is number {
  return price != null && originalPrice != null && originalPrice > price;
}

export function discountPercentOf(price: number | null, originalPrice: number | null): number | null {
  if (!hasDiscount(price, originalPrice)) return null;
  return Math.round(((originalPrice - price!) / originalPrice) * 100);
}

export function monthlyInstallmentOf(price: number | null, months = 12): number | null {
  if (price == null || price <= 0) return null;
  return Math.ceil(price / months / 1000) * 1000;
}
