/**
 * Section `marquee`: tiêu đề nhỏ + dải thẻ tên (tag) chạy ngang vô hạn, đủ mục thì 2 dòng chạy ngược chiều, dưới là câu ghi chú; không có mục thì không render.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer. CMS: heading, content, metadata.items [].
 * Lưu ý: mỗi dòng nhân 4 bản nội dung để vòng lặp liền mạch, rê chuột thì dừng; py riêng trong className đè đệm chuẩn của Shell.
 * Keyframe marquee-* (styles/effects.css) lùi thêm nửa khoảng cách giữa các bản (gap-3 → 0.375rem): đổi gap thì sửa cả hai chỗ.
 * lint-sections-ignore R2: heading của dải này CHÍNH LÀ một dòng eyebrow căn giữa (không có h2), nên không dùng Head.
 */
import { Eyebrow } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Shell,
  anchorIdOf,
  toInlineHtml,
  textListOf,
  type SectionProps,
} from "../_shared";

const EDGE_FADE =
  "[-webkit-mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]";

const NAME_TAG =
  "inline-flex items-center gap-2.5 rounded-full border border-navy-100 bg-navy-50 px-5 py-2.5 text-base font-semibold tracking-md whitespace-nowrap text-navy-700 shadow-soft transition-colors duration-250 ease-brand hover:border-navy-700 hover:bg-navy-700 hover:text-white motion-reduce:transition-none";

function MarqueeLine({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none items-center gap-3 p-0" aria-hidden="true">
      {items.map((item) => (
        <li className={NAME_TAG} key={item}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function MarqueeRow({
  items,
  direction,
  isSecondRow,
}: {
  items: string[];
  direction: "left" | "right";
  isSecondRow?: boolean;
}) {
  return (
    <div
      className={cn(
        "group mx-auto mt-4 mb-4 overflow-hidden py-2",
        EDGE_FADE,
        isSecondRow && "mt-0 mb-6",
      )}
    >
      <div
        className={cn(
          "flex w-max gap-3 group-hover:[animation-play-state:paused]",
          direction === "right"
            ? "animate-[marquee-right_32s_linear_infinite]"
            : "animate-[marquee-left_26s_linear_infinite]",
        )}
      >
        {[0, 1, 2, 3].map((copyIndex) => (
          <MarqueeLine items={items} key={copyIndex} />
        ))}
      </div>
    </div>
  );
}

export function Marquee({ section }: SectionProps) {
  const phrases = textListOf(section, "items");
  if (phrases.length === 0) return null;

  const half = Math.ceil(phrases.length / 2);
  const topRow = phrases.slice(0, half);
  const bottomRow = phrases.slice(half);

  return (
    <Shell
      id={anchorIdOf(section, "marquee")}
      className="border-y border-line-soft bg-paper py-[clamp(3.5rem,7vw,5.5rem)] text-center"
      containerClassName="reveal"
    >
      {section?.heading ? <Eyebrow center>{section.heading}</Eyebrow> : null}
      <p className="sr-only">{phrases.join(", ")}</p>
      <MarqueeRow items={topRow} direction="right" />
      {bottomRow.length > 0 ? (
        <MarqueeRow items={bottomRow} direction="left" isSecondRow />
      ) : null}
      {section?.content?.trim() ? (
        <p
          className="mx-auto my-0 max-w-[36rem] text-base text-ink-faint"
          dangerouslySetInnerHTML={{ __html: toInlineHtml(section.content) }}
        />
      ) : null}
    </Shell>
  );
}
