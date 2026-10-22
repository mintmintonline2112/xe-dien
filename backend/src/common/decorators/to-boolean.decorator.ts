/**
 * Decorator @ToBoolean() đổi giá trị chuỗi của form multipart ('1' / '0' / 'true' / 'false') thành boolean để @IsBoolean qua.
 * Dùng bởi: DTO nhận dữ liệu multipart (hiện chưa có DTO nào import).
 * Lưu ý: giữ nguyên undefined / null / '' (trả undefined) để giá trị mặc định của DTO vẫn áp dụng.
 */
import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true' || value === '1' || value === 1;
  });
}
