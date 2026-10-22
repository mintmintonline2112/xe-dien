/**
 * Bảng permissions: một quyền (code duy nhất, thuộc một module) gán cho vai trò qua role_permissions.
 * Dùng bởi: permissions.service.ts, role.entity.ts, roles.service.ts, database/seeding (permission.seed, role.seed).
 */
import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { Role } from '../roles/role.entity';
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  code: string;

  @Index()
  @Column()
  module: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
