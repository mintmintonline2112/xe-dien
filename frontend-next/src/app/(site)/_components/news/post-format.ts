/**
 * Định dạng ngày đăng (dd/mm/yyyy kiểu Việt Nam) và ước lượng số phút đọc của bài viết.
 * Dùng bởi: news/PostCard.tsx, trang tin-tuc, tin-tuc/[slug].
 */
const VN_DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const WORDS_PER_MINUTE = 220;

export function formatPostDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : VN_DATE_FORMATTER.format(date);
}

export function formatReadingTime(html: string | null | undefined): string {
  const words = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} phút đọc`;
}
