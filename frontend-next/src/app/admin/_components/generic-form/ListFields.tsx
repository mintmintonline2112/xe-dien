'use client';

/**
 * Ô nhập dạng danh sách cho GenericForm: `stringList` (dòng chữ), `pairList` (cặp nhãn – giá trị), `imageList` (nhiều ảnh từ Thư viện / tải lên).
 * Dùng bởi: GenericForm.tsx (field type stringList / pairList / imageList), ví dụ ProductForm (điểm nổi bật, thông số, ảnh phụ).
 * Lưu ý: imageList lưu đường dẫn tương đối "uploads/..." (bỏ domain API) hoặc "/images/..." (ảnh tĩnh); ảnh tải lên đi qua hộp thoại
 * nén rồi vào thư mục Thư viện `uploadFolder` (mặc định "library"). Dòng trống vẫn giữ trong form, nơi gọi tự lọc khi gửi.
 */

import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Image as ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';
import { libraryService } from '@/app/admin/_lib/library.service';
import { LibraryPicker } from '@/app/admin/_components/library-picker/LibraryPicker';
import { useImageCompressConfirm } from '@/app/admin/_components/image-compress-dialog/useImageCompressConfirm';

export type PairItem = { label: string; value: string };

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function toStoredImagePath(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('/images/')) return trimmed;
  return trimmed.replace(/^https?:\/\/[^/]+\//i, '').replace(/^\//, '');
}

function RowActions({
  index,
  count,
  disabled,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  disabled?: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="gf-list-actions">
      <button type="button" className="adm-icon-btn" title="Lên" disabled={disabled || index === 0} onClick={() => onMove(-1)}>
        <ArrowUp size={15} />
      </button>
      <button type="button" className="adm-icon-btn" title="Xuống" disabled={disabled || index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown size={15} />
      </button>
      <button type="button" className="adm-icon-btn is-danger" title="Xóa" disabled={disabled} onClick={onRemove}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function StringListInput({
  value,
  onChange,
  placeholder,
  addLabel = 'Thêm dòng',
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="gf-list">
      {value.map((row, index) => (
        <div className="gf-list-row" key={index}>
          <input
            className="gf-control"
            value={row}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange(value.map((item, i) => (i === index ? e.target.value : item)))}
          />
          <RowActions
            index={index}
            count={value.length}
            disabled={disabled}
            onMove={(direction) => onChange(moveItem(value, index, direction))}
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {!disabled && (
        <button type="button" className="adm-btn adm-btn--sm gf-list-add" onClick={() => onChange([...value, ''])}>
          <Plus size={14} /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function PairListInput({
  value,
  onChange,
  labelColumn = 'Nhãn',
  valueColumn = 'Giá trị',
  labelPlaceholder,
  valuePlaceholder,
  addLabel = 'Thêm dòng',
  disabled,
}: {
  value: PairItem[];
  onChange: (value: PairItem[]) => void;
  labelColumn?: string;
  valueColumn?: string;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
  disabled?: boolean;
}) {
  const updateRow = (index: number, patch: Partial<PairItem>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="gf-list">
      {value.length > 0 && (
        <div className="gf-list-row gf-list-head">
          <span>{labelColumn}</span>
          <span>{valueColumn}</span>
          <span />
        </div>
      )}
      {value.map((row, index) => (
        <div className="gf-list-row is-pair" key={index}>
          <input
            className="gf-control"
            value={row.label}
            placeholder={labelPlaceholder ?? labelColumn}
            disabled={disabled}
            onChange={(e) => updateRow(index, { label: e.target.value })}
          />
          <input
            className="gf-control"
            value={row.value}
            placeholder={valuePlaceholder ?? valueColumn}
            disabled={disabled}
            onChange={(e) => updateRow(index, { value: e.target.value })}
          />
          <RowActions
            index={index}
            count={value.length}
            disabled={disabled}
            onMove={(direction) => onChange(moveItem(value, index, direction))}
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {!disabled && (
        <button
          type="button"
          className="adm-btn adm-btn--sm gf-list-add"
          onClick={() => onChange([...value, { label: '', value: '' }])}
        >
          <Plus size={14} /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function ImageListInput({
  value,
  onChange,
  uploadFolder = 'library',
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  uploadFolder?: string;
  disabled?: boolean;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { confirmCompress, dialog: compressDialog } = useImageCompressConfirm();

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const compressedFiles = await confirmCompress(input.files);
    input.value = '';
    if (!compressedFiles?.length) return;
    setIsUploading(true);
    const uploadedPaths: string[] = [];
    try {
      for (const file of compressedFiles) {
        const uploadedImage = await libraryService.upload(file, uploadFolder);
        uploadedPaths.push(toStoredImagePath(uploadedImage.url));
      }
      toast.success(`Đã tải lên ${uploadedPaths.length} ảnh`);
    } catch {
      toast.error('Tải ảnh thất bại');
    } finally {
      if (uploadedPaths.length) onChange([...value, ...uploadedPaths]);
      setIsUploading(false);
    }
  }

  return (
    <div className="gf-gallery">
      {value.length > 0 && (
        <div className="gf-gallery-grid">
          {value.map((path, index) => (
            <figure className="gf-gallery-item" key={`${path}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImageUrl(path) ?? path} alt={`Ảnh ${index + 1}`} />
              {!disabled && (
                <figcaption>
                  <button type="button" title="Sang trái" disabled={index === 0} onClick={() => onChange(moveItem(value, index, -1))}>
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    title="Sang phải"
                    disabled={index === value.length - 1}
                    onClick={() => onChange(moveItem(value, index, 1))}
                  >
                    <ArrowRight size={13} />
                  </button>
                  <button type="button" title="Bỏ ảnh" className="is-danger" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                    <X size={13} />
                  </button>
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {!disabled && (
        <div className="gf-image-actions">
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => setIsPickerOpen(true)}>
            <ImageIcon size={14} /> Chọn từ Thư viện
          </button>
          <label className="adm-btn adm-btn--sm gf-image-replace">
            {isUploading ? <span className="adm-spin" /> : <Upload size={14} />}
            Tải ảnh lên
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFilesChange} disabled={isUploading} />
          </label>
        </div>
      )}
      {compressDialog}
      <LibraryPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => onChange([...value, toStoredImagePath(url)])}
      />
    </div>
  );
}
