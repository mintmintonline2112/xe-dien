/**
 * Nhãn trạng thái nhỏ dạng viên thuốc, tông navy / gold / neutral / danger (Server Component).
 * Dùng bởi: export qua components/ui/index.ts.
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type BadgeTone = "navy" | "gold" | "neutral" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  navy: "bg-navy-100 text-navy-800",
  gold: "bg-gold-100 text-gold-500",
  neutral: "bg-cream-2 text-ink-soft",
  danger: "bg-danger/15 text-danger",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "navy", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs leading-normal font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
      {...rest}
    />
  );
}
