/**
 * Section `photo-strip`: dải ảnh khung bo góc có chú thích, dưới là ghi chú + nút; không có heading thì chỉ có dải ảnh để ghép liền dưới khối khác (section-flow).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc subheading, heading, content, metadata.items [{image,caption}], note, ctaLabel, ctaHref.
 */
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  Note,
  Shell,
  anchorIdOf,
  itemsOf,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

export function PhotoStrip({ section }: SectionProps) {
  const photos = itemsOf(section, "items").filter((photo) => photo.image);

  return (
    <Shell id={anchorIdOf(section, "photo-strip")} tone="tint" flow>
      <Head section={section} />

      {photos.length > 0 ? (
        <div
          data-stagger="70"
          className={cn(
            "reveal reveal-group mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-3 gap-6",
            photos.length === 2 && "grid-cols-2",
          )}
        >
          {photos.map((photo, index) => (
            <figure className="m-0" key={`${photo.image}-${index}`}>
              <div className={cn(PHOTO_FRAME, "aspect-4/3")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(photo.image)}
                  alt={photo.caption ?? ""}
                  loading="lazy"
                />
              </div>
              {photo.caption ? (
                <figcaption className="mt-3 text-center font-display text-base text-ink-faint italic">
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      <Note
        text={textOf(section, "note")}
        cta={textOf(section, "ctaLabel")}
        href={textOf(section, "ctaHref")}
      />
    </Shell>
  );
}
