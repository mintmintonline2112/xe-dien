/**
 * Bảng product_categories: danh mục sản phẩm (cây cha / con 2 cấp), ảnh ô danh mục, key icon, SEO và bản dịch.
 * Dùng bởi: product-categories.service.ts, products/entities/product.entity.ts, client/products, dashboard, seeding (product-category.seed.ts).
 * Lưu ý: imagePath là /images/... (file tĩnh frontend) hoặc uploads/...; icon là key trong bộ icon của frontend (xem docs/catalog-api.md).
 * TypeORM nạp entity theo mẫu tên *.entity.ts (src/config/database.config.ts), không đổi tên file.
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('product_categories')
@Index('IDX_product_categories_parent', ['parentId'])
export class ProductCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index('UQ_product_categories_slug', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
  parentId: number | null;

  @ManyToOne(() => ProductCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'FK_product_categories_parent',
  })
  parent: ProductCategory | null;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children: ProductCategory[];

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_path', type: 'varchar', length: 500, nullable: true })
  imagePath: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  icon: string | null;

  @Index('IDX_product_categories_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
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

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
