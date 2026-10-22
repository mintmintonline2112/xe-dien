/**
 * Kiểu dữ liệu API thư viện trả về: file trong thư viện (ảnh hoặc video), video vừa upload, nơi đang dùng một file.
 * Dùng bởi: library.service.ts. Frontend có bản kiểu riêng ở frontend-next app/admin/_lib/library.service.ts.
 * Lưu ý: LibraryImage dùng cho cả video (width / height null); MediaUsage.type là loại nội dung ("Bài viết", "Trang"…), count là số lần cùng bản ghi tham chiếu tới file.
 */
import type { MediaKind } from './media.entity';

export type LibraryKind = MediaKind;

export interface LibraryVideo {
  name: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface LibraryImage {
  id: number;
  kind: LibraryKind;
  name: string;
  path: string;
  url: string;
  folder: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  modifiedAt: string;
}

export interface MediaUsage {
  type: string;
  title: string;
  count: number;
}
