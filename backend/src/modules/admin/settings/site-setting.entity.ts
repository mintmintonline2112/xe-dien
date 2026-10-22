/**
 * Bảng site_settings: mỗi hàng là một cặp key / giá trị JSON của cấu hình website.
 * Dùng bởi: settings.service.ts, settings.module.ts.
 */
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Index('UQ_site_settings_key', { unique: true })
  @Column({ type: 'varchar', length: 120 })
  key: string;

  @Column({ type: 'json' })
  value: unknown;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
