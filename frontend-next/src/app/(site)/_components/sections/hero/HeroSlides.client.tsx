"use client";

/**
 * Phần tương tác của section `hero` bố cục slider: ảnh nền chuyển mờ dần, tiêu đề + mô tả đổi theo slide, dãy số slide bên phải có vạch tiến độ.
 * Dùng bởi: sections/hero/Hero.tsx (phần nút CTA + số liệu truyền vào qua children, render phía server).
 * Lưu ý: tự chạy mỗi `interval` ms, hẹn giờ lại từ đầu mỗi lần đổi slide; dừng khi rê chuột / focus bên trong / tab ẩn / giảm chuyển động.
 * `progressKey` đổi để vạch tiến độ chạy lại khớp bộ hẹn giờ. `html` của slide đã sanitize phía server.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Eyebrow, HERO_TEXT } from "@/app/(site)/_components/ui";

export type HeroSlide = {
  src: string;
  alt: string;
  title: string;
  html: string;
};

export function HeroSlides({
  id,
  eyebrow,
  showEyebrow = false,
  slides,
  interval = 6500,
  label,
  children,
}: {
  id: string;
  eyebrow?: string | null;
  showEyebrow?: boolean;
  slides: HeroSlide[];
  interval?: number;
  label?: string;
  children?: ReactNode;
}) {
  const slideCount = slides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => setPrefersReducedMotion(motionQuery.matches);
    const handleVisibilityChange = () => setIsTabHidden(document.hidden);
    handleMotionChange();
    handleVisibilityChange();
    motionQuery.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const goToSlide = useCallback(
    (index: number) => setCurrentIndex(((index % slideCount) + slideCount) % slideCount),
    [slideCount],
  );

  const isPaused = isHovered || isTabHidden || prefersReducedMotion;

  useEffect(() => {
    if (slideCount < 2 || isPaused) return;
    const timer = window.setTimeout(() => goToSlide(currentIndex + 1), interval);
    return () => window.clearTimeout(timer);
  }, [currentIndex, isPaused, slideCount, interval, goToSlide]);

  if (slideCount === 0) return null;
  const slide = slides[Math.min(currentIndex, slideCount - 1)];
  const progressKey = `${currentIndex}-${isPaused ? "paused" : "running"}`;

  return (
    <section
      className="relative isolate flex min-h-[clamp(580px,88vh,840px)] items-center overflow-hidden bg-navy-900 text-light before:absolute before:inset-0 before:-z-1 before:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--navy-900)_95%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_86%,transparent)_34%,color-mix(in_oklab,var(--navy-900)_45%,transparent)_64%,color-mix(in_oklab,var(--navy-900)_20%,transparent)_100%),linear-gradient(0deg,color-mix(in_oklab,var(--navy-900)_55%,transparent)_0%,transparent_30%)] before:content-[''] max-[900px]:min-h-0 max-[900px]:before:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-900)_60%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_92%,transparent)_55%)]"
      id={id}
      aria-roledescription="carousel"
      aria-label={label}
      style={
        { ["--hs-interval" as string]: `${interval}ms` } as React.CSSProperties
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setIsHovered(false);
      }}
    >
      <div className="absolute inset-0 -z-2" aria-hidden="true">
        {slides.map((item, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${item.src}-${index}`}
            src={item.src}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover [transition:opacity_1200ms_var(--ease),transform_7000ms_linear] motion-reduce:[transform:none] motion-reduce:transition-none",
              index === currentIndex
                ? "[transform:scale(1)] opacity-100"
                : "[transform:scale(1.08)] opacity-0",
            )}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="site-container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[clamp(2rem,6vw,5rem)] py-[clamp(5rem,10vw,7.5rem)] max-[900px]:grid-cols-[minmax(0,1fr)] max-[900px]:gap-8">
        <div className="max-w-[41rem]">
          {eyebrow ? (
            <Eyebrow gold heading show={showEyebrow}>
              {eyebrow}
            </Eyebrow>
          ) : null}
          <div
            className="animate-[hs-in_800ms_var(--ease)_both] motion-reduce:animate-none"
            key={currentIndex}
            aria-live={isPaused ? "polite" : "off"}
          >
            <h1 className="mb-[0.5em] text-display font-semibold text-light">
              {slide.title}
            </h1>
            {slide.html ? (
              <div
                className={cn(HERO_TEXT, "max-w-[37rem]")}
                dangerouslySetInnerHTML={{ __html: slide.html }}
              />
            ) : null}
          </div>
          {children}
        </div>

        {slideCount > 1 ? (
          <div
            className="flex flex-col items-end gap-1 max-[900px]:mt-7 max-[900px]:flex-row max-[900px]:items-center max-[900px]:justify-center max-[900px]:gap-5"
            role="group"
            aria-label="Chọn slide"
          >
            {slides.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-4 border-0 bg-transparent px-0 py-1 font-display text-base font-semibold tracking-sm transition-[color] duration-250 ease-brand",
                  index === currentIndex
                    ? "text-gold-300"
                    : "text-light-soft hover:text-light",
                )}
                aria-label={`Slide ${index + 1}/${slideCount}: ${item.title}`}
                aria-current={index === currentIndex ? "true" : undefined}
                onClick={() => goToSlide(index)}
              >
                <span
                  className={cn(
                    "relative h-[2px] w-[34px] overflow-hidden bg-light/25 transition-[width] duration-350 ease-brand max-[900px]:w-[20px]",
                    index === currentIndex &&
                      "w-[76px] after:absolute after:inset-0 after:origin-left after:animate-[hs-progress_var(--hs-interval,6500ms)_linear_forwards] after:bg-gold-400 after:content-[''] max-[900px]:w-[44px]",
                    index === currentIndex &&
                      isPaused &&
                      "after:[transform:scaleX(1)] after:animate-none after:opacity-55",
                  )}
                  key={index === currentIndex ? progressKey : "idle"}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "transition-[font-size] duration-300 ease-brand",
                    index === currentIndex && "text-3xl max-[900px]:text-xl",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
            <p
              className="mt-4 mb-0 text-xs tracking-2xl text-light-soft max-[900px]:hidden"
              aria-hidden="true"
            >
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(slideCount).padStart(2, "0")}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
