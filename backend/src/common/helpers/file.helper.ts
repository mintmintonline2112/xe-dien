/**
 * Đặt tên file upload (giữ tên gốc đã bỏ dấu, thêm -2, -3 khi trùng) và nhận dạng ảnh bằng magic bytes.
 * Dùng bởi: modules/admin/library (controller + service), modules/upload-image/upload-image.service.ts.
 * Lưu ý: không tin `file.mimetype` (trình duyệt gửi, giả mạo được); thiếu detectImageKind thì .svg / .html khai man
 * image/png được lưu nguyên vào /uploads và mở trên domain API (XSS lưu trữ). Multer đưa originalname dạng latin1 → decode lại utf8.
 */
import { extname } from 'path';

export class FileHelper {
  static cleanFileName(originalName: string): string {
    const fileExtName = extname(originalName);
    const fileName = originalName.replace(fileExtName, '');

    return (
      fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase() + fileExtName
    );
  }
}

export function buildUniqueUploadName(
  originalName: string,
  exists: (candidate: string) => boolean,
): string {
  let decoded = originalName;
  try {
    const utf8Name = Buffer.from(originalName, 'latin1').toString('utf8');
    const hasReplacementChar = utf8Name.includes('�');
    if (!hasReplacementChar && /[^\x00-\x7F]/.test(originalName))
      decoded = utf8Name;
  } catch {
    decoded = originalName;
  }
  const ext = (extname(decoded).toLowerCase() || '.jpg').replace(
    /[^a-z0-9.]/g,
    '',
  );
  const base =
    decoded
      .slice(0, decoded.length - extname(decoded).length)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'image';

  let candidate = `${base}${ext}`;
  let suffix = 2;
  while (exists(candidate)) candidate = `${base}-${suffix++}${ext}`;
  return candidate;
}

export type ImageKind = '.jpg' | '.png' | '.webp' | '.gif';

export const MIME_BY_IMAGE_KIND: Record<ImageKind, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export function detectImageKind(buffer: Buffer): ImageKind | null {
  if (!buffer || buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return '.jpg';

  const pngMagic = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  if (buffer.subarray(0, 8).equals(pngMagic)) return '.png';

  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return '.webp';
  }

  const gifSignature = buffer.subarray(0, 6).toString('ascii');
  if (gifSignature === 'GIF87a' || gifSignature === 'GIF89a') return '.gif';

  return null;
}
