/**
 * Bảng contacts: liên hệ khách gửi từ website.
 * Dùng bởi: contact.service.ts, dashboard.service.ts.
 * Lưu ý: TypeORM nạp entity theo mẫu tên *.entity.ts (src/config/database.config.ts), không đổi tên file.
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('contacts')
export class ContactEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fullname: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
