/**
 * Đọc tham số dòng lệnh dạng `--ten=giatri` và cờ `--ten`, dựng tuỳ chọn cho lệnh crawl / push (kèm mặc định, biến môi trường).
 * Dùng bởi: bin/catalog-importer.mjs.
 * Lưu ý: email / mật khẩu CMS ưu tiên biến môi trường CATALOG_IMPORTER_EMAIL / CATALOG_IMPORTER_PASSWORD để không lộ trong lịch sử lệnh;
 * access token chỉ nhận qua biến môi trường CATALOG_IMPORTER_TOKEN (CMS đặt khi tự chạy tool).
 */
import { join } from "node:path";

const DEFAULT_DELAY_MS = 1200;
const DEFAULT_MAX_IMAGES = 12;

export function readArg(name) {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

export const hasFlag = (name) => process.argv.includes(`--${name}`);

function readPositiveNumber(name) {
  const value = Number(readArg(name));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function requireArg(name, example) {
  const value = readArg(name);
  if (!value) throw new Error(`Thiếu --${name}. Ví dụ: ${example}`);
  return value;
}

function defaultRunDir(url) {
  const slug = new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "catalog";
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  return join("catalog-runs", `${slug}-${stamp}`);
}

export function readCrawlOptions() {
  const url = requireArg("url", "--url=https://site-nguon.vn/o-to-dien/");
  return {
    url,
    profile: readArg("profile") ?? "gd3",
    out: readArg("out") ?? defaultRunDir(url),
    maxPages: readPositiveNumber("pages"),
    limit: readPositiveNumber("limit"),
    maxImages: readPositiveNumber("max-images") ?? DEFAULT_MAX_IMAGES,
    delayMs: readPositiveNumber("delay") ?? DEFAULT_DELAY_MS,
    withImages: !hasFlag("no-images"),
  };
}

export function readPushOptions(runDir) {
  const isDryRun = hasFlag("dry-run");
  return {
    runDir,
    target: readArg("target") ?? "nest-cms",
    api: isDryRun ? readArg("api") : requireArg("api", "--api=http://localhost:3018/api"),
    email: process.env.CATALOG_IMPORTER_EMAIL ?? readArg("email"),
    password: process.env.CATALOG_IMPORTER_PASSWORD ?? readArg("password"),
    token: process.env.CATALOG_IMPORTER_TOKEN,
    category: requireArg("category", "--category=o-to-dien"),
    sub: readArg("sub"),
    update: hasFlag("update"),
    dryRun: isDryRun,
    status: readArg("status") ?? "published",
    folder: readArg("folder") ?? "products",
    skuPrefix: readArg("sku-prefix") ?? "NK-",
    mediaBaseUrl: readArg("media-base-url"),
  };
}
