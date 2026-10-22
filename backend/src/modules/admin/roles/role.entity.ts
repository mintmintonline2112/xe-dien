/**
 * Bảng roles và bảng nối role_permissions (vai trò ↔ quyền).
 * Dùng bởi: roles.service.ts, staff.entity.ts, permission.entity.ts, database/seeding (role.seed, staff.seed).
 */
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Permission } from '../permissions/permission.entity';
import { Staff } from '../staffs/staff.entity';
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Staff, (staff) => staff.role)
  staffs: Staff[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];
}
