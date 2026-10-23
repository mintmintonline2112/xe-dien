/**
 * Chụp HTML các trang public (đã làm phẳng: bỏ <script>, link /_next/static, id do useId sinh, mỗi thẻ một dòng) để `diff -r` trước / sau refactor.
 * Dùng bởi: `npm run snapshot -- <thư-mục>` khi site đang chạy; đổi bằng SNAP_BASE (mặc định http://localhost:3008), SNAP_PATHS.
 * Lưu ý: refactor không đổi giao diện thì hai thư mục phải giống nhau từng byte.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.SNAP_BASE ?? "http://localhost:3008";
const outDir = process.argv[2];
const pagePaths = (process.env.SNAP_PATHS ?? "/,/san-pham,/lien-he,/tin-tuc").split(",");

if (!outDir) {
  console.error("Thiếu thư mục đích: node scripts/snapshot-pages.mjs <out-dir>");
  process.exit(1);
}

function normalizeHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replace(/<link\b[^>]*_next\/static[^>]*>/g, "")
    .replace(/\/_next\/static\/[^"'\s)]+/g, "/_next/static/X")
    .replace(/\snonce="[^"]*"/g, "")
    .replace(/_R_[a-z0-9]+_/g, "_R_X_")
    .replace(/>\s*</g, ">\n<")
    .trim();
}

await mkdir(outDir, { recursive: true });
let failedCount = 0;
for (const pagePath of pagePaths) {
  const url = baseUrl + pagePath;
  const file = path.join(outDir, (pagePath === "/" ? "index" : pagePath.replace(/^\//, "").replace(/\//g, "__")) + ".html");
  try {
    const response = await fetch(url, { headers: { accept: "text/html" } });
    const html = await response.text();
    await writeFile(file, `<!-- ${url} ${response.status} -->\n` + normalizeHtml(html));
    console.log(`${response.status}  ${pagePath}  -> ${file}`);
    if (!response.ok) failedCount++;
  } catch (error) {
    failedCount++;
    console.error(`LỖI  ${pagePath}: ${error.message}`);
  }
}
process.exit(failedCount ? 1 : 0);
