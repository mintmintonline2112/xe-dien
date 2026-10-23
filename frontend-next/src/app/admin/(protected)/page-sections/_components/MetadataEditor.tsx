'use client';

/**
 * Khu chỉnh metadata trực quan theo danh mục component (bảng section_definitions): bố cục, danh sách chuỗi, danh sách mục
 * có ảnh / chú thích, nhóm ô chữ, ảnh đơn (kèm điểm lấy nét), JSON — thêm / xoá / di chuyển bằng nút, không cần biết JSON.
 * Dùng bởi: PageSectionForm.tsx.
 * Lưu ý: field có `layouts` chỉ hiện khi bố cục đang chọn thuộc danh sách đó. Item dạng chuỗi cũ vẫn đọc được (thành field
 * đầu tiên). textMap có key `__self__` = các ô chữ nằm thẳng ở gốc metadata.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, ImageIcon, Plus, Trash2 } from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/LibraryPicker';
import { FocalPointPicker } from '@/app/admin/(protected)/page-sections/_components/FocalPointPicker';
import type { SectionDefinition, SectionFieldSpec } from '@/app/admin/(protected)/page-sections/_lib/page-section.service';

type SectionMetadata = Record<string, unknown>;

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function moveItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function RowControls({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (toIndex: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="me-row-controls">
      <button type="button" className="adm-icon-btn" title="Lên" disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ChevronUp size={14} />
      </button>
      <button type="button" className="adm-icon-btn" title="Xuống" disabled={index === total - 1} onClick={() => onMove(index + 1)}>
        <ChevronDown size={14} />
      </button>
      <button type="button" className="adm-icon-btn me-remove" title="Xóa" onClick={onRemove}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function SelectFieldEditor({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'select' }>;
  value: unknown;
  onChange: (next: string) => void;
}) {
  const selectedValue = typeof value === 'string' ? value : spec.options[0]?.value;
  const selectedOption = spec.options.find((option) => option.value === selectedValue);
  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <div className="me-segmented" role="radiogroup" aria-label={spec.label}>
        {spec.options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === selectedValue}
            className={`me-segment${option.value === selectedValue ? ' is-active' : ''}`}
            title={option.hint}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selectedOption?.hint ? <p className="gf-hint">{selectedOption.hint}</p> : null}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function StringListEditor({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'stringList' }>;
  value: unknown;
  onChange: (next: string[]) => void;
}) {
  const items = toArray(value).map((item) => (typeof item === 'string' ? item : String(item ?? '')));
  return (
    <div className="me-field">
      <div className="me-field-head">
        <label className="gf-label">{spec.label}</label>
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => onChange([...items, ''])}>
          <Plus size={13} /> Thêm dòng
        </button>
      </div>
      {items.map((item, index) => (
        <div className="me-row" key={index}>
          <input
            className="gf-control"
            value={item}
            onChange={(e) => onChange(items.map((line, i) => (i === index ? e.target.value : line)))}
          />
          <RowControls
            index={index}
            total={items.length}
            onMove={(toIndex) => onChange(moveItem(items, index, toIndex))}
            onRemove={() => onChange(items.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function ItemListEditor({
  spec,
  value,
  onChange,
  onPickImage,
}: {
  spec: Extract<SectionFieldSpec, { type: 'itemList' }>;
  value: unknown;
  onChange: (next: Array<Record<string, string>>) => void;
  onPickImage: (apply: (url: string) => void) => void;
}) {
  const firstField = spec.itemFields[0]?.name ?? 'value';
  const items = toArray(value).map((item) => {
    if (typeof item === 'string') return { [firstField]: item } as Record<string, string>;
    if (item && typeof item === 'object') {
      const normalizedItem: Record<string, string> = {};
      for (const field of spec.itemFields) {
        const raw = (item as Record<string, unknown>)[field.name];
        normalizedItem[field.name] = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
      }
      return normalizedItem;
    }
    return {} as Record<string, string>;
  });

  const updateItemField = (index: number, name: string, fieldValue: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [name]: fieldValue } : item)));

  return (
    <div className="me-field">
      <div className="me-field-head">
        <label className="gf-label">{spec.label}</label>
        <button
          type="button"
          className="adm-btn adm-btn--sm"
          onClick={() => onChange([...items, Object.fromEntries(spec.itemFields.map((field) => [field.name, '']))])}
        >
          <Plus size={13} /> Thêm mục
        </button>
      </div>
      {items.map((item, index) => (
        <div className="me-card" key={index}>
          <div className="me-card-fields">
            {spec.itemFields.map((field) => (
              <div key={field.name} className="me-card-field">
                <label className="gf-label">{field.label}</label>
                {field.kind === 'image' ? (
                  <div className="me-image-row">
                    <input
                      className="gf-control"
                      value={item[field.name] ?? ''}
                      placeholder="/images/... hoặc chọn từ Thư viện"
                      onChange={(e) => updateItemField(index, field.name, e.target.value)}
                    />
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm"
                      onClick={() => onPickImage((url) => updateItemField(index, field.name, url))}
                    >
                      <ImageIcon size={13} /> Thư viện
                    </button>
                    {item[field.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="me-thumb" src={item[field.name]} alt="" />
                    ) : null}
                  </div>
                ) : field.kind === 'textarea' ? (
                  <textarea
                    className="gf-control"
                    rows={2}
                    value={item[field.name] ?? ''}
                    onChange={(e) => updateItemField(index, field.name, e.target.value)}
                  />
                ) : (
                  <input
                    className="gf-control"
                    value={item[field.name] ?? ''}
                    onChange={(e) => updateItemField(index, field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <RowControls
            index={index}
            total={items.length}
            onMove={(toIndex) => onChange(moveItem(items, index, toIndex))}
            onRemove={() => onChange(items.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function ImageFieldEditor({
  spec,
  value,
  onChange,
  onPickImage,
  position,
  onPositionChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'image' }>;
  value: unknown;
  onChange: (next: string | undefined) => void;
  onPickImage: (apply: (url: string) => void) => void;
  position: unknown;
  onPositionChange: (next: string | undefined) => void;
}) {
  const url = typeof value === 'string' ? value : '';

  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <div className="me-image-row">
        <input
          className="gf-control"
          value={url}
          placeholder="/images/... hoặc chọn từ Thư viện"
          onChange={(e) => onChange(e.target.value || undefined)}
        />
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => onPickImage((picked) => onChange(picked))}>
          <ImageIcon size={13} /> Thư viện
        </button>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="me-thumb" src={url} alt="" />
        ) : null}
      </div>
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
      {spec.positionKey && url ? (
        <FocalPointPicker
          url={url}
          value={typeof position === 'string' ? position : undefined}
          onChange={onPositionChange}
        />
      ) : null}
    </div>
  );
}

function TextMapEditor({
  spec,
  metadata,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'textMap' }>;
  metadata: SectionMetadata;
  onChange: (next: SectionMetadata) => void;
}) {
  const isStoredAtRoot = spec.key === '__self__';
  const textMap = isStoredAtRoot ? metadata : ((metadata[spec.key] as SectionMetadata | undefined) ?? {});

  const updateTextField = (name: string, value: string) => {
    const nextTextMap = { ...textMap, [name]: value };
    onChange(isStoredAtRoot ? nextTextMap : { ...metadata, [spec.key]: nextTextMap });
  };

  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <div className="me-card-fields">
        {spec.fields.map((field) => (
          <div key={field.name} className="me-card-field">
            <label className="gf-label">{field.label}</label>
            <input
              className="gf-control"
              value={typeof textMap[field.name] === 'string' ? (textMap[field.name] as string) : ''}
              onChange={(e) => updateTextField(field.name, e.target.value)}
            />
          </div>
        ))}
      </div>
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function JsonKeyEditor({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'json' }>;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [draft, setDraft] = useState(() => (value == null ? '' : JSON.stringify(value, null, 2)));
  const [hasError, setHasError] = useState(false);
  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <textarea
        className={`gf-control me-json${hasError ? ' me-json-error' : ''}`}
        rows={7}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const raw = draft.trim();
          if (!raw) {
            setHasError(false);
            onChange(undefined);
            return;
          }
          try {
            onChange(JSON.parse(raw));
            setHasError(false);
          } catch {
            setHasError(true);
          }
        }}
      />
      {hasError ? <p className="gf-hint me-error">JSON không hợp lệ — chưa được áp dụng.</p> : null}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

export function MetadataEditor({
  definition,
  value,
  onChange,
}: {
  definition?: SectionDefinition;
  value: SectionMetadata;
  onChange: (next: SectionMetadata) => void;
}) {
  const [imagePicker, setImagePicker] = useState<{ apply: (url: string) => void } | null>(null);
  const [advancedDraft, setAdvancedDraft] = useState<string | null>(null);
  const [hasAdvancedError, setHasAdvancedError] = useState(false);

  const setMetadataKey = (key: string, keyValue: unknown) => {
    const nextMetadata = { ...value };
    if (keyValue === undefined) delete nextMetadata[key];
    else nextMetadata[key] = keyValue;
    onChange(nextMetadata);
  };

  const specs = definition?.fields ?? [];
  const layoutSpec = specs.find((spec): spec is Extract<SectionFieldSpec, { type: 'select' }> => spec.key === 'layout' && spec.type === 'select');
  const currentLayout = (typeof value.layout === 'string' ? value.layout : undefined) ?? layoutSpec?.options[0]?.value;

  const visibleSpecs = specs.filter(
    (spec) => !spec.layouts || (!!currentLayout && spec.layouts.includes(currentLayout)),
  );

  return (
    <div className="me-wrap">
      <div className="me-head">
        <strong>Nội dung có cấu trúc của khối</strong>
        <small>
          {definition
            ? definition.description ?? definition.label
            : 'Section thuộc danh mục sẽ có khu chỉnh sửa trực quan tại đây. Khối generic không cần metadata — chỉ dùng heading, nội dung và ảnh minh họa.'}
        </small>
      </div>

      {visibleSpecs.map((spec) => {
        if (spec.type === 'select') {
          return (
            <SelectFieldEditor key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => setMetadataKey(spec.key, next)} />
          );
        }
        if (spec.type === 'stringList') {
          return (
            <StringListEditor key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => setMetadataKey(spec.key, next)} />
          );
        }
        if (spec.type === 'itemList') {
          return (
            <ItemListEditor
              key={spec.key}
              spec={spec}
              value={value[spec.key]}
              onChange={(next) => setMetadataKey(spec.key, next)}
              onPickImage={(apply) => setImagePicker({ apply })}
            />
          );
        }
        if (spec.type === 'textMap') {
          return <TextMapEditor key={spec.key} spec={spec} metadata={value} onChange={onChange} />;
        }
        if (spec.type === 'image') {
          return (
            <ImageFieldEditor
              key={spec.key}
              spec={spec}
              value={value[spec.key]}
              onChange={(next) => setMetadataKey(spec.key, next)}
              onPickImage={(apply) => setImagePicker({ apply })}
              position={spec.positionKey ? value[spec.positionKey] : undefined}
              onPositionChange={(next) => {
                if (spec.positionKey) setMetadataKey(spec.positionKey, next);
              }}
            />
          );
        }
        return (
          <JsonKeyEditor key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => setMetadataKey(spec.key, next)} />
        );
      })}

      <details className="gf-group me-advanced">
        <summary className="gf-group-summary">
          <strong>Nâng cao — JSON đầy đủ</strong>
          <small>Dành cho dữ liệu ngoài danh mục; sửa xong bấm &ldquo;Áp dụng JSON&rdquo;.</small>
        </summary>
        <div className="gf-group-body">
          <textarea
            className={`gf-control me-json${hasAdvancedError ? ' me-json-error' : ''}`}
            rows={9}
            value={advancedDraft ?? JSON.stringify(value, null, 2)}
            onChange={(e) => setAdvancedDraft(e.target.value)}
          />
          {hasAdvancedError ? (
            <p className="gf-hint me-error">JSON không hợp lệ — chưa được áp dụng.</p>
          ) : null}
          <button
            type="button"
            className="adm-btn adm-btn--sm"
            onClick={() => {
              const raw = (advancedDraft ?? '').trim();
              if (advancedDraft === null) return;
              try {
                const parsed: unknown = raw ? JSON.parse(raw) : {};
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
                onChange(parsed as SectionMetadata);
                setAdvancedDraft(null);
                setHasAdvancedError(false);
              } catch {
                setHasAdvancedError(true);
              }
            }}
          >
            Áp dụng JSON
          </button>
        </div>
      </details>

      {imagePicker ? (
        <LibraryPicker
          isOpen
          onClose={() => setImagePicker(null)}
          onSelect={(url) => {
            imagePicker.apply(url);
            setImagePicker(null);
          }}
        />
      ) : null}
    </div>
  );
}
