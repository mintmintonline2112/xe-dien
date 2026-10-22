'use client';

/**
 * Ô "Video" của admin: tải MP4/WebM/MOV (tới 200MB, có tiến trình), chọn từ Thư viện, hoặc dán link YouTube/Vimeo; trả về (path|url, hướng).
 * Dùng bởi: GenericForm.tsx (field type video), rich-text-editor/RichTextEditor.tsx (hộp chèn video).
 * Lưu ý: hướng ngang/dọc tự đoán từ kích thước khung hình của file (link YouTube Shorts → dọc), admin vẫn đổi tay được.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { FolderOpen, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { libraryService } from '@/app/admin/_lib/library.service';
import { LibraryPicker } from '@/app/admin/_components/library-picker/LibraryPicker';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';
import { guessOrientation, isExternalVideo } from '@/media/video-source';

export type VideoOrientation = 'landscape' | 'portrait';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_MB = 200;

function detectOrientationFromSrc(src: string): Promise<VideoOrientation> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () =>
      resolve(video.videoHeight > video.videoWidth ? 'portrait' : 'landscape');
    video.onerror = () => resolve('landscape');
    video.src = src;
  });
}

async function detectOrientationFromFile(file: File): Promise<VideoOrientation> {
  const url = URL.createObjectURL(file);
  try {
    return await detectOrientationFromSrc(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function VideoInput({
  value,
  orientation,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  orientation: VideoOrientation | '';
  onChange: (path: string, orientation: VideoOrientation | '') => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const radioName = useId();
  const [progress, setProgress] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const currentOrientation = orientation || 'landscape';
  const isExternalLink = isExternalVideo(value);
  const previewSrc = value ? (isExternalLink ? value : resolveImageUrl(value)) : null;

  async function uploadVideoFile(file: File | undefined) {
    if (!file) return;
    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error('Chỉ nhận video MP4, WebM hoặc MOV');
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video tối đa ${MAX_VIDEO_MB}MB — nén bớt rồi tải lại`);
      return;
    }
    setProgress(0);
    try {
      const [detected, uploaded] = await Promise.all([
        detectOrientationFromFile(file),
        libraryService.uploadVideo(file, setProgress),
      ]);
      onChange(uploaded.path, detected);
      toast.success('Đã tải video lên');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tải video thất bại');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function pickFromLibrary(url: string) {
    const detected = await detectOrientationFromSrc(resolveImageUrl(url) ?? url);
    onChange(url, detected);
  }

  function commitLink(rawLink: string) {
    const link = rawLink.trim();
    if (!link) {
      onChange('', '');
      return;
    }
    onChange(link, guessOrientation(link, currentOrientation));
  }

  return (
    <div className="gf-video">
      <div className="gf-imageurl-row">
        <input
          className="gf-control"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commitLink(draft)}
          placeholder={placeholder ?? 'Dán link YouTube / Vimeo, hoặc bấm Tải video lên'}
          disabled={disabled || progress !== null}
        />
        <button
          type="button"
          className="adm-btn"
          onClick={() => setIsPickerOpen(true)}
          disabled={disabled || progress !== null}
          title="Chọn video đã có trong Thư viện"
        >
          <FolderOpen size={14} /> Thư viện
        </button>
        <button
          type="button"
          className="adm-btn"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || progress !== null}
        >
          <Upload size={14} /> Tải video lên
        </button>
        {value && !disabled && (
          <button
            type="button"
            className="adm-btn"
            onClick={() => onChange('', '')}
            aria-label="Bỏ video"
            title="Bỏ video"
          >
            <X size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          hidden
          onChange={(e) => uploadVideoFile(e.target.files?.[0])}
        />
      </div>

      <LibraryPicker
        isOpen={isPickerOpen}
        kind="video"
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => void pickFromLibrary(url)}
      />

      {progress !== null && (
        <div className="gf-video-progress" role="progressbar" aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
          <small>Đang tải… {progress}%</small>
        </div>
      )}

      {value && (
        <div className="gf-video-meta">
          <div className={`gf-video-preview is-${currentOrientation}`}>
            {isExternalLink ? (
              <div className="gf-video-link">Link ngoài: {value}</div>
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={previewSrc ?? undefined} controls preload="metadata" />
            )}
          </div>
          <div className="gf-video-orient" role="radiogroup" aria-label="Hướng video">
            {(
              [
                ['landscape', 'Ngang 16:9'],
                ['portrait', 'Dọc 9:16'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={`gf-video-orient-opt${currentOrientation === key ? ' is-active' : ''}`}>
                <input
                  type="radio"
                  name={radioName}
                  checked={currentOrientation === key}
                  onChange={() => onChange(value, key)}
                  disabled={disabled}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
