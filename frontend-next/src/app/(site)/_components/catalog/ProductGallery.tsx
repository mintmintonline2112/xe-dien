"use client";

/**
 * Bộ ảnh trang chi tiết sản phẩm: ảnh lớn vuông (mũi tên chuyển ảnh, nhãn % giảm) + hàng ảnh nhỏ bấm để chọn.
 * Dùng bởi: app/(site)/san-pham/[slug]/page.tsx.
 * Lưu ý: nhận URL ảnh đã resolve sẵn ở server; nhãn trợ năng của nút là prop có mặc định tiếng Việt vì không hiện ra màn hình.
 */
import { useState } from "react";
import { cn } from "@/utils/cn";

const ARROW_BUTTON =
  "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-0 bg-paper/90 text-ink shadow-badge hover:bg-paper";

export function ProductGallery({
  images,
  title,
  discountLabel,
  previousLabel = "Ảnh trước",
  nextLabel = "Ảnh sau",
}: {
  images: string[];
  title: string;
  discountLabel?: string | null;
  previousLabel?: string;
  nextLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageCount = images.length;
  const showImage = (index: number) => setActiveIndex(((index % imageCount) + imageCount) % imageCount);

  if (imageCount === 0) {
    return <div className="aspect-square rounded-lg border border-line bg-cream" aria-hidden="true" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`${title} — ảnh ${activeIndex + 1}`}
          className="h-full w-full animate-[hs-in_400ms_var(--ease)_both] object-cover motion-reduce:animate-none"
          fetchPriority="high"
        />
        {discountLabel ? (
          <span className="absolute top-3 left-3 rounded-full bg-sale px-3 py-1 text-sm font-bold text-light shadow-badge">
            {discountLabel}
          </span>
        ) : null}
        {imageCount > 1 ? (
          <>
            <button type="button" className={cn(ARROW_BUTTON, "left-3")} aria-label={previousLabel} onClick={() => showImage(activeIndex - 1)}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 5.5 8 12l6.5 6.5" />
              </svg>
            </button>
            <button type="button" className={cn(ARROW_BUTTON, "right-3")} aria-label={nextLabel} onClick={() => showImage(activeIndex + 1)}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
              </svg>
            </button>
          </>
        ) : null}
      </div>
      {imageCount > 1 ? (
        <ul className="m-0 grid list-none grid-cols-5 gap-2 p-0 max-[640px]:grid-cols-4">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                className={cn(
                  "block aspect-square w-full overflow-hidden rounded-md border-2 bg-paper p-0 transition-[border-color] duration-200 ease-brand",
                  index === activeIndex ? "border-navy-700" : "border-line hover:border-navy-600",
                )}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
