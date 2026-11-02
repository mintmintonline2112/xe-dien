'use client';

/**
 * Ô chọn icon dạng lưới: mỗi lựa chọn là một nút có hình icon + tên, bấm để chọn, có nút "không dùng icon".
 * Dùng bởi: GenericForm.tsx (field type 'iconSelect', VD icon danh mục sản phẩm).
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { GenericSelectOption } from './types';

export function IconSelectInput({
  value,
  onChange,
  options,
  emptyLabel = 'Không dùng icon',
  renderOptionIcon,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: GenericSelectOption[];
  emptyLabel?: string;
  renderOptionIcon?: (value: string) => ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="gf-icon-grid" role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={value === ''}
        className={cn('gf-icon-option is-empty', value === '' && 'is-selected')}
        onClick={() => onChange('')}
        disabled={disabled}
      >
        <span className="gf-icon-option-art">—</span>
        <span className="gf-icon-option-label">{emptyLabel}</span>
      </button>
      {options.map((option) => {
        const optionValue = String(option.value);
        const isSelected = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={cn('gf-icon-option', isSelected && 'is-selected')}
            onClick={() => onChange(optionValue)}
            disabled={disabled || option.disabled}
            title={option.label}
          >
            <span className="gf-icon-option-art">{renderOptionIcon?.(optionValue)}</span>
            <span className="gf-icon-option-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
