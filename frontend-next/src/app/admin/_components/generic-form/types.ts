/**
 * Kiểu dữ liệu của GenericForm: loại field, field, nhóm field, lựa chọn của ô select.
 * Dùng bởi: GenericForm.tsx, _lib/publish-status.ts, seo-fields.ts và các màn *Form.tsx của admin.
 * Lưu ý: field `video` lưu hướng video vào `orientationKey` (mặc định `${key}Orientation`); `renderExtra` nhận toàn bộ giá trị form.
 * Giá trị của field danh sách: `stringList` = string[], `pairList` = { label, value }[] (tên cột ở `pairColumns`), `imageList` = string[] đường dẫn ảnh.
 */
import type { ReactNode } from 'react';
import type { RegisterOptions } from 'react-hook-form';

export type GenericFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'image'
  | 'imageUrl'
  | 'video'
  | 'date'
  | 'tel'
  | 'tags'
  | 'stringList'
  | 'pairList'
  | 'imageList';

export interface GenericSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface GenericFormGroup {
  id: string;
  title: string;
  description?: string;
  collapsed?: boolean;
}

export interface GenericFormField {
  key: string;
  label: string;
  type: GenericFieldType;

  group?: string;

  placeholder?: string;
  hint?: string;
  autocomplete?: string;

  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;

  options?: GenericSelectOption[];

  orientationKey?: string;

  pairColumns?: { label: string; value: string };
  addLabel?: string;
  uploadFolder?: string;

  showPasswordToggle?: boolean;

  rules?: RegisterOptions;
  minLength?: number;

  className?: string;

  renderExtra?: (values: Record<string, unknown>) => ReactNode;
}
