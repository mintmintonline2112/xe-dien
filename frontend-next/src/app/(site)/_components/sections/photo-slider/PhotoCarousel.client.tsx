"use client";

/**
 * Slider dải ảnh của section `photo-slider`: máy tính 3 ảnh, dưới 1080px 2 ảnh, điện thoại 1 ảnh; trượt từng ảnh, trượt vòng, không tự chạy (mũi tên, chấm, vuốt, ←/→).
 * Dùng bởi: sections/photo-slider/PhotoSlider.tsx.
 * Lưu ý: trượt vòng bằng cách chèn bản sao ảnh cuối vào đầu dải và ảnh đầu vào cuối; trượt vào bản sao xong thì nhảy (không hiệu ứng) về ảnh thật.
 * Số ảnh hiển thị khai 2 nơi phải khớp: `--per` trong CAROUSEL_FRAME (CSS) và PER_VIEW_BREAKPOINTS (JS). Ít ảnh hơn số hiển thị thì đứng yên, căn giữa.
 * Vùng clip nới mỗi bên 1rem (-mx-4 px-4, nhỏ hơn khe 1.5rem) để bóng hai mép không bị cắt mà ảnh kế bên vẫn ẩn.
 */
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { cn } from "@/utils/cn";
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";

export type CarouselPhoto = { src: string; caption?: string };

const PER_VIEW_BREAKPOINTS: Array<[query: string, perView: number]> = [
  ["(max-width: 640px)", 1],
  ["(max-width: 1080px)", 2],
];
const DEFAULT_PER_VIEW = 3;
const MAX_PER_VIEW = 3;
const SLIDE_MS = 550;
const STAGGER_MS = 70;

function subscribeToPerView(onChange: () => void) {
  const mediaQueries = PER_VIEW_BREAKPOINTS.map(([query]) => window.matchMedia(query));
  mediaQueries.forEach((mediaQuery) => mediaQuery.addEventListener("change", onChange));
  return () =>
    mediaQueries.forEach((mediaQuery) => mediaQuery.removeEventListener("change", onChange));
}
const getPerView = () =>
  PER_VIEW_BREAKPOINTS.find(([query]) => window.matchMedia(query).matches)?.[1] ??
  DEFAULT_PER_VIEW;

const wrapIndex = (value: number, length: number) => ((value % length) + length) % length;

const CAROUSEL_FRAME =
  "@container relative touch-pan-y [--gap:--spacing(6)] [--per:3] max-[1080px]:[--per:2] max-[640px]:[--per:1]";

const ARROW_BUTTON =
  "absolute top-[calc((100cqw_-_(var(--per)_-_1)_*_var(--gap))_/_var(--per)_*_3_/_8)] z-2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-paper/90 text-navy-700 shadow-badge backdrop-blur-sm transition-[background-color,border-color,color,scale] duration-200 ease-brand hover:scale-108 hover:border-navy-700 hover:bg-navy-700 hover:text-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 max-[640px]:size-9 [&>svg]:size-5 max-[640px]:[&>svg]:size-4";

