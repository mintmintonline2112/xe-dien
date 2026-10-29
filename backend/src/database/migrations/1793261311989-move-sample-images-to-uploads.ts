/**
 * Đổi đường dẫn ảnh mẫu /images/<thư-mục>/... (file tĩnh của frontend) thành uploads/<thư-mục>/... để ảnh mẫu hiện trong Thư viện admin.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (deploy.sh), cho DB đã seed trước khi ảnh mẫu chuyển sang backend/uploads.
 * Lưu ý: chỉ đổi 5 thư mục ảnh mẫu đã chép sang backend/uploads (categories, hero, news, pages, products). Cột HTML (content) giữ
 * nguyên vì đường dẫn tương đối uploads/... trong HTML sẽ trỏ sai domain.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const SAMPLE_FOLDERS = ['categories', 'hero', 'news', 'pages', 'products'];
const SAMPLE_FOLDER_PATTERN = `(${SAMPLE_FOLDERS.join('|')})/`;

const PATH_COLUMNS: Array<[table: string, column: string]> = [
  ['product_categories', 'image_path'],
  ['product_categories', 'og_image_path'],
  ['products', 'thumbnail_path'],
  ['products', 'og_image_path'],
  ['pages', 'hero_image_path'],
  ['pages', 'og_image_path'],
  ['page_sections', 'media_path'],
  ['blog_posts', 'cover_image_path'],
  ['blog_posts', 'og_image_path'],
  ['blog_categories', 'og_image_path'],
];

const JSON_COLUMNS: Array<[table: string, column: string]> = [
  ['products', 'gallery'],
  ['products', 'metadata'],
  ['page_sections', 'metadata'],
  ['blog_posts', 'metadata'],
  ['site_settings', 'value'],
];

async function replacePathPrefix(
  queryRunner: QueryRunner,
  fromPrefix: string,
  toPrefix: string,
): Promise<void> {
  for (const [table, column] of PATH_COLUMNS) {
    await queryRunner.query(
      `UPDATE \`${table}\` SET \`${column}\` = CONCAT(?, SUBSTRING(\`${column}\`, ?)) WHERE \`${column}\` REGEXP ?`,
      [
        toPrefix,
        fromPrefix.length + 1,
        `^${fromPrefix}${SAMPLE_FOLDER_PATTERN}`,
      ],
    );
  }
  for (const [table, column] of JSON_COLUMNS) {
    for (const folder of SAMPLE_FOLDERS) {
      const fromValue = `"${fromPrefix}${folder}/`;
      const toValue = `"${toPrefix}${folder}/`;
      await queryRunner.query(
        `UPDATE \`${table}\` SET \`${column}\` = REPLACE(\`${column}\`, ?, ?) WHERE \`${column}\` LIKE ?`,
        [fromValue, toValue, `%${fromValue}%`],
      );
    }
  }
}

export class MoveSampleImagesToUploads1793261311989 implements MigrationInterface {
  name = 'MoveSampleImagesToUploads1793261311989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await replacePathPrefix(queryRunner, '/images/', 'uploads/');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await replacePathPrefix(queryRunner, 'uploads/', '/images/');
  }
}
