/**
 * Đưa Ô tô điện (sản phẩm chủ lực) lên đầu trên site đang chạy: thứ tự danh mục gốc, menu "Sản phẩm" ở header, thứ tự section
 * trang chủ, slide ô tô điện lên đầu banner, bật "mua nhiều" cho 4 sản phẩm ô tô điện mẫu.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (deploy.sh chạy tự động). Seed đã đổi cùng thứ tự cho cài đặt mới.
 * Lưu ý: chỉ sửa dữ liệu, khớp theo slug / href / sectionKey; mục admin đã xoá hoặc đổi slug thì bỏ qua. down() trả lại thứ tự cũ.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const ROOT_CATEGORY_ORDER_NEW = [
  'o-to-dien',
  'xe-dap-dien',
  'xe-may-dien',
  'xe-dien-2-banh',
  'xe-dien-3-banh',
  'xe-dien-tre-em',
  'xe-chuyen-dung',
  'phu-tung',
  'tram-sac',
];
const ROOT_CATEGORY_ORDER_OLD = [
  'xe-dap-dien',
  'xe-may-dien',
  'xe-dien-2-banh',
  'xe-dien-3-banh',
  'o-to-dien',
  'xe-dien-tre-em',
  'xe-chuyen-dung',
  'phu-tung',
  'tram-sac',
];

const HOME_SECTION_ORDER_NEW = [
  'banner',
  'uu-dai',
  'mua-nhieu',
  'o-to-dien',
  'danh-muc',
  'moi-ve',
  'xe-dap-dien',
  'xe-may-dien',
  'xe-dien-2-banh',
  'xe-chuyen-dung',
  'phu-tung',
];
const HOME_SECTION_ORDER_OLD = [
  'banner',
  'uu-dai',
  'mua-nhieu',
  'danh-muc',
  'moi-ve',
  'xe-dap-dien',
  'xe-may-dien',
  'xe-dien-2-banh',
  'o-to-dien',
  'xe-chuyen-dung',
  'phu-tung',
];

const FEATURED_EV_CAR_SLUGS = [
  'xe-dien-san-golf-4-cho',
  'xe-dien-du-lich-8-cho',
  'xe-dien-du-lich-11-cho',
  'xe-bus-dien-14-cho',
];

const EV_CAR_SLIDE_HREF = '/danh-muc/o-to-dien';

type BannerSlide = { href?: string };

export class EvCarsFirst1793552285873 implements MigrationInterface {
  name = 'EvCarsFirst1793552285873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.applyOrder(
      queryRunner,
      ROOT_CATEGORY_ORDER_NEW,
      HOME_SECTION_ORDER_NEW,
    );
    await this.moveEvCarSlide(queryRunner, (slides, index) => [
      slides[index],
      ...slides.filter((_, i) => i !== index),
    ]);
    await queryRunner.query(
      `UPDATE products SET is_featured = 1 WHERE slug IN (${FEATURED_EV_CAR_SLUGS.map(() => '?').join(',')})`,
      FEATURED_EV_CAR_SLUGS,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.applyOrder(
      queryRunner,
      ROOT_CATEGORY_ORDER_OLD,
      HOME_SECTION_ORDER_OLD,
    );
    await this.moveEvCarSlide(queryRunner, (slides, index) => {
      const rest = slides.filter((_, i) => i !== index);
      return [...rest.slice(0, 2), slides[index], ...rest.slice(2)];
    });
    await queryRunner.query(
      `UPDATE products SET is_featured = 0 WHERE slug IN (${FEATURED_EV_CAR_SLUGS.map(() => '?').join(',')})`,
      FEATURED_EV_CAR_SLUGS,
    );
  }

  private async applyOrder(
    queryRunner: QueryRunner,
    categorySlugs: string[],
    sectionKeys: string[],
  ): Promise<void> {
    for (const [index, slug] of categorySlugs.entries()) {
      await queryRunner.query(
        'UPDATE product_categories SET sort_order = ? WHERE slug = ? AND parent_id IS NULL',
        [index + 1, slug],
      );
      await queryRunner.query(
        `UPDATE menu_items SET sort_order = ? WHERE location = 'header' AND parent_id IS NOT NULL AND href IN (?, ?)`,
        [index + 1, `/danh-muc/${slug}`, `/danh-muc/${slug}/`],
      );
    }
    for (const [index, sectionKey] of sectionKeys.entries()) {
      await queryRunner.query(
        `UPDATE page_sections SET sort_order = ? WHERE section_key = ? AND page_id = (SELECT id FROM pages WHERE slug = 'home')`,
        [index + 1, sectionKey],
      );
    }
  }

  private async moveEvCarSlide(
    queryRunner: QueryRunner,
    reorder: (slides: BannerSlide[], evCarIndex: number) => BannerSlide[],
  ): Promise<void> {
    const rows: Array<{
      id: number;
      metadata: string | Record<string, unknown> | null;
    }> = await queryRunner.query(
      `SELECT s.id, s.metadata FROM page_sections s JOIN pages p ON p.id = s.page_id WHERE p.slug = 'home' AND s.section_key = 'banner'`,
    );
    for (const row of rows) {
      const metadata =
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : row.metadata;
      const slides: BannerSlide[] | undefined = metadata?.slides;
      if (!Array.isArray(slides)) continue;
      const evCarIndex = slides.findIndex(
        (slide) => slide?.href?.replace(/\/$/, '') === EV_CAR_SLIDE_HREF,
      );
      if (evCarIndex < 0) continue;
      metadata.slides = reorder(slides, evCarIndex);
      await queryRunner.query(
        'UPDATE page_sections SET metadata = ? WHERE id = ?',
        [JSON.stringify(metadata), row.id],
      );
    }
  }
}
