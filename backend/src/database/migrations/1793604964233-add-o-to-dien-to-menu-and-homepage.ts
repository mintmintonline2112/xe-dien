/**
 * Thêm dòng Ô tô điện cho DB đã seed trước đó: danh mục `o-to-dien` đứng đầu, mục menu header ngay sau Trang chủ, section
 * sản phẩm "Ô tô điện" trên trang chủ ngay sau "Danh mục sản phẩm"; đổi nhãn menu "Xe resort – du lịch" thành "Xe resort".
 * Dùng bởi: `npm run db:run` / `db:run:prod` (deploy.sh, chạy trước db:seed).
 * Lưu ý: phần nào đã có (admin tự tạo) hoặc chưa có mốc (DB trống, seed sẽ tạo đủ) thì bỏ qua; các mục cùng cấp phía sau được
 * đẩy lùi 1 bậc để không trùng thứ tự. down chỉ gỡ mục menu và section, giữ danh mục vì có thể đã gắn sản phẩm.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const CATEGORY_SLUG = 'o-to-dien';
const CATEGORY_HREF = '/danh-muc/o-to-dien';
const SECTION_KEY = 'o-to-dien';
const RESORT_MENU_HREF = '/danh-muc/xe-dien-du-lich';

const SECTION_METADATA = {
  _component: 'product-grid',
  layout: 'split',
  source: 'category',
  categorySlug: CATEGORY_SLUG,
  limit: '8',
  ctaLabel: 'Xem tất cả ô tô điện',
};

async function hasRow(queryRunner: QueryRunner, sql: string, params: unknown[]): Promise<boolean> {
  const rows: unknown[] = await queryRunner.query(sql, params);
  return rows.length > 0;
}

async function addCategory(queryRunner: QueryRunner): Promise<void> {
  if (await hasRow(queryRunner, 'SELECT id FROM product_categories WHERE slug = ?', [CATEGORY_SLUG])) return;
  if (!(await hasRow(queryRunner, 'SELECT id FROM product_categories LIMIT 1', []))) return;

  await queryRunner.query(
    'UPDATE product_categories SET sort_order = sort_order + 1 WHERE parent_id IS NULL',
  );
  await queryRunner.query(
    `INSERT INTO product_categories (name, slug, parent_id, description, image_path, icon, is_active, sort_order, meta_title, meta_description)
     VALUES (?, ?, NULL, ?, ?, 'ev-car', 1, 1, ?, ?)`,
    [
      'Ô tô điện',
      CATEGORY_SLUG,
      'Ô tô điện, xe điện 4 bánh chở người và chở hàng cho khu đô thị, khu công nghiệp, doanh nghiệp — vận hành êm, không khí thải, sạc điện dân dụng, chi phí vận hành thấp.',
      `uploads/categories/${CATEGORY_SLUG}.webp`,
      'Ô tô điện chính hãng, giá tốt',
      'Ô tô điện, xe điện 4 bánh chở người, chở hàng, xe điện chuyên dụng đô thị chính hãng. Báo giá dự án, bảo trì tận nơi, giao xe toàn quốc.',
    ],
  );
}

async function addHeaderMenuItem(queryRunner: QueryRunner): Promise<void> {
  if (
    await hasRow(
      queryRunner,
      "SELECT id FROM menu_items WHERE href = ? AND parent_id IS NULL AND location = 'header'",
      [CATEGORY_HREF],
    )
  ) {
    return;
  }
  const homeItems: Array<{ sortOrder: number }> = await queryRunner.query(
    "SELECT sort_order AS sortOrder FROM menu_items WHERE href = '/' AND parent_id IS NULL AND location = 'header' AND deleted_at IS NULL",
  );
  if (homeItems.length === 0) return;

  const sortOrder = Number(homeItems[0].sortOrder) + 1;
  await queryRunner.query(
    "UPDATE menu_items SET sort_order = sort_order + 1 WHERE parent_id IS NULL AND location = 'header' AND sort_order >= ?",
    [sortOrder],
  );
  await queryRunner.query(
    `INSERT INTO menu_items (label, href, parent_id, is_active, show_submenu, location, sort_order)
     VALUES ('Ô tô điện', ?, NULL, 1, 0, 'header', ?)`,
    [CATEGORY_HREF, sortOrder],
  );
}

async function addHomepageSection(queryRunner: QueryRunner): Promise<void> {
  const homePages: Array<{ id: number }> = await queryRunner.query(
    "SELECT id FROM pages WHERE slug = 'home' AND deleted_at IS NULL",
  );
  if (homePages.length === 0) return;
  const pageId = homePages[0].id;
  if (await hasRow(queryRunner, 'SELECT id FROM page_sections WHERE page_id = ? AND section_key = ?', [pageId, SECTION_KEY])) {
    return;
  }

  const anchorSections: Array<{ sortOrder: number }> = await queryRunner.query(
    "SELECT sort_order AS sortOrder FROM page_sections WHERE page_id = ? AND section_key = 'danh-muc' AND deleted_at IS NULL",
    [pageId],
  );
  const lastSections: Array<{ maxOrder: number | null }> = await queryRunner.query(
    'SELECT MAX(sort_order) AS maxOrder FROM page_sections WHERE page_id = ? AND deleted_at IS NULL',
    [pageId],
  );
  const sortOrder =
    anchorSections.length > 0
      ? Number(anchorSections[0].sortOrder) + 1
      : Number(lastSections[0]?.maxOrder ?? 0) + 1;

  await queryRunner.query(
    'UPDATE page_sections SET sort_order = sort_order + 1 WHERE page_id = ? AND sort_order >= ?',
    [pageId, sortOrder],
  );
  await queryRunner.query(
    `INSERT INTO page_sections (page_id, section_key, heading, metadata, is_active, sort_order)
     VALUES (?, ?, 'Ô tô điện', ?, 1, ?)`,
    [pageId, SECTION_KEY, JSON.stringify(SECTION_METADATA), sortOrder],
  );
}

async function renameResortMenuLabel(queryRunner: QueryRunner, fromLabel: string, toLabel: string): Promise<void> {
  await queryRunner.query(
    "UPDATE menu_items SET label = ? WHERE href = ? AND parent_id IS NULL AND location = 'header' AND label = ?",
    [toLabel, RESORT_MENU_HREF, fromLabel],
  );
}

export class AddOToDienToMenuAndHomepage1793604964233 implements MigrationInterface {
  name = 'AddOToDienToMenuAndHomepage1793604964233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addCategory(queryRunner);
    await addHeaderMenuItem(queryRunner);
    await addHomepageSection(queryRunner);
    await renameResortMenuLabel(queryRunner, 'Xe resort – du lịch', 'Xe resort');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM menu_items WHERE href = ? AND parent_id IS NULL AND location = 'header'",
      [CATEGORY_HREF],
    );
    await queryRunner.query(
      "DELETE s FROM page_sections s JOIN pages p ON p.id = s.page_id WHERE p.slug = 'home' AND s.section_key = ?",
      [SECTION_KEY],
    );
    await renameResortMenuLabel(queryRunner, 'Xe resort', 'Xe resort – du lịch');
  }
}
