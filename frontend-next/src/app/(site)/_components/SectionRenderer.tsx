/**
 * Render một page-section bằng component trong registry (sections/index.ts), và danh sách section của một trang.
 * Dùng bởi: app/(site)/page.tsx, san-pham/page.tsx, lien-he/page.tsx, [slug]/page.tsx.
 * Lưu ý: loại component đọc từ metadata._component, thiếu thì theo sectionKey; không khớp registry thì dùng GenericBlock.
 * Chỉ render section đang bật, theo sortOrder.
 */
import { GenericBlock, resolveComponent } from "@/app/(site)/_components/sections";
import type { CmsPage, PageSection } from "@/types/cms";

export function componentTypeOf(section: PageSection): string {
  const metadata = (section.metadata ?? {}) as Record<string, unknown>;
  return typeof metadata._component === "string" && metadata._component ? metadata._component : section.sectionKey;
}

export function SectionRenderer({ section, index }: { section: PageSection; index: number }) {
  const Component = resolveComponent(componentTypeOf(section));
  if (!Component) return <GenericBlock section={section} index={index} />;
  return <Component section={section} index={index} />;
}

export function activeSectionsOf(page: CmsPage | null | undefined): PageSection[] {
  return (page?.sections ?? [])
    .filter((section) => section.isActive !== false)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function PageSections({ page }: { page: CmsPage }) {
  return (
    <>
      {activeSectionsOf(page).map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}
    </>
  );
}
