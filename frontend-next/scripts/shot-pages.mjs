/**
 * Chụp PNG các trang public bằng Edge / Chrome headless để so pixel trước / sau refactor (đi kèm scripts/diff-png.mjs).
 * Dùng bởi: `npm run shot -- <thư-mục>`; đổi bằng SNAP_BASE, SNAP_PATHS, SNAP_WIDTHS, SNAP_HEIGHT, BROWSER_BIN.
 * Lưu ý: mỗi trang × bề ngang → một PNG cao 12000px; bật prefers-reduced-motion để hiệu ứng không làm ảnh khác nhau.
 * Thử Chrome trước Edge (Edge đang mở / policy hay thoát không ghi file); profile tạm ngoài thư mục ảnh, xóa "cố gắng" vì Chrome có thể giữ khóa.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const baseUrl = process.env.SNAP_BASE ?? "http://localhost:3006";
const outDir = process.argv[2];
const pagePaths = (process.env.SNAP_PATHS ?? "/,/san-pham,/lien-he,/tin-tuc").split(",");
const viewportWidths = (process.env.SNAP_WIDTHS ?? "1440,390").split(",").map(Number);
const HEIGHT = Number(process.env.SNAP_HEIGHT ?? 12000);

if (!outDir) {
  console.error("Thiếu thư mục đích: node scripts/shot-pages.mjs <out-dir>");
  process.exit(1);
}

const BROWSER_CANDIDATES = [
  process.env.BROWSER_BIN,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = BROWSER_CANDIDATES.find((candidate) => fs.existsSync(candidate));
if (!browser) {
  console.error("Không tìm thấy Edge/Chrome. Đặt BROWSER_BIN=<đường dẫn exe>.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "shot-profile-"));
let failedCount = 0;
for (const pagePath of pagePaths) {
  for (const width of viewportWidths) {
    const fileName = (pagePath === "/" ? "index" : pagePath.replace(/^\//, "").replace(/\/$/, "").replace(/\//g, "__")) + `@${width}.png`;
    const file = path.resolve(outDir, fileName);
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-prefers-reduced-motion",
      "--force-device-scale-factor=1",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=10000",
      `--window-size=${width},${HEIGHT}`,
      `--screenshot=${file}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      baseUrl + pagePath,
    ];
    const result = spawnSync(browser, args, { stdio: "ignore", timeout: 120000 });
    const isSaved = result.status === 0 && fs.existsSync(file);
    console.log(`${isSaved ? "ok " : "LỖI"}  ${pagePath} @${width}  -> ${path.relative(process.cwd(), file)}`);
    if (!isSaved) failedCount++;
  }
}
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 });
} catch {}
process.exit(failedCount ? 1 : 0);
