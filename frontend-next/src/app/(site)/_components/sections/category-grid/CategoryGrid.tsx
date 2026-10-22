/**
 * Section `category-grid`: các danh mục sản phẩm lấy từ API; bố cục `tiles` (ô icon tròn + tên + số sản phẩm) hoặc `cards` (thẻ ảnh có tên phủ dưới).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.parentSlug (trống = danh mục gốc, có = danh mục con của nó), limit,
 * ctaLabel, ctaHref. Icon / ảnh / thứ tự lấy từ Admin → Danh mục sản phẩm. Không có danh mục nào thì ẩn khối.
 */
import Link from "next/link";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { getProductCategories } from "@/app/(site)/_lib/catalog";
import { toImageUrl } from "@/app/(site)/_lib/cms";
import { siteRoutes } from "@/config/routes";
import type { ProductCategory } from "@/types/cms";
import {
  RowHead,
  Shell,
  alternatingTone,
  anchorIdOf,
  layoutOf,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["tiles", "cards"] as const;

function pickCategories(categories: ProductCategory[], parentSlug: string | undefined, limit: number): ProductCategory[] {
  const parent = parentSlug ? categories.find((category) => category.slug === parentSlug) : undefined;
  const picked = parent
    ? categories.filter((category) => category.parentId === parent.id)
    : categories.filter((category) => !category.parentId);
  return picked.slice(0, limit);
}

function productCountLabel(category: ProductCategory): string | null {
  return category.productCount ? `${category.productCount} sản phẩm` : null;
}

export async function CategoryGrid({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "tiles");
  const limit = Number.parseInt(textOf(section, "limit") ?? "", 10) || 12;
  const categories = pickCategories(await getProductCategories(), textOf(section, "parentSlug"), limit);
  if (categories.length === 0) return null;

  return (
    <Shell id={anchorIdOf(section, "category-grid")} tone={alternatingTone(index)}>
      <RowHead section={section} ctaLabel={textOf(section, "ctaLabel")} ctaHref={textOf(section, "ctaHref")} />
      {layout === "cards" ? <CardsBody categories={categories} /> : <TilesBody categories={categories} />}
    </Shell>
  );
}

function TilesBody({ categories }: { categories: ProductCategory[] }) {
  return (
    <ul
      className="reveal reveal-group m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-3 p-0 max-[640px]:grid-cols-3 max-[640px]:gap-2"
      data-stagger="50"
    >
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={siteRoutes.category(category.slug)}
            className="group flex h-full flex-col items-center gap-2.5 rounded-lg border border-line bg-paper px-2 py-4 text-center text-ink transition-[border-color,box-shadow] duration-200 ease-brand hover:border-navy-600 hover:shadow-soft"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-50 text-navy-700 transition-[background-color,color] duration-200 ease-brand group-hover:bg-navy-700 group-hover:text-gold-300 max-[640px]:h-12 max-[640px]:w-12">
              <SiteIcon name={category.icon} className="h-7 w-7 max-[640px]:h-6 max-[640px]:w-6" strokeWidth={1.5} />
            </span>
            <span className="text-sm leading-snug font-semibold max-[640px]:text-xs">{category.name}</span>
            {productCountLabel(category) ? (
              <span className="-mt-1.5 text-2xs text-ink-faint">{productCountLabel(category)}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CardsBody({ categories }: { categories: ProductCategory[] }) {
  return (
    <ul
      className="reveal reveal-group m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4 p-0 max-[640px]:grid-cols-2 max-[640px]:gap-3"
      data-stagger="60"
    >
      {categories.map((category) => {
        const image = toImageUrl(category.imagePath);
        return (
          <li key={category.id}>
            <Link
              href={siteRoutes.category(category.slug)}
              className="group relative isolate flex aspect-4/3 flex-col justify-end overflow-hidden rounded-lg bg-navy-800 p-4 text-light"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 -z-2 h-full w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : null}
              <span aria-hidden="true" className="absolute inset-0 -z-1 bg-linear-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
              <span className="font-display text-lg leading-tight font-bold">{category.name}</span>
              {productCountLabel(category) ? (
                <span className="mt-1 text-xs text-light-soft">{productCountLabel(category)}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
