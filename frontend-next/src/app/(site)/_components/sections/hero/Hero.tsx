/**
 * Section `hero` (khối đầu trang): bố cục `banner` (băng chuyền ảnh bo góc trong khung, HeroBanner.client.tsx), `slider` (ảnh nền tràn
 * màn hình chuyển slide, HeroSlides.client.tsx) hoặc `static` (tiêu đề lớn + giới thiệu + nút + số liệu, ảnh tràn mép phải).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer. CMS: subheading, heading, content, metadata.slides [{image,title,text,alt,label,href}],
 * stats, image, ctaLabel/ctaHref, cta2Label/cta2Href.
 * Lưu ý: không có slide thì rơi về bố cục static. Bố cục banner: nút của từng slide là slides[].label/href, trống thì dùng ctaLabel/ctaHref của khối.
 * h1 static mang `data-headline` (SiteEffects tách chữ); tia sét trôi dùng keyframes `floaty` (effects.css).
 * lint-sections-ignore R1: hero không dùng đệm chuẩn; bố cục banner / slider do client dựng cả <section> (HeroSlides.client.tsx cần bắt hover/focus trên cả khối để dừng tự chạy).
 * lint-sections-ignore R2: tiêu đề là h1 data-headline cỡ display + mô tả kiểu HERO_TEXT (khác đầu khối chuẩn của Head).
 */
import type { CSSProperties } from "react";
import { HeroBanner, type HeroBannerSlide } from "./HeroBanner.client";
import { HeroSlides, type HeroSlide } from "./HeroSlides.client";
import {
  Eyebrow,
  HERO_TEXT,
  NAVY_GRAIN,
  NAVY_PATTERN,
} from "@/app/(site)/_components/ui";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { cn } from "@/utils/cn";
import {
  Cta,
  StatsList,
  anchorIdOf,
  itemsOf,
  layoutOf,
  resolveImage,
  shouldShowEyebrow,
  textOf,
  toHtml,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["banner", "slider", "static"] as const;

const ACTIONS_ROW = "mt-9 flex flex-wrap gap-4";

const BOLT_GLYPH = <path d="M18 2 7 18h8l-2 12 12-17h-8z" strokeLinejoin="round" />;

function FloatGlyph({
  style,
  duration,
  delay,
  width,
}: {
  style: CSSProperties;
  duration: string;
  delay?: string;
  width: number;
}) {
  return (
    <svg
      style={
        {
          ...style,
          width,
          ["--float-dur" as string]: duration,
          ["--float-delay" as string]: delay,
        } as CSSProperties
      }
      className="absolute animate-[floaty_var(--float-dur,16s)_ease-in-out_var(--float-delay,0s)_infinite_alternate] text-gold-300 opacity-10 will-change-transform"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {BOLT_GLYPH}
    </svg>
  );
}

export function Hero({ section }: SectionProps) {
  const id = anchorIdOf(section, "hero");
  const stats = itemsOf(section, "stats");
  const actions = (
    <>
      <Cta
        label={textOf(section, "ctaLabel")}
        href={textOf(section, "ctaHref")}
        className="btn btn-gold"
      />
      <Cta
        label={textOf(section, "cta2Label")}
        href={textOf(section, "cta2Href")}
        className="btn btn-ghost"
      />
    </>
  );
  const hasActions = Boolean(
    textOf(section, "ctaLabel") || textOf(section, "cta2Label"),
  );

  const slides: HeroSlide[] = itemsOf(section, "slides")
    .filter((slide) => slide.image)
    .map((slide) => {
      const title = slide.title || section?.heading || "";
      const text = slide.text || section?.content || "";
      return {
        src: resolveImage(slide.image),
        alt: slide.alt || title,
        title,
        html: text ? sanitizeRichText(toHtml(text)) : "",
      };
    });

  const layout = layoutOf(section, LAYOUTS, "banner");

  if (layout === "banner" && slides.length > 0) {
    const bannerSlides: HeroBannerSlide[] = itemsOf(section, "slides")
      .filter((slide) => slide.image)
      .map((slide, slideIndex) => ({
        ...slides[slideIndex],
        ctaLabel: slide.label || textOf(section, "ctaLabel"),
        ctaHref: slide.href || textOf(section, "ctaHref"),
      }));
    return <HeroBanner id={id} slides={bannerSlides} label={section?.heading ?? undefined} />;
  }

  if (layout === "slider" && slides.length > 0) {
    return (
      <HeroSlides
        id={id}
        eyebrow={section?.subheading}
        showEyebrow={shouldShowEyebrow(section)}
        slides={slides}
        label={section?.heading ?? undefined}
      >
        {hasActions ? <div className={ACTIONS_ROW}>{actions}</div> : null}
        <StatsList stats={stats} className="reveal" />
      </HeroSlides>
    );
  }

  const image = textOf(section, "image");
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(120%_90%_at_85%_10%,color-mix(in_oklab,var(--navy-600)_55%,transparent)_0%,transparent_55%),linear-gradient(160deg,var(--navy-800)_0%,var(--navy-900)_78%)] text-light",
        NAVY_PATTERN,
        NAVY_GRAIN,
      )}
      id={id}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
        aria-hidden="true"
      >
        <FloatGlyph style={{ top: "14%", left: "5%" }} width={40} duration="15s" />
        <FloatGlyph
          style={{ top: "64%", left: "11%" }}
          width={26}
          duration="19s"
          delay="-6s"
        />
        <FloatGlyph
          style={{ top: "8%", right: "14%" }}
          width={30}
          duration="17s"
          delay="-3s"
        />
        <FloatGlyph
          style={{ top: "78%", right: "6%" }}
          width={44}
          duration="21s"
          delay="-10s"
        />
        <FloatGlyph
          style={{ top: "40%", left: "44%" }}
          width={20}
          duration="14s"
          delay="-8s"
        />
      </div>
      <div className="relative z-1 site-container grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-[clamp(2.5rem,6vw,5rem)] py-[clamp(4.5rem,9vw,7.5rem)] max-[900px]:grid-cols-1">
        <div data-stagger="90">
          {section?.subheading ? (
            <Eyebrow
              gold
              heading
              show={shouldShowEyebrow(section)}
              className="reveal"
            >
              {section.subheading}
            </Eyebrow>
          ) : null}
          {section?.heading ? (
            <h1
              data-headline
              className="reveal mb-[0.5em] text-display font-semibold text-light"
            >
              {section.heading}
            </h1>
          ) : null}
          {section?.content ? (
            <div
              className={cn(HERO_TEXT, "reveal")}
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(section.content),
              }}
            />
          ) : null}
          {hasActions ? (
            <div className={`${ACTIONS_ROW} reveal`}>{actions}</div>
          ) : null}
          <StatsList stats={stats} className="reveal" />
        </div>
      </div>

      {image ? (
        <figure
          className="reveal absolute inset-y-0 right-0 z-0 m-0 w-[min(55vw,1150px)] max-[900px]:relative max-[900px]:inset-auto max-[900px]:h-[300px] max-[900px]:w-full"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImage(image)}
            alt=""
            className="h-full w-full [mask-image:linear-gradient(to_right,transparent_0,#000_34%)] object-cover [-webkit-mask-image:linear-gradient(to_right,transparent_0,#000_34%)] max-[900px]:[mask-image:linear-gradient(to_bottom,transparent_0,#000_22%)] max-[900px]:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0,#000_22%)]"
          />
        </figure>
      ) : null}
    </section>
  );
}
