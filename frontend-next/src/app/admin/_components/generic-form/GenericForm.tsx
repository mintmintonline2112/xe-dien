'use client';

/**
 * Form dùng chung của admin dựng từ danh sách field (text, select, richtext, ảnh, video, tags, danh sách…), có nhóm gập/mở và cột ảnh bìa.
 * Dùng bởi: các màn *Form.tsx trong app/admin/(protected) (sản phẩm, bài viết, danh mục, trang, section, menu, nhân sự).
 * Lưu ý: chỉ gọi watch() toàn form khi có field dùng `renderExtra` (watch làm form re-render theo mỗi thay đổi).
 * Ảnh bìa hỏi nén trước khi nhận (hủy thì giữ ảnh cũ); ảnh đã qua hộp thoại thì backend không nén lại.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm, type DefaultValues, type FieldValues, type RegisterOptions } from 'react-hook-form';
import { ArrowLeft, Eye, EyeOff, Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';
import { RichTextEditor } from '@/app/admin/_components/rich-text-editor/RichTextEditor';
import { LibraryPicker } from '@/app/admin/_components/library-picker/LibraryPicker';
import { VideoInput, type VideoOrientation } from './VideoInput';
import { ImageListInput, PairListInput, StringListInput, type PairItem } from './ListFields';
import { useImageCompressConfirm } from '@/app/admin/_components/image-compress-dialog/useImageCompressConfirm';
import type { GenericFormField, GenericFormGroup } from './types';

interface GenericFormProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; link?: string }[];
  fields: GenericFormField[];
  groups?: GenericFormGroup[];
  defaultValues: DefaultValues<T>;
  isLoading?: boolean;
  readOnly?: boolean;
  submitLabel?: string;
  hideSubmit?: boolean;
  onSubmit: (values: T) => void;
  onCancel?: () => void;
  derive?: (values: T) => Partial<T>;
}

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export function GenericForm<T extends FieldValues>({
  title,
  subtitle,
  breadcrumbs = [],
  fields,
  groups = [],
  defaultValues,
  isLoading = false,
  readOnly = false,
  submitLabel = 'Lưu',
  hideSubmit = false,
  onSubmit,
  onCancel,
  derive,
}: GenericFormProps<T>) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    getValues,
    formState: { errors },
  } = useForm<T>({ defaultValues });

  useEffect(() => {
    if (!derive) return;
    const subscription = watch((values) => {
      const derived = derive(values as T);
      for (const [key, value] of Object.entries(derived)) {
        if ((getValues(key as never) as unknown) !== value) {
          setValue(key as never, value as never, { shouldDirty: false, shouldValidate: false });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [derive, watch, setValue, getValues]);

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [pickerFieldKey, setPickerFieldKey] = useState<string | null>(null);
  const { confirmCompress, dialog: compressDialog } = useImageCompressConfirm();

  const visibleFields = useMemo(() => fields.filter((field) => !field.hidden), [fields]);
  const extraValues = visibleFields.some((field) => field.renderExtra)
    ? (watch() as Record<string, unknown>)
    : null;
  const leftFields = useMemo(
    () => visibleFields.filter((field) => field.type !== 'image' && !field.group),
    [visibleFields],
  );
  const groupedFields = useMemo(
    () =>
      groups.map((group) => ({
        group,
        fields: visibleFields.filter((field) => field.type !== 'image' && field.group === group.id),
      })),
    [visibleFields, groups],
  );
  const imageField = useMemo(() => visibleFields.find((field) => field.type === 'image'), [visibleFields]);

  const imageValue = imageField ? watch(imageField.key as never) : undefined;
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageField) return;
    if (imageValue instanceof File) {
      const url = URL.createObjectURL(imageValue);
      setPreviewSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof imageValue === 'string' && imageValue) {
      setPreviewSrc(resolveImageUrl(imageValue));
    } else {
      setPreviewSrc(null);
    }
  }, [imageValue, imageField]);

  function buildRules(field: GenericFormField): RegisterOptions<T, never> {
    const rules: Record<string, unknown> = { ...field.rules };
    if (field.required) rules.required = 'Trường này là bắt buộc';
    if (field.minLength) {
      rules.minLength = { value: field.minLength, message: `Tối thiểu ${field.minLength} ký tự` };
    }
    if (field.type === 'email') {
      rules.pattern = { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' };
    }
    if (field.type === 'number') rules.valueAsNumber = true;
    return rules as unknown as RegisterOptions<T, never>;
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const rawFile = input.files?.[0];
    if (!rawFile || !imageField) return;
    const key = imageField.key as never;
    const compressedFiles = await confirmCompress([rawFile]);
    input.value = '';
    if (!compressedFiles) return;
    const file = compressedFiles[0];
    if (!IMAGE_TYPES.includes(file.type)) {
      setError(key, { type: 'invalidType', message: 'Chỉ chấp nhận JPG, JPEG, PNG, WEBP' });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError(key, { type: 'maxSize', message: 'Ảnh phải nhỏ hơn 15MB' });
      return;
    }
    clearErrors(key);
    setValue(key, file as never, { shouldDirty: true });
  }

  function removeImage() {
    if (!imageField) return;
    setValue(imageField.key as never, null as never, { shouldDirty: true });
    setPreviewSrc(null);
  }

  const isDisabled = (field: GenericFormField) =>
    readOnly || field.disabled || field.readonly;

  const errorMessageOf = (key: string) => (errors as Record<string, { message?: string }>)[key]?.message;

  function blockEnterSubmit(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }

  function renderField(field: GenericFormField) {
    return (
      <div key={field.key} className={field.className}>
        <label className="gf-label">
          {field.label}
          {field.required && <span className="gf-required">*</span>}
        </label>

        {field.type === 'stringList' ? (
          <StringListInput
            value={(watch(field.key as never) as unknown as string[]) ?? []}
            onChange={(nextValue) => setValue(field.key as never, nextValue as never, { shouldDirty: true })}
            placeholder={field.placeholder}
            addLabel={field.addLabel}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'pairList' ? (
          <PairListInput
            value={(watch(field.key as never) as unknown as PairItem[]) ?? []}
            onChange={(nextValue) => setValue(field.key as never, nextValue as never, { shouldDirty: true })}
            labelColumn={field.pairColumns?.label}
            valueColumn={field.pairColumns?.value}
            addLabel={field.addLabel}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'imageList' ? (
          <ImageListInput
            value={(watch(field.key as never) as unknown as string[]) ?? []}
            onChange={(nextValue) => setValue(field.key as never, nextValue as never, { shouldDirty: true })}
            uploadFolder={field.uploadFolder}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'tags' ? (
          <TagsInput
            value={(watch(field.key as never) as unknown as string) ?? ''}
            onChange={(nextValue) => setValue(field.key as never, nextValue as never, { shouldDirty: true })}
            placeholder={field.placeholder}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'video' ? (
          <VideoInput
            value={(watch(field.key as never) as unknown as string) ?? ''}
            orientation={
              (watch((field.orientationKey ?? `${field.key}Orientation`) as never) as unknown as
                VideoOrientation | '') || ''
            }
            onChange={(path, orientation) => {
              setValue(field.key as never, path as never, { shouldDirty: true });
              setValue(
                (field.orientationKey ?? `${field.key}Orientation`) as never,
                orientation as never,
                { shouldDirty: true },
              );
            }}
            placeholder={field.placeholder}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'imageUrl' ? (
          <ImageUrlInput
            value={(watch(field.key as never) as unknown as string) ?? ''}
            onChange={(nextValue) => setValue(field.key as never, nextValue as never, { shouldDirty: true })}
            onPick={() => setPickerFieldKey(field.key)}
            placeholder={field.placeholder}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'richtext' ? (
          <RichTextEditor
            value={(watch(field.key as never) as unknown as string) ?? ''}
            onChange={(html) => setValue(field.key as never, html as never, { shouldDirty: true })}
            placeholder={field.placeholder}
            disabled={isDisabled(field)}
          />
        ) : field.type === 'textarea' ? (
          <textarea
            {...register(field.key as never, buildRules(field))}
            placeholder={field.placeholder}
            disabled={isDisabled(field)}
            rows={4}
            className="gf-control"
          />
        ) : field.type === 'select' ? (
          <select
            {...register(field.key as never, buildRules(field))}
            disabled={isDisabled(field)}
            className="gf-control"
          >
            <option value="">{field.placeholder ?? 'Chọn...'}</option>
            {field.options?.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'checkbox' ? (
          <label className="gf-check">
            <input
              type="checkbox"
              {...register(field.key as never)}
              disabled={isDisabled(field)}
            />
            {field.hint && <span>{field.hint}</span>}
          </label>
        ) : field.type === 'password' ? (
          <div className="gf-password">
            <input
              type={showPassword[field.key] ? 'text' : 'password'}
              {...register(field.key as never, buildRules(field))}
              placeholder={field.placeholder}
              autoComplete={field.autocomplete}
              disabled={isDisabled(field)}
              className="gf-control"
            />
            {field.showPasswordToggle && (
              <button
                type="button"
                className="gf-eye"
                onClick={() => setShowPassword((current) => ({ ...current, [field.key]: !current[field.key] }))}
                aria-label="Hiện / ẩn mật khẩu"
              >
                {showPassword[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
        ) : (
          <input
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
            {...register(field.key as never, buildRules(field))}
            placeholder={field.placeholder}
            autoComplete={field.autocomplete}
            disabled={isDisabled(field)}
            className="gf-control"
          />
        )}

        {field.hint && field.type !== 'checkbox' && (
          <p className="gf-hint">{field.hint}</p>
        )}
        {errorMessageOf(field.key) && <p className="gf-error">{errorMessageOf(field.key)}</p>}
        {field.renderExtra && extraValues && field.renderExtra(extraValues)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => !isLoading && onSubmit(values))} onKeyDown={blockEnterSubmit}>
      <div className="gf-header">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : history.back())}
          className="gf-back"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          {title && <h1 className="adm-page-title">{title}</h1>}
          {subtitle && <p className="adm-page-subtitle">{subtitle}</p>}
          {breadcrumbs.length > 0 && (
            <nav className="gf-breadcrumbs">
              {breadcrumbs.map((breadcrumb, index) => (
                <span key={index}>
                  {breadcrumb.link ? <Link href={breadcrumb.link}>{breadcrumb.label}</Link> : breadcrumb.label}
                  {index < breadcrumbs.length - 1 && <span style={{ margin: '0 4px' }}>/</span>}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className={cn('gf-grid', imageField && 'has-image')}>
        <div className="gf-card">
          {leftFields.map(renderField)}

          {groupedFields.map(({ group, fields: groupFields }) =>
            groupFields.length > 0 ? (
              <details key={group.id} className="gf-group" open={!group.collapsed}>
                <summary className="gf-group-summary">
                  <strong>{group.title}</strong>
                  {group.description && <small>{group.description}</small>}
                </summary>
                <div className="gf-group-body">{groupFields.map(renderField)}</div>
              </details>
            ) : null,
          )}
        </div>

        {imageField && (
          <div className="gf-card">
            <div>
              <label className="gf-label">{imageField.label}</label>
              <div className="gf-image-box">
                {previewSrc ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewSrc} alt="preview" />
                    {!isDisabled(imageField) && (
                      <button type="button" onClick={removeImage} className="gf-image-remove" aria-label="Xóa ảnh">
                        <X size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <label className="gf-upload">
                    <Upload size={24} />
                    <span>Bấm để tải ảnh lên</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} disabled={isDisabled(imageField)} />
                  </label>
                )}
              </div>
              {!isDisabled(imageField) && (
                <div className="gf-image-actions">
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm"
                    onClick={() => setPickerFieldKey(imageField.key)}
                  >
                    <ImageIcon size={14} />
                    Chọn từ Thư viện
                  </button>
                  {previewSrc && (
                    <label className="adm-btn adm-btn--sm gf-image-replace">
                      <Upload size={14} />
                      Tải ảnh khác
                      <input type="file" accept="image/*" onChange={handleImageFileChange} />
                    </label>
                  )}
                </div>
              )}
              <p className="gf-hint">Chọn ảnh có sẵn trong Thư viện hoặc tải ảnh mới (JPG/PNG/WEBP, tối đa 15MB — hệ thống tự nén về ~1MB).</p>
              {errorMessageOf(imageField.key) && <p className="gf-error">{errorMessageOf(imageField.key)}</p>}
            </div>
          </div>
        )}
      </div>

      {!hideSubmit && !readOnly && (
        <div className="gf-actions">
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : history.back())}
            className="adm-btn"
          >
            Hủy
          </button>
          <button type="submit" disabled={isLoading} className="adm-btn adm-btn--primary">
            {isLoading && <span className="adm-spin" />}
            {submitLabel}
          </button>
        </div>
      )}

      {compressDialog}
      <LibraryPicker
        isOpen={pickerFieldKey !== null}
        onClose={() => setPickerFieldKey(null)}
        onSelect={(url) => {
          if (pickerFieldKey) {
            setValue(pickerFieldKey as never, url as never, { shouldDirty: true });
          }
        }}
      />
    </form>
  );
}

function ImageUrlInput({
  value,
  onChange,
  onPick,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onPick: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const previewSrc = resolveImageUrl(value);
  return (
    <div className="gf-imageurl">
      <div className="gf-imageurl-row">
        <input
          className="gf-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://... hoặc chọn từ Thư viện'}
          disabled={disabled}
        />
        <button type="button" className="adm-btn" onClick={onPick} disabled={disabled}>
          Thư viện
        </button>
        {value && !disabled && (
          <button
            type="button"
            className="adm-btn"
            onClick={() => onChange('')}
            aria-label="Bỏ ảnh"
            title="Bỏ ảnh"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {previewSrc && (
        <div className="gf-imageurl-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Xem trước" />
        </div>
      )}
    </div>
  );
}

function TagsInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState('');
  const tags = value ? value.split(',').map((tag) => tag.trim()).filter(Boolean) : [];

  function commitTag(rawTag: string) {
    const tag = rawTag.trim();
    setText('');
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag].join(', '));
  }

  function removeTagAt(index: number) {
    onChange(tags.filter((_, tagIndex) => tagIndex !== index).join(', '));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag(text);
    } else if (e.key === 'Backspace' && !text && tags.length) {
      removeTagAt(tags.length - 1);
    }
  }

  return (
    <div className={cn('gf-tags', disabled && 'is-disabled')}>
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="gf-tag">
          {tag}
          {!disabled && (
            <button type="button" onClick={() => removeTagAt(index)} aria-label={`Xóa ${tag}`}>
              <X size={12} />
            </button>
          )}
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitTag(text)}
        placeholder={tags.length ? '' : placeholder}
        disabled={disabled}
      />
    </div>
  );
}
