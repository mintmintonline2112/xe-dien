/**
 * Bản dự phòng của các trang chuẩn (home, contact) khi API CMS lỗi hoặc trang bị gỡ khỏi CMS.
 * Dùng bởi: app/(site)/page.tsx, lien-he/page.tsx.
 * Lưu ý: src/content/cms-fallback.json sinh từ seed backend (`cd backend && npm run content:export`);
 * không sửa tay file JSON, sửa page.seed.ts rồi chạy lại lệnh. Khối sản phẩm / danh mục / tin tức trong bản dự phòng
 * vẫn gọi API riêng nên khi API lỗi chúng tự ẩn.
 */
import fallbackJson from "@/content/cms-fallback.json";
import type { CmsPage } from "@/types/cms";

const FALLBACK_PAGES = fallbackJson as unknown as Record<string, CmsPage>;

export function getFallbackPage(slug: "home" | "contact"): CmsPage {
  return FALLBACK_PAGES[slug];
}
