/**
 * Section `steps` (quy trình làm việc): bố cục `slider` (nền màu chủ đạo, slider ảnh tự chạy + chuỗi ô bước bấm được, bước N ↔ ảnh N) hoặc `circles` (bước trong vòng tròn nối bằng đường cong nét đứt).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title,text}], slides [{image,caption,alt}] + ctaLabel/ctaHref (slider), backdropImage (circles).
 * STEP_ICONS theo thứ tự: chọn / gửi yêu cầu, tìm & kiểm tra, duyệt hồ sơ, ký xác nhận, nhận xe (lặp vòng nếu nhiều bước hơn). `--ps-count` là inline style vì số bước do CMS quyết định.
 */
import type { CSSProperties, ReactNode } from "react";
import { StepsChain } from "./StepsChain.client";
import { type StepsSlide } from "./StepsSlider.client";
import {
  Head,
  Note,
  Shell,
  anchorIdOf,
  itemsOf,
  layoutOf,
  formatOrdinal,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["slider", "circles"] as const;

const STEP_ICONS: ReactNode[] = [
  <>
    <rect key="a" x="8" y="6" width="24" height="30" rx="2.5" />
    <path key="b" d="M15 6V4.5A1.5 1.5 0 0 1 16.5 3h7A1.5 1.5 0 0 1 25 4.5V6" />
    <path key="c" d="M14 16h12M14 22h12M14 28h7" />
  </>,
  <>
    <circle key="a" cx="17" cy="17" r="11" />
    <path key="b" d="m25 25 10 10" />
    <path key="c" d="m12.5 17 3 3 6-6.5" />
  </>,
  <>
    <path
      key="a"
      d="M10 4h14l8 8v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
    />
    <path key="b" d="M24 4v8h8" />
    <path key="c" d="m14 25 4 4 8-9" />
  </>,
  <>
    <path key="a" d="M6 35h28" />
    <path key="b" d="M10 29 26 13l4 4-16 16h-4v-4z" />
    <path key="c" d="m22 17 4 4" />
  </>,
  <>
    <circle key="a" cx="10" cy="29" r="5" />
    <circle key="b" cx="30" cy="29" r="5" />
    <path key="c" d="M15 29h10l-3.5-14H26M21.5 15h-5M8 21.5h13M4.5 24c1-3.5 3.6-5.5 7.5-5.5h5M24.5 9h4l1.5 3" />
  </>,
];

export function Steps({ section }: SectionProps) {
  const id = anchorIdOf(section, "steps");
  const steps = itemsOf(section, "items")
    .filter((step) => step.title)
    .map((step) => ({ title: step.title, text: step.text }));

  if (layoutOf(section, LAYOUTS, "slider") === "circles") {
    const backdropImage = textOf(section, "backdropImage");
    return (
      <Shell
        id={id}
        className="border-y border-line-soft bg-cream-2"
        backdrop={
          backdropImage ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[3%] inset-y-[6%] bg-contain bg-center bg-no-repeat opacity-[0.07]"
              style={{ backgroundImage: `url(${resolveImage(backdropImage)})` }}
            />
          ) : undefined
        }
        containerClassName="relative"
      >
        <Head section={section} />
        {steps.length > 0 ? (
          <ol
            data-stagger="70"
            className="reveal reveal-group mt-[clamp(0.5rem,2vw,1.5rem)] grid grid-cols-[repeat(var(--ps-count,5),minmax(0,1fr))] gap-x-[var(--ps-gap)] gap-y-11 [--ps-gap:clamp(1rem,2.4vw,2rem)] [--ps-size:132px] max-[1080px]:grid-cols-3 max-[1080px]:[--ps-size:116px] max-[640px]:grid-cols-1 max-[640px]:gap-10"
            style={{ ["--ps-count" as string]: steps.length } as CSSProperties}
          >
            {steps.map((step, index) => (
              <li
                className="group relative text-center"
                key={`${step.title}-${index}`}
              >
                <div className="relative z-1 mx-auto mb-6 h-[var(--ps-size)] w-[var(--ps-size)] rounded-full bg-paper shadow-float">
                  <span
                    className="absolute inset-[11px] grid place-items-center rounded-full border border-dashed border-navy-600 text-navy-700 transition-[background-color,color,border-color] duration-300 ease-brand group-hover:border-gold-400 group-hover:bg-navy-700 group-hover:text-gold-300"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 40 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[46px] w-[46px]"
                    >
                      {STEP_ICONS[index % STEP_ICONS.length]}
                    </svg>
                  </span>
                  <span
                    className="absolute top-[2px] -right-[4px] grid h-10 w-10 place-items-center rounded-full border-[3px] border-cream-2 bg-navy-700 font-display text-sm font-bold text-gold-300"
                    aria-hidden="true"
                  >
                    {formatOrdinal(index)}
                  </span>
                </div>
                {index < steps.length - 1 ? (
                  <svg
                    className="pointer-events-none absolute top-[calc(var(--ps-size)/2_-_22px)] left-[calc(50%_+_var(--ps-size)/2)] h-[44px] w-[calc(100%_+_var(--ps-gap)_-_var(--ps-size))] animate-[ps-dash_1.8s_linear_infinite] overflow-visible fill-none stroke-navy-600 stroke-[1.5] [stroke-dasharray:4_5] motion-reduce:animate-none max-[1080px]:hidden"
                    viewBox="0 0 100 44"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d={
                        index % 2 === 0
                          ? "M0 22 C 30 46, 70 46, 100 22"
                          : "M0 22 C 30 -2, 70 -2, 100 22"
                      }
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                ) : null}
                <h3 className="mb-2 text-xl text-ink">{step.title}</h3>
                {step.text ? (
                  <p className="mx-auto my-0 max-w-[16rem] text-base leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}
      </Shell>
    );
  }

  const slides: StepsSlide[] = itemsOf(section, "slides")
    .filter((slide) => slide.image)
    .map((slide) => ({
      src: resolveImage(slide.image),
      caption: slide.caption,
      alt: slide.alt,
    }));
  const ctaLabel = textOf(section, "ctaLabel");

  return (
    <Shell id={id} tone="dark">
      <Head section={section} light />
      {steps.length > 0 || slides.length > 0 ? (
        <StepsChain slides={slides} chain={steps} />
      ) : null}
      <Note light cta={ctaLabel} href={textOf(section, "ctaHref")} />
    </Shell>
  );
}
