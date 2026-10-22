/**
 * Khung nội dung có viền ghép từ Card, CardHeader (tiêu đề + nút góc phải), CardBody, CardFooter — đều là Server Component.
 * Dùng bởi: export qua components/ui/index.ts.
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-paper",
        className,
      )}
      {...rest}
    />
  );
}

export interface CardHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  title,
  action,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-b-line-soft px-5 py-4",
        className,
      )}
      {...rest}
    >
      {title ? <h3 className="m-0 text-base font-bold">{title}</h3> : children}
      {action}
    </div>
  );
}

export function CardBody({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...rest} />;
}

export function CardFooter({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t border-t-line-soft bg-cream px-5 py-4",
        className,
      )}
      {...rest}
    />
  );
}
