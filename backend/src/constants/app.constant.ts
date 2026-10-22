/**
 * Thứ tự sắp xếp mặc định cho truy vấn TypeORM: theo cột sort tăng dần rồi id giảm dần.
 * Dùng bởi: hiện chưa có file nào import.
 */
import { FindOptionsOrder } from 'typeorm';

export const DEFAULT_ORDER: FindOptionsOrder<any> = {
  sort: 'ASC',
  id: 'DESC',
};
