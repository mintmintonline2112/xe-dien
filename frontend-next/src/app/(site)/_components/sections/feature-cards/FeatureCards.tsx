/**
 * Section `feature-cards`: lưới thẻ màu chủ đạo có icon + tiêu đề + mô tả.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title,text,icon}] (icon trống thì xoay vòng theo thứ tự).
 * Thẻ nghiêng theo chuột (`tilt-card`) và hiện so le (`data-stagger`) do SiteEffects.tsx điều khiển.
 */
import {
  Head,
  IconBadge,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  type SectionProps,
} from "../_shared";

export function FeatureCards({ section }: SectionProps) {
  const cards = itemsOf(section, "items").filter((card) => card.title);

  return (
    <Shell id={anchorIdOf(section, "feature-cards")} tone="tint">
      <Head section={section} />

      {cards.length > 0 ? (
        <div
          data-stagger="90"
          className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
        >
          {cards.map((card, index) => (
            <article
              className="tilt-card group reveal rounded-lg border border-gold-300/30 bg-navy-700 px-7 pt-8 pb-7 shadow-lift hover:-translate-y-1 hover:border-gold-400"
              key={`${card.title}-${index}`}
            >
              <IconBadge className="mb-5 border-light/30 bg-light/10 text-light group-hover:scale-110 group-hover:rotate-[-5deg]">
                {iconFor(card.icon, index)}
              </IconBadge>
              <h3 className="mb-2 text-2xl text-light">{card.title}</h3>
              {card.text ? (
                <p className="m-0 text-base text-light/90">{card.text}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}
