/**
 * Sinh /robots.txt: cho crawl site public, chặn admin và /api/, trỏ tới sitemap.
 * Dùng bởi: Next.js App Router (metadata route).
 */
import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { ADMIN_BASE } from "@/config/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [`${ADMIN_BASE}/`, "/api/"] }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
