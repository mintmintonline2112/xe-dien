"use client";

/**
 * Phần tương tác của section `hero` bố cục banner: băng chuyền ảnh bo góc trong khung nội dung, chữ + nút phủ bên trái, mũi tên và chấm chọn slide.
 * Dùng bởi: sections/hero/Hero.tsx.
 * Lưu ý: tự chạy mỗi `interval` ms; dừng khi rê chuột / focus bên trong / tab ẩn / giảm chuyển động. Nhãn trợ năng của nút
 * (previousLabel, nextLabel, slideLabel) là prop có mặc định tiếng Việt vì không hiện ra màn hình. `html` đã sanitize phía server.
 * Tiêu đề slide là <p> (nhiều slide); h1 của trang là `label` (heading của section) ẩn bằng sr-only.
 */
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/utils/cn";

export type HeroBannerSlide = {
  src: string;
  alt: string;
  title: string;
  html: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const ARROW_BUTTON =
  "absolute top-1/2 z-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-0 bg-light/85 text-ink shadow-badge transition-[background-color,opacity] duration-200 ease-brand hover:bg-light max-[640px]:hidden";

export function HeroBanner({
  id,
  slides,
  label,
  interval = 5500,
  previousLabel = "Slide trước",
  nextLabel = "Slide sau",
  slideLabel = "Chuyển tới slide",
}: {
  id: string;
  slides: HeroBannerSlide[];
  label?: string;
  interval?: number;
  previousLabel?: string;
  nextLabel?: string;
  slideLabel?: string;
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

  return (
    <section className="pt-5 pb-1 max-[640px]:pt-3" id={id} aria-roledescription="carousel" aria-label={label}>
      {label ? <h1 className="sr-only">{label}</h1> : null}
      <div
        className="site-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsHovered(false);
        }}
      >
        <div className="relative isolate aspect-[1240/470] overflow-hidden rounded-lg bg-navy-900 shadow-lift max-[900px]:aspect-[16/10] max-[640px]:aspect-[4/5]">
          {slides.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-brand motion-reduce:transition-none",
                index === currentIndex ? "z-1 opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={index !== currentIndex}
              role="group"
              aria-roledescription="slide"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="absolute inset-0 -z-2 h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-1 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--navy-900)_88%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_55%,transparent)_45%,transparent_75%)] max-[640px]:bg-[linear-gradient(0deg,color-mix(in_oklab,var(--navy-900)_92%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_60%,transparent)_50%,transparent_80%)]"
              />
              <div className="flex h-full max-w-[34rem] flex-col justify-center gap-4 px-[clamp(1.5rem,5vw,3.5rem)] text-light max-[640px]:justify-end max-[640px]:pb-14">
                <p className="m-0 font-display text-display leading-[1.08] font-extrabold text-balance">{slide.title}</p>
                {slide.html ? (
                  <div
                    className="text-base text-light-soft max-[640px]:text-sm [&_p]:m-0 [&_p+p]:mt-2"
                    dangerouslySetInnerHTML={{ __html: slide.html }}
                  />
                ) : null}
                {slide.ctaLabel ? (
                  <a href={slide.ctaHref || "#tu-van"} className="btn btn-gold mt-2 self-start" tabIndex={index === currentIndex ? 0 : -1}>
                    {slide.ctaLabel}
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          {slideCount > 1 ? (
            <>
              <button type="button" className={cn(ARROW_BUTTON, "left-4")} aria-label={previousLabel} onClick={() => goToSlide(currentIndex - 1)}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 5.5 8 12l6.5 6.5" />
                </svg>
              </button>
              <button type="button" className={cn(ARROW_BUTTON, "right-4")} aria-label={nextLabel} onClick={() => goToSlide(currentIndex + 1)}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
                </svg>
              </button>
              <div className="absolute inset-x-0 bottom-4 z-2 flex justify-center gap-2" role="group">
                {slides.map((slide, index) => (
                  <button
                    key={`dot-${slide.src}-${index}`}
                    type="button"
                    className={cn(
                      "h-2.5 rounded-full border-0 p-0 transition-[width,background-color] duration-300 ease-brand",
                      index === currentIndex ? "w-8 bg-gold-400" : "w-2.5 bg-light/60 hover:bg-light",
                    )}
                    aria-label={`${slideLabel} ${index + 1}: ${slide.title}`}
                    aria-current={index === currentIndex ? "true" : undefined}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
