"use client";

/**
 * Slider ảnh + chuỗi ô bước bấm được của section `steps` bố cục slider: bấm ô N thì slider nhảy tới ảnh N, slider tự chạy thì ô tương ứng sáng lên.
 * Dùng bởi: sections/steps/Steps.tsx.
 * Lưu ý: ít ảnh hơn số bước thì các bước dư dùng ảnh cuối; không có ảnh thì chỉ còn chuỗi bước. id slider tạo bằng useId() để đặt section 2 lần không trùng.
 * Ô bước là con của `.reveal-group` nên transform/transition thuộc hiệu ứng hiện dần (effects.css), rê chuột chỉ đổi nền + viền.
 */
import { useCallback, useId, useState } from "react";
import { cn } from "@/utils/cn";
import { StepsSlider, type StepsSlide } from "./StepsSlider.client";

export type ChainStep = { title: string; text?: string };

const STEP_BUTTON =
  "relative w-full cursor-pointer appearance-none rounded-lg border px-4 pt-6 pb-5 text-center text-inherit [font:inherit] hover:border-gold-300/55 hover:bg-light/10 not-last:after:absolute not-last:after:top-1/2 not-last:after:-right-[0.95rem] not-last:after:z-1 not-last:after:text-lg not-last:after:text-gold-300 not-last:after:content-['→'] not-last:after:[transform:translateY(-50%)] max-[1080px]:nth-3:after:content-none max-[640px]:grid max-[640px]:grid-cols-[40px_1fr] max-[640px]:gap-x-4 max-[640px]:gap-y-1 max-[640px]:px-5 max-[640px]:py-5 max-[640px]:text-left max-[640px]:not-last:after:top-auto max-[640px]:not-last:after:right-auto max-[640px]:not-last:after:-bottom-[1.35rem] max-[640px]:not-last:after:left-[1.95rem] max-[640px]:not-last:after:content-['↓'] max-[640px]:not-last:after:[transform:none]";

export function StepsChain({
  slides,
  chain,
}: {
  slides?: StepsSlide[];
  chain: ChainStep[];
}) {
  const sliderSlides = slides ?? [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isChainHovered, setIsChainHovered] = useState(false);
  const sliderId = useId();

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
    setActiveStep(index);
  }, []);

  const selectStep = (step: number) => {
    setActiveStep(step);
    setCurrentSlide(Math.min(step, Math.max(0, sliderSlides.length - 1)));
  };

  return (
    <>
      {sliderSlides.length > 0 ? (
        <StepsSlider
          id={sliderId}
          slides={sliderSlides}
          currentIndex={currentSlide}
          onChange={handleSlideChange}
          isPaused={isChainHovered}
        />
      ) : null}

      {chain.length > 0 ? (
        <div
          data-stagger="70"
          className="reveal reveal-group relative mt-4 grid grid-cols-[repeat(var(--chain-cols,6),minmax(0,1fr))] gap-4 max-[1080px]:grid-cols-3 max-[1080px]:gap-x-4 max-[1080px]:gap-y-6 max-[640px]:grid-cols-1 max-[640px]:gap-6"
          style={
            { ["--chain-cols" as string]: chain.length } as React.CSSProperties
          }
          onMouseEnter={() => setIsChainHovered(true)}
          onMouseLeave={() => setIsChainHovered(false)}
        >
          {chain.map((step, index) => (
            <button
              key={step.title}
              type="button"
              className={cn(
                STEP_BUTTON,
                index === activeStep
                  ? "border-gold-400 bg-gold-300/15 shadow-lift ring-1 ring-gold-300/35"
                  : "border-light/15 bg-light/5",
              )}
              aria-current={index === activeStep ? "true" : undefined}
              aria-controls={sliderSlides.length > 0 ? sliderId : undefined}
              onClick={() => selectStep(index)}
            >
              <span
                className={cn(
                  "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border text-base font-semibold max-[640px]:[grid-row:span_2] max-[640px]:m-0",
                  index === activeStep
                    ? "border-gold-400 bg-gold-400 text-navy-900"
                    : "border-gold-300/50 text-gold-300",
                )}
              >
                {index + 1}
              </span>
              <h3
                className={cn(
                  "mb-1 font-main text-lg max-[640px]:m-0 max-[640px]:self-center",
                  index === activeStep ? "text-gold-300" : "text-light",
                )}
              >
                {step.title}
              </h3>
              {step.text ? (
                <p className="m-0 text-sm leading-normal text-light-soft">
                  {step.text}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
