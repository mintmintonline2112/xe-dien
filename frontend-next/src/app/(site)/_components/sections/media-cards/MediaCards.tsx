/**
 * Section `media-cards`: lưới thẻ có ảnh, mỗi thẻ một dòng xe / dịch vụ / đối tác; bố cục `circles`, `toggle`, `names`, `photo`, `badge`.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer. CMS: heading, subheading, content, metadata.items
 * [{title,text,short,image,imagePosition,icon,alt}], sizes (chip phụ) + toggleLabel + ctaLabel/ctaHref (toggle), image (photo), photos + note (badge), itemLabel.
 * Lưu ý: công tắc rút gọn của `toggle` chạy thuần CSS: checkbox ẩn là `peer` của thanh trượt, còn đổi mô tả ngắn / đầy đủ bắt từ thẻ
 * bằng `group-has-[input:not(:checked)]` (mô tả khác nhánh DOM nên `peer-*` không với tới). Thẻ `.reveal` không tự khai transition.
 */
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import {
  ARCH,
  PHOTO_FRAME,
  SECTION_NOTE,
  SECTION_PHOTO,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  BRAND_ICON,
  Cta,
  Head,
  IconBadge,
  InlineNote,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  layoutOf,
  formatOrdinal,
  splitParagraphs,
  resolveImage,
  textOf,
  textListOf,
  type SectionProps,
  alternatingTone,
} from "../_shared";

const LAYOUTS = ["circles", "toggle", "names", "photo", "badge"] as const;

type Card = Record<string, string>;

const CARD_BASE =
  "rounded-lg border border-line bg-paper shadow-soft hover:border-gold-400 hover:shadow-lift";

const CARD_ZOOM =
  "block h-full w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.045] motion-reduce:transition-none";

