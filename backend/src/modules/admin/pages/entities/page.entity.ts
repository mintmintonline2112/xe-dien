/**
 * Bảng pages: trang nội dung của website (tiêu đề, ảnh đầu trang, SEO, bản dịch) và các section của nó.
 * Dùng bởi: pages.service.ts, modules/client/pages, dashboard, database (page.seed), scripts/layout-sync.
 * Lưu ý: heroImagePath trống = dùng ảnh mặc định của website; heroImagePosition là CSS object-position (VD "50% 62%");
 * translations dạng { en: { <field>: value } } (xem src/common/i18n/translations.ts).
 */
import { Column, Entity, OneToMany } from 'typeorm';
import { SeoContentEntity } from 'src/common/base/seo-content.entity';
import { PageSection } from './page-section.entity';

@Entity('pages')
export class Page extends SeoContentEntity {
  @Column({ type: 'varchar', length: 160, nullable: true })
  eyebrow: string | null;

  @Column({ type: 'text', nullable: true })
  lead: string | null;

  @Column({
    name: 'hero_image_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  heroImagePath: string | null;

  @Column({
    name: 'hero_image_position',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  heroImagePosition: string | null;

  @Column({
    name: 'template_key',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  templateKey: string | null;

  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @OneToMany(() => PageSection, (section) => section.page, {
    cascade: false,
  })
  sections: PageSection[];
}
