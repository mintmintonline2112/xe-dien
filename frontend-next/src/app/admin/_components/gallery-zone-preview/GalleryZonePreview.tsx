'use client';

/**
 * Xem trước phân khu ảnh ngang / dọc của kiểu hiển thị "Bộ sưu tập ảnh" ngay dưới editor nội dung, dùng chung logic đo ảnh với gallery ngoài site.
 * Dùng bởi: hiện chưa có trang nào import (dự kiến gắn vào form Page section qua `renderExtra`).
 * Lưu ý: `resolveSrc` khai ở cấp module để effect đo ảnh trong useImageOrientations không chạy lại theo mỗi lần gõ phím.
 */

import { useMemo } from 'react';
import { RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';
import {
  parseGalleryImages,
  useImageOrientations,
  type GalleryImage,
} from '@/media/gallery-orientation';

const resolveSrc = (src: string) => resolveImageUrl(src) ?? src;

function ZoneThumbs({ images }: { images: GalleryImage[] }) {
  return (
    <div className="gzp-thumbs">
      {images.map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.src}-${index}`}
          src={resolveSrc(image.src)}
          alt={image.alt || `Ảnh ${index + 1}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}

export function GalleryZonePreview({ html }: { html: string }) {
  const images = useMemo(() => parseGalleryImages(html).images, [html]);
  const orientations = useImageOrientations(images, resolveSrc);

  if (images.length === 0) {
    return (
      <div className="gzp gzp--empty">
        Chưa có ảnh nào trong nội dung — bấm nút <strong>chèn ảnh</strong> trên
        thanh công cụ của editor, ảnh sẽ tự chia khu ngang / dọc ngoài website.
      </div>
    );
  }

  const landscapeImages = images.filter((image) => orientations[image.src] === 'landscape');
  const portraitImages = images.filter((image) => orientations[image.src] === 'portrait');
  const measuringCount = images.length - landscapeImages.length - portraitImages.length;

  return (
    <div className="gzp">
      <p className="gzp-title">
        Xem trước phân khu ngoài website
        {measuringCount > 0 && <span className="gzp-measuring">đang đo {measuringCount} ảnh…</span>}
      </p>
      <div className="gzp-zones">
        <div className="gzp-zone">
          <p className="gzp-zone-head">
            <RectangleHorizontal size={14} />
            Khổ ngang · {landscapeImages.length} ảnh
            <span>lưới ~2 cột</span>
          </p>
          {landscapeImages.length > 0 ? (
            <ZoneThumbs images={landscapeImages} />
          ) : (
            <p className="gzp-zone-empty">Không có ảnh ngang</p>
          )}
        </div>
        <div className="gzp-zone">
          <p className="gzp-zone-head">
            <RectangleVertical size={14} />
            Khổ dọc · {portraitImages.length} ảnh
            <span>lưới ~3 cột</span>
          </p>
          {portraitImages.length > 0 ? (
            <ZoneThumbs images={portraitImages} />
          ) : (
            <p className="gzp-zone-empty">Không có ảnh dọc</p>
          )}
        </div>
      </div>
      <p className="gzp-note">
        Khu xếp theo chiều thật của ảnh (ngang → khu ngang, dọc → khu dọc);
        thứ tự trong mỗi khu theo thứ tự chèn trong nội dung. Nhãn khu ngoài
        website chỉ hiện khi có đủ cả hai loại ảnh.
      </p>
    </div>
  );
}
