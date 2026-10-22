/**
 * Vòng xoay loading, kế thừa màu chữ hiện tại (currentColor) — Server Component.
 * Dùng bởi: Button.tsx, export qua components/ui/index.ts.
 */
import { cn } from "@/utils/cn";

export function Spinner({
  className,
  label = "Đang tải",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block h-[1.1em] w-[1.1em] animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.2em] [animation-duration:0.7s]",
        className,
      )}
      role="status"
      aria-label={label}
    />
  );
}
