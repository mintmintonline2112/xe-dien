/**
 * Khối generic khi section không khớp component nào trong registry: đầu khối + ảnh minh hoạ + nội dung rich-text.
 * Dùng bởi: _components/SectionRenderer.tsx (qua sections/index.ts).
 * Lưu ý: nội dung là HTML từ CMS nên dùng class `.post-content` (styles/components.css), không đặt được class Tailwind vào từng thẻ.
 */
import { ARCH, PHOTO_FRAME, SECTION_PHOTO } from "@/app/(site)/_components/ui";
import { toMediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { cn } from "@/utils/cn";
import { Head, Shell, anchorIdOf, type SectionProps, alternatingTone } from "../_shared";

export function GenericBlock({ section, index = 0 }: SectionProps) {
  if (!section) return null;
  const image = toMediaUrl(section.mediaPath);
  return (
    <Shell tone={alternatingTone(index)} id={anchorIdOf(section, "generic")}>
      <Head section={section} intro={false} />
      {image ? (
        <figure className={cn(PHOTO_FRAME, SECTION_PHOTO, ARCH, "reveal")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={section.heading ?? ""} loading="lazy" />
        </figure>
      ) : null}
      {section.content ? (
        <div
          className="post-content reveal"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(section.content),
          }}
        />
      ) : null}
    </Shell>
  );
}
