/**
 * Section `faq`: accordion câu hỏi bằng <details> gốc (không JavaScript); bố cục `columns` (thẻ trắng, 2 cột hoặc theo nhóm) hoặc `split` (accordion + ảnh lớn).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc subheading, heading, content, metadata.items [{question,answer,group}], headingAccent, image / imageAlt /
 * imageSide ('left') / note (split). Có tên nhóm thì mỗi nhóm một cột, không thì chia đều 2 cột. `open:` / `group-open:` bám <details open>.
 */
import { cn } from "@/utils/cn";
import {
  Head,
  Shell,
  anchorIdOf,
  itemsOf,
  layoutOf,
  splitParagraphs,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["columns", "split"] as const;

type FaqItem = { question: string; answer: string; group?: string };
type FaqColumn = { title?: string; items: FaqItem[] };

function groupIntoColumns(faqItems: FaqItem[]): FaqColumn[] {
  if (faqItems.some((item) => item.group)) {
    const columns: FaqColumn[] = [];
    for (const item of faqItems) {
      const title = item.group ?? "";
      let column = columns.find((entry) => (entry.title ?? "") === title);
      if (!column) {
        column = { title: title || undefined, items: [] };
        columns.push(column);
      }
      column.items.push(item);
    }
    return columns;
  }
  const half = Math.ceil(faqItems.length / 2);
  return [{ items: faqItems.slice(0, half) }, { items: faqItems.slice(half) }].filter(
    (column) => column.items.length > 0,
  );
}

const Answer = ({ text, className }: { text: string; className: string }) =>
  text ? (
    <div className={cn(className, "[&_p]:mb-[0.7em] [&_p:last-child]:mb-0")}>
      {splitParagraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  ) : null;

export function Faq({ section }: SectionProps) {
  const id = anchorIdOf(section, "faq");
  const faqItems: FaqItem[] = itemsOf(section, "items")
    .filter((item) => item.question)
    .map((item) => ({
      question: item.question,
      answer: item.answer ?? "",
      group: item.group,
    }));

  if (layoutOf(section, LAYOUTS, "columns") === "split") {
    const image = textOf(section, "image");
    const isImageLeft = textOf(section, "imageSide")?.toLowerCase() === "left";
    const note = textOf(section, "note");
    return (
      <Shell
        id={id}
        className="bg-cream-2"
        containerClassName="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-stretch gap-[clamp(2.25rem,5vw,4.5rem)] max-[900px]:grid-cols-1"
      >
        <div
          className={cn(
            "reveal flex flex-col py-[clamp(0.5rem,2vw,1.75rem)]",
            isImageLeft && "order-2",
          )}
        >
          <Head section={section} align="left" />

          {faqItems.length > 0 ? (
            <div className="mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-col gap-3">
              {faqItems.map((item) => (
                <details
                  className="group rounded-2xl bg-paper shadow-soft transition-[box-shadow,transform] duration-[240ms] ease-brand open:shadow-lift hover:-translate-y-px"
                  key={item.question}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 font-display text-base font-bold text-navy-900 transition-colors duration-200 ease-brand marker:content-none hover:text-navy-600 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold-500 max-[640px]:gap-4 max-[640px]:px-5 max-[640px]:py-4">
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="relative h-[18px] w-[18px] shrink-0 text-navy-700 transition-colors duration-[220ms] ease-brand group-open:text-gold-500 before:absolute before:top-1/2 before:left-0 before:h-[2px] before:w-full before:-translate-y-1/2 before:rounded-xs before:bg-current before:transition-[transform,opacity] before:duration-[250ms] before:ease-brand before:content-[''] after:absolute after:top-0 after:left-1/2 after:h-full after:w-[2px] after:-translate-x-1/2 after:rounded-xs after:bg-current after:transition-[transform,opacity] after:duration-[200ms] after:ease-brand after:content-[''] group-open:after:scale-y-0 group-open:after:opacity-0"
                    />
                  </summary>
                  <Answer
                    text={item.answer}
                    className="animate-[faq-in_300ms_var(--ease)_both] px-6 pb-5 text-base leading-relaxed text-ink-soft motion-reduce:animate-none max-[640px]:px-5 max-[640px]:pb-5"
                  />
                </details>
              ))}
            </div>
          ) : null}

          {note ? (
            <p className="mt-auto border-t border-line pt-4 text-xs leading-relaxed text-ink-faint max-[900px]:mt-7">
              {note}
            </p>
          ) : null}
        </div>

        {image ? (
          <figure className="reveal m-0 h-full min-h-[clamp(360px,44vw,620px)] overflow-hidden rounded-3xl bg-navy-800 shadow-soft max-[900px]:min-h-[320px] max-[640px]:min-h-[260px] max-[640px]:rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImage(image)}
              alt={textOf(section, "imageAlt") ?? section?.heading ?? ""}
              loading="lazy"
              className="block h-full min-h-[inherit] w-full object-cover"
            />
          </figure>
        ) : null}
      </Shell>
    );
  }

  const columns = groupIntoColumns(faqItems);
  return (
    <Shell id={id} tone="tint">
      <Head section={section} />

      {columns.length > 0 ? (
        <div className="grid grid-cols-2 items-start gap-x-[clamp(1.5rem,3vw,2rem)] gap-y-6 max-[900px]:grid-cols-1">
          {columns.map((column, columnIndex) => (
            <div
              className="reveal flex flex-col gap-3"
              key={column.title ?? columnIndex}
            >
              {column.title ? (
                <h3 className="mb-4 text-2xl text-ink">{column.title}</h3>
              ) : null}
              {column.items.map((item) => (
                <details
                  className="group rounded-lg border border-l-[3px] border-line-soft border-l-navy-700 bg-paper shadow-soft transition-[border-color,box-shadow] duration-250 ease-brand open:border-l-gold-400 open:shadow-soft"
                  key={item.question}
                >
                  <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-5 px-6 py-4 font-display text-lg font-semibold text-ink transition-colors duration-200 ease-brand marker:content-none hover:text-navy-600 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 max-[640px]:gap-4 max-[640px]:px-4 max-[640px]:py-4">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center text-navy-700 transition-[transform,color] duration-300 ease-brand group-open:rotate-45 group-open:text-gold-500"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        className="h-[18px] w-[18px]"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <span>{item.question}</span>
                  </summary>
                  <Answer
                    text={item.answer}
                    className="animate-[faq-in_300ms_var(--ease)_both] py-0 pr-6 pb-5 pl-[calc(1.5rem+28px+1.25rem)] text-base leading-relaxed text-ink-soft motion-reduce:animate-none max-[640px]:px-4"
                  />
                </details>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}
