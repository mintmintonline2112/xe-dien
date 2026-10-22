/**
 * Bảng quote_requests: yêu cầu tư vấn / báo giá / trả góp / lái thử / đăng ký đại lý gửi từ form trên website, kèm trạng thái xử lý.
 * Dùng bởi: quote-requests.service.ts, admin-quote-requests.controller.ts, dto/create-quote-request.dto.ts, dto/update-quote-request-status.dto.ts.
 * Lưu ý: productId không có khoá ngoại — sản phẩm bị xoá thì yêu cầu vẫn giữ productName để tra lại.
 */
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

export enum QuoteRequestStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  QUOTED = 'quoted',
  CLOSED = 'closed',
}

export const QUOTE_REQUEST_TYPES = [
  'consult',
  'quote',
  'installment',
  'test_ride',
  'dealer',
] as const;
export type QuoteRequestType = (typeof QUOTE_REQUEST_TYPES)[number];

export const QUOTE_REQUEST_TYPE_LABELS: Record<QuoteRequestType, string> = {
  consult: 'Tư vấn chọn xe',
  quote: 'Báo giá',
  installment: 'Mua trả góp',
  test_ride: 'Xem xe – lái thử',
  dealer: 'Đăng ký đại lý',
};

@Entity('quote_requests')
export class QuoteRequest extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Index('IDX_quote_requests_phone')
  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  province: string | null;

  @Index('IDX_quote_requests_type')
  @Column({
    name: 'request_type',
    type: 'varchar',
    length: 30,
    default: 'consult',
  })
  requestType: QuoteRequestType;

  @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
  productId: number | null;

  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  productName: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'source_url', type: 'varchar', length: 500, nullable: true })
  sourceUrl: string | null;

  @Index('IDX_quote_requests_status')
  @Column({ type: 'varchar', length: 20, default: QuoteRequestStatus.NEW })
  status: QuoteRequestStatus;
}
