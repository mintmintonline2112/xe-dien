/**
 * Section `service-strip`: dải cam kết dịch vụ (giao hàng, thanh toán, đổi trả, bảo hành…) — icon + tiêu đề + một dòng mô tả, chia cột đều.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content (tuỳ chọn), metadata.items [{icon, title, text}]. Khối dùng đệm mỏng riêng
 * (py-8) và luôn nền trắng có viền trên / dưới để tách khỏi khối kề bên.
 */
import {
  Head,
  IconBadge,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  type SectionProps,
} from "../_shared";

export function ServiceStrip({ section }: SectionProps) {
  const services = itemsOf(section, "items").filter((service) => service.title);
  if (services.length === 0) return null;

  return (
    <Shell
      id={anchorIdOf(section, "service-strip")}
      className="border-y border-y-line bg-paper py-8 max-[640px]:py-6"
    >
      <Head section={section} />
      <ul
        className="reveal reveal-group m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-x-6 gap-y-5 p-0 max-[640px]:grid-cols-2 max-[640px]:gap-x-3"
        data-stagger="70"
      >
        {services.map((service, serviceIndex) => (
          <li key={`${service.title}-${serviceIndex}`} className="flex items-center gap-3 max-[640px]:flex-col max-[640px]:text-center">
            <IconBadge className="h-12 w-12 border-gold-300 bg-gold-100 text-navy-800 [&>svg]:h-6 [&>svg]:w-6">
              {iconFor(service.icon, serviceIndex)}
            </IconBadge>
            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-xs text-ink uppercase max-[640px]:text-xs">{service.title}</span>
              {service.text ? <span className="block text-sm text-ink-faint max-[640px]:text-xs">{service.text}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
