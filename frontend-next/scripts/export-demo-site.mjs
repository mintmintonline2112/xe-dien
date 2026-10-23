/**
 * Xuất toàn bộ site public đang chạy thành thư mục HTML / CSS / JS tĩnh để đưa lên GitHub Pages làm bản demo cho khách.
 * Dùng bởi: `npm run export:demo -- <thư-mục>` khi site dev (cổng 3006) + backend đang chạy; đổi nguồn bằng DEMO_BASE.
 * Lưu ý: đi hết link nội bộ từ trang chủ (kể cả ?page / ?sort / ?category), mỗi URL thành một file .html, link đổi sang đường dẫn
 * tương đối nên chạy được cả ở thư mục con GitHub Pages lẫn mở thẳng bằng file://. JS của Next bị bỏ; phần tương tác cần cho demo
 * (menu mobile, slider, gallery, tìm kiếm, form) nằm ở demo-site-runtime.js. Mỗi lần chạy xoá sạch thư mục đích trừ `.git`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteUrl = (process.env.DEMO_BASE ?? "http://localhost:3006").replace(
  /\/$/,
  "",
);
const outDir = process.argv[2];
const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptsDir, "..", "public");
const SEARCH_PAGE_FILE = "san-pham/tim-kiem/index.html";
const CREDITS_PAGE_FILE = "ghi-cong-anh/index.html";
const SKIPPED_PREFIXES = ["/_next", "/admin", "/api", "/images", "/favicon"];

if (!outDir) {
  console.error("Thiếu thư mục đích: npm run export:demo -- <thư-mục>");
  process.exit(1);
}

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttribute = (value) => escapeHtml(value).replace(/"/g, "&quot;");

function parseInternalUrl(rawHref) {
  const href = decodeEntities(rawHref);
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  if (SKIPPED_PREFIXES.some((prefix) => href.startsWith(prefix))) return null;
  const url = new URL(href, siteUrl);
  if (url.searchParams.has("q")) return null;
  const pathname = url.pathname.endsWith("/")
    ? url.pathname
    : `${url.pathname}/`;
  const params = [...url.searchParams.entries()]
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return { pathname, params, hash: url.hash };
}

const pageKeyOf = ({ pathname, params }) =>
  params.length
    ? `${pathname}?${params.map(([key, value]) => `${key}=${value}`).join("&")}`
    : pathname;

function pageFileOf({ pathname, params }) {
  const folder = pathname.replace(/^\/|\/$/g, "");
  const suffix = params
    .map(([key, value]) => `--${key}-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`)
    .join("");
  const fileName = suffix ? `index${suffix}.html` : "index.html";
  return folder ? `${folder}/${fileName}` : fileName;
}

const relativeHref = (fromFile, toFile) => {
  const relative = path.posix.relative(path.posix.dirname(fromFile), toFile);
  return relative || path.posix.basename(toFile);
};

const rootPrefixOf = (fromFile) => {
  const depth = fromFile.split("/").length - 1;
  return depth === 0 ? "./" : "../".repeat(depth);
};

async function fetchText(pathWithQuery, attemptsLeft = 3) {
  try {
    const response = await fetch(`${siteUrl}${pathWithQuery}`, {
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`${response.status} ${pathWithQuery}`);
    return await response.text();
  } catch (error) {
    if (attemptsLeft <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return fetchText(pathWithQuery, attemptsLeft - 1);
  }
}

async function crawlSite() {
  const pages = new Map();
  const queue = [parseInternalUrl("/")];
  const queued = new Set([pageKeyOf(queue[0])]);
  while (queue.length) {
    const target = queue.shift();
    const key = pageKeyOf(target);
    const html = await fetchText(key);
    pages.set(key, { target, html, file: pageFileOf(target) });
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const linked = parseInternalUrl(match[1]);
      if (!linked) continue;
      const linkedKey = pageKeyOf(linked);
      if (queued.has(linkedKey)) continue;
      queued.add(linkedKey);
      queue.push(linked);
    }
    if (pages.size % 20 === 0) {
      console.log(`  đã tải ${pages.size} trang, còn ${queue.length}`);
    }
  }
  return pages;
}

const copiedAssets = new Set();

function copyPublicAsset(publicPath) {
  const cleanPath = decodeURIComponent(publicPath.split("?")[0]);
  const source = path.join(publicDir, cleanPath);
  if (!fs.existsSync(source)) return null;
  const relativePath = cleanPath.replace(/^\//, "");
  if (!copiedAssets.has(relativePath)) {
    const destination = path.join(outDir, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copiedAssets.add(relativePath);
  }
  return relativePath;
}

function toPublicAssetPath(rawUrl) {
  const url = decodeEntities(rawUrl.trim().replace(/^['"]|['"]$/g, ""));
  if (url.startsWith("/_next/image")) {
    const imageUrl = new URL(url, siteUrl).searchParams.get("url");
    return imageUrl && imageUrl.startsWith("/") ? imageUrl : null;
  }
  if (url.startsWith("/images/") || url === "/favicon.svg") return url;
  return null;
}

const stylesheetFiles = new Map();

async function exportStylesheet(href) {
  if (stylesheetFiles.has(href)) return stylesheetFiles.get(href);
  const fileName = `assets/css/${path.posix.basename(href.split("?")[0]).replace(/[^a-zA-Z0-9_.-]/g, "-")}`;
  stylesheetFiles.set(href, fileName);
  let css = (await fetchText(href)).replace(
    /\/\*# sourceMappingURL=[^*]*\*\//g,
    "",
  );
  const fontUrls = [
    ...new Set(
      [...css.matchAll(/url\((\/_next\/static\/media\/[^)]+)\)/g)].map(
        (match) => match[1],
      ),
    ),
  ];
  for (const fontUrl of fontUrls) {
    const response = await fetch(`${siteUrl}${fontUrl}`);
    const fontFile = `assets/media/${path.posix.basename(fontUrl)}`;
    fs.mkdirSync(path.join(outDir, "assets/media"), { recursive: true });
    fs.writeFileSync(
      path.join(outDir, fontFile),
      Buffer.from(await response.arrayBuffer()),
    );
    css = css.split(fontUrl).join(relativeHref(fileName, fontFile));
  }
  css = css.replace(/url\(([^)]+)\)/g, (whole, rawUrl) => {
    const publicPath = toPublicAssetPath(rawUrl);
    const copied = publicPath && copyPublicAsset(publicPath);
    return copied ? `url(${relativeHref(fileName, copied)})` : whole;
  });
  fs.mkdirSync(path.join(outDir, "assets/css"), { recursive: true });
  fs.writeFileSync(path.join(outDir, fileName), css);
  return fileName;
}

function rewriteInlineUrls(text, pageFile) {
  return text.replace(/url\(([^)]+)\)/g, (whole, rawUrl) => {
    const publicPath = toPublicAssetPath(rawUrl);
    const copied = publicPath && copyPublicAsset(publicPath);
    return copied ? `url(${relativeHref(pageFile, copied)})` : whole;
  });
}

async function transformPage(html, pageFile, pageFilesByKey) {
  let output = html;
  output = output.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<script\b[^>]*\/>/gi, "");
  output = output.replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");
  output = output.replace(
    /<link[^>]*rel="(?:preload|modulepreload)"[^>]*\/?>/gi,
    "",
  );
  output = output.replace(/<link rel="canonical"[^>]*\/?>/gi, "");
  output = output.replace(
    /<meta (?:property|name)="(?:og|twitter):[^"]*"[^>]*\/?>/gi,
    "",
  );
  output = output.replace(/<meta name="next-size-adjust"[^>]*\/?>/gi, "");
  output = output.replace(
    /<meta name="robots"[^>]*\/?>/gi,
    '<meta name="robots" content="noindex, nofollow"/>',
  );
  output = output.replace(/\s(?:srcSet|srcset|sizes)="[^"]*"/g, "");

  const stylesheetLinks = [
    ...output.matchAll(
      /<link rel="stylesheet" href="(\/_next\/[^"]+)"[^>]*\/?>/gi,
    ),
  ];
  for (const [whole, href] of stylesheetLinks) {
    const cssFile = await exportStylesheet(href);
    output = output.replace(
      whole,
      `<link rel="stylesheet" href="${relativeHref(pageFile, cssFile)}"/>`,
    );
  }

  output = output.replace(
    /(\s(?:src|href)=")([^"]+)(")/g,
    (whole, start, value, end) => {
      const publicPath = toPublicAssetPath(value);
      if (publicPath) {
        const copied = copyPublicAsset(publicPath);
        return copied
          ? `${start}${relativeHref(pageFile, copied)}${end}`
          : whole;
      }
      if (decodeEntities(value) === "/images/CREDITS.md")
        return `${start}${relativeHref(pageFile, CREDITS_PAGE_FILE)}${end}`;
      const linked = parseInternalUrl(value);
      if (!linked) return whole;
      const targetFile = pageFilesByKey.get(pageKeyOf(linked));
      if (!targetFile) return whole;
      return `${start}${relativeHref(pageFile, targetFile)}${linked.hash}${end}`;
    },
  );

  output = output.replace(/style="([^"]*url\([^"]*)"/g, (whole, style) => {
    const rewritten = rewriteInlineUrls(decodeEntities(style), pageFile);
    return `style="${rewritten.replace(/"/g, "&quot;")}"`;
  });

  output = output.replace(
    /<form([^>]*?)action="\/san-pham\/?"/g,
    (whole, attributes) =>
      `<form${attributes}action="${relativeHref(pageFile, SEARCH_PAGE_FILE)}"`,
  );

  const rootPrefix = rootPrefixOf(pageFile);
  output = output.replace("<html", `<html data-demo-root="${rootPrefix}"`);
  output = output.replace(
    "</body>",
    `<script src="${relativeHref(pageFile, "assets/js/search-index.js")}" defer></script>` +
      `<script src="${relativeHref(pageFile, "assets/js/demo.js")}" defer></script></body>`,
  );
  return output;
}

const PRODUCT_CARD_PATTERN =
  /<article class="group relative flex h-full flex-col[^"]*">[\s\S]*?<\/article>/g;
const removeDiacritics = (value) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

function buildSearchIndex(pages) {
  const productsBySlug = new Map();
  for (const { html } of pages.values()) {
    for (const [cardHtml] of html.matchAll(PRODUCT_CARD_PATTERN)) {
      const slug = cardHtml.match(/href="\/san-pham\/([^/"?]+)\/?"/)?.[1];
      if (!slug || productsBySlug.has(slug)) continue;
      const text = decodeEntities(cardHtml.replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ")
        .trim();
      productsBySlug.set(slug, { slug, cardHtml, text });
    }
  }
  return [...productsBySlug.values()];
}

function buildCreditsHtml(markdown) {
  const parts = [];
  let paragraph = [];
  let isListOpen = false;
  const flushParagraph = () => {
    if (paragraph.length)
      parts.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (isListOpen) parts.push("</ul>");
    isListOpen = false;
  };
  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (trimmed.startsWith("#")) {
      flushParagraph();
      closeList();
      const level = trimmed.startsWith("## ") ? "h2" : "h1";
      parts.push(
        `<${level}>${escapeHtml(trimmed.replace(/^#+\s*/, ""))}</${level}>`,
      );
    } else if (trimmed.startsWith("- ")) {
      flushParagraph();
      if (!isListOpen) {
        parts.push("<ul>");
        isListOpen = true;
      }
      parts.push(
        `<li>${escapeHtml(trimmed.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`,
      );
    } else if (/^https?:\/\//.test(trimmed) && isListOpen) {
      const url = escapeAttribute(trimmed);
      parts[parts.length - 1] = parts[parts.length - 1].replace(
        "</li>",
        `<br><a href="${url}" target="_blank" rel="noopener">${url}</a></li>`,
      );
    } else {
      closeList();
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  closeList();
  return parts.join("\n");
}

function writeCreditsPage() {
  const creditsPath = path.join(publicDir, "images", "CREDITS.md");
  if (!fs.existsSync(creditsPath)) return;
  const homeHref = relativeHref(CREDITS_PAGE_FILE, "index.html");
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ghi công ảnh minh hoạ — Xe Điện Xanh</title>
<style>
body{margin:0;background:#f4f6f5;color:#1f2a25;font:15px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:960px;margin:0 auto;padding:32px 16px 64px;overflow-wrap:anywhere}
a{color:#0a7d4f}h1{font-size:28px;margin:8px 0 16px}h2{font-size:19px;margin:28px 0 8px}
ul{padding-left:20px}li{margin:8px 0}.back{display:inline-block;margin-bottom:8px;font-weight:600;text-decoration:none}
</style>
</head>
<body>
<main>
<a class="back" href="${homeHref}">← Về trang chủ</a>
${buildCreditsHtml(fs.readFileSync(creditsPath, "utf8"))}
</main>
</body>
</html>
`;
  fs.mkdirSync(path.join(outDir, path.dirname(CREDITS_PAGE_FILE)), {
    recursive: true,
  });
  fs.writeFileSync(path.join(outDir, CREDITS_PAGE_FILE), html);
}

function writeDemoReadme(pageCount) {
  const readme = `# Xe Điện Xanh — bản demo tĩnh

Bản xem trước website bán xe điện Xe Điện Xanh: ${pageCount} trang HTML (trang chủ, sản phẩm, danh mục, chi tiết xe,
tin tức, liên hệ, chính sách…) kèm CSS, JS và ảnh, không cần backend.

- Xem trên máy: mở \`index.html\` bằng trình duyệt.
- Đưa lên GitHub Pages: push thư mục này lên một repo, vào **Settings → Pages**, chọn nhánh \`main\`, thư mục \`/ (root)\`.

Dữ liệu (sản phẩm, giá, số điện thoại, địa chỉ) là dữ liệu mẫu. Form tư vấn / liên hệ chỉ mô phỏng, không gửi đi đâu;
tìm kiếm chạy trên danh sách sản phẩm có sẵn trong trang. Ảnh minh hoạ lấy từ Wikimedia Commons, ghi công ở trang
\`ghi-cong-anh/\`.
`;
  fs.writeFileSync(path.join(outDir, "README.md"), readme);
}

fs.mkdirSync(outDir, { recursive: true });
for (const entry of fs.readdirSync(outDir)) {
  if (entry !== ".git")
    fs.rmSync(path.join(outDir, entry), { recursive: true, force: true });
}

console.log(`Đang tải site từ ${siteUrl} …`);
const pages = await crawlSite();
const pageFilesByKey = new Map(
  [...pages].map(([key, page]) => [key, page.file]),
);

for (const page of pages.values()) {
  const html = await transformPage(page.html, page.file, pageFilesByKey);
  fs.mkdirSync(path.join(outDir, path.dirname(page.file)), { recursive: true });
  fs.writeFileSync(path.join(outDir, page.file), html);
}

const searchTemplate = await fetchText("/san-pham/?q=xe");
fs.mkdirSync(path.join(outDir, path.dirname(SEARCH_PAGE_FILE)), {
  recursive: true,
});
fs.writeFileSync(
  path.join(outDir, SEARCH_PAGE_FILE),
  (
    await transformPage(searchTemplate, SEARCH_PAGE_FILE, pageFilesByKey)
  ).replace("<html", '<html data-demo-search-page=""'),
);

const searchIndex = buildSearchIndex(pages).map((product) => ({
  slug: product.slug,
  text: removeDiacritics(product.text).toLowerCase(),
  cardHtml: product.cardHtml
    .replace(/(\s(?:src|href)=")([^"]+)(")/g, (whole, start, value, end) => {
      const publicPath = toPublicAssetPath(value);
      if (publicPath) {
        const copied = copyPublicAsset(publicPath);
        return copied ? `${start}{{ROOT}}${copied}${end}` : whole;
      }
      const linked = parseInternalUrl(value);
      const targetFile = linked && pageFilesByKey.get(pageKeyOf(linked));
      return targetFile ? `${start}{{ROOT}}${targetFile}${end}` : whole;
    })
    .replace(/\s(?:srcSet|srcset|sizes)="[^"]*"/g, ""),
}));
fs.mkdirSync(path.join(outDir, "assets/js"), { recursive: true });
fs.writeFileSync(
  path.join(outDir, "assets/js/search-index.js"),
  `window.DEMO_PRODUCTS = ${JSON.stringify(searchIndex)};\n`,
);
fs.copyFileSync(
  path.join(scriptsDir, "demo-site-runtime.js"),
  path.join(outDir, "assets/js/demo.js"),
);

writeCreditsPage();
writeDemoReadme(pages.size + 1);
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

const unresolved = new Set();
for (const page of pages.values()) {
  const html = fs.readFileSync(path.join(outDir, page.file), "utf8");
  for (const match of html.matchAll(/(?:src|href)="(\/[^"/][^"]*)"/g))
    unresolved.add(match[1]);
}

console.log(
  `Xong: ${pages.size} trang + trang tìm kiếm, ${searchIndex.length} sản phẩm trong chỉ mục, ${copiedAssets.size} file ảnh → ${outDir}`,
);
if (unresolved.size)
  console.log(
    `Link tuyệt đối chưa đổi (${unresolved.size}): ${[...unresolved].slice(0, 15).join(", ")}`,
  );
