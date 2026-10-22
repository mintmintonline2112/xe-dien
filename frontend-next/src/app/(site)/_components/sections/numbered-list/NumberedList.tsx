/**
 * Section `numbered-list`: chia đôi, trái là tiêu đề + giới thiệu + ghi chú + nút (đứng yên khi cuộn trên máy tính), phải là các mục đánh số 01, 02… chia 2 cột.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc subheading, heading, content, metadata.items [], note, ctaLabel, ctaHref — cùng dữ liệu với `checklist` nên đổi qua lại không phải nhập lại.
 */
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  Shell,
  anchorIdOf,
  toInlineHtml,
  formatOrdinal,
  textOf,
  textListOf,
  type SectionProps,
} from "../_shared";

export function NumberedList({ section }: SectionProps) {
  const numberedItems = textListOf(section, "items");
  const note = textOf(section, "note");

  return (
    <Shell
      id={anchorIdOf(section, "numbered-list")}
      tone="tint"
      containerClassName={cn(
        "grid items-start gap-[clamp(2.5rem,6vw,5.5rem)] max-[900px]:grid-cols-1",
        numberedItems.length > 0 && "grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]",
      )}
    >
      <div className="reveal min-[901px]:sticky min-[901px]:top-32">
        <Head section={section} align="left" />
        {note ? (
          <p
            className="mt-6 mb-0 font-display text-base text-ink-faint italic"
            dangerouslySetInnerHTML={{ __html: toInlineHtml(note) }}
          />
        ) : null}
        <Cta
          label={textOf(section, "ctaLabel")}
          href={textOf(section, "ctaHref")}
          style={{ marginTop: "1.5rem" }}
        />
      </div>

      {numberedItems.length > 0 ? (
        <ol
          data-stagger="60"
          className="reveal reveal-group m-0 grid list-none grid-cols-2 gap-x-8 p-0 max-[640px]:grid-cols-1"
        >
          {numberedItems.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-baseline gap-4 border-b border-line py-5 max-[640px]:first:border-t min-[641px]:nth-[-n+2]:border-t"
            >
              <span
                aria-hidden="true"
                className="w-9 shrink-0 font-display text-2xl leading-none font-semibold text-gold-500 tabular-nums"
              >
                {formatOrdinal(i)}
              </span>
              <span className="text-lg font-medium text-navy-900">{item}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </Shell>
  );
}
