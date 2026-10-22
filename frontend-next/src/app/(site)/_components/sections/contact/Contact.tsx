/**
 * Section `contact`: bố cục `form` (thông tin liên hệ + ghi chú + ảnh bên trái, form liên hệ bên phải) hoặc `list` (đầu khối + danh sách thông tin).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: thông tin ưu tiên metadata section → Admin → Trang Liên hệ → config mặc định; tên công ty ở Admin → Trang Liên hệ
 * thắng tiêu đề section. CMS đọc metadata.location/address/email/phone/hours, label* (nhãn từng dòng, trống thì chỉ có nội dung), note, image, imageAlt.
 * Tiêu đề form, danh sách chủ đề và ghi chú dưới form lấy từ Admin → Trang Liên hệ → Form.
 */
import { ContactForm } from "@/app/(site)/_components/forms";
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import { toTelHref } from "@/settings/contact-page";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import {
  Head,
  ICONS,
  IconBadge,
  InlineNote,
  Shell,
  anchorIdOf,
  layoutOf,
  resolveImage,
  textOf,
  type SectionProps,
  alternatingTone,
} from "../_shared";

const LAYOUTS = ["form", "list"] as const;

export async function Contact({ section, index = 0 }: SectionProps) {
  const id = anchorIdOf(section, "contact");
  const settings = await getSiteSettings();
  const defaultContact = resolveContact(settings);
  const contactInfo = {
    location: textOf(section, "location") ?? defaultContact.location,
    address: textOf(section, "address") ?? defaultContact.address,
    email: textOf(section, "email") ?? defaultContact.email,
    phone: textOf(section, "phone") ?? defaultContact.phone,
    hours: textOf(section, "hours") ?? defaultContact.hours,
  };
  const phoneHref = toTelHref(contactInfo.phone);

  const rows = [
    {
      key: "location",
      label: textOf(section, "labelLocation"),
      icon: ICONS.pin,
      body: contactInfo.location,
    },
    {
      key: "address",
      label: textOf(section, "labelAddress"),
      icon: ICONS.building,
      body: contactInfo.address,
    },
    {
      key: "email",
      label: textOf(section, "labelEmail"),
      icon: ICONS.mail,
      body: <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>,
    },
    {
      key: "phone",
      label: textOf(section, "labelPhone"),
      icon: ICONS.phone,
      body: <a href={phoneHref}>{contactInfo.phone}</a>,
    },
    {
      key: "hours",
      label: textOf(section, "labelHours"),
      icon: ICONS.clock,
      body: contactInfo.hours,
    },
  ].filter((row) => row.body);

  const infoList = (
    <ul className="mb-7 flex flex-col gap-4">
      {rows.map((row) => (
        <li
          className="group flex items-start gap-4 rounded-lg border border-line bg-paper px-6 py-5 shadow-soft"
          key={row.key}
        >
          <IconBadge className="group-hover:scale-110 group-hover:rotate-[-5deg]">
            {row.icon}
          </IconBadge>
          <div>
            {row.label ? (
              <h4 className="m-0 mb-1 text-lg">{row.label}</h4>
            ) : null}
            <p className="m-0 text-base text-ink-soft [&_a]:font-semibold [&_a]:text-navy-700 [&_a:hover]:text-navy-800">
              {row.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  const note = (
    <InlineNote
      text={textOf(section, "note")}
      className="rounded-r border-l-3 border-navy-700 bg-navy-50 px-5 py-4 text-sm text-ink-soft"
    />
  );

  if (layoutOf(section, LAYOUTS, "form") === "list") {
    return (
      <Shell tone={alternatingTone(index)} id={id}>
        <Head section={section} />
        <div className="reveal max-w-[34rem]">{infoList}</div>
        {note}
      </Shell>
    );
  }

  const formInterests = (settings.contactPage?.form?.interests ?? [])
    .map((interest) => interest.value?.trim())
    .filter((value): value is string => Boolean(value));
  const image = textOf(section, "image");
  const title =
    settings.contactPage?.company?.name?.trim() ||
    section?.heading ||
    defaultContact.name;

  return (
    <Shell
      id={id}
      containerClassName="grid grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] items-start gap-[clamp(2.5rem,6vw,4.5rem)] max-[900px]:grid-cols-1"
    >
      <div className="reveal">
        <Head
          section={section ? { ...section, heading: title } : section}
          align="left"
        />

        {infoList}

        {note}

        {image ? (
          <figure className={cn(PHOTO_FRAME, "reveal mt-8 aspect-16/10")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImage(image)}
              alt={textOf(section, "imageAlt") ?? ""}
              loading="lazy"
            />
          </figure>
        ) : null}
      </div>

      <ContactForm
        title={settings.contactPage?.form?.title?.trim() || undefined}
        interests={formInterests.length > 0 ? formInterests : undefined}
        note={settings.contactPage?.form?.note?.trim() || undefined}
      />
    </Shell>
  );
}
