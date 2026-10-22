/**
 * 4 màu thương hiệu (chỉnh ở Admin → Cài đặt): field cho form, giá trị mặc định, sắc độ suy ra để xem trước, CSS đè biến --brand-*.
 * Dùng bởi: app/(site)/layout.tsx (chèn CSS), SettingsScreen.tsx, settings.service.ts, settings/site-settings.ts.
 * Lưu ý: BRAND_SHADES phải khớp công thức color-mix trong styles/base.css. File không import gì để dùng được ở cả server lẫn client.
 */
export type BrandColorKey = "primary" | "secondary" | "black" | "white";
export type BrandColors = Partial<Record<BrandColorKey, string>>;

export const BRAND_COLOR_FIELDS: Array<{
  key: BrandColorKey;
  label: string;
  hint: string;
  defaultValue: string;
}> = [
  {
    key: "primary",
    label: "Màu chủ đạo",
    hint: "Thanh menu, nút chính, dải nền tối (banner, form tư vấn, footer), tiêu đề",
    defaultValue: "#0A7D4F",
  },
  {
    key: "secondary",
    label: "Màu phụ (vàng volt)",
    hint: "Nút trả góp / CTA nổi bật, nhãn sản phẩm, điểm nhấn",
    defaultValue: "#FFB81C",
  },
  {
    key: "black",
    label: "Màu đen (chữ)",
    hint: "Chữ nội dung; chữ phụ và chữ mờ là sắc nhạt hơn của màu này",
    defaultValue: "#1A2420",
  },
  {
    key: "white",
    label: "Màu trắng",
    hint: "Nền thẻ, chữ trên nền tối",
    defaultValue: "#FFFFFF",
  },
];

export const BRAND_COLOR_DEFAULTS = Object.fromEntries(
  BRAND_COLOR_FIELDS.map((field) => [field.key, field.defaultValue]),
) as Record<BrandColorKey, string>;

export const BRAND_SHADES: Array<{ label: string; css: string }> = [
  { label: "Chủ đạo 900", css: "color-mix(in oklab, var(--brand-primary) 58%, #000)" },
  { label: "Chủ đạo 800", css: "color-mix(in oklab, var(--brand-primary) 78%, #000)" },
  { label: "Chủ đạo 700", css: "var(--brand-primary)" },
  { label: "Chủ đạo 600", css: "color-mix(in oklab, var(--brand-primary) 80%, #fff)" },
  { label: "Chủ đạo 100", css: "color-mix(in oklab, var(--brand-primary) 14%, #fff)" },
  { label: "Vàng 500", css: "color-mix(in oklab, var(--brand-secondary) 72%, #000)" },
  { label: "Vàng 400", css: "var(--brand-secondary)" },
  { label: "Vàng 300", css: "color-mix(in oklab, var(--brand-secondary) 82%, #fff)" },
  { label: "Vàng 100", css: "color-mix(in oklab, var(--brand-secondary) 22%, #fff)" },
  { label: "Chữ", css: "var(--brand-black)" },
  { label: "Chữ phụ", css: "color-mix(in oklab, var(--brand-black) 78%, #fff)" },
  { label: "Chữ mờ", css: "color-mix(in oklab, var(--brand-black) 62%, #fff)" },
];

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function isBrandHex(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value);
}

export function buildBrandColorsCss(colors: BrandColors | null | undefined): string {
  const declarations = BRAND_COLOR_FIELDS.filter((field) =>
    isBrandHex(colors?.[field.key]),
  ).map((field) => `--brand-${field.key}: ${colors![field.key]};`);
  return declarations.length > 0 ? `:root { ${declarations.join(" ")} }` : "";
}
