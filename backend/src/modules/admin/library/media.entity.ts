/**
 * Bảng media: chỉ mục file trong uploads/ để phân trang / tìm bằng SQL và lưu alt, kích thước, người tải lên.
 * Dùng bởi: library.service.ts, library.module.ts, library.types.ts.
 * Lưu ý: ổ đĩa vẫn là nguồn sự thật, LibraryService.sync() sửa chỗ lệch; path tính từ gốc dự án (uploads/library/logo.png), folder gốc = 'root', extension không có dấu chấm.
 * Lưu ý: modifiedAt là mtime của file, dùng để sắp "mới nhất" và phát hiện file bị thay; không đổi tên file vì TypeORM nạp theo mẫu tên .entity.ts.
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type MediaKind = 'image' | 'video';

@Entity('media')
@Index('IDX_media_kind_created', ['kind', 'createdAt'])
@Index('IDX_media_folder', ['folder'])
export class Media {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Index('UQ_media_path', { unique: true })
  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 190, default: 'root' })
  folder: string;

  @Column({ type: 'varchar', length: 10 })
  kind: MediaKind;

  @Column({ type: 'varchar', length: 16 })
  extension: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  size: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  width: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  height: number | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  alt: string | null;

  @Column({
    name: 'uploaded_by_staff_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  uploadedByStaffId: string | null;

  @Column({ name: 'modified_at', type: 'datetime', precision: 6 })
  modifiedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
