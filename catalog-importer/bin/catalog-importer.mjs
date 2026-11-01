#!/usr/bin/env node
/**
 * CLI catalog-importer: `crawl` (cào danh mục nguồn → thư mục lượt cào), `push` (đẩy lượt cào vào CMS), `import` (cả hai), `help`.
 * Dùng bởi: `node bin/catalog-importer.mjs …` hoặc `npm run crawl|push|import -- …` trong thư mục catalog-importer.
 * Lưu ý: chỉ cào nội dung bạn sở hữu hoặc được phép sao chép. Đích CMS chọn bằng --target (mặc định nest-cms) qua bảng TARGETS.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readArg, readCrawlOptions, readPushOptions } from "../src/cli/cli-args.mjs";
import { crawlCatalog } from "../src/crawl/catalog-crawler.mjs";
import { pushProducts as pushToNestCms } from "../src/targets/nest-cms-target.mjs";

const TARGETS = { "nest-cms": pushToNestCms };

const HELP_TEXT = `catalog-importer — cào danh mục sản phẩm và đẩy vào CMS

  crawl  --url=<link danh mục> [--profile=gd3|<file.json>] [--out=<thư mục>] [--pages=N] [--limit=N]
         [--max-images=12] [--delay=1200] [--no-images]
  push   --run=<thư mục lượt cào> --category=<slug> --api=<http://host/api> [--target=nest-cms]
         [--sub="từ khoá=slug,…"] [--update] [--dry-run] [--status=published] [--folder=products] [--sku-prefix=NK-]
         [--media-base-url=<https://api.site.vn>]
         (đăng nhập: CATALOG_IMPORTER_EMAIL / CATALOG_IMPORTER_PASSWORD hoặc --email= --password=,
          hoặc access token sẵn ở CATALOG_IMPORTER_TOKEN)
  import mọi tham số của crawl + push (không cần --run)

Chi tiết: README.md`;

function readRun(runDir) {
  const productsFile = join(runDir, "products.json");
  if (!existsSync(productsFile)) throw new Error(`Không thấy ${productsFile} — chạy lệnh crawl trước`);
  return JSON.parse(readFileSync(productsFile, "utf8"));
}

async function push(runDir) {
  const options = readPushOptions(runDir);
  const pushProducts = TARGETS[options.target];
  if (!pushProducts) throw new Error(`Không có đích "${options.target}". Có: ${Object.keys(TARGETS).join(", ")}`);
  const hasCredentials = options.token || (options.email && options.password);
  if (!options.dryRun && !hasCredentials) throw new Error("Thiếu email / mật khẩu CMS");
  await pushProducts(readRun(runDir), options);
}

async function main() {
  const command = process.argv[2];
  if (command === "crawl") return void (await crawlCatalog(readCrawlOptions()));
  if (command === "push") return push(resolve(readArg("run") ?? ""));
  if (command === "import") return push(await crawlCatalog(readCrawlOptions()));
  console.log(HELP_TEXT);
}

main().catch((error) => {
  console.error(`Lỗi: ${error.message}`);
  process.exit(1);
});
