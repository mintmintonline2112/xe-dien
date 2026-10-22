'use client';

/**
 * Thư viện media: ảnh (uploads/library…) và video (uploads/videos) chung một chỗ; lọc theo loại / thư mục, xem chi tiết,
 * sửa alt, copy URL, xoá, quét lại thư mục uploads/ khi có file thêm / xoá bằng FTP.
 * Dùng bởi: library/page.tsx.
 * Lưu ý: ảnh qua hộp thoại nén rồi mới upload; video upload thẳng (tới 200MB, có % tiến trình). Trước khi xoá luôn hỏi
 * backend file đang được dùng ở đâu để cảnh báo (tra lỗi thì vẫn cho xoá, chỉ mất phần cảnh báo).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Copy,
  ExternalLink,
  Film,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  libraryService,
  LIBRARY_QUERY_KEY,
  type LibraryImage,
  type LibraryKind,
  type MediaUsage,
} from '@/app/admin/_lib/library.service';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { Pagination } from '@/app/admin/_components/data-table/Pagination';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { useImageCompressConfirm } from '@/app/admin/_components/image-compress-dialog/useImageCompressConfirm';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex ? 1 : 0)} ${units[unitIndex]}`;
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Đã copy URL');
  } catch {
    toast.error('Không copy được URL');
  }
}

export function LibraryScreen() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');
  const [type, setType] = useState<LibraryKind | 'all'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const { confirmCompress, dialog: compressDialog } = useImageCompressConfirm();
  const [selectedItem, setSelectedItem] = useState<LibraryImage | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, folder, type, limit]);

  const params = useMemo(
    () => ({ page, limit, search, folder, type }),
    [page, limit, search, folder, type],
  );

  const { data, isFetching } = useQuery({
    queryKey: [...LIBRARY_QUERY_KEY, params],
    queryFn: () => libraryService.list(params),
    placeholderData: keepPreviousData,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const folders = data?.folders ?? [];
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const currentPage = meta?.page ?? page;
  const total = meta?.total ?? items.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, total);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const picked = await confirmCompress(files);
    if (!picked) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setIsUploading(true);
    const target = folder === 'all' || folder === 'videos' ? 'library' : folder;
    let uploadedCount = 0;
    for (const file of picked) {
      try {
        await libraryService.upload(file, target);
        uploadedCount += 1;
      } catch {
        toast.error(`Không tải được "${file.name}"`);
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (uploadedCount > 0) {
      toast.success(`Đã tải lên ${uploadedCount} file`);
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    }
  }

  async function handleUploadVideo(files: FileList | null) {
    if (!files || files.length === 0) return;
    let uploadedCount = 0;
    for (const file of Array.from(files)) {
      if (!VIDEO_TYPES.includes(file.type)) {
        toast.error(`"${file.name}": chỉ nhận MP4, WebM hoặc MOV`);
        continue;
      }
      setVideoProgress(0);
      try {
        await libraryService.uploadVideo(file, setVideoProgress);
        uploadedCount += 1;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Không tải được "${file.name}"`);
      }
    }
    setVideoProgress(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (uploadedCount > 0) {
      toast.success(`Đã tải lên ${uploadedCount} video`);
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    }
  }

  async function handleDelete(item: LibraryImage) {
    const usage = await libraryService.usage(item.path).catch((): MediaUsage[] => []);

    const mediaLabel = item.kind === 'video' ? 'video' : 'ảnh';
    const text = usage.length
      ? `"${item.name}" ĐANG ĐƯỢC DÙNG ở ${usage.length} nơi:\n\n` +
        usage
          .slice(0, 8)
          .map((place) => `• ${place.type}: ${place.title}${place.count > 1 ? ` (${place.count} chỗ)` : ''}`)
          .join('\n') +
        (usage.length > 8 ? `\n• …và ${usage.length - 8} nơi khác` : '') +
        `\n\nXoá thì những chỗ trên sẽ mất ${mediaLabel}.`
      : `"${item.name}" sẽ bị xóa vĩnh viễn. Hiện KHÔNG có nội dung nào đang dùng file này.`;

    const isDeleted = await confirmAction(
      { title: 'Xóa file?', text, confirmButtonText: 'Xóa' },
      () => libraryService.remove(item.path),
    );
    if (isDeleted) {
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    try {
      const syncResult = await libraryService.sync();
      const changedCount = syncResult.added + syncResult.removed + syncResult.updated;
      toast.success(
        changedCount === 0
          ? 'Thư viện đã khớp với thư mục trên máy chủ'
          : `Đã cập nhật: thêm ${syncResult.added}, gỡ ${syncResult.removed}, làm mới ${syncResult.updated}`,
      );
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSyncing(false);
    }
  }

  const isBusy = isUploading || videoProgress !== null;

  return (
    <div>
      {compressDialog}
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Thư viện ảnh &amp; video</h1>
          <p className="adm-page-subtitle">
            {meta?.total ?? 0} file · {formatBytes(data?.totalSize ?? 0)}
            {videoProgress !== null && ` · đang tải video ${videoProgress}%`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="lib-hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            className="lib-hidden"
            onChange={(e) => handleUploadVideo(e.target.files)}
          />
          <button
            type="button"
            onClick={handleSync}
            disabled={isBusy || isSyncing}
            className="adm-btn"
            title="Quét lại thư mục uploads/ trên máy chủ — dùng khi có file được thêm/xoá bằng FTP"
          >
            {isSyncing ? <span className="adm-spin" /> : <RefreshCw size={16} />}
            Quét lại
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isBusy}
            className="adm-btn"
          >
            {videoProgress !== null ? <span className="adm-spin" /> : <Film size={16} />}
            Tải video lên
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="adm-btn adm-btn--primary"
          >
            {isUploading ? <span className="adm-spin" /> : <Upload size={16} />}
            Tải ảnh lên
          </button>
        </div>
      </div>

      <div className="dt-toolbar">
        <div className="dt-search">
          <Search size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm file…"
          />
        </div>
        <select
          className="dt-filter"
          value={type}
          onChange={(e) => setType(e.target.value as LibraryKind | 'all')}
        >
          <option value="all">Ảnh + video</option>
          <option value="image">Chỉ ảnh</option>
          <option value="video">Chỉ video</option>
        </select>
        <select className="dt-filter" value={folder} onChange={(e) => setFolder(e.target.value)}>
          <option value="all">Tất cả thư mục</option>
          {folders.map((folderName) => (
            <option key={folderName} value={folderName}>
              {folderName}
            </option>
          ))}
        </select>
      </div>

      <div className="lb-card">
        {isFetching && items.length === 0 ? (
          <p className="lb-msg">Đang tải…</p>
        ) : items.length === 0 ? (
          <p className="lb-msg">Chưa có file nào. Bấm Tải ảnh lên / Tải video lên để thêm.</p>
        ) : (
          <div className="lb-grid">
            {items.map((item) => (
              <div key={item.path} className="lb-item">
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="lb-thumb"
                  title="Xem chi tiết"
                >
                  {item.kind === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={item.url} preload="metadata" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt || item.name} />
                  )}
                  {item.kind === 'video' && (
                    <span className="lb-kind-badge">
                      <Film size={11} /> video
                    </span>
                  )}
                  <span className="lb-item-actions">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url);
                      }}
                      aria-label="Copy URL"
                      title="Copy URL"
                    >
                      <Copy size={13} />
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Mở tab mới"
                      title="Mở"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <span
                      role="button"
                      tabIndex={0}
                      className="lb-del"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      aria-label="Xóa"
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                    </span>
                  </span>
                </button>
                <div className="lb-item-meta">
                  <p className="lb-item-name" title={item.name}>
                    {item.name}
                  </p>
                  <p className="lb-item-sub">
                    {item.folder} · {formatBytes(item.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <Pagination
            className="lb-paging"
            page={currentPage}
            totalPages={totalPages}
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={setLimit}
            pageSizeOptions={[12, 24, 48, 96]}
            unit="file"
          />
        )}
      </div>

      {selectedItem && (
        <DetailModal
          key={selectedItem.path}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={() => handleDelete(selectedItem)}
          onAltSaved={() => queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY })}
        />
      )}
    </div>
  );
}

function DetailModal({
  item,
  onClose,
  onDelete,
  onAltSaved,
}: {
  item: LibraryImage;
  onClose: () => void;
  onDelete: () => void;
  onAltSaved: () => void;
}) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(
    item.width && item.height ? { width: item.width, height: item.height } : null,
  );
  const [alt, setAlt] = useState(item.alt ?? '');
  const [savedAlt, setSavedAlt] = useState(item.alt ?? '');
  const [isSavingAlt, setIsSavingAlt] = useState(false);
  const isVideo = item.kind === 'video';

  async function saveAlt() {
    setIsSavingAlt(true);
    try {
      await libraryService.updateAlt(item.id, alt);
      setSavedAlt(alt);
      toast.success('Đã lưu mô tả ảnh');
      onAltSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingAlt(false);
    }
  }

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-detail" onClick={(e) => e.stopPropagation()}>
        <div className="lb-detail-preview">
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={item.url}
              controls
              preload="metadata"
              onLoadedMetadata={(e) =>
                setDimensions({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight })
              }
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.alt || item.name}
              onLoad={(e) =>
                setDimensions({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })
              }
            />
          )}
        </div>

        <div className="lb-detail-info">
          <div className="lb-detail-head">
            <h3 title={item.name}>{item.name}</h3>
            <button type="button" onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </div>

          <dl className="lb-detail-rows">
            <DetailRow label="Loại" value={isVideo ? 'Video' : 'Ảnh'} />
            <DetailRow
              label="Kích thước"
              value={
                dimensions
                  ? `${dimensions.width} × ${dimensions.height} px${isVideo ? (dimensions.height > dimensions.width ? ' · dọc 9:16' : ' · ngang 16:9') : ''}`
                  : 'Đang tải…'
              }
            />
            <DetailRow label="Dung lượng" value={formatBytes(item.size)} />
            <DetailRow label="Thư mục" value={item.folder} />
            <DetailRow label="Định dạng" value={item.extension.toUpperCase()} />
            <DetailRow label="Sửa lần cuối" value={new Date(item.modifiedAt).toLocaleString('vi-VN')} />
            {!isVideo && (
              <div className="lb-detail-alt">
                <dt>Mô tả ảnh (alt)</dt>
                <div className="lb-detail-url">
                  <input
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    maxLength={300}
                    placeholder="Ví dụ: Xe máy điện màu xanh trước showroom"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void saveAlt();
                    }}
                  />
                  <button
                    type="button"
                    onClick={saveAlt}
                    disabled={isSavingAlt || alt === savedAlt}
                    title="Lưu mô tả"
                  >
                    {isSavingAlt ? <span className="adm-spin" /> : 'Lưu'}
                  </button>
                </div>
                <p className="gf-hint">
                  Hiện khi ảnh lỗi, giúp Google hiểu nội dung ảnh và cho người khiếm thị nghe được.
                </p>
              </div>
            )}
            <div>
              <dt>URL</dt>
              <div className="lb-detail-url">
                <input readOnly value={item.url} onFocus={(e) => e.currentTarget.select()} />
                <button type="button" onClick={() => copyUrl(item.url)} title="Copy URL">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </dl>

          <div className="lb-detail-actions">
            <a href={item.url} target="_blank" rel="noreferrer" className="adm-btn">
              <ExternalLink size={15} /> Mở
            </a>
            <button type="button" onClick={onDelete} className="adm-btn lb-btn-danger">
              <Trash2 size={15} /> Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="lb-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
