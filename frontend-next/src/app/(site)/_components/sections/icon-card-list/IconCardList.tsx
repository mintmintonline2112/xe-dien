/**
 * Section `icon-card-list`: mỗi dòng một mục có icon (tiêu đề + mô tả); bố cục `list` hoặc `split` (chữ + nút + ảnh lớn bên trái, ảnh blob có nhãn + danh sách bên phải).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title,text,icon}], ctaLabel/ctaHref, image + imageAlt,
 * image2 + image2Alt (ảnh blob), badge (dùng | để xuống dòng). BLOB_RADIUS 8 giá trị quá dài cho `rounded-[]` nên khai thẳng thuộc tính.
 */
import { Fragment } from "react";
import {
  Cta,
  Head,
  IconBadge,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  layoutOf,
  resolveImage,
  textOf,
  type SectionProps,
  alternatingTone,
} from "../_shared";

const LAYOUTS = ["list", "split"] as const;

const BLOB_RADIUS = "[border-radius:62%_38%_56%_44%/48%_60%_40%_52%]";

export function IconCardList({ section, index = 0 }: SectionProps) {
  const id = anchorIdOf(section, "icon-card-list");
  const rows = itemsOf(section, "items").filter((row) => row.title || row.label);

  if (layoutOf(section, LAYOUTS, "list") === "split") {
    const image = textOf(section, "image");
    const blobImage = textOf(section, "image2");
    const badge = textOf(section, "badge");
    return (
      <Shell id={id}>
        <div className="grid grid-cols-2 items-start gap-[clamp(3rem,6vw,5.5rem)] max-[900px]:grid-cols-1">
          <div className="reveal self-stretch">
            <Head section={section} align="left" />
            <Cta
              label={textOf(section, "ctaLabel")}
              href={textOf(section, "ctaHref")}
              style={{ marginTop: "1.2rem" }}
            />
            {image ? (
              <figure className='relative isolate m-0 mt-[clamp(2.5rem,5vw,4rem)] w-full max-w-[520px] pr-3 pb-3 after:absolute after:right-0 after:bottom-0 after:-z-1 after:h-[72%] after:w-[72%] after:rounded-[0.5rem_0.5rem_2rem_0.5rem] after:bg-gold-400 after:opacity-[0.72] after:content-[""] max-[900px]:mt-8'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(image)}
                  alt={textOf(section, "imageAlt") ?? ""}
                  loading="lazy"
                  className="aspect-[5/4] w-full rounded-[2rem_0.5rem_2rem_0.5rem] border border-line object-cover object-[center_62%] shadow-lift"
                />
              </figure>
            ) : null}
          </div>

          <div className="reveal flex flex-col gap-7">
            {blobImage ? (
              <figure className="relative m-0 mx-auto w-full max-w-[520px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(blobImage)}
                  alt={textOf(section, "image2Alt") ?? ""}
                  loading="lazy"
                  className={`aspect-[5/4] w-full object-cover shadow-lift ${BLOB_RADIUS}`}
                />
                {badge ? (
                  <span
                    className="absolute -bottom-[10px] -left-[12px] grid h-[94px] w-[94px] [rotate:-6deg] place-items-center rounded-full border-4 border-cream bg-gold-400 text-center text-sm leading-snug font-bold tracking-xs text-navy-900 shadow-badge"
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
            {rows.length > 0 ? (
              <ul className="flex flex-col">
                {rows.map((row, i) => (
                  <li
                    key={`${row.title ?? row.label}-${i}`}
                    className="flex items-center gap-4 border-b border-line-soft px-1 py-4 last:border-b-0"
                  >
                    <IconBadge>{iconFor(row.icon, i)}</IconBadge>
                    <div>
                      <h4 className="m-0 text-lg">{row.title ?? row.label}</h4>
                      {row.text ? (
                        <p className="mt-1 mb-0 text-base text-ink-soft">
                          {row.text}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell tone={alternatingTone(index)} id={id}>
      <Head section={section} />
      {rows.length > 0 ? (
        <ul
          data-stagger="70"
          className="reveal reveal-group flex flex-col gap-4"
        >
          {rows.map((row, i) => (
            <li
              key={`${row.title ?? row.label}-${i}`}
              className="group flex items-center gap-5 rounded-lg border border-line bg-paper px-6 py-5 shadow-soft hover:translate-x-[6px] hover:border-gold-400"
            >
              <IconBadge className="group-hover:scale-110 group-hover:rotate-[-5deg]">
                {iconFor(row.icon, i)}
              </IconBadge>
              <div>
                <h4 className="mb-1 text-xl">{row.title ?? row.label}</h4>
                {row.text ? (
                  <p className="m-0 text-base text-ink-soft">{row.text}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}