export function MediaCards({ section, index = 0 }: SectionProps) {
  const id = anchorIdOf(section, "media-cards");
  const layout = layoutOf(section, LAYOUTS, "circles");
  const cards: Card[] = itemsOf(section, "items").filter((card) => card.title);

  if (layout === "toggle")
    return <ToggleCards id={id} section={section} cards={cards} />;
  if (layout === "photo")
    return <PhotoCards id={id} section={section} cards={cards} />;
  if (layout === "badge")
    return <BadgeCards id={id} section={section} cards={cards} />;

  if (layout === "names") {
    return (
      <Shell tone={alternatingTone(index)} id={id}>
        <Head section={section} />
        {cards.length > 0 ? (
          <div
            data-stagger="90"
            className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
          >
            {cards.map((card) => (
              <article
                className={cn(
                  "tilt-card group reveal px-7 pt-8 pb-7 hover:-translate-y-1",
                  CARD_BASE,
                )}
                key={card.title}
              >
                <IconBadge className="mb-5 group-hover:scale-110 group-hover:rotate-[-5deg]">
                  {BRAND_ICON}
                </IconBadge>
                <h3 className="mb-2 text-2xl">{card.title}</h3>
              </article>
            ))}
          </div>
        ) : null}
      </Shell>
    );
  }

  return (
    <Shell id={id} tone="tint" flow>
      <Head section={section} />
      {cards.length > 0 ? (
        <ul className="reveal mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-4 gap-[clamp(1.5rem,3vw,2.5rem)] text-center max-[900px]:grid-cols-2 max-[900px]:gap-y-10">
          {cards.map((card, i) => (
            <li className="group" key={`${card.title}-${i}`}>
              <div className="relative mx-auto aspect-square w-[clamp(150px,15vw,210px)]">
                <span
                  className="absolute top-0 left-0 z-1 grid h-[46px] w-[46px] place-items-center rounded-full border-[3px] border-cream-2 bg-gold-400 text-base font-bold text-navy-900 shadow-badge"
                  aria-hidden="true"
                >
                  {formatOrdinal(i)}
                </span>
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImage(card.image)}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full rounded-full border-4 border-paper object-cover shadow-lift transition-transform duration-[350ms] ease-brand group-hover:scale-105 motion-reduce:transition-none"
                  />
                ) : null}
              </div>
              <h4 className="mt-5 mb-2 text-xl">{card.title}</h4>
              {card.text ? (
                <p className="m-0 text-base text-ink-soft">{card.text}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}

const GRADIENT_CARD =
  "bg-[radial-gradient(120%_70%_at_100%_100%,color-mix(in_oklab,var(--gold-300)_38%,transparent),transparent_62%),linear-gradient(178deg,var(--navy-800)_0%,var(--navy-600)_52%,color-mix(in_oklab,var(--navy-600)_55%,#fff)_100%)]";

const PHOTO_CARD_SCRIM =
  'before:absolute before:inset-0 before:-z-1 before:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-900)_72%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_28%,transparent)_42%,color-mix(in_oklab,var(--navy-900)_5%,transparent)_62%,color-mix(in_oklab,var(--navy-900)_45%,transparent)_100%)] before:content-[""]';

const CARD_TEXT = "mt-3 max-w-[44ch] text-base leading-relaxed text-white/90";

function ToggleCards({
  id,
  section,
  cards,
}: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const sizes = textListOf(section, "sizes");
  const toggleLabel = textOf(section, "toggleLabel");
  const ctaLabel = textOf(section, "ctaLabel");
  const ctaHref = textOf(section, "ctaHref");

  return (
    <Shell id={id} tone="tint">
      <Head section={section} />

      {cards.length > 0 ? (
        <div className="mt-[clamp(2.25rem,4vw,3.25rem)] grid grid-cols-2 gap-[clamp(1rem,2vw,1.5rem)] max-[900px]:grid-cols-1">
          {cards.map((card, i) => {
            const fullText = card.text || card.short || "";
            return (
              <article
                className={cn(
                  "group reveal relative isolate min-h-[clamp(380px,36vw,480px)] overflow-hidden rounded-3xl text-white shadow-soft max-[900px]:min-h-[360px] max-[640px]:min-h-[340px] max-[640px]:rounded-2xl",
                  card.image ? PHOTO_CARD_SCRIM : GRADIENT_CARD,
                )}
                key={`${card.title}-${i}`}
              >
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="absolute inset-0 -z-2 h-full w-full object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-[1.04] motion-reduce:transition-none"
                    src={resolveImage(card.image)}
                    alt=""
                    loading="lazy"
                  />
                ) : null}

                <div className="relative flex h-full min-h-[inherit] flex-col p-[clamp(1.5rem,3vw,2.4rem)]">
                  <div className="flex items-center justify-between gap-4">
                    <label
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-3 select-none",
                        !card.short && "invisible",
                      )}
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        className="peer pointer-events-none absolute h-px w-px opacity-0"
                        defaultChecked
                      />
                      <span
                        className="relative h-[22px] w-[38px] shrink-0 rounded-full border border-white/55 bg-white/30 transition-colors duration-[220ms] ease-brand peer-checked:bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-gold-300 peer-checked:[&>span]:translate-x-4 peer-checked:[&>span]:bg-navy-700"
                        aria-hidden="true"
                      >
                        <span className="absolute top-[3px] left-[3px] h-[14px] w-[14px] rounded-full bg-white transition-[transform,background-color] duration-[240ms] ease-brand motion-reduce:transition-none" />
                      </span>
                      {toggleLabel ? (
                        <span className="text-base font-medium">
                          {toggleLabel}
                        </span>
                      ) : null}
                    </label>
                    <span
                      className="font-display text-sm font-bold tracking-sm text-gold-300"
                      aria-hidden="true"
                    >
                      {formatOrdinal(i)}
                    </span>
                  </div>

                  <h3 className="mt-4 mb-0 font-display text-h3 leading-tight text-white">
                    {card.title}
                  </h3>

                  {card.short ? (
                    <p
                      className={cn(
                        CARD_TEXT,
                        "mb-6 group-has-[input:not(:checked)]:hidden",
                      )}
                    >
                      {card.short}
                    </p>
                  ) : null}
                  <div
                    className={cn(
                      "mb-6",
                      card.short
                        ? "hidden group-has-[input:not(:checked)]:block group-has-[input:not(:checked)]:animate-[faq-in_300ms_var(--ease)_both] motion-reduce:animate-none"
                        : "block",
                    )}
                  >
                    {splitParagraphs(fullText).map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex} className={cn(CARD_TEXT, "mb-0")}>
                        {paragraph}
                      </p>
                    ))}
                    {sizes.length > 0 ? (
                      <ul
                        className="mt-4 flex flex-wrap gap-2"
                        aria-label="Phân loại"
                      >
                        {sizes.map((size) => (
                          <li
                            key={size}
                            className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-semibold tracking-xs"
                          >
                            {size}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <Cta
                    label={ctaLabel}
                    href={ctaHref}
                    className="mt-auto inline-flex items-center gap-2 self-start rounded-full border border-white/60 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur-[8px] transition-[background-color,color,border-color] duration-[220ms] ease-brand hover:border-gold-300 hover:bg-gold-300 hover:text-navy-900"
                  >
                    <span
                      className="h-2 w-2 rounded-full bg-current"
                      aria-hidden="true"
                    />
                  </Cta>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <InlineNote
        text={textOf(section, "note")}
        className={cn(SECTION_NOTE, "reveal")}
      />
    </Shell>
  );
}

function PhotoCards({
  id,
  section,
  cards,
}: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const image = textOf(section, "image");
  const itemLabel = textOf(section, "itemLabel");

  return (
    <Shell id={id}>
      <Head section={section} />

      {image ? (
        <figure className={cn(PHOTO_FRAME, SECTION_PHOTO, ARCH, "reveal")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImage(image)}
            alt={textOf(section, "imageAlt") ?? section?.heading ?? ""}
          />
        </figure>
      ) : null}

      {cards.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          {cards.map((card, i) => (
            <article
              className={cn(
                "group reveal grid min-h-[290px] grid-cols-[minmax(190px,0.9fr)_minmax(0,1.1fr)] overflow-hidden hover:-translate-y-1 max-[640px]:grid-cols-1",
                CARD_BASE,
              )}
              key={`${card.title}-${i}`}
            >
              {card.image ? (
                <figure className="relative m-0 min-h-full min-w-0 overflow-hidden bg-navy-900 max-[640px]:aspect-[16/10] max-[640px]:min-h-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(card.image)}
                    alt={card.alt || card.title}
                    loading="lazy"
                    style={
                      card.imagePosition
                        ? { objectPosition: card.imagePosition }
                        : undefined
                    }
                    className={cn(
                      CARD_ZOOM,
                      "min-h-[290px] max-[640px]:min-h-0",
                    )}
                  />
                </figure>
              ) : null}
              <div className="flex flex-col justify-center px-6 py-7">
                <div className="mb-5 flex items-center gap-3 text-2xs font-bold tracking-md text-ink-faint uppercase">
                  <IconBadge className="h-[42px] w-[42px] flex-none">
                    {BRAND_ICON}
                  </IconBadge>
                  <span>{itemLabel ? `${itemLabel} ${formatOrdinal(i)}` : formatOrdinal(i)}</span>
                </div>
                <h3 className="mb-2 text-2xl">{card.title}</h3>
                {card.text ? (
                  <p className="m-0 text-ink-soft">{card.text}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}

function BadgeCards({
  id,
  section,
  cards,
}: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const photos = itemsOf(section, "photos").filter((photo) => photo.image);
  const note = textOf(section, "note");
  const itemLabel = textOf(section, "itemLabel");

  return (
    <Shell id={id} tone="tint">
      <Head section={section} />

      {cards.length > 0 ? (
        <div className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1">
          {cards.map((card, i) => (
            <article
              className={cn(
                "group reveal overflow-hidden hover:-translate-y-[5px]",
                CARD_BASE,
              )}
              key={`${card.title}-${i}`}
            >
              <div className='relative aspect-[4/3] overflow-hidden bg-cream-2 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-900)_2%,transparent)_45%,color-mix(in_oklab,var(--navy-900)_32%,transparent)_100%)] after:content-[""]'>
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImage(card.image)}
                    alt={card.alt || card.title}
                    loading="lazy"
                    style={{ objectPosition: card.imagePosition || "center" }}
                    className={CARD_ZOOM}
                  />
                ) : null}
                <span className="absolute top-4 left-4 z-1 rounded-full border border-gold-300/50 bg-navy-900/90 px-3 py-2 text-2xs leading-none font-bold tracking-md text-cream uppercase">
                  {itemLabel ? `${itemLabel} ${formatOrdinal(i)}` : formatOrdinal(i)}
                </span>
              </div>
              <div className="relative min-h-[190px] border-t-[3px] border-gold-400 px-6 pt-6 pb-7">
                <IconBadge className="absolute -top-[1.8rem] right-[1.3rem] border-cream bg-navy-700 text-cream shadow-badge">
                  {iconFor(card.icon, i)}
                </IconBadge>
                <h3 className="mb-2 max-w-[calc(100%-3.2rem)] text-2xl">
                  {card.title}
                </h3>
                {card.text ? (
                  <p className="m-0 text-ink-soft">{card.text}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div
          data-stagger="70"
          className={cn(
            "reveal reveal-group mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-3 gap-6",
            photos.length === 2 && "grid-cols-2",
          )}
        >
          {photos.map((photo, i) => (
            <figure className="m-0" key={`${photo.image}-${i}`}>
              <div className={cn(PHOTO_FRAME, "aspect-4/3")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(photo.image)}
                  alt={photo.caption ?? ""}
                  loading="lazy"
                />
              </div>
              {photo.caption ? (
                <figcaption className="mt-3 text-center font-display text-base text-ink-faint italic">
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      {note ? (
        <div className="reveal mt-[clamp(2.5rem,5vw,4rem)] rounded-lg border border-l-2 border-navy-100 border-l-gold-400 bg-navy-50 px-8 py-6 text-lg text-ink-soft">
          <p
            className="m-0 max-w-none [&_strong]:text-navy-700"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(note) }}
          />
        </div>
      ) : null}
    </Shell>
  );
}
