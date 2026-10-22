/**
 * Bảng notifications: thông báo hiện ở chuông của admin (liên hệ mới, yêu cầu báo giá mới...).
 * Dùng bởi: notification.service.ts, contact/contact.service.ts, quote-requests/quote-requests.service.ts và module của chúng.
 */
import { BaseEntity } from 'src/common/base/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('notifications')
export class AppNotification extends BaseEntity {
  @Column()
  @Index()
  type: string;

  @Column()
  @Index()
  module: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;
}
