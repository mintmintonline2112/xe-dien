/**
 * Khối dựng sẵn cho mọi section: khung (Shell), đầu khối (Head), đầu khối kiểu cửa hàng (RowHead), đoạn intro, ghi chú + nút (Note, Cta), dải số liệu (StatsList).
 * Dùng bởi: mọi section qua _shared/index.ts (và sections/_template).
 * Lưu ý: Shell là <section> duy nhất của một section; Head lo quy tắc ẩn eyebrow toàn site, align="left" không bọc div
 * (cột chứa phải mang `reveal`). `.reveal` / `.reveal-group` thuộc layer effects (thắng class Tailwind): đừng đặt
 * opacity / transform / transition lên chính phần tử đó. RowHead = tiêu đề trái + link "xem tất cả" phải, gạch chân màu chủ đạo
 * (khối sản phẩm, danh mục, tin tức). StatsList đảo nhãn xuống dưới bằng `order-2` để giữ thứ tự đọc dt → dd.
 */
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  Eyebrow,
  SECTION,
  SECTION_DARK,
  SECTION_FLOW,
  SECTION_NOTE,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import type { PageSection } from "@/types/cms";
import { toInlineHtml, shouldShowEyebrow, textOf, type SectionTone } from "./data";

const INTRO_TEXT = "max-w-176 text-lg text-ink-soft [&_p:last-child]:mb-0";

export function RichIntro({
  html,
  className = INTRO_TEXT,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html?.trim()) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}

export function InlineNote({
  text,
  className,
  style,
}: {
  text: string | undefined;
  className: string;
  style?: CSSProperties;
}) {
  if (!text) return null;
  return (
    <p
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: toInlineHtml(text) }}
    />
  );
}

export function Head({
  section,
  light = false,
  intro = true,
  align = "center",
  level = 2,
  className,
}: {
  section?: PageSection | null;
  light?: boolean;
  intro?: boolean;
  align?: "center" | "left";
  level?: 1 | 2;
  className?: string;
}) {
  if (!section?.heading && !section?.subheading && !(intro && section?.content))
    return null;
  const isCentered = align === "center";
  const Heading = level === 1 ? "h1" : "h2";
  const accent = textOf(section, "headingAccent");
  const accentStart =
    accent && section?.heading ? section.heading.lastIndexOf(accent) : -1;
  const Wrapper = isCentered ? "div" : Fragment;
  const wrapperProps = isCentered
    ? {
        className: cn(
          "reveal mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-[54rem] text-center",
          className,
        ),
      }
    : {};
  return (
    <Wrapper {...wrapperProps}>
      {section?.subheading ? (
        <Eyebrow
          gold={light}
          center={isCentered}
          heading
          show={shouldShowEyebrow(section)}
        >
          {section.subheading}
        </Eyebrow>
      ) : null}
      {section?.heading ? (
        <Heading
          className={cn(
            level === 1 ? "text-h1" : "text-h2",
            light && "text-light",
          )}
        >
          {accentStart >= 0 && accent ? (
            <>
              {section.heading.slice(0, accentStart)}
              <span className="text-gold-500">{accent}</span>
              {section.heading.slice(accentStart + accent.length)}
            </>
          ) : (
            section.heading
          )}
        </Heading>
      ) : null}
      {intro ? (
        <RichIntro
          html={section?.content}
          className={cn(INTRO_TEXT, isCentered && "mx-auto", light && "text-light-soft")}
        />
      ) : null}
    </Wrapper>
  );
}

export function Shell({
  id,
  tone = "plain",
  flow,
  backdrop,
  bleed,
  className,
  containerClassName,
  children,
}: {
  id: string;
  tone?: SectionTone;
  flow?: boolean;
  backdrop?: ReactNode;
  bleed?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        SECTION,
        tone === "dark" && SECTION_DARK,
        tone === "tint" && SECTION_TINT,
        flow && SECTION_FLOW,
        backdrop && "relative isolate overflow-hidden",
        className,
      )}
      id={id}
    >
      {backdrop}
      {bleed ? (
        children
      ) : (
        <div className={cn("site-container", containerClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}

export function Cta({
  label,
  href,
  className = "btn btn-ghost-dark btn-sm",
  style,
  children,
}: {
  label: string | undefined;
  href: string | undefined;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  if (!label) return null;
  return (
    <a href={href || "#tu-van"} className={className} style={style}>
      {children}
      {label}
    </a>
  );
}

export function Note({
  text,
  cta,
  href,
  light = false,
  className,
}: {
  text?: string;
  cta?: string;
  href?: string;
  light?: boolean;
  className?: string;
}) {
  if (!text && !cta) return null;
  return (
    <p
      className={cn(
        SECTION_NOTE,
        "reveal",
        light && "text-light-soft",
        className,
      )}
    >
      {text ? (
        <span dangerouslySetInnerHTML={{ __html: toInlineHtml(text) }} />
      ) : null}
      {text && cta ? <br /> : null}
      <Cta
        label={cta}
        href={href}
        className={light ? "btn btn-gold btn-sm" : "btn btn-ghost-dark btn-sm"}
        style={light ? undefined : { marginTop: "1rem" }}
      />
    </p>
  );
}

export function RowHead({
  section,
  ctaLabel,
  ctaHref,
  light = false,
  className,
}: {
  section?: PageSection | null;
  ctaLabel?: string;
  ctaHref?: string;
  light?: boolean;
  className?: string;
}) {
  if (!section?.heading && !ctaLabel) return null;
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 pb-3 [&_h2]:mb-0 [&_h2]:text-h3",
        light ? "border-b-light/25" : "border-b-navy-700",
        className,
      )}
    >
      <div className="reveal min-w-0 [&>div]:mt-2 [&>div]:max-w-none [&>div]:text-base">
        <Head section={section} align="left" light={light} />
      </div>
      {ctaLabel ? (
        <a
          href={ctaHref || "#"}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap",
            light ? "text-gold-300 hover:text-light" : "text-navy-700 hover:text-navy-800",
          )}
        >
          {ctaLabel}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}

function StatValue({ value, band }: { value: string; band?: boolean }) {
  const count = /^\d/.test(value) ? Number.parseInt(value, 10) : undefined;
  const parts = value.split(/([′+])/).filter(Boolean);
  return (
    <dd
      className={cn(
        "m-0 mb-1 font-display text-h2 leading-none font-semibold",
        band ? "text-gold-500" : "text-gold-300",
      )}
      data-count={count}
    >
      {parts.map((part, index) =>
        part === "′" || part === "+" ? (
          <span className="text-[0.6em]" key={index}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </dd>
  );
}

export function StatsList({
  stats,
  band,
  className,
}: {
  stats: Array<Record<string, string>>;
  band?: boolean;
  className?: string;
}) {
  const rows = stats.filter((stat) => stat.label && stat.value);
  if (rows.length === 0) return null;
  return (
    <dl
      className={cn(
        "mt-13 mb-0 flex flex-wrap gap-[clamp(1.5rem,4vw,3.5rem)] border-t pt-8 max-[640px]:justify-between max-[640px]:gap-6",
        band ? "border-t-line" : "border-t-light/20",
        className,
      )}
    >
      {rows.map((stat) => (
        <div className="flex flex-col" key={stat.label}>
          <dt
            className={cn(
              "order-2 text-xs tracking-xl uppercase",
              band ? "text-ink-faint" : "text-light-soft",
            )}
          >
            {stat.label}
          </dt>
          <StatValue value={stat.value} band={band} />
        </div>
      ))}
    </dl>
  );
}
