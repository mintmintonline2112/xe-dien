/**
 * Section `marquee`: tiêu đề nhỏ + chữ chạy ngang vô hạn, đủ mục thì 2 dòng chạy ngược chiều, dưới là câu ghi chú; không có mục thì không render.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer. CMS: heading, content, metadata.items [].
 * Lưu ý: mỗi dòng nhân 4 bản nội dung để vòng lặp liền mạch, rê chuột thì dừng; py riêng trong className đè đệm chuẩn của Shell.
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

function MarqueeLine({ items }: { items: string[] }) {
  return (
    <p
      className="m-0 flex items-baseline gap-6 text-h4 font-medium whitespace-nowrap text-navy-700 italic"
      aria-hidden="true"
    >
      {items.map((item) => (
        <span className="contents" key={item}>
          <span>{item}</span>
          <span className="text-[0.55em] text-gold-400 not-italic">✦</span>
        </span>
      ))}
    </p>
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
        "group mx-auto mt-2 mb-6 overflow-hidden",
        EDGE_FADE,
        isSecondRow && "mt-1",
      )}
    >
      <div
        className={cn(
          "flex w-max gap-6 group-hover:[animation-play-state:paused]",
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
