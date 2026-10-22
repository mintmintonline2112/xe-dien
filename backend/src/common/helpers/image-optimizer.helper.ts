/**
 * Nén ảnh khi upload về khoảng ≤ 1MB: thu về tối đa 1920px cạnh dài, xoay theo EXIF, bỏ metadata, hạ quality dần (tối thiểu 60).
 * Dùng bởi: modules/admin/library/library.service.ts (thư viện ảnh), modules/upload-image/upload-image.service.ts (ảnh bìa bài viết).
 * Lưu ý: PNG trong suốt giữ PNG (nén palette); PNG không trong suốt chuyển sang JPEG (đổi đuôi .png → .jpg);
 * GIF / SVG / ảnh lỗi trả nguyên file. MAX_UPLOAD_MB là giới hạn file thô, nginx VPS cần client_max_body_size ≥ giá trị này.
 */
import sharp from 'sharp';
import { extname } from 'path';

export const MAX_UPLOAD_MB = 15;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const IMAGE_OPTIMIZE = {
  MAX_EDGE: 1920,
  TARGET_BYTES: 1024 * 1024,
  QUALITY: 82,
  MIN_QUALITY: 60,
  SKIP_BELOW_BYTES: 300 * 1024,
} as const;

export type OptimizedImage = {
  buffer: Buffer;
  ext: string;
  mime: string;
  changed: boolean;
};

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const OPTIMIZABLE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

export async function optimizeImage(
  buffer: Buffer,
  originalName: string,
  originalMime?: string,
): Promise<OptimizedImage> {
  const ext = extname(originalName).toLowerCase();
  const passthrough: OptimizedImage = {
    buffer,
    ext,
    mime: originalMime || MIME_BY_EXT[ext] || 'application/octet-stream',
    changed: false,
  };

  if (!OPTIMIZABLE_EXTS.includes(ext)) return passthrough;

  try {
    const meta = await sharp(buffer).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const isTooLarge = Math.max(width, height) > IMAGE_OPTIMIZE.MAX_EDGE;
    const isTooHeavy = buffer.length > IMAGE_OPTIMIZE.SKIP_BELOW_BYTES;
    if (!isTooLarge && !isTooHeavy) return passthrough;

    const createResizedPipeline = () =>
      sharp(buffer).rotate().resize({
        width: IMAGE_OPTIMIZE.MAX_EDGE,
        height: IMAGE_OPTIMIZE.MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      });

    const encodeJpeg = (quality: number) =>
      createResizedPipeline()
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();
    const encodeWebp = (quality: number) =>
      createResizedPipeline().webp({ quality }).toBuffer();

    const encodeWithinTarget = async (
      encode: (quality: number) => Promise<Buffer>,
    ) => {
      let quality: number = IMAGE_OPTIMIZE.QUALITY;
      let encoded = await encode(quality);
      while (
        encoded.length > IMAGE_OPTIMIZE.TARGET_BYTES &&
        quality > IMAGE_OPTIMIZE.MIN_QUALITY
      ) {
        quality -= 8;
        encoded = await encode(Math.max(quality, IMAGE_OPTIMIZE.MIN_QUALITY));
      }
      return encoded;
    };

    if (ext === '.png') {
      const hasAlpha = Boolean(meta.hasAlpha);
      if (hasAlpha) {
        const encoded = await createResizedPipeline()
          .png({ compressionLevel: 9, palette: true, quality: 90, effort: 7 })
          .toBuffer();
        return encoded.length < buffer.length
          ? { buffer: encoded, ext: '.png', mime: 'image/png', changed: true }
          : passthrough;
      }
      const encoded = await encodeWithinTarget(encodeJpeg);
      return {
        buffer: encoded,
        ext: '.jpg',
        mime: 'image/jpeg',
        changed: true,
      };
    }

    if (ext === '.webp') {
      const encoded = await encodeWithinTarget(encodeWebp);
      return encoded.length < buffer.length
        ? { buffer: encoded, ext: '.webp', mime: 'image/webp', changed: true }
        : passthrough;
    }

    const encoded = await encodeWithinTarget(encodeJpeg);
    return encoded.length < buffer.length
      ? { buffer: encoded, ext: '.jpg', mime: 'image/jpeg', changed: true }
      : passthrough;
  } catch {
    return passthrough;
  }
}
