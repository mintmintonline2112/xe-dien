/**
 * Section `store-list`: hệ thống cửa hàng / showroom; bố cục `grid` (thẻ có ảnh, địa chỉ, điện thoại, giờ mở cửa, link bản đồ)
 * hoặc `list` (danh sách gọn chia theo khu vực).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title, caption (khu vực), text (địa chỉ), label (điện thoại),
 * value (giờ mở cửa), href (link Google Maps), image}], mapLabel (chữ link bản đồ), note, ctaLabel, ctaHref.
 */
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { toTelHref } from "@/settings/contact-page";
import {
  Head,
  Note,
  Shell,
  alternatingTone,
  anchorIdOf,
  itemsOf,
  layoutOf,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["grid", "list"] as const;

type Store = Record<string, string>;

const DETAIL_ROW = "m-0 flex items-start gap-2 text-sm text-ink-soft [&>svg]:mt-0.5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-navy-700";

export function StoreList({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "grid");
  const stores = itemsOf(section, "items").filter((store) => store.title || store.text);
  const mapLabel = textOf(section, "mapLabel");
  if (stores.length === 0 && !section?.heading) return null;

  return (
    <Shell id={anchorIdOf(section, "store-list")} tone={alternatingTone(index)}>
      <Head section={section} />
      {layout === "list" ? (
        <ListBody stores={stores} mapLabel={mapLabel} />
      ) : (
        <ul
          className="reveal reveal-group m-0 grid list-none grid-cols-3 gap-5 p-0 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1"
          data-stagger="70"
        >
          {stores.map((store, storeIndex) => (
            <li key={`${store.title}-${storeIndex}`}>
              <StoreCard store={store} mapLabel={mapLabel} />
            </li>
          ))}
        </ul>
      )}
      <Note text={textOf(section, "note")} cta={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} />
    </Shell>
  );
}

function StoreDetails({ store, mapLabel }: { store: Store; mapLabel: string | undefined }) {
  return (
    <>
      {store.text ? (
        <p className={DETAIL_ROW}>
          <SiteIcon name="pin" />
          <span>{store.text}</span>
        </p>
      ) : null}
      {store.label ? (
        <p className={DETAIL_ROW}>
          <SiteIcon name="phone" />
          <a href={toTelHref(store.label)} className="font-semibold text-navy-700 hover:text-navy-800">
            {store.label}
          </a>
        </p>
      ) : null}
      {store.value ? (
        <p className={DETAIL_ROW}>
          <SiteIcon name="clock" />
          <span>{store.value}</span>
        </p>
      ) : null}
      {store.href && mapLabel ? (
        <a
          href={store.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-800"
        >
          {mapLabel}
          <SiteIcon name="arrow-right" className="h-4 w-4" />
        </a>
      ) : null}
    </>
  );
}

function StoreCard({ store, mapLabel }: { store: Store; mapLabel: string | undefined }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper">
      {store.image ? (
        <div className="aspect-video overflow-hidden bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveImage(store.image)} alt={store.alt ?? store.title ?? ""} loading="lazy" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {store.caption ? (
          <p className="m-0 text-2xs font-semibold tracking-md text-gold-500 uppercase">{store.caption}</p>
        ) : null}
        {store.title ? <h3 className="m-0 mb-1 font-main text-lg leading-snug font-bold">{store.title}</h3> : null}
        <StoreDetails store={store} mapLabel={mapLabel} />
      </div>
    </article>
  );
}

function ListBody({ stores, mapLabel }: { stores: Store[]; mapLabel: string | undefined }) {
  const regions = [...new Set(stores.map((store) => store.caption ?? ""))];
  return (
    <div className="reveal reveal-group grid grid-cols-2 gap-6 max-[900px]:grid-cols-1" data-stagger="70">
      {regions.map((region) => (
        <div key={region || "khac"} className="rounded-lg border border-line bg-paper p-5">
          {region ? <h3 className="m-0 mb-3 font-main text-base font-bold text-navy-700">{region}</h3> : null}
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {stores
              .filter((store) => (store.caption ?? "") === region)
              .map((store, storeIndex) => (
                <li key={`${store.title}-${storeIndex}`} className="flex flex-col gap-1.5 border-t border-t-line-soft pt-4 first:border-t-0 first:pt-0">
                  {store.title ? <p className="m-0 font-semibold text-ink">{store.title}</p> : null}
                  <StoreDetails store={store} mapLabel={mapLabel} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
