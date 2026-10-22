/**
 * Bảng blog_categories: danh mục blog (cây cha / con), SEO và bản dịch.
 * Dùng bởi: blog-categories.service.ts, blog-post.entity.ts, dashboard, client/blog-posts, database/seeding (blog.seed.ts).
 * Lưu ý: displayName trống thì website dùng name; translations dạng { en: { <field>: value } } (xem src/common/i18n/translations.ts).
 * Lưu ý: TypeORM nạp entity theo mẫu tên *.entity.ts (src/config/database.config.ts), không đổi tên file.
 */
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
import { BlogPost } from '../../blog-posts/entities/blog-post.entity';

@Entity('blog_categories')
@Index('IDX_blog_categories_parent', ['parentId'])
export class BlogCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName: string | null;

  @Index('UQ_blog_categories_slug', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
  parentId: number | null;

  @ManyToOne(() => BlogCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'FK_blog_categories_parent',
  })
  parent: BlogCategory | null;

  @OneToMany(() => BlogCategory, (category) => category.parent)
  children: BlogCategory[];

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index('IDX_blog_categories_active')
  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({
    name: 'meta_description',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  metaDescription: string | null;

  @Column({
    name: 'og_image_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  ogImagePath: string | null;

  @Column({
    name: 'canonical_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  canonicalUrl: string | null;

  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @OneToMany(() => BlogPost, (post) => post.category)
  posts: BlogPost[];
}
