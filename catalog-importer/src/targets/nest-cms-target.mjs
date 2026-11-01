/**
 * Đích `nest-cms`: đẩy products.json của một lượt cào vào CMS NestJS qua API admin — upload ảnh lên Thư viện, thay ảnh trong mô tả
 * bằng URL thật, tạo (hoặc --update thì sửa) sản phẩm trong danh mục --category, xếp danh mục con theo quy tắc --sub.
 * Dùng bởi: bin/catalog-importer.mjs (lệnh push, import).
 * Lưu ý: sản phẩm coi là trùng khi cùng slug hoặc metadata.importedFrom; trùng thì bỏ qua nếu không có --update. --dry-run chỉ in kế
 * hoạch, không upload. Ảnh trong mô tả dùng link Thư viện trả về (theo host đã gọi API); --media-base-url thay host đó khi --api là
 * địa chỉ nội bộ (VD CMS tự chạy tool qua 127.0.0.1). Viết đích mới cho CMS khác: export hàm pushProducts(run, options, log) cùng chữ ký (README mục "Viết đích mới").
 */
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { load } from "cheerio";
import { toSlug } from "../crawl/vietnamese-slug.mjs";
import { createNestCmsClient } from "./nest-cms-client.mjs";

const EXCERPT_LENGTH = 220;
const PAGE_SIZE = 1000;

function parseSubcategoryRules(raw) {
  return String(raw ?? "")
    .split(",")
    .map((pair) => pair.split("="))
    .filter((parts) => parts.length === 2 && parts[0].trim() && parts[1].trim())
    .map(([keyword, categorySlug]) => ({ keyword: toSlug(keyword), categorySlug: categorySlug.trim() }));
}

function buildExcerpt(html) {
  if (!html) return null;
  const text = load(html).text().replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).replace(/\s\S*$/, "")}…` : text;
}

async function uploadRunFile(client, runDir, relativePath, folder, cache) {
  if (!relativePath) return null;
  if (cache.has(relativePath)) return cache.get(relativePath);
  const uploaded = await client.uploadToLibrary(readFileSync(join(runDir, relativePath)), basename(relativePath), folder);
  cache.set(relativePath, uploaded);
  return uploaded;
}

function buildContentImageUrl(uploaded, mediaBaseUrl) {
  return mediaBaseUrl ? `${mediaBaseUrl.replace(/\/$/, "")}/${uploaded.path}` : uploaded.url;
}

async function buildProductFields(client, runDir, product, categoryId, options, uploadCache) {
  const folder = options.folder;
  const imagePaths = [];
  for (const image of product.images) {
    const uploaded = await uploadRunFile(client, runDir, image.file, folder, uploadCache).catch(() => null);
    if (uploaded?.path) imagePaths.push(uploaded.path);
  }
  let content = product.descriptionHtml;
  if (content) {
    const $ = load(content, null, false);
    for (const image of $("img").toArray()) {
      const src = $(image).attr("src") ?? "";
      const uploaded = src.startsWith("images/") ? await uploadRunFile(client, runDir, src, folder, uploadCache).catch(() => null) : null;
      if (uploaded?.path) $(image).attr("src", buildContentImageUrl(uploaded, options.mediaBaseUrl));
      else if (src.startsWith("images/")) $(image).remove();
    }
    content = $.html().trim() || null;
  }
  return {
    title: product.title,
    slug: product.slug,
    status: options.status,
    categoryId,
    sku: product.code ? `${options.skuPrefix}${product.code}` : undefined,
    brand: product.brand ?? undefined,
    price: product.price,
    originalPrice: product.originalPrice,
    stockStatus: product.isOutOfStock ? "out_of_stock" : "in_stock",
    excerpt: buildExcerpt(content) ?? undefined,
    content: content ?? undefined,
    thumbnailPath: imagePaths[0] ?? null,
    gallery: imagePaths.length > 1 ? imagePaths : null,
    specs: product.specs?.length ? product.specs : null,
    publishedAt: new Date().toISOString(),
    metadata: { importedFrom: product.sourceUrl, importedAt: new Date().toISOString() },
  };
}

async function findExistingProduct(client, product) {
  const result = await client.get(`admin/products?search=${encodeURIComponent(product.title)}&limit=50`);
  return (result?.data ?? []).find(
    (existing) => existing.slug === product.slug || existing.metadata?.importedFrom === product.sourceUrl,
  );
}

export async function pushProducts(run, options, log = console.log) {
  const rules = parseSubcategoryRules(options.sub);
  if (options.dryRun) {
    for (const product of run.products) {
      const rule = rules.find((candidate) => product.slug.includes(candidate.keyword));
      log(`[chạy thử] ${product.title} → ${rule?.categorySlug ?? options.category} (${product.images.length} ảnh)`);
    }
    return;
  }

  const client = createNestCmsClient({
    apiUrl: options.api,
    email: options.email,
    password: options.password,
    token: options.token,
  });
  await client.login();
  const categories = (await client.get(`admin/product-categories?limit=${PAGE_SIZE}`))?.data ?? [];
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const defaultCategoryId = categoryIdBySlug.get(options.category);
  if (!defaultCategoryId) throw new Error(`CMS không có danh mục slug "${options.category}"`);

  const counts = { created: 0, updated: 0, skipped: 0, failed: 0 };
  const uploadCache = new Map();
  for (const [index, product] of run.products.entries()) {
    const prefix = `[${index + 1}/${run.products.length}]`;
    try {
      const existing = await findExistingProduct(client, product);
      if (existing && !options.update) {
        counts.skipped++;
        log(`${prefix} bỏ qua (đã có) ${product.title}`);
        continue;
      }
      const rule = rules.find((candidate) => product.slug.includes(candidate.keyword));
      const categoryId = (rule && categoryIdBySlug.get(rule.categorySlug)) || defaultCategoryId;
      const fields = await buildProductFields(client, options.runDir, product, categoryId, options, uploadCache);
      if (existing) await client.put(`admin/products/${existing.id}`, fields);
      else await client.post("admin/products", fields);
      counts[existing ? "updated" : "created"]++;
      log(`${prefix} ${existing ? "cập nhật" : "tạo mới"} ${product.title}`);
    } catch (error) {
      counts.failed++;
      log(`${prefix} lỗi ${product.title}: ${error.message}`);
    }
  }
  log(`\nTạo ${counts.created} · cập nhật ${counts.updated} · bỏ qua ${counts.skipped} · lỗi ${counts.failed}`);
}
