/**
 * Nút hoặc link dạng nút (có `href` → <Link>), biến thể primary / gold / outline / ghost / danger, cỡ sm / md / lg, trạng thái loading.
 * Dùng bởi: export qua components/ui/index.ts.
 * Lưu ý: Server Component (không "use client"); onClick chỉ chạy khi nút nằm trong Client Component. Cỡ md giữ cỡ chữ của chỗ đặt nút.
 */
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "gold" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border-navy-700 bg-navy-700 text-white",
  gold: "border-gold-400 bg-gold-400 text-navy-900",
  outline: "border-navy-700 bg-transparent text-navy-700",
  ghost: "border-transparent bg-transparent text-ink",
  danger: "border-danger bg-danger text-white",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm leading-none",
  md: "px-6 py-3 [font-size:inherit] leading-none",
  lg: "px-8 py-4 text-base leading-none",
};

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: string;
  };

export function Button({
  variant = "primary",
  size = "md",
  block,
  loading,
  leading,
  className,
  children,
  href,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border font-semibold no-underline [transition:background_0.15s_ease,color_0.15s_ease,transform_0.1s_ease] hover:brightness-108 active:[transform:translateY(1px)] disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block && "w-full",
    className,
  );
  const content = (
    <>
      {loading ? <Spinner /> : leading}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClassName}
        aria-disabled={disabled || loading || undefined}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </button>
  );
}
