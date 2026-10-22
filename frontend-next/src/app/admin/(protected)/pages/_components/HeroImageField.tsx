'use client';

/**
 * Ô ảnh nền dải tiêu đề đầu trang (PageHero): gõ đường dẫn hoặc chọn từ Thư viện, rồi bấm / kéo lên ảnh để chọn điểm lấy nét.
 * Dùng bởi: PageForm.tsx (chèn dưới ô Đoạn dẫn).
 * Lưu ý: website làm nhoè ảnh và phủ navy phía sau tiêu đề; để trống thì dùng ảnh showroom mặc định.
 */

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/LibraryPicker';
import { FocalPointPicker } from '@/app/admin/(protected)/page-sections/_components/FocalPointPicker';

export function HeroImageField({
  image,
  position,
  onImageChange,
  onPositionChange,
}: {
  image: string;
  position: string;
  onImageChange: (next: string) => void;
  onPositionChange: (next: string) => void;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="gf-field" style={{ marginTop: 18 }}>
      <label className="gf-label">Ảnh nền đầu trang</label>
      <div className="me-image-row">
        <input
          className="gf-control"
          value={image}
          placeholder="Trống = ảnh showroom mặc định"
          onChange={(e) => onImageChange(e.target.value)}
        />
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => setIsPickerOpen(true)}>
          <ImageIcon size={13} /> Thư viện
        </button>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="me-thumb" src={image} alt="" />
        ) : null}
      </div>
      <p className="gf-hint">
        Ảnh được làm nhoè nhẹ và phủ lớp navy phía sau tiêu đề trang (đậm bên trái, nhạt dần sang phải).
      </p>
      {image ? (
        <FocalPointPicker
          url={image}
          value={position || undefined}
          onChange={(next) => onPositionChange(next ?? '')}
          previews={[
            { label: 'Máy tính (dải ngang dẹt)', width: 220, height: 56 },
            { label: 'Điện thoại', width: 78, height: 96 },
          ]}
        />
      ) : null}

      {isPickerOpen ? (
        <LibraryPicker
          isOpen
          onClose={() => setIsPickerOpen(false)}
          onSelect={(url) => {
            onImageChange(url);
            setIsPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
