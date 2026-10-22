"use client";

/**
 * Slider ảnh của section `steps` bố cục slider: tự chạy 5 giây / ảnh, mũi tên, chấm, vuốt; không có ảnh thì không render.
 * Dùng bởi: sections/steps/StepsChain.client.tsx (điều khiển qua currentIndex / onChange / isPaused, bỏ trống thì tự giữ trạng thái).
 * Lưu ý: dùng setTimeout (không phải setInterval) để mỗi lần đổi ảnh đếm lại từ đầu, bấm chọn bước xong không bị nhảy ảnh ngay.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { PHOTO_FRAME, SECTION_PHOTO } from "@/app/(site)/_components/ui";

export type StepsSlide = { src: string; alt?: string; caption?: string };

const ARROW_BUTTON =
  "absolute top-1/2 z-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold-300/55 bg-navy-900/60 text-gold-300 backdrop-blur-[4px] [transform:translateY(-50%)] [transition:background-color_200ms_var(--ease),transform_200ms_var(--ease),border-color_200ms_var(--ease)] hover:border-gold-300 hover:bg-navy-700 hover:[transform:translateY(-50%)_scale(1.08)] max-[640px]:h-9 max-[640px]:w-9 [&>svg]:h-5 [&>svg]:w-5 max-[640px]:[&>svg]:h-4 max-[640px]:[&>svg]:w-4";

export function StepsSlider({
  slides,
  currentIndex: controlledIndex,
  onChange,
  isPaused: isPausedOutside = false,
  id,
}: {
  slides?: StepsSlide[];
  id?: string;
  currentIndex?: number;
  onChange?: (index: number) => void;
  isPaused?: boolean;
}) {
  const slideList = slides ?? [];
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
  const currentIndex = controlledIndex ?? uncontrolledIndex;
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const isPaused = isPausedOutside || isHoverPaused;
  const swipeStartX = useRef<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      const nextIndex = ((index % slideList.length) + slideList.length) % slideList.length;
      setUncontrolledIndex(nextIndex);
      onChange?.(nextIndex);
    },
    [slideList.length, onChange],
  );

  useEffect(() => {
    if (isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goToSlide(currentIndex + 1), 5000);
    return () => clearTimeout(timer);
  }, [isPaused, currentIndex, goToSlide]);

  return (
    <div
      className={cn(
        PHOTO_FRAME,
        SECTION_PHOTO,
        "reveal touch-pan-y border-gold-300/40",
      )}
      id={id}
      onMouseEnter={() => setIsHoverPaused(true)}
      onMouseLeave={() => setIsHoverPaused(false)}
      onFocus={() => setIsHoverPaused(true)}
      onBlur={() => setIsHoverPaused(false)}
      onPointerDown={(e) => {
        swipeStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStartX.current === null) return;
        const deltaX = e.clientX - swipeStartX.current;
        if (Math.abs(deltaX) > 40) goToSlide(currentIndex + (deltaX < 0 ? 1 : -1));
        swipeStartX.current = null;
      }}
    >
      <div
        className="flex h-full [transition:transform_650ms_var(--ease)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slideList.map((slide) => (
          <figure
            className="relative m-0 h-full flex-[0_0_100%] overflow-hidden"
            key={slide.src}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="[-webkit-user-drag:none]"
              src={slide.src}
              alt={slide.alt ?? slide.caption ?? ""}
              loading="lazy"
              draggable={false}
            />
            {slide.caption ? (
              <figcaption className="absolute bottom-4 left-[1.1rem] z-3 rounded-full border border-gold-300/45 bg-navy-900/80 px-4 py-2 text-sm tracking-xs text-light backdrop-blur-[4px] max-[640px]:bottom-[0.8rem] max-[640px]:left-[0.8rem] max-[640px]:px-3 max-[640px]:py-1 max-[640px]:text-xs">
                {slide.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      <button
        type="button"
        className={cn(ARROW_BUTTON, "left-[0.9rem]")}
        aria-label="Previous slide"
        onClick={() => goToSlide(currentIndex - 1)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        className={cn(ARROW_BUTTON, "right-[0.9rem]")}
        aria-label="Next slide"
        onClick={() => goToSlide(currentIndex + 1)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        className="absolute right-[1.2rem] bottom-[1.1rem] z-4 flex gap-2 max-[640px]:right-[0.9rem] max-[640px]:bottom-[0.9rem]"
        aria-label="Slides"
      >
        {slideList.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={cn(
              "h-[9px] rounded-full border-none p-0 [transition:background-color_250ms_var(--ease),width_250ms_var(--ease)]",
              index === currentIndex
                ? "w-[22px] bg-gold-300"
                : "w-[9px] bg-light/40",
            )}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
