/**
 * Footer site public: cột thương hiệu + thông tin công ty (địa chỉ, tổng đài, hotline, email, giờ mở cửa, mạng xã hội), các cột menu
 * chân trang từ CMS, cột danh mục sản phẩm, dòng bản quyền + link ghi công ảnh.
 * Dùng bởi: app/(site)/layout.tsx.
 * Lưu ý: liên hệ lấy từ Admin (resolveContact); cột menu = Admin → Menu vị trí footer (cấp 1 là tiêu đề cột). Link CREDITS.md
 * BẮT BUỘC giữ khi còn dùng ảnh CC BY / CC BY-SA (backend/uploads, public/images). Dưới 900px chừa đệm đáy cho thanh ContactDock.
 */
import Link from "next/link";
import type { CategoryNode } from "@/app/(site)/_lib/catalog";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { siteRoutes } from "@/config/routes";
import type { SiteContact, SocialLinks } from "@/settings/site-settings";
import { Brand, type BrandProps } from "./Brand";
import { SocialIcons } from "./SocialIcons";

const FOOTER_LINK = "block py-1 text-sm text-light-soft hover:text-gold-300";
const COLUMN_TITLE = "mb-4 text-sm font-bold tracking-sm text-light uppercase";
const CONTACT_ROW = "m-0 flex items-start gap-2.5 text-sm text-light-soft [&>svg]:mt-0.5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gold-300";

export function Footer({
  brand,
  contact,
  menu,
  categories,
  social,
  footerText,
}: {
  brand?: BrandProps;
  contact: SiteContact;
  menu: SiteMenuItem[];
  categories: CategoryNode[];
  social?: SocialLinks | null;
  footerText?: string | null;
}) {
  return (
    <footer className="bg-navy-900 text-light-soft max-[900px]:pb-16">
      <div className="site-container grid grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] gap-[clamp(1.75rem,4vw,3.5rem)] pt-[clamp(2.75rem,5vw,4rem)] pb-10 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <Brand isFooter {...brand} />
          <p className="m-0 mt-2 font-semibold text-light">{contact.name}</p>
          <address className="flex flex-col gap-2.5 not-italic">
            <p className={CONTACT_ROW}>
              <SiteIcon name="pin" />
              <span>
                {contact.address}
                {contact.location ? `, ${contact.location}` : ""}
              </span>
            </p>
            <p className={CONTACT_ROW}>
              <SiteIcon name="headset" />
              <span>
                Tổng đài miễn phí:{" "}
                <a href={contact.hotlineHref} className="font-bold text-gold-300 hover:text-light">
                  {contact.hotline}
                </a>
              </span>
            </p>
            <p className={CONTACT_ROW}>
              <SiteIcon name="phone" />
              <span>
                Mua hàng:{" "}
                <a href={contact.phoneHref} className="font-bold text-gold-300 hover:text-light">
                  {contact.phone}
                </a>
              </span>
            </p>
            <p className={CONTACT_ROW}>
              <SiteIcon name="mail" />
              <a href={`mailto:${contact.email}`} className="text-light-soft hover:text-gold-300">
                {contact.email}
              </a>
            </p>
            {contact.hours ? (
              <p className={CONTACT_ROW}>
                <SiteIcon name="clock" />
                <span>{contact.hours}</span>
              </p>
            ) : null}
          </address>
          <SocialIcons
            links={social}
            className="mt-2 inline-flex items-center gap-2"
            linkClassName="grid h-9 w-9 place-items-center rounded-full border border-light/20 text-light-soft hover:border-gold-400 hover:bg-gold-400 hover:text-ink [&>svg]:h-4 [&>svg]:w-4"
            label="Mạng xã hội"
          />
        </div>

        {menu.map((column) => (
          <nav key={column.key} aria-label={column.label}>
            <h2 className={COLUMN_TITLE}>{column.label}</h2>
            {(column.children ?? []).map((link) => (
              <Link key={link.href} className={FOOTER_LINK} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}

        {categories.length > 0 ? (
          <nav aria-label="Danh mục sản phẩm">
            <h2 className={COLUMN_TITLE}>Danh mục sản phẩm</h2>
            {categories.map((category) => (
              <Link key={category.id} className={FOOTER_LINK} href={siteRoutes.category(category.slug)}>
                {category.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="border-t border-t-light/10">
        <div className="site-container flex flex-wrap justify-between gap-x-8 gap-y-2 py-5 text-xs max-[640px]:flex-col">
          <p className="m-0">
            © {new Date().getFullYear()} {footerText?.trim() || `${contact.name}. Bảo lưu mọi quyền.`}
          </p>
          <p className="m-0 text-light-soft/70 [&_a]:text-inherit [&_a]:underline [&_a:hover]:text-gold-300">
            Ảnh minh hoạ từ Wikimedia Commons — <a href="/images/CREDITS.md">ghi công ảnh</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
