/**
 * Lớp entity gốc: id, sort_order, created_at, updated_at, deleted_at (xoá mềm, có index IDX_base_deleted).
 * Dùng bởi: seo-content.entity.ts và các entity trong modules/admin (page-section, section-definition, menu-item, role, permission…).
 */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'sort_order', type: 'int', unsigned: true, default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;

  @Index('IDX_base_deleted')
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  deletedAt: Date | null;
}
