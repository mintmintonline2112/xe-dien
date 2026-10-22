/**
 * cn(): ghép className có điều kiện (clsx) rồi giải xung đột utility Tailwind (tailwind-merge) — class đứng sau thắng.
 * Dùng bởi: hầu hết component của site, components/ui và admin.
 * Lưu ý: tailwind-merge phải biết các mốc tự đặt trong styles/tailwind.css (thêm / đổi mốc trong @theme thì sửa danh sách ở đây);
 * bỏ xung đột text-* với leading-* vì thang cỡ chữ của site không gắn line-height.
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  override: { conflictingClassGroups: { "font-size": [] } },
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "h4", "h5"],
      tracking: ["xs", "sm", "md", "lg", "xl", "2xl"],
      shadow: ["soft", "lift", "badge", "float", "glow", "glow-lg"],
      ease: ["brand"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
