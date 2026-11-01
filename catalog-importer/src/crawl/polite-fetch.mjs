/**
 * Gọi HTTP lịch sự tới site nguồn: nghỉ `delayMs` trước mỗi request, thử lại 2 lần (nghỉ gấp 3), User-Agent tự xưng là importer.
 * Dùng bởi: crawl/catalog-crawler.mjs (HTML), crawl/image-downloader.mjs (ảnh).
 */
const USER_AGENT = "Mozilla/5.0 (compatible; CatalogImporter/1.0)";
const RETRY_COUNT = 2;

export const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

export async function fetchWithRetry(url, delayMs) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    await wait(attempt === 0 ? delayMs : delayMs * 3);
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) throw new Error(`HTTP ${response.status} — ${url}`);
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Không tải được ${url}`);
}

export async function fetchHtml(url, delayMs) {
  return (await fetchWithRetry(url, delayMs)).text();
}
