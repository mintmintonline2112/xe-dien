'use client';

/**
 * Logic gallery tự phân khu theo chiều ảnh: parseGalleryImages tách <img> khỏi HTML nội dung, useImageOrientations đo ảnh ngang / dọc.
 * Dùng bởi: app/admin/_components/gallery-zone-preview/GalleryZonePreview.tsx.
 * Lưu ý: không dùng ref đánh dấu "đã đo" vì StrictMode chạy effect 2 lần (lần đầu bị hủy); ảnh hỏng xếp vào khu ngang để không mất khỏi gallery.
 */

import { useEffect, useState } from 'react';

export type GalleryImage = { src: string; alt: string };
export type Orientation = 'landscape' | 'portrait';

export function parseGalleryImages(html: string): {
  intro: string;
  images: GalleryImage[];
} {
  const images: GalleryImage[] = [];

  const withoutImages = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /\bsrc\s*=\s*"([^"]+)"/i.exec(tag)?.[1];
    if (src) {
      const alt = /\balt\s*=\s*"([^"]*)"/i.exec(tag)?.[1] ?? '';
      images.push({ src, alt });
    }
    return '';
  });

  const intro = withoutImages
    .replace(/<(p|figure|span)[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, '')
    .trim();

  return { intro, images };
}

export function useImageOrientations(
  images: GalleryImage[],
  resolveSrc?: (src: string) => string,
): Record<string, Orientation> {
  const [orientations, setOrientations] = useState<Record<string, Orientation>>(
    {},
  );

  useEffect(() => {
    let isCancelled = false;

    for (const { src } of images) {
      const probe = new window.Image();
      probe.onload = () => {
        if (isCancelled) return;
        const orientation: Orientation =
          probe.naturalHeight > probe.naturalWidth ? 'portrait' : 'landscape';
        setOrientations((previous) =>
          previous[src] ? previous : { ...previous, [src]: orientation },
        );
      };
      probe.onerror = () => {
        if (isCancelled) return;
        setOrientations((previous) =>
          previous[src] ? previous : { ...previous, [src]: 'landscape' },
        );
      };
      probe.src = resolveSrc ? resolveSrc(src) : src;
    }

    return () => {
      isCancelled = true;
    };
  }, [images, resolveSrc]);

  return orientations;
}
