/**
 * Tải một ảnh về thư mục lượt cào: <run>/images/<slug>/<slug>-<n>.<đuôi>, trả đường dẫn tương đối "images/…" để ghi vào products.json.
 * Dùng bởi: crawl/catalog-crawler.mjs.
 * Lưu ý: file đã có thì không tải lại (cào tiếp một lượt dở an toàn). Bỏ qua phản hồi không phải ảnh. Ảnh giữ nguyên chất lượng gốc —
 * việc nén để CMS đích lo khi upload.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fetchWithRetry } from "./polite-fetch.mjs";

const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const EXT_BY_MIME = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

function extensionOf(url, contentType) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if (ALLOWED_EXTS.includes(fromUrl)) return fromUrl;
  return EXT_BY_MIME[contentType?.split(";")[0]] ?? ".jpg";
}

export async function downloadImage(imageUrl, runDir, productSlug, index, delayMs) {
  const folder = join("images", productSlug);
  const baseName = `${productSlug}-${index + 1}`;
  const existing = ALLOWED_EXTS.map((ext) => join(folder, `${baseName}${ext}`)).find((path) => existsSync(join(runDir, path)));
  if (existing) return existing.replace(/\\/g, "/");

  const response = await fetchWithRetry(imageUrl, delayMs);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) return null;
  const relativePath = join(folder, `${baseName}${extensionOf(imageUrl, contentType)}`);
  await mkdir(join(runDir, folder), { recursive: true });
  await writeFile(join(runDir, relativePath), Buffer.from(await response.arrayBuffer()));
  return relativePath.replace(/\\/g, "/");
}
