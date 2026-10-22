/**
 * Section `promo-tiles`: hàng ô nổi bật màu (khuyến mãi / trả góp / tuyển dụng…), mỗi ô có icon, tiêu đề, một dòng mô tả, bấm cả ô.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content (thường để trống — khối nằm sát banner), metadata.items [{icon, title, text, href}].
 * Màu ô xoay vòng TILE_TONES theo thứ tự; khối dùng đệm mỏng riêng (py-5) thay đệm chuẩn.
 */
import { cn } from "@/utils/cn";
import {
  Head,
  IconBadge,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  type SectionProps,
} from "../_shared";

const TILE_TONES = [
  "bg-sale text-light [&_.tile-icon]:border-light/30 [&_.tile-icon]:bg-light/15 [&_.tile-icon]:text-light",
  "bg-navy-700 text-light [&_.tile-icon]:border-light/30 [&_.tile-icon]:bg-light/15 [&_.tile-icon]:text-gold-300",
  "bg-gold-400 text-ink [&_.tile-icon]:border-ink/15 [&_.tile-icon]:bg-light/40 [&_.tile-icon]:text-ink",
] as const;

export function PromoTiles({ section }: SectionProps) {
  const tiles = itemsOf(section, "items").filter((tile) => tile.title);
  if (tiles.length === 0) return null;

  return (
    <Shell id={anchorIdOf(section, "promo-tiles")} className="py-5 max-[640px]:py-4">
      <Head section={section} />
      <ul
        className="reveal reveal-group m-0 grid list-none auto-cols-fr grid-flow-col gap-4 p-0 max-[900px]:grid-flow-row max-[900px]:grid-cols-1 max-[900px]:gap-3"
        data-stagger="80"
      >
        {tiles.map((tile, tileIndex) => {
          const content = (
            <>
              <IconBadge className="tile-icon h-12 w-12 [&>svg]:h-6 [&>svg]:w-6">{iconFor(tile.icon, tileIndex)}</IconBadge>
              <span className="min-w-0">
                <span className="block font-display text-lg leading-tight font-extrabold tracking-xs uppercase">{tile.title}</span>
                {tile.text ? <span className="mt-1 block text-sm opacity-90">{tile.text}</span> : null}
              </span>
            </>
          );
          const tileClassName = cn(
            "flex h-full items-center gap-4 rounded-lg px-5 py-4 shadow-soft",
            TILE_TONES[tileIndex % TILE_TONES.length],
          );
          return (
            <li key={`${tile.title}-${tileIndex}`}>
              {tile.href ? (
                <a href={tile.href} className={cn(tileClassName, "transition-[filter] duration-200 ease-brand hover:brightness-105")}>
                  {content}
                </a>
              ) : (
                <div className={tileClassName}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
