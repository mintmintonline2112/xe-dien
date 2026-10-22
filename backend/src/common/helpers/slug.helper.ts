/**
 * Tạo slug URL từ chuỗi (kể cả tiếng Việt có dấu) và sinh slug không trùng (trong Set hoặc trong bảng DB, thêm -2, -3…).
 * Dùng bởi: modules/admin (pages, blog-posts, blog-categories, products, product-categories service), database/seeding (product.seed.ts).
 * Lưu ý: generateUniqueSlug tính cả bản ghi đã soft-delete; so id dạng chuỗi vì route param là string còn id entity là number.
 */
import { Repository } from 'typeorm';

const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlugInSet(
  base: string,
  used: Set<string>,
  fallback = 'item',
): string {
  const baseSlug = slugify(base) || fallback;
  let candidate = baseSlug;
  let counter = 1;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  used.add(candidate);
  return candidate;
}

export async function generateUniqueSlug<T extends { id?: number }>(
  repo: Repository<T>,
  base: string,
  options: { excludeId?: number; column?: string; fallback?: string } = {},
): Promise<string> {
  const column = options.column ?? 'slug';
  const baseSlug = slugify(base) || options.fallback || 'item';

  let candidate = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await repo.findOne({
      where: { [column]: candidate } as any,
      withDeleted: true,
    });

    const isSelf =
      options.excludeId != null &&
      String(existing?.id) === String(options.excludeId);
    if (!existing || isSelf) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}
