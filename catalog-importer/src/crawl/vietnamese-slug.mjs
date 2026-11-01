/**
 * Tạo slug URL từ chuỗi tiếng Việt có dấu ("Ô tô điện VF3" → "o-to-dien-vf3"), cùng quy tắc với slug.helper.ts của backend NestJS.
 * Dùng bởi: crawl/catalog-crawler.mjs (tên thư mục ảnh, slug sản phẩm), targets/nest-cms-target.mjs (so trùng, khớp danh mục con).
 */
export function toSlug(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
