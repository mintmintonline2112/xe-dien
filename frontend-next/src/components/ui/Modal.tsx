"use client";

/**
 * Hộp thoại dựa trên thẻ <dialog>: mở / đóng theo prop `open`, đóng khi bấm Escape hoặc bấm ra nền.
 * Dùng bởi: export qua components/ui/index.ts.
 * Lưu ý: Client Component duy nhất của bộ ui (cần useEffect + DOM API); nội dung truyền qua children vẫn có thể là Server Component.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  width?: string;
  className?: string;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  footer,
  width,
  className,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleBackdropClick);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "w-[min(92vw,var(--ui-modal-width,32rem))] rounded-2xl border-none bg-paper p-0 text-ink shadow-float backdrop:bg-navy-900/45",
        className,
      )}
      style={
        width
          ? ({ "--ui-modal-width": width } as React.CSSProperties)
          : undefined
      }
    >
      {title ? (
        <div className="flex items-center justify-between border-b border-b-line-soft px-5 py-4">
          <h2 className="m-0 text-lg font-bold">{title}</h2>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-2xl leading-none text-ink-faint"
            aria-label="Đóng"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-t-line-soft px-5 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
