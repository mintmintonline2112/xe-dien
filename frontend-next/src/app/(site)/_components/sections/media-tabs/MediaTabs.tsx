/**
 * Section `media-tabs`: nội dung chia tab (VD mỗi tab một dòng xe), phần tab nằm ở MediaTabPanels.client.tsx; có heading thì hiện đầu khối.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc subheading, heading, content, metadata.items [{title,heading,short,text,image,imagePosition,ctaLabel,ctaHref}],
 * itemLabel (chữ trước số thứ tự, trống thì ẩn), ctaLabel/ctaHref (nút mặc định khi tab không tự đặt).
 */
import { MediaTabPanels, type MediaTab } from "./MediaTabPanels.client";
import {
  Head,
  Shell,
  anchorIdOf,
  itemsOf,
  formatOrdinal,
  splitParagraphs,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

export function MediaTabs({ section }: SectionProps) {
  const itemLabel = textOf(section, "itemLabel");
  const defaultCtaLabel = textOf(section, "ctaLabel");
  const defaultCtaHref = textOf(section, "ctaHref");

  const tabs: MediaTab[] = itemsOf(section, "items")
    .filter((item) => item.title)
    .map((item, i) => ({
      title: item.title,
      heading: item.heading || item.title,
      label: itemLabel ? `${itemLabel} ${formatOrdinal(i)}` : undefined,
      short: item.short || undefined,
      paragraphs: item.text ? splitParagraphs(item.text) : [],
      image: item.image ? resolveImage(item.image) : undefined,
      imagePosition: item.imagePosition || undefined,
      ctaLabel: item.ctaLabel || defaultCtaLabel,
      ctaHref: item.ctaHref || defaultCtaHref,
    }));

  return (
    <Shell id={anchorIdOf(section, "media-tabs")}>
      <Head section={section} />
      {tabs.length > 0 ? <MediaTabPanels tabs={tabs} /> : null}
    </Shell>
  );
}
