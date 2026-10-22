/**
 * Section `product-grid`: khối sản phẩm lấy từ API theo nguồn (mua nhiều / mới nhất / một danh mục); bố cục `grid` (lưới 5 cột),
 * `rail` (dải trượt ngang) hoặc `split` (cột trái ảnh danh mục + danh mục con, phải lưới 4 cột).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.source (featured | newest | category), categorySlug, limit, image,
 * ctaLabel, ctaHref (trống mà có categorySlug thì trỏ về trang danh mục). API lỗi / không có sản phẩm thì ẩn cả khối.
 */
import Link from "next/link";
import { ProductCardGrid } from "@/app/(site)/_components/catalog/ProductCardGrid";
import { getProductCategory, getProducts, type ProductQuery } from "@/app/(site)/_lib/catalog";
import { toImageUrl } from "@/app/(site)/_lib/cms";
import { siteRoutes } from "@/config/routes";
import type { ProductCategory } from "@/types/cms";
import {
  Cta,
  RowHead,
  Shell,
  alternatingTone,
  anchorIdOf,
  layoutOf,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["grid", "rail", "split"] as const;
const SOURCES = ["featured", "newest", "category"] as const;
type ProductSource = (typeof SOURCES)[number];

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 24;

function sourceOf(raw: string | undefined, categorySlug: string | undefined): ProductSource {
  if (raw && (SOURCES as readonly string[]).includes(raw)) return raw as ProductSource;
  return categorySlug ? "category" : "featured";
}

function limitOf(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, MAX_LIMIT) : DEFAULT_LIMIT;
}

function buildQuery(source: ProductSource, categorySlug: string | undefined, limit: number): ProductQuery {
  if (source === "newest") return { sort: "newest", limit, category: categorySlug };
  if (source === "category") return { sort: "featured", limit, category: categorySlug };
  return { featured: true, sort: "featured", limit };
}

export async function ProductGrid({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "grid");
  const categorySlug = textOf(section, "categorySlug");
  const source = sourceOf(textOf(section, "source"), categorySlug);
  const limit = limitOf(textOf(section, "limit"));
  const id = anchorIdOf(section, "product-grid");

  const [result, category] = await Promise.all([
    getProducts(buildQuery(source, categorySlug, limit)),
    layout === "split" && categorySlug ? getProductCategory(categorySlug) : Promise.resolve(null),
  ]);
  const products = result?.data ?? [];
  if (products.length === 0) return null;

  const ctaLabel = textOf(section, "ctaLabel");
  const ctaHref = textOf(section, "ctaHref") ?? (categorySlug ? siteRoutes.category(categorySlug) : siteRoutes.products);

  return (
    <Shell id={id} tone={alternatingTone(index)}>
      <RowHead section={section} ctaLabel={ctaLabel} ctaHref={ctaHref} />
      {layout === "split" ? (
        <div className="grid grid-cols-[16.5rem_minmax(0,1fr)] items-start gap-5 max-[1000px]:grid-cols-1">
          <CategoryAside
            category={category}
            image={textOf(section, "image")}
            title={section?.heading ?? category?.name}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
          />
          <ProductCardGrid products={products} columns={4} />
        </div>
      ) : (
        <ProductCardGrid products={products} columns={5} isRail={layout === "rail"} />
      )}
    </Shell>
  );
}

function CategoryAside({
  category,
  image,
  title,
  ctaLabel,
  ctaHref,
}: {
  category: ProductCategory | null;
  image: string | undefined;
  title: string | null | undefined;
  ctaLabel: string | undefined;
  ctaHref: string;
}) {
  const imageUrl = image ? resolveImage(image) : toImageUrl(category?.imagePath);
  const children = category?.children ?? [];
  return (
    <aside className="reveal relative isolate flex min-h-full flex-col justify-end overflow-hidden rounded-lg bg-navy-800 p-5 text-light max-[1000px]:min-h-56">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 -z-2 h-full w-full object-cover" />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 -z-1 bg-linear-to-b from-transparent via-navy-900/20 to-navy-900/90" />
      {title ? <p className="m-0 mt-auto mb-3 font-display text-xl font-extrabold text-light [text-shadow:0_1px_8px_rgb(0_0_0/0.45)]">{title}</p> : null}
      {children.length > 0 ? (
        <ul className="m-0 mb-5 flex flex-wrap gap-2 p-0 max-[1000px]:mb-4">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={siteRoutes.category(child.slug)}
                className="inline-block rounded-full border border-light/30 bg-light/10 px-3 py-1 text-xs font-medium text-light backdrop-blur-[2px] hover:border-gold-300 hover:text-gold-300"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Cta label={ctaLabel} href={ctaHref} className="btn btn-gold btn-sm self-start" />
    </aside>
  );
}
