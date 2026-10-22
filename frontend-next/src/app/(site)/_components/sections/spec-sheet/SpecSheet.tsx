/**
 * Section `spec-sheet`: phiếu thông số sản phẩm, bảng 2 cột (tên thông số có icon │ giá trị) trong thẻ trắng, bên cạnh là ảnh dọc có nhãn tròn; dưới bảng là ghi chú + nút.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: content tách đoạn <p> ĐẦU làm intro dưới tiêu đề, các đoạn SAU làm ghi chú dưới bảng. CMS đọc metadata.items [{title,text,icon}], image, imagePosition,
 * imageAlt, badge (| để xuống dòng), ctaLabel, ctaHref. Nhãn tròn nằm ngoài khung ảnh vì khung phải giữ overflow-hidden cho hiệu ứng .photo-frame.
 */
import { Fragment } from "react";
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  IconBadge,
  RichIntro,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

export function SpecSheet({ section }: SectionProps) {
  const rows = itemsOf(section, "items").filter((row) => row.title);
  const image = textOf(section, "image");
  const imagePosition = textOf(section, "imagePosition");
  const badge = textOf(section, "badge");
  const ctaLabel = textOf(section, "ctaLabel");

  const paragraphs = section?.content?.match(/<p[\s\S]*?<\/p>/g) ?? [];
  const introHtml = paragraphs.length > 0 ? paragraphs[0] : section?.content;
  const noteHtml = paragraphs.slice(1).join("");

  return (
    <Shell id={anchorIdOf(section, "spec-sheet")}>
      <Head
        section={section ? { ...section, content: introHtml ?? null } : section}
      />

      {rows.length > 0 || image ? (
        <div
          className={cn(
            "grid items-stretch gap-8 max-[900px]:grid-cols-1",
            image && rows.length > 0
              ? "grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
              : "mx-auto max-w-4xl grid-cols-1",
          )}
        >
          {rows.length > 0 ? (
            <div className="reveal overflow-hidden rounded-lg border border-line bg-paper shadow-soft">
              <dl data-stagger="50" className="reveal-group m-0">
                {rows.map((row, i) => (
                  <div
                    key={`${row.title}-${i}`}
                    className="grid grid-cols-[minmax(12rem,0.4fr)_minmax(0,1fr)] border-b border-line-soft last:border-b-0 even:bg-cream/60 max-[640px]:grid-cols-1"
                  >
                    <dt className="flex items-center gap-3 border-r border-line-soft px-6 py-4 font-display text-base font-semibold text-navy-900 max-[640px]:border-r-0 max-[640px]:pb-1">
                      <IconBadge className="h-10 w-10 [&>svg]:h-5 [&>svg]:w-5">
                        {iconFor(row.icon, i)}
                      </IconBadge>
                      {row.title}
                    </dt>
                    <dd className="m-0 flex items-center px-6 py-4 text-base text-ink-soft max-[640px]:pt-1 max-[640px]:pl-19">
                      {row.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {image ? (
            <figure className="reveal relative m-0 min-h-80 max-[900px]:order-first max-[900px]:aspect-video max-[900px]:min-h-0">
              <div className={cn(PHOTO_FRAME, "h-full")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(image)}
                  alt={textOf(section, "imageAlt") ?? ""}
                  loading="lazy"
                  style={
                    imagePosition
                      ? { objectPosition: imagePosition }
                      : undefined
                  }
                />
              </div>
              {badge ? (
                <span
                  className="absolute -bottom-3 -left-3 z-1 grid h-23.5 w-23.5 -rotate-6 place-items-center rounded-full border-4 border-cream bg-gold-400 text-center text-sm leading-snug font-bold tracking-xs text-navy-900 shadow-badge"
                  aria-hidden="true"
                >
                  {badge.split(/\s*\|\s*|\n/).map((line, i, lines) => (
                    <Fragment key={i}>
                      {line}
                      {i < lines.length - 1 ? <br /> : null}
                    </Fragment>
                  ))}
                </span>
              ) : null}
            </figure>
          ) : null}
        </div>
      ) : null}

      {noteHtml || ctaLabel ? (
        <div className="reveal mx-auto mt-12 max-w-160 text-center">
          <RichIntro
            html={noteHtml}
            className="font-display text-base text-ink-faint italic [&_p]:m-0 [&_p+p]:mt-2"
          />
          <Cta
            label={ctaLabel}
            href={textOf(section, "ctaHref")}
            className="btn btn-ghost-dark btn-sm"
            style={{ marginTop: noteHtml ? "1.25rem" : 0 }}
          />
        </div>
      ) : null}
    </Shell>
  );
}
