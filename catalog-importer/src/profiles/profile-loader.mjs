/**
 * Nạp hồ sơ bộ chọn của site nguồn: tên hồ sơ có sẵn trong thư mục profiles (VD "gd3") hoặc đường dẫn tới file JSON riêng.
 * Dùng bởi: crawl/catalog-crawler.mjs.
 * Lưu ý: hồ sơ thiếu listing.productLink hoặc product.title thì báo lỗi ngay; cấu trúc đầy đủ xem README mục "Hồ sơ site".
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BUILT_IN_DIR = dirname(fileURLToPath(import.meta.url));

export function loadSiteProfile(nameOrPath) {
  const builtInPath = join(BUILT_IN_DIR, `${nameOrPath}.json`);
  const profilePath = existsSync(builtInPath) ? builtInPath : resolve(nameOrPath);
  if (!existsSync(profilePath)) throw new Error(`Không thấy hồ sơ site "${nameOrPath}"`);
  const profile = JSON.parse(readFileSync(profilePath, "utf8"));
  if (!profile.listing?.productLink || !profile.product?.title) {
    throw new Error(`Hồ sơ ${profilePath} thiếu listing.productLink hoặc product.title`);
  }
  return profile;
}
