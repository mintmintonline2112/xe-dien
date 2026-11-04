'use client';

/**
 * Field "chọn danh mục" của khối ô danh mục (category-grid): chọn danh mục nào hiện và xếp thứ tự riêng cho khối, lưu mảng slug
 * vào metadata (vd categorySlugs).
 * Dùng bởi: MetadataEditor.tsx (field type `categoryPicker`).
 * Lưu ý: thứ tự ở đây độc lập với Admin → Danh mục sản phẩm; danh sách trống = khối tự lấy theo thứ tự danh mục. Slug không còn
 * tồn tại vẫn giữ trong danh sách (hiện "đã xoá") để admin tự gỡ, website bỏ qua slug đó.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ListRestart, Trash2 } from 'lucide-react';
import { SiteIcon } from '@/app/(site)/_components/SiteIcon';
import {
  buildCategoryOptions,
  productCategoryService,
  PRODUCT_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import type { SectionFieldSpec } from '@/app/admin/(protected)/page-sections/_lib/page-section.service';

function moveSlug(slugs: string[], fromIndex: number, toIndex: number): string[] {
  if (toIndex < 0 || toIndex >= slugs.length) return slugs;
  const next = slugs.slice();
  const [slug] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, slug);
  return next;
}

export function CategoryPickerField({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'categoryPicker' }>;
  value: unknown;
  onChange: (next: string[] | undefined) => void;
}) {
  const { data } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => productCategoryService.paginate({ limit: 1000 }),
  });
  const categories = useMemo(() => data?.data ?? [], [data]);
  const categoryBySlug = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);

  const chosenSlugs = Array.isArray(value) ? value.filter((slug): slug is string => typeof slug === 'string') : [];
  const addableOptions = buildCategoryOptions(categories).filter((option) => {
    const category = categories.find((item) => item.id === option.value);
    return category && !chosenSlugs.includes(category.slug);
  });

  const updateSlugs = (next: string[]) => onChange(next.length > 0 ? next : undefined);

  const fillWithRootCategories = () =>
    updateSlugs(categories.filter((category) => category.parentId == null).map((category) => category.slug));

  return (
    <div className="me-field">
      <div className="me-field-head">
        <label className="gf-label">{spec.label}</label>
        {chosenSlugs.length === 0 && categories.length > 0 ? (
          <button type="button" className="adm-btn adm-btn--sm" onClick={fillWithRootCategories}>
            <ListRestart size={13} /> Lấy danh mục gốc để sắp xếp
          </button>
        ) : null}
      </div>

      {chosenSlugs.length === 0 ? (
        <p className="gf-hint">Chưa chọn — khối đang tự lấy danh mục theo thứ tự ở Admin → Danh mục sản phẩm.</p>
      ) : (
        <ol className="cp-list">
          {chosenSlugs.map((slug, index) => {
            const category = categoryBySlug.get(slug);
            return (
              <li key={slug} className="cp-row">
                <span className="cp-index">{index + 1}</span>
                <span className="cp-icon">{category?.icon ? <SiteIcon name={category.icon} className="h-5 w-5" /> : null}</span>
                <span className="cp-name">
                  {category?.name ?? slug}
                  {!category ? <em> (đã xoá)</em> : !category.isActive ? <em> (đang ẩn)</em> : null}
                </span>
                <span className="cp-slug">/{slug}</span>
                <div className="me-row-controls">
                  <button type="button" className="adm-icon-btn" title="Lên" disabled={index === 0} onClick={() => updateSlugs(moveSlug(chosenSlugs, index, index - 1))}>
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    title="Xuống"
                    disabled={index === chosenSlugs.length - 1}
                    onClick={() => updateSlugs(moveSlug(chosenSlugs, index, index + 1))}
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" className="adm-icon-btn me-remove" title="Bỏ khỏi khối" onClick={() => updateSlugs(chosenSlugs.filter((_, i) => i !== index))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {addableOptions.length > 0 ? (
        <select
          className="gf-control cp-add"
          value=""
          onChange={(e) => {
            const category = categories.find((item) => String(item.id) === e.target.value);
            if (category) updateSlugs([...chosenSlugs, category.slug]);
          }}
        >
          <option value="">+ Thêm danh mục vào khối…</option>
          {addableOptions.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {chosenSlugs.length > 0 ? (
        <button type="button" className="cp-reset" onClick={() => onChange(undefined)}>
          Bỏ chọn tất cả (quay lại tự lấy theo thứ tự danh mục)
        </button>
      ) : null}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}
