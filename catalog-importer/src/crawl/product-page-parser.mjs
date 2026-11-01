/**
 * Đọc HTML theo hồ sơ site: link sản phẩm + số trang cuối của trang danh sách; tên, mã, hãng, giá, tình trạng, link ảnh, thông số,
 * mô tả của trang chi tiết.
 * Dùng bởi: crawl/catalog-crawler.mjs.
 * Lưu ý: thông số ưu tiên bảng (product.specTableRows); không có bảng thì tách dòng "- Nhãn: giá trị" trong product.specBox, dòng không
 * tách được đưa lên đầu mô tả. Link trỏ về chính site nguồn trong mô tả bị gỡ (giữ chữ).
 */
import { load } from "cheerio";

const SPEC_LINE_PATTERN = /^[-–•*\s]*([^:]{2,60}):\s*(.+)$/;
const STRIPPED_TAGS = "script, style, iframe, form, button, noscript";

const cleanText = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

export function parsePrice(text) {
  const digits = String(text ?? "").replace(/[^\d]/g, "");
  const amount = digits ? Number(digits) : NaN;
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function toAbsoluteUrl(href, baseUrl) {
  if (!href?.trim()) return null;
  try {
    return new URL(href.trim(), baseUrl).toString();
  } catch {
    return null;
  }
}

export function parseListingPage(html, pageUrl, profile, categorySlug) {
  const $ = load(html);
  const productUrls = $(profile.listing.productLink)
    .map((_, link) => toAbsoluteUrl($(link).attr("href"), pageUrl))
    .get()
    .filter(Boolean);
  let lastPage = 1;
  if (profile.listing.pageNumberPattern) {
    const pattern = new RegExp(profile.listing.pageNumberPattern.replace("{category}", categorySlug));
    $("a[href]").each((_, link) => {
      const match = ($(link).attr("href") ?? "").match(pattern);
      if (match) lastPage = Math.max(lastPage, Number(match[1]));
    });
  }
  return { productUrls, lastPage };
}

function readTableSpecs($, selectors) {
  if (!selectors.specTableRows) return [];
  const specs = [];
  $(selectors.specTableRows).each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const label = cleanText($(cells[0]).text()).replace(/:\s*$/, "");
    const value = cleanText($(cells[1]).text());
    if (label && value) specs.push({ label, value });
  });
  return specs;
}

function readLineSpecs($, selectors) {
  const specs = [];
  const leftover = [];
  if (!selectors.specBox) return { specs, leftoverHtml: "" };
  $(selectors.specBox)
    .find("p, li")
    .each((_, line) => {
      if ($(line).find("p, li").length) return;
      const text = cleanText($(line).text());
      if (!text) return;
      const match = text.match(SPEC_LINE_PATTERN);
      if (match) specs.push({ label: match[1].trim(), value: match[2].trim() });
      else leftover.push(`<p>${$(line).html() ?? ""}</p>`);
    });
  return { specs, leftoverHtml: leftover.join("") };
}

function readDescriptionHtml($, selectors, pageUrl) {
  if (!selectors.description) return "";
  const box = $(selectors.description).first();
  if (!box.length) return "";
  box.find(STRIPPED_TAGS).remove();
  const sourceHost = new URL(pageUrl).host;
  box.find("a[href]").each((_, link) => {
    const href = $(link).attr("href") ?? "";
    if (href.startsWith("/") || href.includes(sourceHost)) $(link).replaceWith($(link).html() ?? "");
  });
  box.find("img").each((_, image) => {
    const src = toAbsoluteUrl($(image).attr("data-src") ?? $(image).attr("src"), pageUrl);
    if (src) $(image).attr("src", src).removeAttr("data-src").removeAttr("srcset");
    else $(image).remove();
  });
  const hasContent = cleanText(box.text()) || box.find("img").length;
  return hasContent ? (box.html() ?? "").trim() : "";
}

function readImageUrls($, selectors, pageUrl) {
  const urls = (selectors.images ?? []).flatMap(({ selector, attr }) =>
    $(selector)
      .map((_, element) => toAbsoluteUrl($(element).attr(attr ?? "src"), pageUrl))
      .get(),
  );
  return [...new Set(urls.filter(Boolean))];
}

export function parseProductPage(html, pageUrl, profile) {
  const selectors = profile.product;
  const $ = load(html);
  const title = cleanText($(selectors.title).first().text());
  if (!title) return null;

  const priceBox = selectors.priceBox ? $(selectors.priceBox).first() : $.root();
  const price = parsePrice(priceBox.find(selectors.price).first().text());
  const originalPrice = selectors.originalPrice ? parsePrice(priceBox.find(selectors.originalPrice).first().text()) : null;
  const outOfStockPattern = new RegExp(selectors.outOfStockPattern ?? "hết hàng|out of stock", "i");

  const tableSpecs = readTableSpecs($, selectors);
  const lineSpecs = tableSpecs.length ? { specs: [], leftoverHtml: "" } : readLineSpecs($, selectors);
  const descriptionHtml = lineSpecs.leftoverHtml + readDescriptionHtml($, selectors, pageUrl);

  return {
    sourceUrl: pageUrl,
    title,
    code: selectors.code ? cleanText($(selectors.code).first().text()) || null : null,
    brand: selectors.brand ? cleanText($(selectors.brand).first().text()) || null : null,
    price,
    originalPrice: originalPrice && price && originalPrice > price ? originalPrice : null,
    isOutOfStock: selectors.stock ? outOfStockPattern.test($(selectors.stock).first().text()) : false,
    imageUrls: readImageUrls($, selectors, pageUrl),
    specs: tableSpecs.length ? tableSpecs : lineSpecs.specs,
    descriptionHtml: descriptionHtml || null,
  };
}
