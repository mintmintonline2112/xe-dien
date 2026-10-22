/**
 * Bảng staff_refresh_tokens: một hàng = một phiên đăng nhập admin còn sống; đăng xuất / hết hạn thì xoá hàng.
 * Dùng bởi: auth/auth.service.ts, auth/auth.module.ts, staffs/staff.entity.ts, staffs/staffs.module.ts.
 * Lưu ý: sessionId nhúng trong token để tra đúng một hàng bằng chỉ mục. tokenHash là SHA-256, không dùng bcrypt
 * vì bcrypt chỉ băm 72 byte đầu (giống nhau ở mọi token của cùng nhân viên). previousTokenHash vẫn được chấp nhận
 * vài giây sau rotatedAt để hai tab cùng làm mới không bị coi là token bị đánh cắp.
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Staff } from '../staffs/staff.entity';

@Entity('staff_refresh_tokens')
@Index('IDX_staff_refresh_expires', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index('UQ_staff_refresh_session', { unique: true })
  @Column({ name: 'session_id', type: 'varchar', length: 64 })
  sessionId: string;

  @ManyToOne(() => Staff, (staff) => staff.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({
    name: 'previous_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  previousTokenHash: string | null;

  @Column({
    name: 'rotated_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  rotatedAt: Date | null;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  os: string;
}
