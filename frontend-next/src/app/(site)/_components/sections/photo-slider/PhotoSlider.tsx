/**
 * Section `photo-slider`: anh em của `photo-strip` (cùng dữ liệu, cùng khung ảnh + chú thích) nhưng dải ảnh là slider (PhotoCarousel.client.tsx), dưới là ghi chú + nút.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc subheading, heading, content, metadata.items [{image,caption}], note, ctaLabel, ctaHref; heading làm nhãn trợ năng của slider.
 */
import { PhotoCarousel } from "./PhotoCarousel.client";
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

export function PhotoSlider({ section }: SectionProps) {
  const photos = itemsOf(section, "items")
    .filter((photo) => photo.image)
    .map((photo) => ({
      src: resolveImage(photo.image),
      caption: photo.caption,
    }));

  return (
    <Shell id={anchorIdOf(section, "photo-slider")} tone="tint" flow>
      <Head section={section} />

      {photos.length > 0 ? (
        <PhotoCarousel
          className="mt-[clamp(2.5rem,5vw,3.5rem)]"
          photos={photos}
          label={section?.heading ?? undefined}
        />
      ) : null}

      <Note
        text={textOf(section, "note")}
        cta={textOf(section, "ctaLabel")}
        href={textOf(section, "ctaHref")}
      />
    </Shell>
  );
}
