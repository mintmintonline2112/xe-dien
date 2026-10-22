/**
 * Section `feature-list`: danh sách mục có ghi chú + dải chip; bố cục `split` (mục đánh số kẹp hai bên ảnh tròn) hoặc `grid` (lưới mục có dấu tick).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{label,note}], chips [], image, note.
 * Cột trái đảo hướng để số quay vào ảnh (dưới 900px trả về hướng thường); vòng nét đứt quanh ảnh xoay 26s, rê chuột 9s.
 */
import {
  Head,
  Shell,
  anchorIdOf,
  toInlineHtml,
  itemsOf,
  layoutOf,
  formatOrdinal,
  resolveImage,
  textOf,
  textListOf,
  type SectionProps,
  alternatingTone,
} from "../_shared";

const LAYOUTS = ["split", "grid"] as const;

const ROW_NOTE = "text-xs text-ink-faint italic";

export function FeatureList({ section, index = 0 }: SectionProps) {
  const id = anchorIdOf(section, "feature-list");
  const rows = itemsOf(section, "items")
    .map((row) => ({ label: row.label ?? row.title ?? "", note: row.note }))
    .filter((row) => row.label);
  const chips = textListOf(section, "chips");
  const note = textOf(section, "note");

  const chipBand =
    note || chips.length > 0 ? (
      <div className="reveal mt-10 flex flex-wrap items-center justify-between gap-6 rounded-lg border border-navy-100 bg-navy-50 px-8 py-6 max-[640px]:flex-col max-[640px]:items-start">
        {note ? (
          <p
            className="m-0 max-w-[34rem] text-base text-ink-soft"
            dangerouslySetInnerHTML={{ __html: toInlineHtml(note) }}
          />
        ) : null}
        {chips.length > 0 ? (
          <div className="flex gap-3">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded bg-navy-700 px-6 py-2 text-base font-semibold tracking-md text-cream"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    ) : null;

  if (layoutOf(section, LAYOUTS, "split") === "grid") {
    return (
      <Shell tone={alternatingTone(index)} id={id}>
        <Head section={section} />
        {rows.length > 0 ? (
          <ul
            data-stagger="70"
            className="reveal reveal-group grid grid-cols-4 gap-4 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
          >
            {rows.map((row) => (
              <li
                key={row.label}
                className="flex flex-wrap items-center gap-3 rounded border border-line bg-paper px-5 py-4 text-base hover:-translate-y-0.5 hover:border-gold-400"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-xs font-bold text-navy-700"
                >
                  ✓
                </span>
                {row.label}
                {row.note ? <span className={ROW_NOTE}>{row.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {chipBand}
      </Shell>
    );
  }

  const half = Math.ceil(rows.length / 2);
  const image = textOf(section, "image");
  const renderColumn = (
    columnRows: typeof rows,
    offset: number,
    side: "left" | "right",
  ) => (
    <ul className="flex flex-col gap-6">
      {columnRows.map((row, i) => (
        <li
          key={row.label}
          className={
            side === "left"
              ? "flex flex-row-reverse items-center gap-4 text-right max-[900px]:flex-row max-[900px]:text-left"
              : "flex items-center gap-4"
          }
        >
          <span
            className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-gold-400 bg-paper font-display text-base font-semibold text-gold-500 italic shadow-soft"
            aria-hidden="true"
          >
            {formatOrdinal(offset + i)}
          </span>
          <div>
            <h4 className="m-0 text-base">{row.label}</h4>
            {row.note ? (
              <span className={`block ${ROW_NOTE} mt-1 text-sm`}>{row.note}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <Shell id={id}>
      <Head section={section} />

      {rows.length > 0 ? (
        <div className="reveal mb-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(1.5rem,4vw,3rem)] max-[900px]:grid-cols-1 max-[900px]:gap-y-8">
          {renderColumn(rows.slice(0, half), 0, "left")}
          <div className="flex justify-center max-[900px]:order-[-1]">
            <div className='relative aspect-square w-[clamp(220px,24vw,320px)] rounded-full p-[14px] before:pointer-events-none before:absolute before:inset-0 before:animate-[doc-ring-spin_26s_linear_infinite] before:rounded-full before:border before:border-dashed before:border-gold-400 before:content-[""] hover:before:[animation-duration:9s]'>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImage(image)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full rounded-full object-cover shadow-lift"
                />
              ) : null}
            </div>
          </div>
          {renderColumn(rows.slice(half), half, "right")}
        </div>
      ) : null}

      {chipBand}
    </Shell>
  );
}
