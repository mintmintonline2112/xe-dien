/**
 * Bảng menu_items: menu của website public, hai cấp, theo vị trí location (header = menu chính, footer = cột link chân trang).
 * Dùng bởi: menu-items.service.ts, các controller menu, database/seeding (seeding.module, seeds/menu.seed.ts).
 * Lưu ý: header — item gốc là mục menu, item con là menu thả xuống; footer — item gốc là tiêu đề cột, item con là link.
 * Cây public lọc vị trí theo item gốc, item con đi theo cha;
 * translations dạng { en: { <field>: value } } (xem src/common/i18n/translations.ts).
 */
import { BaseEntity } from 'src/common/base/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

export const MENU_LOCATIONS = ['header', 'footer'] as const;
export type MenuLocation = (typeof MENU_LOCATIONS)[number];

@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column({ type: 'varchar', length: 160 })
  label: string;

  @Column({ type: 'varchar', length: 500 })
  href: string;

  @Index('IDX_menu_items_parent')
  @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
  parentId: number | null;

  @ManyToOne(() => MenuItem, (item) => item.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuItem | null;

  @OneToMany(() => MenuItem, (item) => item.parent)
  children: MenuItem[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @Column({ name: 'show_submenu', type: 'boolean', default: true })
  showSubmenu: boolean;

  @Index('IDX_menu_items_location')
  @Column({ type: 'varchar', length: 20, default: 'header' })
  location: MenuLocation;
}
