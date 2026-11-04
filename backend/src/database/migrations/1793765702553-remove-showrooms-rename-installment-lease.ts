/**
 * Gỡ "Hệ thống showroom" khỏi DB đã seed (trang /he-thong-showroom về nháp, ẩn khối store-list ở trang chủ / liên hệ, xoá mềm link
 * menu, bỏ nút "Xem hệ thống showroom") và đổi chữ "Thuê tài chính" thành "Thuê trả góp" trong nội dung section.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (deploy.sh, chạy trước db:seed).
 * Lưu ý: chỉ ẩn / chuyển nháp, không xoá hẳn — admin bật lại được trong Trang / Page section. Seed đã bỏ các mục này nên chạy
 * lại db:seed không tạo lại (menu seed khớp cả mục xoá mềm).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const SHOWROOM_PAGE_SLUG = 'he-thong-showroom';
const SHOWROOM_HREF_PATTERN = '/he-thong-showroom%';

const TEXT_REPLACEMENTS: Array<[string, string]> = [
  ['Thuê tài chính linh hoạt', 'Thuê trả góp linh hoạt'],
  ['"Thuê tài chính"', '"Thuê trả góp"'],
  ['Hỗ trợ trả góp, thuê tài chính, thuê theo tháng cho doanh nghiệp', 'Hỗ trợ mua trả góp, thuê theo tháng cho doanh nghiệp'],
];

async function replaceSectionText(queryRunner: QueryRunner, replacements: Array<[string, string]>): Promise<void> {
  for (const [fromText, toText] of replacements) {
    await queryRunner.query(
      'UPDATE page_sections SET metadata = REPLACE(metadata, ?, ?) WHERE metadata LIKE ?',
      [fromText, toText, `%${fromText}%`],
    );
  }
}

export class RemoveShowroomsRenameInstallmentLease1793765702553 implements MigrationInterface {
  name = 'RemoveShowroomsRenameInstallmentLease1793765702553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("UPDATE pages SET status = 'draft' WHERE slug = ?", [SHOWROOM_PAGE_SLUG]);
    await queryRunner.query(
      "UPDATE page_sections SET is_active = 0 WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$._component')) = 'store-list'",
    );
    await queryRunner.query(
      'UPDATE menu_items SET deleted_at = NOW(6) WHERE href LIKE ? AND deleted_at IS NULL',
      [SHOWROOM_HREF_PATTERN],
    );
    await queryRunner.query(
      `UPDATE page_sections SET metadata = JSON_REMOVE(metadata, '$.ctaLabel', '$.ctaHref')
       WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.ctaHref')) LIKE ?`,
      [SHOWROOM_HREF_PATTERN],
    );
    await replaceSectionText(queryRunner, TEXT_REPLACEMENTS);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await replaceSectionText(
      queryRunner,
      TEXT_REPLACEMENTS.map(([fromText, toText]) => [toText, fromText]),
    );
    await queryRunner.query('UPDATE menu_items SET deleted_at = NULL WHERE href LIKE ?', [SHOWROOM_HREF_PATTERN]);
    await queryRunner.query(
      "UPDATE page_sections SET is_active = 1 WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$._component')) = 'store-list'",
    );
    await queryRunner.query("UPDATE pages SET status = 'published' WHERE slug = ?", [SHOWROOM_PAGE_SLUG]);
  }
}
