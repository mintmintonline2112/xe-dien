/**
 * Biến môi trường của frontend: apiUrl (server gọi API), publicApiUrl (trình duyệt truy cập được), siteUrl.
 * Dùng bởi: api/api-fetch.ts, app/(site)/_lib (cms, seo, sanitize), forms.tsx, admin _lib (admin-api, library.service, utils), layout, robots.
 * Lưu ý: trên VPS apiUrl là 127.0.0.1 nội bộ (server-to-server); src ảnh và link công khai phải dùng publicApiUrl.
 */
const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const env = {
  apiUrl: trimTrailingSlash(
    process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3010/api",
  ),
  publicApiUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL ??
      process.env.API_URL ??
      "http://localhost:3010/api",
  ),
  siteUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
} as const;
