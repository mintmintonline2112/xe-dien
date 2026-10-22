'use client';

/**
 * Hook useImageCompressConfirm: nén thử ảnh trước khi upload và mở hộp thoại cho chọn kích thước / dung lượng, xem số liệu trước–sau.
 * Dùng bởi: GenericForm.tsx, LibraryPicker.tsx, library/_components/LibraryScreen.tsx (`const { confirmCompress, dialog } = …`, render `dialog`).
 * Lưu ý: ảnh đã đủ nhẹ với tùy chọn hiện tại thì trả file ngay, không mở hộp thoại; lựa chọn gần nhất lưu localStorage.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  compressImageFile,
  formatBytes,
  DEFAULT_COMPRESS_OPTIONS,
  EDGE_PRESETS,
  SIZE_PRESETS,
  type CompressOptions,
  type CompressResult,
} from '@/app/admin/_lib/image-compress';
import './image-compress-dialog.css';

const COMPRESS_PREFERENCE_STORAGE_KEY = 'ssd-admin-compress-pref';

function loadCompressPreference(): CompressOptions {
  try {
    const storedValue = localStorage.getItem(COMPRESS_PREFERENCE_STORAGE_KEY);
    if (!storedValue) return DEFAULT_COMPRESS_OPTIONS;
    const stored = JSON.parse(storedValue) as Partial<CompressOptions>;
    const isKnownEdge = EDGE_PRESETS.some((preset) => preset.value === stored.maxEdge);
    const isKnownSize = SIZE_PRESETS.some((preset) => preset.value === stored.targetBytes);
    return {
      maxEdge: isKnownEdge ? (stored.maxEdge as number) : DEFAULT_COMPRESS_OPTIONS.maxEdge,
      targetBytes: isKnownSize ? (stored.targetBytes as number) : DEFAULT_COMPRESS_OPTIONS.targetBytes,
    };
  } catch {
    return DEFAULT_COMPRESS_OPTIONS;
  }
}
function saveCompressPreference(options: CompressOptions) {
  try {
    localStorage.setItem(COMPRESS_PREFERENCE_STORAGE_KEY, JSON.stringify(options));
  } catch {
  }
}

type PendingState = {
  originals: File[];
  results: CompressResult[];
  options: CompressOptions;
  resolve: (files: File[] | null) => void;
} | null;

function revokePreviewUrls(results: CompressResult[]) {
  for (const result of results) URL.revokeObjectURL(result.previewUrl);
}

export function useImageCompressConfirm() {
  const [pending, setPending] = useState<PendingState>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pendingRef = useRef<PendingState>(null);
  pendingRef.current = pending;

  const confirmCompress = useCallback(
    (files: File[] | FileList | null | undefined): Promise<File[] | null> => {
      const selectedFiles = files ? Array.from(files) : [];
      if (!selectedFiles.length) return Promise.resolve([]);
      setIsAnalyzing(true);
      return (async () => {
        const options = loadCompressPreference();
        const results: CompressResult[] = [];
        for (const file of selectedFiles) results.push(await compressImageFile(file, options));
        setIsAnalyzing(false);
        if (results.every((result) => result.skip)) {
          revokePreviewUrls(results);
          return selectedFiles;
        }
        return new Promise<File[] | null>((resolve) => {
          setPending({ originals: selectedFiles, results, options, resolve });
        });
      })();
    },
    [],
  );

  const settlePending = useCallback((files: File[] | null) => {
    const current = pendingRef.current;
    if (!current) return;
    revokePreviewUrls(current.results);
    setPending(null);
    current.resolve(files);
  }, []);

  const recompressWithOptions = useCallback(async (options: CompressOptions) => {
    const current = pendingRef.current;
    if (!current) return;
    saveCompressPreference(options);
    const results: CompressResult[] = [];
    for (const file of current.originals) results.push(await compressImageFile(file, options));
    const latest = pendingRef.current;
    if (!latest) {
      revokePreviewUrls(results);
      return;
    }
    revokePreviewUrls(latest.results);
    setPending({ ...latest, results, options });
  }, []);

  useEffect(() => {
    if (!pending) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') settlePending(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pending, settlePending]);

  const dialog = (
    <>
      {isAnalyzing && (
        <div className="icd-overlay" role="status" aria-live="polite">
          <div className="icd-analyzing">
            <Loader2 className="icd-spin" size={18} />
            Đang phân tích ảnh…
          </div>
        </div>
      )}
      {pending && (
        <ImageCompressDialog
          results={pending.results}
          options={pending.options}
          onOptionsChange={recompressWithOptions}
          onConfirm={() => settlePending(pending.results.map((result) => result.file))}
          onKeepOriginal={() => settlePending(pending.originals)}
          onCancel={() => settlePending(null)}
        />
      )}
    </>
  );

  return { confirmCompress, dialog, analyzing: isAnalyzing };
}

function ImageCompressDialog({
  results,
  options,
  onOptionsChange,
  onConfirm,
  onKeepOriginal,
  onCancel,
}: {
  results: CompressResult[];
  options: CompressOptions;
  onOptionsChange: (nextOptions: CompressOptions) => Promise<void>;
  onConfirm: () => void;
  onKeepOriginal: () => void;
  onCancel: () => void;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const totalBefore = results.reduce((sum, result) => sum + result.original.size, 0);
  const totalAfter = results.reduce((sum, result) => sum + result.file.size, 0);
  const savedBytes = totalBefore - totalAfter;
  const savedPercent = totalBefore ? Math.round((savedBytes / totalBefore) * 100) : 0;
  const hasNothingToCompress = results.every((result) => result.skip);

  async function applyOptions(patch: Partial<CompressOptions>) {
    setIsBusy(true);
    try {
      await onOptionsChange({ ...options, ...patch });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="icd-overlay" onClick={onCancel} role="presentation">
      <div
        className="icd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="icd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icd-head">
          <h2 id="icd-title">Nén ảnh trước khi tải lên</h2>
          <p>
            Ảnh khá nặng. Chọn kích thước và mức dung lượng bên dưới — số liệu cập nhật ngay
            để bạn xem trước rồi mới quyết định.
          </p>
        </div>

        <div className="icd-options">
          <fieldset className="icd-group">
            <legend>Kích thước (cạnh dài)</legend>
            <div className="icd-chips" role="radiogroup" aria-label="Kích thước">
              {EDGE_PRESETS.map((edgePreset) => (
                <button
                  key={edgePreset.value}
                  type="button"
                  role="radio"
                  aria-checked={options.maxEdge === edgePreset.value}
                  className={`icd-chip${options.maxEdge === edgePreset.value ? ' is-on' : ''}`}
                  disabled={isBusy}
                  title={edgePreset.hint}
                  onClick={() => applyOptions({ maxEdge: edgePreset.value })}
                >
                  {edgePreset.label}
                  <small>{edgePreset.hint}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="icd-group">
            <legend>Dung lượng mục tiêu</legend>
            <div className="icd-chips" role="radiogroup" aria-label="Dung lượng">
              {SIZE_PRESETS.map((sizePreset) => (
                <button
                  key={sizePreset.value}
                  type="button"
                  role="radio"
                  aria-checked={options.targetBytes === sizePreset.value}
                  className={`icd-chip${options.targetBytes === sizePreset.value ? ' is-on' : ''}`}
                  disabled={isBusy}
                  title={sizePreset.hint}
                  onClick={() => applyOptions({ targetBytes: sizePreset.value })}
                >
                  {sizePreset.label}
                  <small>{sizePreset.hint}</small>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <ul className={`icd-list${isBusy ? ' is-busy' : ''}`} aria-busy={isBusy}>
          {results.map((result) => (
            <li key={result.original.name + result.original.size} className={result.skip ? 'is-skip' : ''}>
              <div className="icd-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.previewUrl} alt="" />
              </div>
              <div className="icd-info">
                <b title={result.original.name}>{result.original.name}</b>
                {result.skip ? (
                  <small>
                    {formatBytes(result.original.size)}
                    {result.width ? ` · ${result.width}×${result.height}` : ''} — {result.reason ?? 'giữ nguyên'}
                  </small>
                ) : (
                  <small>
                    <span>
                      {formatBytes(result.original.size)}
                      {result.width ? ` · ${result.width}×${result.height}` : ''}
                    </span>
                    <ArrowRight size={12} aria-hidden="true" />
                    <span className="icd-after">
                      {formatBytes(result.file.size)} · {result.outWidth}×{result.outHeight}
                      {result.file.type !== result.original.type ? ' · → JPG' : ''}
                    </span>
                  </small>
                )}
              </div>
              {!result.skip && (
                <span className="icd-badge">
                  −{Math.round(((result.original.size - result.file.size) / result.original.size) * 100)}%
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="icd-summary">
          {isBusy ? (
            <>
              <Loader2 className="icd-spin" size={14} /> Đang tính lại…
            </>
          ) : (
            <>
              Tổng: <b>{formatBytes(totalBefore)}</b> <ArrowRight size={12} aria-hidden="true" />{' '}
              <b className="icd-after">{formatBytes(totalAfter)}</b>
              {savedBytes > 0 ? ` — tiết kiệm ${formatBytes(savedBytes)} (${savedPercent}%)` : ' — không thay đổi'}
            </>
          )}
        </div>

        <div className="icd-actions">
          <button type="button" className="adm-btn" onClick={onCancel}>
            Hủy
          </button>
          <button
            type="button"
            className="adm-btn"
            onClick={onKeepOriginal}
            title="Tải ảnh gốc, không nén"
          >
            Giữ nguyên bản gốc
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={onConfirm}
            disabled={isBusy || hasNothingToCompress}
            autoFocus
          >
            Nén &amp; tải lên
          </button>
        </div>
      </div>
    </div>
  );
}
