/**
 * Cấu hình Next.js: strict mode, URL có dấu "/" cuối, tắt tối ưu ảnh của next/image.
 * Dùng bởi: `next dev` / `next build` / `next start`.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