export function PhotoCarousel({
  photos,
  label = "Photos",
  className,
}: {
  photos: CarouselPhoto[];
  label?: string;
  className?: string;
}) {
  const perView = useSyncExternalStore(
    subscribeToPerView,
    getPerView,
    () => DEFAULT_PER_VIEW,
  );
  const photoCount = photos.length;
  const canSlide = photoCount > 1 && photoCount >= perView;
  const cloneCount = canSlide ? Math.min(photoCount, MAX_PER_VIEW) : 0;
  const slides = canSlide
    ? [...photos.slice(photoCount - cloneCount), ...photos, ...photos.slice(0, cloneCount)]
    : photos;

  const [position, setPosition] = useState(cloneCount);
  const [isAnimated, setIsAnimated] = useState(true);
  const settleTimer = useRef<number | undefined>(undefined);
  const swipeStartX = useRef<number | null>(null);

  const currentIndex = canSlide ? wrapIndex(position - cloneCount, photoCount) : 0;
  const previousCloneCount = useRef(cloneCount);
  useEffect(() => {
    if (previousCloneCount.current === cloneCount) return;
    previousCloneCount.current = cloneCount;
    setIsAnimated(false);
    setPosition(cloneCount + currentIndex);
  }, [cloneCount, currentIndex]);

  useEffect(() => {
    if (isAnimated) return;
    const frameId = requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsAnimated(true)),
    );
    return () => cancelAnimationFrame(frameId);
  }, [isAnimated]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const moveTo = (target: number) => {
    if (!canSlide || settleTimer.current !== undefined) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const settledPosition = cloneCount + wrapIndex(target - cloneCount, photoCount);
    if (prefersReducedMotion) {
      setIsAnimated(false);
      setPosition(settledPosition);
      return;
    }
    setIsAnimated(true);
    setPosition(target);
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = undefined;
      if (settledPosition !== target) {
        setIsAnimated(false);
        setPosition(settledPosition);
      }
    }, SLIDE_MS + 30);
  };
  const stepBy = (direction: 1 | -1) => moveTo(position + direction);

  const visibleCount = Math.min(perView, photoCount);
  const liveText =
    visibleCount === 1
      ? `Photo ${currentIndex + 1} of ${photoCount}`
      : `Photos ${Array.from({ length: visibleCount }, (_, offset) => wrapIndex(currentIndex + offset, photoCount) + 1).join(", ")} of ${photoCount}`;

  return (
    <div
      className={cn(CAROUSEL_FRAME, "reveal", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        stepBy(e.key === "ArrowRight" ? 1 : -1);
      }}
      onPointerDown={(e) => {
        swipeStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStartX.current === null) return;
        const deltaX = e.clientX - swipeStartX.current;
        if (Math.abs(deltaX) > 40) stepBy(deltaX < 0 ? 1 : -1);
        swipeStartX.current = null;
      }}
    >
      <div className="-mx-4 overflow-x-clip px-4">
        <div
          className={cn(
            "reveal-group flex [transform:translateX(calc(var(--i)_*_-1_*_(100%_+_var(--gap))_/_var(--per)))] gap-(--gap) motion-reduce:transition-none",
            isAnimated
              ? "transition-transform duration-550 ease-brand"
              : "transition-none",
            !canSlide && "justify-center",
          )}
          style={{ "--i": canSlide ? position : 0 } as CSSProperties}
        >
          {slides.map((photo, slideIndex) => {
            const isShown = canSlide ? slideIndex >= position && slideIndex < position + perView : slideIndex < perView;
            const isClone = canSlide && (slideIndex < cloneCount || slideIndex >= cloneCount + photoCount);
            return (
              <figure
                className="m-0 min-w-0 flex-[0_0_calc((100%_-_(var(--per)_-_1)_*_var(--gap))_/_var(--per))]"
                key={`${isClone ? "clone-" : ""}${slideIndex}-${photo.src}`}
                style={
                  {
                    "--reveal-delay": `${isShown ? (slideIndex - (canSlide ? position : 0)) * STAGGER_MS : 0}ms`,
                  } as CSSProperties
                }
                aria-hidden={!isShown}
              >
                <div className={cn(PHOTO_FRAME, "aspect-4/3")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="[-webkit-user-drag:none]"
                    src={photo.src}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-3 text-center font-display text-base text-ink-faint italic">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </div>

      {canSlide ? (
        <>
          <button
            type="button"
            className={cn(
              ARROW_BUTTON,
              "left-0 -translate-x-1/2 max-[640px]:left-2 max-[640px]:translate-x-0",
            )}
            aria-label="Previous photo"
            onClick={() => stepBy(-1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className={cn(
              ARROW_BUTTON,
              "right-0 translate-x-1/2 max-[640px]:right-2 max-[640px]:translate-x-0",
            )}
            aria-label="Next photo"
            onClick={() => stepBy(1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-7 flex justify-center gap-2">
            {photos.map((photo, i) => (
              <button
                key={`${i}-${photo.src}`}
                type="button"
                className={cn(
                  "h-2.25 cursor-pointer rounded-full border-0 p-0 transition-[background-color,width] duration-250 ease-brand",
                  i === currentIndex
                    ? "w-5.5 bg-gold-500"
                    : "w-2.25 bg-navy-700/20 hover:bg-navy-700/40",
                )}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === currentIndex}
                onClick={() => moveTo(cloneCount + i)}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {liveText}
          </p>
        </>
      ) : null}
    </div>
  );
}
