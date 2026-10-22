/**
 * Section `quote-form`: dải nền màu chủ đạo, tiêu đề + danh sách lợi ích + hotline bên trái, form đăng ký tư vấn (gửi API thật, forms.tsx) bên phải.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [] (lợi ích), note, backdropImage (ảnh mờ lót nền), formTitle,
 * formSubtitle, submitLabel, defaultType (consult | quote | installment | test_ride | dealer). Hotline lấy từ Admin → Trang Liên hệ.
 * Danh sách hiện so le từng dòng: <ul> là `reveal-group` nằm trong khối `.reveal`.
 */
import { ConsultForm } from "@/app/(site)/_components/forms";
import { toRequestType } from "@/app/(site)/_components/request-types";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import {
  Head,
  ICONS,
  InlineNote,
  Shell,
  anchorIdOf,
  resolveImage,
  textListOf,
  textOf,
  type SectionProps,
} from "../_shared";

export async function QuoteForm({ section }: SectionProps) {
  const benefits = textListOf(section, "items");
  const backdropImage = textOf(section, "backdropImage");
  const contact = resolveContact(await getSiteSettings());

  return (
    <Shell
      id={anchorIdOf(section, "quote-form")}
      className="bg-[radial-gradient(110%_90%_at_95%_100%,color-mix(in_oklab,var(--navy-600)_55%,transparent)_0%,transparent_55%),linear-gradient(160deg,var(--navy-900)_0%,var(--navy-800)_100%)] text-light"
      backdrop={
        backdropImage ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.16]"
            style={{ backgroundImage: `url(${resolveImage(backdropImage)})` }}
          />
        ) : undefined
      }
      containerClassName="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-[clamp(2rem,5vw,4.5rem)] max-[900px]:grid-cols-1"
    >
      <div className="reveal">
        <Head section={section} align="left" light />
        {benefits.length > 0 ? (
          <ul data-stagger="45" className="reveal-group my-6 grid gap-3 p-0">
            {benefits.map((benefit) => (
              <li className="flex items-start gap-3 text-base text-light" key={benefit}>
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-400 text-ink" aria-hidden="true">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS.check}
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        ) : null}
        <a href={contact.phoneHref} className="mt-2 inline-flex items-center gap-3 rounded-lg border border-light/20 bg-light/10 px-4 py-3 text-light hover:border-gold-300">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-sale" aria-hidden="true">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {ICONS.phone}
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs text-light-soft">Gọi ngay để được tư vấn</span>
            <strong className="font-display text-xl font-extrabold text-gold-300">{contact.phone}</strong>
          </span>
        </a>
        <InlineNote text={textOf(section, "note")} className="mt-5 mb-0 border-t border-light/20 pt-4 text-sm text-light-soft" />
      </div>

      <ConsultForm
        className="reveal"
        title={textOf(section, "formTitle")}
        subtitle={textOf(section, "formSubtitle")}
        submitLabel={textOf(section, "submitLabel")}
        defaultType={toRequestType(textOf(section, "defaultType"))}
      />
    </Shell>
  );
}
