/**
 * Lệnh `crawl`: đọc mọi trang danh sách của một danh mục nguồn, từng trang chi tiết, tải ảnh (ảnh sản phẩm + ảnh trong mô tả) rồi ghi
 * <run>/products.json theo định dạng chuẩn (README mục "Định dạng products.json").
 * Dùng bởi: bin/catalog-importer.mjs (lệnh crawl, import).
 * Lưu ý: ghi products.json sau MỖI sản phẩm nên dừng giữa chừng vẫn giữ phần đã cào; chạy lại cùng --out thì sản phẩm đã có bị bỏ qua.
 * Ảnh trong mô tả được đổi src thành "images/…" (đường dẫn trong lượt cào) để lệnh push upload và thay bằng URL thật.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { load } from "cheerio";
import { loadSiteProfile } from "../profiles/profile-loader.mjs";
import { downloadImage } from "./image-downloader.mjs";
import { fetchHtml } from "./polite-fetch.mjs";
import { parseListingPage, parseProductPage } from "./product-page-parser.mjs";
import { toSlug } from "./vietnamese-slug.mjs";

const DESCRIPTION_IMAGE_OFFSET = 100;

function readExistingRun(productsFile) {
  if (!existsSync(productsFile)) return null;
  return JSON.parse(readFileSync(productsFile, "utf8"));
}

function categorySlugOf(categoryUrl) {
  return new URL(categoryUrl).pathname.replace(/^\/|\/$/g, "").split("/").pop() ?? "";
}

async function collectProductUrls(categoryUrl, profile, options, log) {
  const origin = new URL(categoryUrl).origin;
  const categorySlug = categorySlugOf(categoryUrl);
  const first = parseListingPage(await fetchHtml(categoryUrl, 0), categoryUrl, profile, categorySlug);
  const lastPage = Math.min(first.lastPage, options.maxPages ?? Infinity);
  const productUrls = new Set(first.productUrls);
  log(`Trang danh sách 1/${lastPage} — ${productUrls.size} sản phẩm`);
  for (let page = 2; page <= lastPage && profile.listing.pageUrlPattern; page++) {
    const pageUrl = origin + profile.listing.pageUrlPattern.replace("{page}", page).replace("{category}", categorySlug);
    parseListingPage(await fetchHtml(pageUrl, options.delayMs), pageUrl, profile, categorySlug).productUrls.forEach((url) =>
      productUrls.add(url),
    );
    log(`Trang danh sách ${page}/${lastPage} — ${productUrls.size} sản phẩm`);
  }
  return [...productUrls].slice(0, options.limit ?? Infinity);
}

async function downloadProductImages(product, runDir, slug, options) {
  const images = [];
  for (const [index, url] of product.imageUrls.slice(0, options.maxImages).entries()) {
    const file = await downloadImage(url, runDir, slug, index, options.delayMs).catch(() => null);
    if (file) images.push({ url, file });
  }
  let descriptionHtml = product.descriptionHtml;
  if (descriptionHtml) {
    const $ = load(descriptionHtml, null, false);
    for (const [index, image] of $("img").toArray().entries()) {
      const file = await downloadImage($(image).attr("src"), runDir, slug, DESCRIPTION_IMAGE_OFFSET + index, options.delayMs).catch(
        () => null,
      );
      if (file) $(image).attr("src", file);
      else $(image).remove();
    }
    descriptionHtml = $.html().trim() || null;
  }
  return { images, descriptionHtml };
}

export async function crawlCatalog(options, log = console.log) {
  const profile = loadSiteProfile(options.profile);
  const runDir = resolve(options.out);
  mkdirSync(runDir, { recursive: true });
  const productsFile = join(runDir, "products.json");
  const run = readExistingRun(productsFile) ?? {
    source: options.url,
    profile: profile.name,
    crawledAt: new Date().toISOString(),
    products: [],
  };
  const doneUrls = new Set(run.products.map((product) => product.sourceUrl));
  const saveRun = () => writeFileSync(productsFile, JSON.stringify(run, null, 2));

  const productUrls = await collectProductUrls(options.url, profile, options, log);
  log(`\nCần đọc ${productUrls.length} sản phẩm (đã có ${doneUrls.size} trong lượt này)\n`);

  for (const [index, url] of productUrls.entries()) {
    const prefix = `[${index + 1}/${productUrls.length}]`;
    if (doneUrls.has(url)) {
      log(`${prefix} đã có    ${url}`);
      continue;
    }
    try {
      const parsed = parseProductPage(await fetchHtml(url, options.delayMs), url, profile);
      if (!parsed) {
        log(`${prefix} không đọc được ${url}`);
        continue;
      }
      const slug = toSlug(parsed.title);
      const { imageUrls, ...fields } = parsed;
      const media = options.withImages
        ? await downloadProductImages(parsed, runDir, slug, options)
        : { images: imageUrls.map((imageUrl) => ({ url: imageUrl, file: null })), descriptionHtml: parsed.descriptionHtml };
      run.products.push({ ...fields, slug, ...media });
      saveRun();
      const price = parsed.price ? `${parsed.price.toLocaleString("vi-VN")}đ` : "Liên hệ";
      log(`${prefix} ${parsed.title} — ${price}, ${media.images.length} ảnh, ${parsed.specs.length} thông số`);
    } catch (error) {
      log(`${prefix} lỗi ${url}: ${error.message}`);
    }
  }
  saveRun();
  log(`\nXong: ${run.products.length} sản phẩm → ${productsFile}`);
  return runDir;
}
