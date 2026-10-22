/**
 * Bảng products: sản phẩm xe điện / phụ tùng (giá, ảnh, thông số, điểm nổi bật, khuyến mãi, SEO, bản dịch).
 * Dùng bởi: products.service.ts, client/products, dashboard, seeding (product.seed.ts).
 * Lưu ý: price null = site hiện "Liên hệ"; originalPrice chỉ hiện khi lớn hơn price. Giá là int unsigned (VNĐ, tối đa ~4,29 tỷ).
 * gallery / specs / highlights là cột JSON; translations dạng { en: { <field>: value } } (xem src/common/i18n/translations.ts).
 */
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { SeoContentEntity } from 'src/common/base/seo-content.entity';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';

export const PRODUCT_STOCK_STATUSES = [
  'in_stock',
  'pre_order',
  'out_of_stock',
] as const;
export type ProductStockStatus = (typeof PRODUCT_STOCK_STATUSES)[number];

export type ProductSpec = { label: string; value: string };

@Entity('products')
@Index('IDX_products_publish', ['status', 'publishedAt'])
@Index('IDX_products_category_publish', ['categoryId', 'status', 'publishedAt'])
@Index('IDX_products_featured', ['isFeatured', 'status'])
export class Product extends SeoContentEntity {
  @Column({ name: 'category_id', type: 'int', unsigned: true, nullable: true })
  categoryId: number | null;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_products_category',
  })
  category: ProductCategory | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sku: string | null;

  @Index('IDX_products_brand')
  @Column({ type: 'varchar', length: 120, nullable: true })
  brand: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  price: number | null;

  @Column({
    name: 'original_price',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  originalPrice: number | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  badge: string | null;

  @Column({
    name: 'stock_status',
    type: 'varchar',
    length: 20,
    default: 'in_stock',
  })
  stockStatus: ProductStockStatus;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ type: 'longtext', nullable: true })
  content: string | null;

  @Column({
    name: 'thumbnail_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailPath: string | null;

  @Column({ type: 'json', nullable: true })
  gallery: string[] | null;

  @Column({ type: 'json', nullable: true })
  specs: ProductSpec[] | null;

  @Column({ type: 'json', nullable: true })
  highlights: string[] | null;

  @Column({ type: 'text', nullable: true })
  promotion: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  warranty: string | null;

  @Column({
    name: 'published_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  publishedAt: Date | null;

  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;
}
