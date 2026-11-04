/**
 * Decorator @ToBoolean() đổi '1' / '0' / 'true' / 'false' (form multipart) hoặc 1 / 0 (tinyint MySQL) thành boolean để @IsBoolean qua.
 * Dùng bởi: pages/dto/create-page-section.dto.ts (isActive — form admin gửi lại đúng giá trị 1 / 0 đọc từ DB).
 * Lưu ý: giữ nguyên undefined / null / '' (trả undefined) để giá trị mặc định của DTO vẫn áp dụng.
 */
import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true' || value === '1' || value === 1;
  });
}
