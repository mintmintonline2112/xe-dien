/**
 * Registry section: key (kebab-case) = tên thư mục = `metadata._component` = key bảng section_definitions → component.
 * Dùng bởi: _components/SectionRenderer.tsx; scripts/new-section.mjs và scripts/lint-sections.mjs đọc / sửa file này.
 * Lưu ý: new-section.mjs chèn bằng regex vào khối import, SECTION_COMPONENTS và `export {…}` — giữ đúng định dạng đó.
 * Thêm component = 1 dòng ở đây + 1 entry trong backend section-definition.seed.ts (+ hình trong admin ComponentPicker.tsx).
 */
import type { ComponentType } from "react";
import type { SectionProps } from "./_shared";

import { CategoryGrid } from "./category-grid/CategoryGrid";
import { Checklist } from "./checklist/Checklist";
import { Contact } from "./contact/Contact";
import { Faq } from "./faq/Faq";
import { FeatureCards } from "./feature-cards/FeatureCards";
import { FeatureList } from "./feature-list/FeatureList";
import { Hero } from "./hero/Hero";
import { IconCardList } from "./icon-card-list/IconCardList";
import { Marquee } from "./marquee/Marquee";
import { MediaCards } from "./media-cards/MediaCards";
import { MediaTabs } from "./media-tabs/MediaTabs";
import { NumberedList } from "./numbered-list/NumberedList";
import { PhotoSlider } from "./photo-slider/PhotoSlider";
import { PhotoStrip } from "./photo-strip/PhotoStrip";
import { PostList } from "./post-list/PostList";
import { ProductGrid } from "./product-grid/ProductGrid";
import { PromoTiles } from "./promo-tiles/PromoTiles";
import { QuoteForm } from "./quote-form/QuoteForm";
import { RichText } from "./rich-text/RichText";
import { ServiceStrip } from "./service-strip/ServiceStrip";
import { SpecSheet } from "./spec-sheet/SpecSheet";
import { Stats } from "./stats/Stats";
import { Steps } from "./steps/Steps";
import { StoreList } from "./store-list/StoreList";

export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  hero: Hero,
  "promo-tiles": PromoTiles,
  "product-grid": ProductGrid,
  "category-grid": CategoryGrid,
  "post-list": PostList,
  "store-list": StoreList,
  "service-strip": ServiceStrip,
  "rich-text": RichText,
  stats: Stats,
  "media-cards": MediaCards,
  "media-tabs": MediaTabs,
  "photo-strip": PhotoStrip,
  "photo-slider": PhotoSlider,
  "icon-card-list": IconCardList,
  "spec-sheet": SpecSheet,
  steps: Steps,
  "feature-list": FeatureList,
  marquee: Marquee,
  "feature-cards": FeatureCards,
  faq: Faq,
  "quote-form": QuoteForm,
  checklist: Checklist,
  "numbered-list": NumberedList,
  contact: Contact,
};

export function resolveComponent(key: string): ComponentType<SectionProps> | null {
  return SECTION_COMPONENTS[key] ?? null;
}

export {
  CategoryGrid,
  Checklist,
  Contact,
  Faq,
  FeatureCards,
  FeatureList,
  Hero,
  IconCardList,
  Marquee,
  MediaCards,
  MediaTabs,
  NumberedList,
  PhotoSlider,
  PhotoStrip,
  PostList,
  ProductGrid,
  PromoTiles,
  QuoteForm,
  RichText,
  ServiceStrip,
  SpecSheet,
  Stats,
  Steps,
  StoreList,
};
export { GenericBlock } from "./generic-block/GenericBlock";
export type { SectionProps } from "./_shared";
