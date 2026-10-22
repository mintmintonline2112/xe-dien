"use client";

/**
 * Danh sách bấm để mở mô tả (mục đầu mở sẵn) — phần tương tác của section `example`.
 * Dùng bởi: Example.tsx cùng thư mục.
 * Lưu ý: chỉ nhận dữ liệu thuần qua props, id phần tử tạo bằng useId() để đặt section 2 lần không trùng id.
 */

import { useId, useState } from "react";
import { cn } from "@/utils/cn";

export type ExampleItem = { title?: string; text?: string };

export function ExampleWidget({ items }: { items: ExampleItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();

  return (
    <ul className="reveal flex flex-col border-t border-line">
      {items.map((item, i) => {
        const isOpen = i === openIndex;
        const panelId = `${baseId}-${i}`;
        return (
          <li key={item.title ?? i} className="border-b border-line">
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left font-display text-lg font-semibold transition-[background-color,color] duration-200 ease-brand",
                isOpen ? "bg-navy-700 text-light" : "text-ink hover:bg-navy-50",
              )}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(i)}
            >
              <span>{item.title}</span>
            </button>
            {isOpen && item.text ? (
              <p id={panelId} className="m-0 px-4 py-4 text-ink-soft">
                {item.text}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
