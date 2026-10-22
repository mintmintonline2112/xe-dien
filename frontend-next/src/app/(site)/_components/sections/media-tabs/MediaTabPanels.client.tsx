"use client";

/**
 * Phần tương tác của section `media-tabs`: hàng tab gạch chân, dưới là ảnh trái + tiêu đề lớn, đoạn dẫn, mô tả, nút bên phải.
 * Dùng bởi: sections/media-tabs/MediaTabs.tsx.
 * Lưu ý: mọi panel đều có sẵn trong HTML (ẩn bằng `hidden`) để nội dung vẫn được index. Bàn phím theo chuẩn tab: ←/→ đổi tab,
 * Home/End về đầu/cuối; trên điện thoại hàng tab cuộn ngang và kéo tab đang chọn vào tầm nhìn.
 */
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/utils/cn";
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";

export type MediaTab = {
  title: string;
  heading: string;
  label?: string;
  short?: string;
  paragraphs: string[];
  image?: string;
  imagePosition?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const TAB_BUTTON =
  "relative flex-1 cursor-pointer border-0 bg-transparent px-5 pt-2 pb-4 text-center font-display text-base font-semibold whitespace-nowrap text-navy-700 transition-colors duration-200 ease-brand after:absolute after:inset-x-0 after:-bottom-px after:h-0.75 after:origin-center after:bg-gold-500 after:transition-transform after:duration-300 after:ease-brand after:content-[''] hover:text-navy-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500 aria-selected:text-gold-500 aria-[selected=false]:after:scale-x-0 max-[900px]:flex-none max-[640px]:px-4 max-[640px]:text-sm motion-reduce:after:transition-none";

const CTA_LINK =
  "group/cta mt-8 inline-flex items-stretch self-start border border-navy-700 text-navy-700 no-underline transition-colors duration-200 ease-brand hover:bg-navy-700 hover:text-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

export function MediaTabPanels({ tabs }: { tabs: MediaTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const selectTab = (index: number, shouldFocus = false) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    setActiveIndex(nextIndex);
    const tab = tabRefs.current[nextIndex];
    if (shouldFocus) tab?.focus();
    tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const targetIndexByKey: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in targetIndexByKey)) return;
    e.preventDefault();
    selectTab(targetIndexByKey[e.key], true);
  };

  return (
    <div className="reveal">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex [scrollbar-width:none] overflow-x-auto border-b border-line [&::-webkit-scrollbar]:hidden"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, i) => (
          <button
            key={`${tab.title}-${i}`}
            ref={(element) => {
              tabRefs.current[i] = element;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === activeIndex}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === activeIndex ? 0 : -1}
            className={TAB_BUTTON}
            onClick={() => selectTab(i)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={`${tab.title}-${i}`}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          tabIndex={0}
          hidden={i !== activeIndex}
          className="mt-[clamp(2.5rem,5vw,4rem)] grid animate-[hs-in_500ms_var(--ease)_both] grid-cols-2 items-stretch gap-[clamp(2rem,6vw,6rem)] focus-visible:outline-none motion-reduce:animate-none max-[900px]:grid-cols-1"
        >
          {tab.image ? (
            <figure className={cn(PHOTO_FRAME, "aspect-5/4 self-start")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tab.image}
                alt={tab.heading}
                loading={i === 0 ? undefined : "lazy"}
                style={
                  tab.imagePosition
                    ? { objectPosition: tab.imagePosition }
                    : undefined
                }
              />
            </figure>
          ) : null}

          <div
            className={cn(
              "flex min-w-0 flex-col",
              !tab.image && "col-span-full max-w-3xl",
            )}
          >
            {tab.label ? (
              <p className="m-0 mb-4 text-xs font-bold tracking-md text-ink-faint uppercase">
                {tab.label}
              </p>
            ) : null}
            <h3 className="m-0 text-h2 leading-tight font-bold text-navy-900 uppercase">
              {tab.heading}
            </h3>
            {tab.short ? (
              <p className="mt-6 mb-0 text-lg leading-relaxed font-semibold text-navy-800">
                {tab.short}
              </p>
            ) : null}

            <div
              className={cn(
                "pt-6",
                (tab.short || tab.ctaLabel) && "mt-auto pt-8 max-[900px]:pt-6",
              )}
            >
              {tab.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className="mt-0 mb-3 text-base leading-relaxed text-ink-soft last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
              {tab.ctaLabel ? (
                <a href={tab.ctaHref || "#tu-van"} className={CTA_LINK}>
                  <span className="px-6 py-3 text-sm font-semibold tracking-xs">
                    {tab.ctaLabel}
                  </span>
                  <span
                    className="flex w-12 items-center justify-center bg-navy-700 text-gold-300 transition-colors duration-200 ease-brand group-hover/cta:bg-gold-500 group-hover/cta:text-navy-900"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 transition-transform duration-200 ease-brand group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
