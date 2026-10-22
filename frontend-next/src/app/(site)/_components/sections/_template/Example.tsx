/**
 * Section `example`: lưới thẻ có icon (bố cục grid) hoặc ảnh + danh sách bấm được (bố cục split).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title, text, icon}], image, note, ctaLabel, ctaHref.
 */
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  IconBadge,
  Note,
  Shell,
  alternatingTone,
  anchorIdOf,
  iconFor,
  itemsOf,
  layoutOf,
  formatOrdinal,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";
import { ExampleWidget } from "./ExampleWidget.client";

const LAYOUTS = ["grid", "split"] as const;

export function Example({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "grid");
  const rows = itemsOf(section, "items");
  const image = textOf(section, "image");
  const id = anchorIdOf(section, "example");

  if (rows.length === 0 && !section?.heading) return null;

  return (
    <Shell id={id} tone={alternatingTone(index)}>
      <Head section={section} />

      {layout === "split" ? (
        <div className="grid items-start gap-10 md:grid-cols-2">
          {image ? (
            <figure className={cn(PHOTO_FRAME, "reveal aspect-4/3")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(image)} alt="" loading="lazy" />
            </figure>
          ) : null}
          <ExampleWidget items={rows} />
        </div>
      ) : (
        <ul
          data-stagger="70"
          className="reveal reveal-group grid gap-6 md:grid-cols-3"
        >
          {rows.map((row, i) => (
            <li
              key={row.title ?? i}
              className="rounded-lg border border-line bg-paper p-6"
            >
              <span className="text-xs tracking-xl text-ink-faint uppercase">
                {formatOrdinal(i)}
              </span>
              <IconBadge className="my-4">{iconFor(row.icon, i)}</IconBadge>
              {row.title ? <h3 className="text-h5">{row.title}</h3> : null}
              {row.text ? (
                <p className="m-0 text-ink-soft">{row.text}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Note
        text={textOf(section, "note")}
        cta={textOf(section, "ctaLabel")}
        href={textOf(section, "ctaHref")}
      />
    </Shell>
  );
}
