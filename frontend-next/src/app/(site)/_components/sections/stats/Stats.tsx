/**
 * Section `stats`: tiêu đề + lưới thẻ số liệu (icon, con số lớn chạy đếm, nhãn, ghi chú), các thẻ hiện so le khi cuộn tới.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.stats [{label,value,icon,note}]. Số ở đầu value (kể cả 1.200) chạy đếm qua
 * SiteEffects.tsx; thẻ sau đếm trễ hơn thẻ trước đúng bằng STAGGER_MS để khớp nhịp hiện so le. Hover nhấc thẻ đặt trên <article>
 * vì <li> là con trực tiếp của .reveal-group (layer effects nuốt transform đặt lên nó).
 */
import {
  Head,
  IconBadge,
  Shell,
  StatNumber,
  anchorIdOf,
  iconFor,
  itemsOf,
  type SectionProps,
  alternatingTone,
} from "../_shared";

const STAGGER_MS = 140;

const STAT_CARD =
  "group relative isolate flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper p-[clamp(1.25rem,2.4vw,1.85rem)] shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-brand hover:-translate-y-1.5 hover:border-navy-600 hover:shadow-lift motion-reduce:transition-none";

export function Stats({ section, index = 0 }: SectionProps) {
  const stats = itemsOf(section, "stats").filter((stat) => stat.label && stat.value);

  return (
    <Shell tone={alternatingTone(index)} id={anchorIdOf(section, "stats")}>
      <Head section={section} />
      {stats.length > 0 ? (
        <ul
          className="reveal reveal-group m-0 mt-10 grid list-none grid-cols-4 gap-5 p-0 max-[1000px]:grid-cols-2 max-[520px]:grid-cols-1"
          data-stagger={STAGGER_MS}
        >
          {stats.map((stat, statIndex) => (
            <li key={stat.label}>
              <article className={STAT_CARD}>
                <span
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-[0.35] bg-[linear-gradient(90deg,var(--navy-700),var(--gold-400))] transition-transform duration-500 ease-brand group-hover:scale-x-100 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                <svg
                  className="pointer-events-none absolute -right-5 -bottom-5 -z-1 h-32 w-32 text-navy-700 opacity-[0.06] transition-transform duration-500 ease-brand group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {iconFor(stat.icon, statIndex)}
                </svg>
                <IconBadge className="group-hover:scale-110">{iconFor(stat.icon, statIndex)}</IconBadge>
                <p className="m-0 mt-5 font-display text-display leading-none font-bold text-navy-700">
                  <StatNumber
                    value={stat.value}
                    suffixClassName="ml-0.5 align-top text-[0.55em] text-gold-500"
                    countDelayMs={statIndex * STAGGER_MS}
                  />
                </p>
                <h3 className="m-0 mt-3 text-sm font-bold tracking-sm text-ink uppercase">{stat.label}</h3>
                {stat.note ? <p className="m-0 mt-2 text-sm leading-relaxed text-ink-soft">{stat.note}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}
