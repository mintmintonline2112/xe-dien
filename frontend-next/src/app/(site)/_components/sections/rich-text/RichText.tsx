/**
 * Section `rich-text`: bài viết tự do (chính sách, hướng dẫn, giới thiệu) — tiêu đề + nội dung soạn bằng trình soạn thảo, trong khung giấy
 * trắng bề ngang vừa đọc; bố cục `article` (một cột) hoặc `aside` (nội dung + cột phải ghi chú nổi bật).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content (HTML → class `.post-content`), metadata.image (ảnh đầu bài), asideTitle, asideText,
 * ctaLabel, ctaHref (hộp cột phải của bố cục aside). Không có nội dung lẫn tiêu đề thì ẩn khối.
 */
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  Shell,
  anchorIdOf,
  layoutOf,
  resolveImage,
  textOf,
  toHtml,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["article", "aside"] as const;

export function RichText({ section }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "article");
  const image = textOf(section, "image");
  const asideTitle = textOf(section, "asideTitle");
  const asideText = textOf(section, "asideText");
  if (!section?.content && !section?.heading) return null;

  const article = (
    <article className="reveal min-w-0 rounded-lg border border-line bg-paper p-[clamp(1.25rem,4vw,2.75rem)]">
      <div className="[&_h2]:text-h3">
        <Head section={section} align="left" intro={false} />
      </div>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveImage(image)} alt="" loading="lazy" className="mb-6 aspect-video w-full rounded-lg object-cover" />
      ) : null}
      {section?.content ? (
        <div className="post-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(toHtml(section.content)) }} />
      ) : null}
    </article>
  );

  return (
    <Shell
      id={anchorIdOf(section, "rich-text")}
      containerClassName={cn(
        layout === "aside" && (asideTitle || asideText)
          ? "grid grid-cols-[minmax(0,1fr)_19rem] items-start gap-6 max-[1000px]:grid-cols-1"
          : "max-w-[56rem]",
      )}
    >
      {article}
      {layout === "aside" && (asideTitle || asideText) ? (
        <aside className="reveal sticky top-[8.5rem] rounded-lg bg-navy-800 p-6 text-light max-[1000px]:static">
          {asideTitle ? <p className="m-0 mb-2 font-display text-xl font-extrabold text-gold-300">{asideTitle}</p> : null}
          {asideText ? (
            <div
              className="text-sm text-light-soft [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(toHtml(asideText)) }}
            />
          ) : null}
          <Cta label={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} className="btn btn-gold btn-sm mt-4" />
        </aside>
      ) : null}
    </Shell>
  );
}
