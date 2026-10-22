/**
 * Section `checklist`: lưới các mục có dấu tick (VD thông tin nên gửi khi yêu cầu báo giá), dưới là ghi chú (có thể chứa link) + nút.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [], note, ctaLabel, ctaHref (cùng dữ liệu với `numbered-list`).
 */
import {
  Head,
  Note,
  Shell,
  anchorIdOf,
  textOf,
  textListOf,
  type SectionProps,
} from "../_shared";

export function Checklist({ section }: SectionProps) {
  const checklistItems = textListOf(section, "items");

  return (
    <Shell id={anchorIdOf(section, "checklist")} tone="tint">
      <Head section={section} />

      {checklistItems.length > 0 ? (
        <ul
          data-stagger="70"
          className="reveal reveal-group grid grid-cols-4 gap-4 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
        >
          {checklistItems.map((item) => (
            <li
              className="flex flex-wrap items-center gap-3 rounded border border-line bg-paper px-5 py-4 text-base hover:-translate-y-0.5 hover:border-gold-400"
              key={item}
            >
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-xs font-bold text-navy-700"
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <Note
        text={textOf(section, "note")}
        cta={textOf(section, "ctaLabel")}
        href={textOf(section, "ctaHref")}
      />
    </Shell>
  );
}
