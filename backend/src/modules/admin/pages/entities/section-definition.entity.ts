/**
 * Bảng section_definitions: danh mục component của website, mỗi component có những layout / field metadata gì.
 * Dùng bởi: page-sections.service.ts (kiểm tra metadata), section-definitions.controller.ts (admin dựng form), seeds/section-definition.seed.ts.
 * Lưu ý: bản ghi do seed đồng bộ theo code, admin chỉ đọc. Field có `layouts` chỉ hiện và chỉ kiểm tra khi
 * metadata.layout thuộc danh sách đó; `positionKey` của field ảnh là key lưu CSS object-position.
 * pageSlug hiện luôn là `shared` (dùng được ở mọi trang).
 */
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

type FieldSpecBase = {
  key: string;
  label: string;
  hint?: string;
  layouts?: string[];
};

export type SectionFieldSpec = FieldSpecBase &
  (
    | { type: 'stringList' }
    | {
        type: 'itemList';
        itemFields: Array<{
          name: string;
          label: string;
          kind: 'text' | 'textarea' | 'image';
        }>;
      }
    | {
        type: 'textMap';
        fields: Array<{ name: string; label: string }>;
      }
    | {
        type: 'image';
        positionKey?: string;
      }
    | { type: 'json' }
    | {
        type: 'select';
        options: Array<{ value: string; label: string; hint?: string }>;
      }
  );

@Entity('section_definitions')
export class SectionDefinition extends BaseEntity {
  @Column({ name: 'page_slug', type: 'varchar', length: 120 })
  pageSlug: string;

  @Index('UQ_section_definitions_key', { unique: true })
  @Column({ name: 'section_key', type: 'varchar', length: 120 })
  sectionKey: string;

  @Column({ type: 'varchar', length: 160 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json' })
  fields: SectionFieldSpec[];
}
