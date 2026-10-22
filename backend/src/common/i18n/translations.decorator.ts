/**
 * Decorator @IsTranslations() cho field `translations` của DTO: nhận chuỗi JSON (form multipart kèm ảnh) hoặc object, rồi kiểm tra dạng { "en": { ... } }.
 * Dùng bởi: DTO tạo / sửa page, page-section, blog-post, blog-category, menu-item trong modules/admin.
 */
import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidTranslations } from './translations';

@ValidatorConstraint({ name: 'translations', async: false })
class TranslationsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidTranslations(value);
  }
  defaultMessage(): string {
    return 'translations phải có dạng { "en": { ... } }';
  }
}

export function IsTranslations() {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'Bản dịch theo ngôn ngữ, ví dụ { "en": { "title": "..." } }',
      type: 'object',
      additionalProperties: true,
    }),
    IsOptional(),
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }),
    Validate(TranslationsConstraint),
  );
}
