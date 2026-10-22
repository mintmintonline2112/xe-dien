/**
 * Root layout chung cho cả site public lẫn admin: nạp styles/tailwind.css, font Google Be Vietnam Pro (đủ dấu tiếng Việt), metadataBase, viewport.
 * Dùng bởi: Next.js App Router cho mọi trang.
 * Lưu ý: title / description / OG của site nằm ở app/(site)/layout.tsx; admin tự khai (noindex) ở app/admin/layout.tsx.
 */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { env } from "@/config/env";
import "@/styles/tailwind.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A7D4F",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
