'use client';

/**
 * Hộp chọn file từ Thư viện media (tìm, lọc thư mục) hoặc tải file mới lên, trả về URL đã chọn; `kind` chọn thư viện ảnh hay video.
 * Dùng bởi: GenericForm.tsx, VideoInput.tsx, RichTextEditor.tsx, MetadataEditor.tsx, HeroImageField.tsx, SettingsScreen.tsx.
 * Lưu ý: ảnh đi qua hộp thoại nén; video upload thẳng (tới 200MB, có % tiến trình).
 */

import './library-picker.css';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { X, Search, Upload, Film } from 'lucide-react';
import { useImageCompressConfirm } from '@/app/admin/_components/image-compress-dialog/useImageCompressConfirm';
import { libraryService, type LibraryImage, type LibraryKind } from '@/app/admin/_lib/library.service';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';

export function LibraryPicker({
  isOpen,
  onClose,
  onSelect,
  kind = 'image',
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  kind?: LibraryKind;
}) {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [items, setItems] = useState<LibraryImage[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const { confirmCompress, dialog: compressDialog } = useImageCompressConfirm();
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVideo = kind === 'video';

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const debounceTimer = setTimeout(() => {
      libraryService
        .list({ search: search.trim(), folder, limit: 60, type: kind })
        .then((response) => {
          setItems(response.data ?? []);
          setFolders(response.folders ?? []);
        })
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [isOpen, search, folder, refreshKey, kind]);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (isVideo) {
      setIsUploading(true);
      setProgress(0);
      try {
        const video = await libraryService.uploadVideo(file, setProgress);
        toast.success('Đã tải video lên');
        onSelect(video.url);
        onClose();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Tải video thất bại');
        setRefreshKey((currentKey) => currentKey + 1);
      } finally {
        setIsUploading(false);
        setProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }
    const compressedFiles = await confirmCompress([file]);
    if (!compressedFiles) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setIsUploading(true);
    try {
      const uploadedImage = await libraryService.upload(compressedFiles[0], folder || 'library');
      toast.success('Đã tải ảnh lên');
      onSelect(uploadedImage.url);
      onClose();
    } catch {
      toast.error('Tải ảnh thất bại');
      setRefreshKey((currentKey) => currentKey + 1);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!isOpen) return null;

  return (
    <>
    {compressDialog}
    <div className="lib-overlay" onClick={onClose}>
      <div className="lib-modal" onClick={(e) => e.stopPropagation()}>
        <header className="lib-head">
          <h3>{isVideo ? 'Thư viện video' : 'Thư viện ảnh'}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </header>

        <div className="lib-toolbar">
          <div className="lib-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isVideo ? 'Tìm video…' : 'Tìm ảnh…'}
            />
          </div>
          <select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="">Tất cả thư mục</option>
            {folders.map((folderName) => (
              <option key={folderName} value={folderName}>
                {folderName}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept={isVideo ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'}
            className="lib-hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <button type="button" className="lib-upload" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            {isUploading ? <span className="lib-spin" /> : isVideo ? <Film size={15} /> : <Upload size={15} />}
            {progress !== null ? `Đang tải ${progress}%` : 'Tải lên'}
          </button>
        </div>

        <div className="lib-body">
          {isLoading ? (
            <p className="lib-msg">Đang tải…</p>
          ) : items.length === 0 ? (
            <p className="lib-msg">{isVideo ? 'Chưa có video nào.' : 'Chưa có ảnh nào.'} Bấm Tải lên để thêm.</p>
          ) : (
            <div className="lib-grid">
              {items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="lib-item"
                  title={item.name}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                >
                  {item.kind === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={resolveImageUrl(item.url) ?? item.url} preload="metadata" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImageUrl(item.url) ?? item.url} alt={item.name} />
                  )}
                  {item.kind === 'video' && <span className="lib-kind">video</span>}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
