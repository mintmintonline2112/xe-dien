/**
 * Nút liên hệ luôn hiện: desktop là cụm nút tròn góc phải dưới (Zalo, Messenger, gọi điện có vòng nháy), mobile là thanh 4 nút đáy màn hình
 * (Gọi điện, Zalo, Tổng đài / Messenger, Showroom).
 * Dùng bởi: app/(site)/layout.tsx.
 * Lưu ý: thanh mobile cao 4rem nên Footer chừa đệm đáy tương ứng dưới 900px. Link Zalo / Messenger trống thì ẩn nút đó.
 * Vòng nháy dùng keyframes `ring-pulse` (styles/effects.css), tắt khi giảm chuyển động.
 */
import Link from "next/link";
import { SiteIcon } from "@/app/(site)/_components/SiteIcon";
import { siteRoutes } from "@/config/routes";
import type { SiteContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";

const FLOAT_BUTTON = "grid h-13 w-13 place-items-center rounded-full text-light shadow-float transition-transform duration-200 ease-brand hover:scale-105";
const DOCK_ITEM = "flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs font-semibold";

function ZaloGlyph({ className }: { className?: string }) {
  return (
    <span className={cn("font-display leading-none font-extrabold tracking-tight", className)} aria-hidden="true">
      Zalo
    </span>
  );
}

export function ContactDock({ contact }: { contact: SiteContact }) {
  return (
    <>
      <div className="fixed right-5 bottom-6 z-90 flex flex-col items-end gap-3 max-[900px]:hidden">
        {contact.zaloHref ? (
          <a href={contact.zaloHref} target="_blank" rel="noopener noreferrer" className={cn(FLOAT_BUTTON, "bg-zalo")} aria-label="Chat Zalo">
            <ZaloGlyph className="text-xs" />
          </a>
        ) : null}
        {contact.messengerHref ? (
          <a href={contact.messengerHref} target="_blank" rel="noopener noreferrer" className={cn(FLOAT_BUTTON, "bg-[#0084FF]")} aria-label="Chat Messenger">
            <SiteIcon name="messenger" className="h-6 w-6" />
          </a>
        ) : null}
        <a href={contact.phoneHref} className="group/call flex items-center gap-2" aria-label={`Gọi ${contact.phone}`}>
          <span className="rounded-full bg-sale px-4 py-2 font-display text-sm font-bold text-light shadow-float">{contact.phone}</span>
          <span className="relative grid h-13 w-13 place-items-center rounded-full bg-sale text-light shadow-float">
            <span aria-hidden="true" className="absolute inset-0 animate-[ring-pulse_1.8s_var(--ease)_infinite] rounded-full bg-sale motion-reduce:animate-none" />
            <SiteIcon name="phone" className="relative h-6 w-6 animate-[phone-shake_1.8s_ease-in-out_infinite] motion-reduce:animate-none" />
          </span>
        </a>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-90 hidden h-16 border-t border-t-line bg-paper pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.35)] max-[900px]:flex"
        aria-label="Liên hệ nhanh"
      >
        <a href={contact.phoneHref} className={cn(DOCK_ITEM, "bg-sale text-light")}>
          <SiteIcon name="phone" className="h-5 w-5" />
          Gọi mua hàng
        </a>
        {contact.zaloHref ? (
          <a href={contact.zaloHref} target="_blank" rel="noopener noreferrer" className={cn(DOCK_ITEM, "text-zalo")}>
            <ZaloGlyph className="text-sm" />
            Chat Zalo
          </a>
        ) : null}
        {contact.messengerHref ? (
          <a href={contact.messengerHref} target="_blank" rel="noopener noreferrer" className={cn(DOCK_ITEM, "text-[#0084FF]")}>
            <SiteIcon name="messenger" className="h-5 w-5" />
            Messenger
          </a>
        ) : (
          <a href={contact.hotlineHref} className={cn(DOCK_ITEM, "text-navy-700")}>
            <SiteIcon name="headset" className="h-5 w-5" />
            Tổng đài
          </a>
        )}
        <Link href={siteRoutes.page("he-thong-showroom")} className={cn(DOCK_ITEM, "text-navy-700")}>
          <SiteIcon name="store" className="h-5 w-5" />
          Showroom
        </Link>
      </nav>
    </>
  );
}
