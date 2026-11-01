/**
 * Đổi tên thương hiệu mẫu "Xe Điện Xanh" thành "Trạm Xe Điện" (tên miền tramxedien.vn) trong nội dung đã seed: cài đặt, trang, section,
 * sản phẩm, danh mục, bài viết, menu, tên nhân sự.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (deploy.sh), cho DB đã seed trước khi seed đổi tên thương hiệu.
 * Lưu ý: quét mọi cột chữ / JSON của các bảng nội dung qua information_schema; chỉ thay đúng chuỗi tên cũ nên nội dung admin tự viết không đổi.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const CONTENT_TABLES = [
  'site_settings',
  'pages',
  'page_sections',
  'products',
  'product_categories',
  'blog_posts',
  'blog_categories',
  'menu_items',
  'staffs',
];

const TEXT_DATA_TYPES = ['varchar', 'text', 'mediumtext', 'longtext', 'json'];

async function replaceBrandName(
  queryRunner: QueryRunner,
  fromName: string,
  toName: string,
): Promise<void> {
  const columns: Array<{ tableName: string; columnName: string }> =
    await queryRunner.query(
      `SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?) AND DATA_TYPE IN (?)`,
      [CONTENT_TABLES, TEXT_DATA_TYPES],
    );
  for (const { tableName, columnName } of columns) {
    await queryRunner.query(
      `UPDATE \`${tableName}\` SET \`${columnName}\` = REPLACE(\`${columnName}\`, ?, ?) WHERE \`${columnName}\` LIKE ?`,
      [fromName, toName, `%${fromName}%`],
    );
  }
}

export class RenameBrandToTramXeDien1793263543733 implements MigrationInterface {
  name = 'RenameBrandToTramXeDien1793263543733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await replaceBrandName(queryRunner, 'Xe Điện Xanh', 'Trạm Xe Điện');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await replaceBrandName(queryRunner, 'Trạm Xe Điện', 'Xe Điện Xanh');
  }
}
