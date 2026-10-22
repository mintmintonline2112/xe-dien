/**
 * Section `stats`: tiêu đề + dải số liệu nổi bật (StatsList bản `band` cho nền sáng, dùng chung với hero).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.stats [{label,value}]; số ở đầu value tự chạy đếm khi cuộn tới (SiteEffects.tsx).
 */
import {
  Head,
  Shell,
  StatsList,
  anchorIdOf,
  itemsOf,
  type SectionProps,
  alternatingTone,
} from "../_shared";

export function Stats({ section, index = 0 }: SectionProps) {
  return (
    <Shell tone={alternatingTone(index)} id={anchorIdOf(section, "stats")}>
      <Head section={section} />
      <StatsList stats={itemsOf(section, "stats")} band className="reveal" />
    </Shell>
  );
}
