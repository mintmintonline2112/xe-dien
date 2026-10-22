/**
 * Đọc dữ liệu section: kiểu props, nền xen kẽ, số thứ tự và các hàm lấy metadata an toàn (textOf, itemsOf, layoutOf…).
 * Dùng bởi: mọi section qua _shared/index.ts, _shared/blocks.tsx.
 * Lưu ý: section chỉ đọc metadata qua các hàm ở đây, không đọc `section.metadata.x` trực tiếp (lint:sections S6).
 * `section` có thể thiếu (trang dựng tay) nên mọi hàm đều chịu null; item là chuỗi (dữ liệu cũ) được nâng thành {title,label}.
 */
import { toMediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import type { PageSection } from "@/types/cms";

export type SectionProps = { section?: PageSection | null; index?: number };

export type SectionTone = "plain" | "tint" | "dark";

export const alternatingTone = (index = 0): SectionTone =>
  index % 2 === 1 ? "tint" : "plain";

export const formatOrdinal = (index: number) => String(index + 1).padStart(2, "0");

export type Meta = Record<string, unknown>;

export const metadataOf = (section?: PageSection | null): Meta =>
  (section?.metadata ?? {}) as Meta;

export const shouldShowEyebrow = (section?: PageSection | null): boolean =>
  metadataOf(section).showEyebrow === true;

export function metaOf<T>(
  section: PageSection | null | undefined,
  key: string,
): T | undefined {
  const value = metadataOf(section)[key];
  return value === undefined || value === null ? undefined : (value as T);
}

export function textOf(
  section: PageSection | null | undefined,
  key: string,
): string | undefined {
  const value = metadataOf(section)[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function textListOf(
  section: PageSection | null | undefined,
  key: string,
): string[] {
  const raw = metadataOf(section)[key];
  return Array.isArray(raw)
    ? raw
        .filter((entry): entry is string => typeof entry === "string" && !!entry.trim())
        .map((entry) => entry.trim())
    : [];
}

export function itemsOf(
  section: PageSection | null | undefined,
  key: string,
): Array<Record<string, string>> {
  const raw = metadataOf(section)[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string")
        return item.trim() ? { label: item.trim(), title: item.trim() } : null;
      if (item && typeof item === "object") {
        const cleaned: Record<string, string> = {};
        for (const [field, value] of Object.entries(item as Meta)) {
          if (typeof value === "string" && value.trim()) cleaned[field] = value.trim();
        }
        return cleaned;
      }
      return null;
    })
    .filter(
      (item): item is Record<string, string> =>
        !!item && Object.keys(item).length > 0,
    );
}

export function layoutOf<L extends string>(
  section: PageSection | null | undefined,
  allowed: readonly L[],
  fallback: L,
): L {
  const raw = textOf(section, "layout");
  return raw && (allowed as readonly string[]).includes(raw)
    ? (raw as L)
    : fallback;
}

export const anchorIdOf = (
  section: PageSection | null | undefined,
  fallback: string,
) => section?.sectionKey ?? fallback;

export const resolveImage = (path: string) =>
  path.startsWith("/images/") ? path : (toMediaUrl(path) ?? path);

export function toHtml(text: string): string {
  if (/^\s*</.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${paragraph.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

export const splitParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export function toInlineHtml(text: string): string {
  const sanitized = sanitizeRichText(text.trim());
  const singleParagraph = sanitized.match(/^<p>([\s\S]*)<\/p>$/);
  return singleParagraph && !singleParagraph[1].includes("<p") ? singleParagraph[1] : sanitized;
}
