'use client';

/**
 * Chọn điểm lấy nét của ảnh (CSS object-position) bằng cách bấm / kéo lên ảnh gốc, kèm khung xem trước ảnh bị cắt ra sao.
 * Dùng bởi: MetadataEditor.tsx (field ảnh có positionKey), pages/_components/HeroImageField.tsx.
 * Lưu ý: website cắt ảnh theo khung (object-fit: cover), điểm lấy nét luôn nằm trong phần giữ lại. Giá trị lưu dạng "x% y%"
 * (VD "50% 62%"), rỗng = giữa ảnh; đọc được cả từ khoá ("center 62%", "top left"). Bàn phím: ←/→/↑/↓ dời 1%, Shift dời 10%.
 * FocalPreview = kích thước (px) mô phỏng tỉ lệ khung ảnh ngoài website.
 */

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

type Point = { x: number; y: number };

const KEYWORD_PERCENT: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };

export function parseObjectPosition(value: string | undefined): Point {
  const parts = (value ?? '').trim().split(/\s+/).filter(Boolean);
  const readAxisPercent = (part: string | undefined) => {
    if (!part) return 50;
    if (part in KEYWORD_PERCENT) return KEYWORD_PERCENT[part];
    const percent = Number.parseFloat(part);
    return part.endsWith('%') && Number.isFinite(percent) ? percent : 50;
  };
  const isVerticalKeywordFirst = parts[0] === 'top' || parts[0] === 'bottom';
  if (isVerticalKeywordFirst) return { x: readAxisPercent(parts[1]), y: readAxisPercent(parts[0]) };
  return { x: readAxisPercent(parts[0]), y: readAxisPercent(parts[1]) };
}

const clampPercent = (value: number) => Math.round(Math.min(100, Math.max(0, value)));

export type FocalPreview = { label: string; width: number; height: number };

const DEFAULT_PREVIEWS: FocalPreview[] = [
  { label: 'Khung dọc (máy tính)', width: 96, height: 164 },
  { label: 'Khung ngang (điện thoại)', width: 176, height: 99 },
];

export function FocalPointPicker({
  url,
  value,
  onChange,
  previews = DEFAULT_PREVIEWS,
}: {
  url: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  previews?: FocalPreview[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { x, y } = parseObjectPosition(value);
  const position = `${x}% ${y}%`;

  const updatePoint = (point: Point) => {
    const next = { x: clampPercent(point.x), y: clampPercent(point.y) };
    onChange(next.x === 50 && next.y === 50 ? undefined : `${next.x}% ${next.y}%`);
  };

  const updatePointFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const stageRect = stageRef.current?.getBoundingClientRect();
    if (!stageRect) return;
    updatePoint({ x: ((e.clientX - stageRect.left) / stageRect.width) * 100, y: ((e.clientY - stageRect.top) / stageRect.height) * 100 });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 10 : 1;
    const nextPointByKey: Record<string, Point> = {
      ArrowLeft: { x: x - step, y },
      ArrowRight: { x: x + step, y },
      ArrowUp: { x, y: y - step },
      ArrowDown: { x, y: y + step },
    };
    if (!(e.key in nextPointByKey)) return;
    e.preventDefault();
    updatePoint(nextPointByKey[e.key]);
  };

  return (
    <div className="me-focal">
      <div className="me-focal-main">
        <div
          ref={stageRef}
          className="me-focal-stage"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            updatePointFromPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) updatePointFromPointer(e);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" draggable={false} />
          <button
            type="button"
            className="me-focal-dot"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`Điểm lấy nét ${x}% ngang, ${y}% dọc — dùng phím mũi tên để dời`}
            onKeyDown={handleKeyDown}
          />
        </div>
        <p className="gf-hint">
          Bấm hoặc kéo lên ảnh để chọn phần cần giữ khi ảnh bị cắt vừa khung. Đang chọn: <strong>{position}</strong>
          {value ? (
            <>
              {' · '}
              <button type="button" className="me-focal-reset" onClick={() => onChange(undefined)}>
                Về giữa ảnh
              </button>
            </>
          ) : null}
        </p>
      </div>

      <div className="me-focal-previews" aria-hidden="true">
        {previews.map((preview) => (
          <figure key={preview.label}>
            <div className="me-focal-frame" style={{ width: preview.width, height: preview.height }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" style={{ objectPosition: position }} />
            </div>
            <figcaption>{preview.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
