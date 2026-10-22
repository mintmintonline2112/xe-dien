"use client";

/**
 * Chặn chuột phải, bôi đen, Ctrl+C / cắt và kéo ảnh trên site public (Admin → Cài đặt → Hạn chế sao chép).
 * Dùng bởi: app/(site)/layout.tsx (chỉ render khi copyProtection khác false).
 * Lưu ý: chỉ là rào mềm phía trình duyệt. Ô nhập liệu vẫn gõ / dán / chọn chữ bình thường.
 * Gắn class `copy-guard` lên <html>; kiểu chữ không bôi đen nằm ở effects.css.
 */
import { useEffect } from "react";

const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable='true']";

function isFromEditable(event: Event): boolean {
  const target = event.target;
  return target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;
}

export function CopyGuard() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("copy-guard");

    const blockUnlessEditable = (event: Event) => {
      if (!isFromEditable(event)) event.preventDefault();
    };
    const blockImageDrag = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    };
    const blockedEvents = ["contextmenu", "copy", "cut", "selectstart"] as const;

    blockedEvents.forEach((name) => document.addEventListener(name, blockUnlessEditable));
    document.addEventListener("dragstart", blockImageDrag);
    return () => {
      root.classList.remove("copy-guard");
      blockedEvents.forEach((name) => document.removeEventListener(name, blockUnlessEditable));
      document.removeEventListener("dragstart", blockImageDrag);
    };
  }, []);

  return null;
}
